import { describe, expect, it } from 'vitest';
import { isCjkChar, normalizeText, tokenize, tokenizeQuery } from './tokenizer';

describe('tokenize', () => {
  it('splits CJK runs into character bigrams', () => {
    expect(tokenize('遠征報酬')).toEqual(['遠征', '征報', '報酬']);
  });

  it('keeps a single CJK character as-is', () => {
    expect(tokenize('金')).toEqual(['金']);
  });

  it('lowercases latin words and keeps digits', () => {
    expect(tokenize('Odyle Energy 560')).toEqual(['odyle', 'energy', '560']);
  });

  it('handles mixed scripts and punctuation', () => {
    expect(tokenize('オードエネルギー（Odyle）、上限560')).toEqual([
      'オー',
      'ード',
      'ドエ',
      'エネ',
      'ネル',
      'ルギ',
      'ギー',
      'odyle',
      '上限',
      '560',
    ]);
  });

  it('normalizes full-width alphanumerics and half-width katakana (NFKC)', () => {
    expect(tokenize('ＡＩＯＮ２')).toEqual(['aion2']);
    expect(tokenize('ｷﾅ')).toEqual(['キナ']);
  });

  it('treats the iteration mark and long vowel mark as CJK', () => {
    expect(tokenize('色々')).toEqual(['色々']);
    expect(isCjkChar('ー')).toBe(true);
    expect(isCjkChar('a')).toBe(false);
  });

  it('returns no tokens for empty or symbol-only input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('！？・ー'.slice(0, 3))).toEqual([]);
  });

  it('supports hangul', () => {
    expect(tokenize('아이온')).toEqual(['아이', '이온']);
  });
});

describe('tokenizeQuery', () => {
  it('deduplicates tokens', () => {
    expect(tokenizeQuery('ああああ')).toEqual(['ああ']);
  });
});

describe('normalizeText', () => {
  it('applies NFKC and lowercase', () => {
    expect(normalizeText('ＫＩＮＡＨ')).toBe('kinah');
  });
});

describe('single-character CJK search', () => {
  it('finds a document containing 剣 with the query 剣', async () => {
    const { default: MiniSearch } = await import('minisearch');
    const { pageIndexOptions } = await import('./search-options');
    const index = new MiniSearch(pageIndexOptions);
    index.add({
      id: 'a',
      title: '剣士',
      aliases: '',
      tags: '',
      summary: '',
      headings: '',
      body: '',
    });
    expect(index.search('剣').map((r) => r.id)).toEqual(['a']);
    expect(index.search('剣士').map((r) => r.id)).toEqual(['a']);
  });
});
