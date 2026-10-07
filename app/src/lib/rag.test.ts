import { describe, expect, it } from 'vitest';
import {
  buildContents,
  buildRagRequest,
  buildSystemInstruction,
  extractCitations,
  formatContext,
  MAX_EXCHANGES,
  NO_INFO_MESSAGE,
  pickReferences,
  retrievalQuery,
  SYSTEM_PROMPT,
  trimHistory,
  type ChatTurn,
} from './rag';
import type { Chunk } from './types';

const chunk = (
  id: string,
  articleId: string,
  title: string,
  heading = '',
  text = '本文',
): Chunk => ({
  id,
  articleId,
  category: 'economy',
  title,
  heading,
  anchor: heading,
  text,
});

const turns = (n: number): ChatTurn[] =>
  Array.from({ length: n }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'model', text: `t${i}` }));

describe('system prompt', () => {
  it('instructs Japanese answers grounded only in excerpts, with a fallback and citations', () => {
    expect(SYSTEM_PROMPT).toContain('Wiki 抜粋」のみを根拠に');
    expect(SYSTEM_PROMPT).toContain('日本語');
    expect(SYSTEM_PROMPT).toContain(NO_INFO_MESSAGE);
    expect(SYSTEM_PROMPT).toContain('[記事タイトル]');
  });

  it('embeds formatted excerpts with title and heading', () => {
    const text = buildSystemInstruction([chunk('a#0', 'a', 'ギーナ', '入手方法', '日課で入手')]);
    expect(text.startsWith(SYSTEM_PROMPT)).toBe(true);
    expect(text).toContain('【抜粋1】\n記事: ギーナ\n位置: ギーナ > 入手方法\n日課で入手');
  });

  it('marks the context as empty when nothing was retrieved', () => {
    expect(formatContext([])).toBe('（該当する抜粋はありません）');
  });
});

describe('trimHistory', () => {
  it(`keeps at most ${MAX_EXCHANGES} exchanges`, () => {
    const trimmed = trimHistory(turns(20));
    expect(trimmed).toHaveLength(MAX_EXCHANGES * 2);
    expect(trimmed[0]?.text).toBe('t8');
  });

  it('always starts with a user turn and drops empty turns', () => {
    const history: ChatTurn[] = [
      { role: 'model', text: 'orphan' },
      { role: 'user', text: '  ' },
      { role: 'user', text: 'q' },
      { role: 'model', text: 'a' },
    ];
    expect(trimHistory(history)).toEqual([
      { role: 'user', text: 'q' },
      { role: 'model', text: 'a' },
    ]);
    expect(trimHistory([{ role: 'model', text: 'x' }])).toEqual([]);
  });
});

describe('buildContents / buildRagRequest', () => {
  it('appends the question as the last user turn in Gemini format', () => {
    const contents = buildContents(
      [
        { role: 'user', text: 'q1' },
        { role: 'model', text: 'a1' },
      ],
      'q2',
    );
    expect(contents).toEqual([
      { role: 'user', parts: [{ text: 'q1' }] },
      { role: 'model', parts: [{ text: 'a1' }] },
      { role: 'user', parts: [{ text: 'q2' }] },
    ]);
  });

  it('combines the system instruction and contents', () => {
    const req = buildRagRequest([], '上限は？', [chunk('a#0', 'a', 'オード')]);
    expect(req.systemInstruction).toContain('記事: オード');
    expect(req.contents).toHaveLength(1);
  });
});

describe('retrievalQuery', () => {
  it('uses long questions as-is', () => {
    expect(retrievalQuery([], 'オードエネルギーの回復量と上限を教えて')).toBe(
      'オードエネルギーの回復量と上限を教えて',
    );
  });

  it('prefixes short follow-ups with the previous user question', () => {
    const history: ChatTurn[] = [
      { role: 'user', text: 'オードエネルギーとは' },
      { role: 'model', text: '…' },
    ];
    expect(retrievalQuery(history, '上限は？')).toBe('オードエネルギーとは 上限は？');
    expect(retrievalQuery([], '上限は？')).toBe('上限は？');
  });
});

describe('citations and references', () => {
  const chunks = [
    chunk('a#0', 'a', 'ギーナ', '入手'),
    chunk('a#1', 'a', 'ギーナ'),
    chunk('b#0', 'b', 'オード'),
  ];

  it('extracts unique bracketed titles', () => {
    expect(extractCitations('稼げる [ギーナ]。上限 [オード] [ギーナ]')).toEqual([
      'ギーナ',
      'オード',
    ]);
  });

  it('returns cited articles when the answer cites them', () => {
    expect(pickReferences(chunks, '日課で稼ぐ [ギーナ]').map((r) => r.id)).toEqual(['a']);
  });

  it('falls back to all retrieved articles (unique, first anchor)', () => {
    const refs = pickReferences(chunks, '引用なし');
    expect(refs).toEqual([
      { id: 'a', title: 'ギーナ', category: 'economy', anchor: '入手' },
      { id: 'b', title: 'オード', category: 'economy', anchor: '' },
    ]);
  });
});
