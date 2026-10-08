import { describe, expect, it } from 'vitest';
import { contentWords, normalizeQuery } from './query-normalize';

describe('contentWords', () => {
  it('removes request phrasing and keeps the topic word', () => {
    expect(contentWords('金策の方法について教えて')).toEqual(['金策']);
    expect(contentWords('お金の稼ぎ方を教えてください')).toEqual(['お金', '稼ぎ方']);
  });

  it('drops question words and verbs around the content words', () => {
    expect(contentWords('ルーンは何個まで装着できる？')).toEqual(['ルーン', '装着']);
    expect(contentWords('会員価格はいくらですか')).toEqual(['会員価格']);
    expect(contentWords('取引所の手数料はいくら？')).toEqual(['取引所', '手数料']);
  });

  it('keeps single kanji and latin words but drops single kana', () => {
    expect(contentWords('剣 と 盾')).toEqual(['剣', '盾']);
    expect(contentWords('★2 の入場 IL はいくつ？')).toEqual(['2', '入場', 'il']);
    expect(contentWords('あ、ん')).toEqual([]);
  });

  it('removes duplicates', () => {
    expect(contentWords('金策 金策について')).toEqual(['金策']);
  });

  it('falls back to the raw words when only phrasing remains', () => {
    expect(contentWords('どうすればいい？')).toEqual(['どうすればいい']);
  });

  it('returns nothing for symbols only', () => {
    expect(contentWords('？！')).toEqual([]);
  });
});

describe('normalizeQuery', () => {
  it('joins content words with spaces', () => {
    expect(normalizeQuery('ルーンは何個まで装着できる？')).toBe('ルーン 装着');
  });

  it('keeps a bare keyword unchanged', () => {
    expect(normalizeQuery('金策')).toBe('金策');
  });
});

describe('contentWords filler boundaries', () => {
  it('keeps あるじ and どうぐ intact', () => {
    expect(contentWords('あるじとは')).toContain('あるじ');
    expect(contentWords('どうぐの強化')).toContain('どうぐ');
  });

  it('still strips fillers at run boundaries', () => {
    expect(contentWords('金策の方法について教えて')).toEqual(['金策']);
  });
});
