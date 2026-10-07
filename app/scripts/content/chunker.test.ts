// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { blockToText, chunkArticle, packBlocks, splitLongText } from './chunker';
import { renderMarkdown } from './markdown';

const base = { articleId: 'odyle', category: 'dungeons' as const, title: 'オードエネルギー' };

describe('chunkArticle', () => {
  it('creates one chunk per section with heading context and anchors', () => {
    const md =
      '導入の文。\n\n## 回復\n\n3時間に15回復。\n\n### 上限\n\n上限は560。\n\n## 使い道\n\n遠征に使う。';
    const chunks = chunkArticle({ ...base, markdown: md });
    expect(chunks.map((c) => [c.heading, c.anchor, c.text])).toEqual([
      ['', '', '導入の文。'],
      ['回復', '回復', '3時間に15回復。'],
      ['回復 > 上限', '上限', '上限は560。'],
      ['使い道', '使い道', '遠征に使う。'],
    ]);
    expect(chunks[0]).toMatchObject({
      id: 'odyle#0',
      articleId: 'odyle',
      category: 'dungeons',
      title: 'オードエネルギー',
    });
    expect(chunks.map((c) => c.id)).toEqual(['odyle#0', 'odyle#1', 'odyle#2', 'odyle#3']);
  });

  it('produces the same anchors as the rendered HTML (incl. duplicates and h4)', async () => {
    const md = '## 報酬\n\n#### 補足\n\nx\n\n## 報酬\n\ny';
    const chunks = chunkArticle({ ...base, markdown: md });
    const { headings } = await renderMarkdown(md, {
      resolve: () => undefined,
      sourceIds: new Set(),
    });
    expect(chunks.map((c) => c.anchor)).toEqual(headings.map((h) => h.id));
  });

  it('keeps chunks near the size limit', () => {
    const paragraph = 'あ'.repeat(250);
    const md = `## 長い節\n\n${[paragraph, paragraph, paragraph, paragraph].join('\n\n')}`;
    const chunks = chunkArticle({ ...base, markdown: md, maxChars: 600 });
    expect(chunks).toHaveLength(2);
    chunks.forEach((c) => expect(c.text.length).toBeLessThanOrEqual(600));
    chunks.forEach((c) => expect(c.heading).toBe('長い節'));
  });

  it('defaults to ~600 characters per chunk', () => {
    const md = Array.from({ length: 10 }, (_, i) => `段落${i}。${'い'.repeat(150)}`).join('\n\n');
    const chunks = chunkArticle({ ...base, markdown: md });
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c) => expect(c.text.length).toBeLessThanOrEqual(600));
  });

  it('replaces wikilinks with titles in chunk text', () => {
    const chunks = chunkArticle({
      ...base,
      markdown: '[[kinah]] と [[kinah|金]] と [[unknown]]',
      resolveTitle: (s) => (s === 'kinah' ? 'ギーナ' : undefined),
    });
    expect(chunks[0]?.text).toBe('ギーナ と 金 と unknown');
  });

  it('returns no chunks for an empty body', () => {
    expect(chunkArticle({ ...base, markdown: '' })).toEqual([]);
  });
});

describe('blockToText', () => {
  const parse = (md: string) => chunkArticle({ ...base, markdown: md })[0]?.text;

  it('renders tables row by row', () => {
    expect(parse('| 項目 | 値 |\n| --- | --- |\n| 上限 | 560 |')).toBe('項目 | 値\n上限 | 560');
  });

  it('renders ordered and unordered lists', () => {
    expect(parse('1. 一\n2. 二')).toBe('1. 一\n2. 二');
    expect(parse('- a\n- b')).toBe('- a\n- b');
  });

  it('renders blockquotes, code and strips html / thematic breaks', () => {
    expect(parse('> **注意**：表示優先')).toBe('注意：表示優先');
    expect(parse('```\ncode\n```')).toBe('code');
    expect(blockToText({ type: 'html', value: '<b>x</b>' })).toBe('');
    expect(blockToText({ type: 'thematicBreak' })).toBe('');
  });
});

describe('splitLongText', () => {
  it('splits on sentence boundaries', () => {
    const parts = splitLongText('一文目です。二文目です。三文目です。', 12);
    expect(parts).toEqual(['一文目です。二文目です。', '三文目です。']);
  });

  it('hard-cuts sentences longer than the limit', () => {
    const parts = splitLongText('あ'.repeat(25), 10);
    expect(parts).toEqual(['あ'.repeat(10), 'あ'.repeat(10), 'あ'.repeat(5)]);
  });
});

describe('packBlocks', () => {
  it('skips empty blocks and merges small ones', () => {
    expect(packBlocks(['a', '', 'b'], 10)).toEqual(['a\nb']);
  });

  it('flushes before an oversized block', () => {
    expect(packBlocks(['short', 'x'.repeat(12)], 10)).toEqual(['short', 'x'.repeat(10), 'xx']);
  });
});
