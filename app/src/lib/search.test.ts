import MiniSearch from 'minisearch';
import { describe, expect, it } from 'vitest';
import { highlight, makeContextSnippet, makeSnippet } from './highlight';
import {
  isSingleKana,
  normalizeTexts,
  searchAllPages,
  searchBody,
  searchPages,
  searchWithFallback,
} from './search';
import { isLatinTerm, pageIndexOptions } from './search-options';

function pageIndex(): MiniSearch {
  const index = new MiniSearch(pageIndexOptions);
  index.addAll([
    {
      id: 'odyle',
      title: 'オードエネルギー',
      category: 'dungeons',
      confidence: 'verified',
      summary: 'ダンジョン報酬の受取に使う資源。',
      aliases: 'Odyle Energy / オード気力',
      tags: '遠征 報酬',
      headings: '回復と上限',
      body: '3時間に15回復する。',
    },
    {
      id: 'kinah',
      title: 'ギーナ',
      category: 'economy',
      confidence: 'community',
      summary: 'ゲーム内通貨。',
      aliases: 'Kinah',
      tags: '金策 取引所',
      headings: '入手方法',
      body: '取引所で売却して稼ぐ。遠征でも手に入る。',
    },
  ]);
  return index;
}

const TEXTS = normalizeTexts(
  new Map([
    ['odyle', '3時間に15回復する。'],
    ['kinah', '取引所で売却して稼ぐ。遠征でも手に入る。遠征の報酬。'],
  ]),
);

describe('searchBody', () => {
  it('matches every whitespace-separated word as a substring, most occurrences first', () => {
    expect(searchBody(TEXTS, '遠征')).toEqual(['kinah']);
    expect(searchBody(TEXTS, '取引所 遠征')).toEqual(['kinah']);
    expect(searchBody(TEXTS, '取引所 回復')).toEqual([]);
    expect(searchBody(TEXTS, '回復')).toEqual(['odyle']);
    expect(searchBody(TEXTS, '  ')).toEqual([]);
  });

  it('normalizes width and case', () => {
    expect(searchBody(normalizeTexts(new Map([['a', 'ＩＬ１０００まで']])), 'il1000')).toEqual([
      'a',
    ]);
  });
});

describe('searchPages', () => {
  const index = pageIndex();

  it('finds Japanese titles by substring (bigram AND)', () => {
    expect(searchPages(index, 'エネルギー').map((h) => h.id)).toEqual(['odyle']);
  });

  it('finds articles by English alias with prefix matching', () => {
    expect(searchPages(index, 'odyl')[0]?.id).toBe('odyle');
    expect(searchPages(index, 'KINAH')[0]).toMatchObject({
      id: 'kinah',
      title: 'ギーナ',
      category: 'economy',
      confidence: 'community',
    });
  });

  it('ranks title/tag matches above body matches', () => {
    expect(searchPages(index, '遠征', 20, TEXTS).map((h) => h.id)).toEqual(['odyle', 'kinah']);
    expect(searchPages(index, '遠征').map((h) => h.id)).toEqual(['odyle']);
  });

  it('finds articles by body text that is not in the index', () => {
    expect(searchPages(index, '売却', 20, TEXTS)).toMatchObject([
      { id: 'kinah', title: 'ギーナ', category: 'economy' },
    ]);
  });

  it('1 文字の仮名は題名・別名の前方一致だけ（本文は見ない）', () => {
    expect(isSingleKana('オ')).toBe(true);
    expect(isSingleKana('剣')).toBe(false);
    expect(isSingleKana('オー')).toBe(false);
    expect(searchPages(index, 'お', 20, TEXTS).map((h) => h.id)).toEqual(['odyle']);
    expect(searchPages(index, 'ぎ', 20, TEXTS).map((h) => h.id)).toEqual(['kinah']);
    // 「る」は「エネルギー」の途中にあるが前方一致ではない
    expect(searchPages(index, 'る', 20, TEXTS)).toEqual([]);
  });

  it('本文だけの一致に bodyOnly を付け、全件を返す', () => {
    const all = searchAllPages(index, '遠征', TEXTS);
    expect(all.map((h) => [h.id, h.bodyOnly ?? false])).toEqual([
      ['odyle', false],
      ['kinah', true],
    ]);
    expect(searchPages(index, '遠征', 1, TEXTS)).toHaveLength(1);
  });

  it('falls back to OR when AND finds nothing, filtering weak matches', () => {
    // 「取引所」は一致、「魔法」は不一致 → OR でギーナのみ
    expect(searchPages(index, '取引所 魔法').map((h) => h.id)).toEqual(['kinah']);
    expect(searchPages(index, '全く関係ない語句です')).toEqual([]);
  });

  it('returns nothing for blank or symbol-only queries', () => {
    expect(searchPages(index, '   ')).toEqual([]);
    expect(searchWithFallback(index, '！？')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(searchPages(index, '遠征', 1)).toHaveLength(1);
  });
});

describe('isLatinTerm', () => {
  it('detects CJK terms', () => {
    expect(isLatinTerm('odyle')).toBe(true);
    expect(isLatinTerm('遠征')).toBe(false);
  });
});

describe('highlight', () => {
  it('marks query matches including bigram overlaps', () => {
    expect(highlight('オードエネルギーの上限', 'エネルギー')).toEqual([
      { text: 'オード', hit: false },
      { text: 'エネルギー', hit: true },
      { text: 'の上限', hit: false },
    ]);
  });

  it('is case- and width-insensitive', () => {
    expect(highlight('Odyle Energy', 'ＯＤＹＬＥ')).toEqual([
      { text: 'Odyle', hit: true },
      { text: ' Energy', hit: false },
    ]);
  });

  it('returns a single segment when nothing matches or query is empty', () => {
    expect(highlight('abc', 'zzz')).toEqual([{ text: 'abc', hit: false }]);
    expect(highlight('abc', '')).toEqual([{ text: 'abc', hit: false }]);
    expect(highlight('', 'a')).toEqual([]);
  });
});

describe('makeSnippet', () => {
  it('returns the whole text when short', () => {
    expect(makeSnippet('短い文', '文')).toEqual(highlight('短い文', '文'));
  });

  it('centers on the first hit with ellipses', () => {
    const text = `${'あ'.repeat(100)}目標${'い'.repeat(100)}`;
    const segments = makeSnippet(text, '目標', 30);
    expect(segments[0]).toEqual({ text: '…', hit: false });
    expect(segments.at(-1)).toEqual({ text: '…', hit: false });
    expect(segments.some((s) => s.hit && s.text === '目標')).toBe(true);
    expect(segments.map((s) => s.text).join('').length).toBeLessThanOrEqual(32);
  });

  it('starts at the beginning when there is no hit', () => {
    const segments = makeSnippet('x'.repeat(50), 'zz', 10);
    expect(segments[0]).toEqual({ text: 'x'.repeat(10), hit: false });
    expect(segments).toHaveLength(2);
  });
});

describe('makeContextSnippet', () => {
  it('表のセル区切りを「 / 」にする', () => {
    const segments = makeContextSnippet('項目 | 内容 ｜ 日次リセット', 'リセット') ?? [];
    expect(segments.map((s) => s.text).join('')).toBe('項目 / 内容 / 日次リセット');
  });
});
