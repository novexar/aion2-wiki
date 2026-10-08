import { describe, expect, it } from 'vitest';
import { buildSynonymDict, expandTerms } from './synonyms';

describe('buildSynonymDict', () => {
  const dict = buildSynonymDict([
    { title: '金策', aliases: ['ギーナ稼ぎ', 'Kina farm', '10', 'あ', '金策'] },
    { title: 'オードエネルギー', aliases: ['ODY', '使い道'] },
    { title: '別の記事', aliases: ['使い道', 'x'.repeat(40)] },
  ]);

  it('maps normalized aliases to article titles', () => {
    expect(dict['ギーナ稼ぎ']).toEqual(['金策']);
    expect(dict['kina farm']).toEqual(['金策']);
    expect(dict['ody']).toEqual(['オードエネルギー']);
  });

  it('skips digits, too short or long aliases and the title itself', () => {
    expect(dict['10']).toBeUndefined();
    expect(dict['あ']).toBeUndefined();
    expect(dict['金策']).toBeUndefined();
    expect(Object.keys(dict).some((k) => k.startsWith('xxxx'))).toBe(false);
  });

  it('keeps aliases shared by a few articles', () => {
    expect(dict['使い道']).toEqual(['オードエネルギー', '別の記事']);
  });

  it('drops aliases shared by too many articles', () => {
    const many = buildSynonymDict(
      ['a', 'b', 'c', 'd'].map((t) => ({ title: t, aliases: ['共通の語'] })),
    );
    expect(many['共通の語']).toBeUndefined();
  });
});

describe('expandTerms', () => {
  const dict = buildSynonymDict([
    { title: 'オードエネルギー', aliases: ['ODY', '補充方法'] },
    { title: '金策', aliases: ['ギーナ稼ぎ'] },
  ]);

  it('adds titles of articles whose alias appears in the question', () => {
    expect(expandTerms('ギーナ稼ぎのコツ', dict, [])).toEqual(['金策']);
  });

  it('matches latin aliases on word boundaries only', () => {
    expect(expandTerms('ODYを補充したい', dict, [])).toEqual(['オードエネルギー']);
    expect(expandTerms('god の話', dict, [])).toEqual([]);
  });

  it('uses the manual map for paraphrases', () => {
    expect(expandTerms('お金の稼ぎ方を教えてください')).toEqual(['金策', 'ギーナ']);
    expect(expandTerms('会員になるといくら？')).toContain('メンバーシップ');
  });

  it('does not repeat words already in the question', () => {
    expect(expandTerms('金策 お金')).toEqual(['ギーナ']);
  });

  it('returns nothing when no synonym applies', () => {
    expect(expandTerms('ルーン', dict)).toEqual([]);
  });
});

describe('generic alias stoplist', () => {
  const dict = buildSynonymDict([
    { title: 'FAQ ダンジョン', aliases: ['オード', 'コロ', 'ぷち', 'ab', 'スキル'] },
    { title: '合計IL', aliases: ['il', 'ゴールド'] },
  ]);

  it('drops short kana, short latin and explicit stop aliases', () => {
    expect(Object.keys(dict)).toEqual(['ゴールド']);
  });

  it('does not expand オード in an odyle energy question', () => {
    expect(expandTerms('オードエネルギーは最大いくつまで貯まる？', dict, [])).toEqual([]);
  });
});
