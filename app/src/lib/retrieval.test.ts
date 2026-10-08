import MiniSearch from 'minisearch';
import { describe, expect, it } from 'vitest';
import {
  queryRuns,
  rankChunks,
  scoreChunk,
  selectArticleIds,
  topArticleIds,
  type ArticleChunks,
} from './retrieval';
import { pageIndexOptions } from './search-options';

function article(id: string, chunks: [string, string][]): ArticleChunks {
  return {
    articleId: id,
    title: id,
    category: 'economy',
    chunks: chunks.map(([heading, text]) => ({ heading, anchor: heading, text })),
  };
}

describe('queryRuns', () => {
  it('splits at particles and drops short hiragana-only filler', () => {
    expect(queryRuns('オードエネルギーの回復量は？')).toEqual([
      ['オー', 'ード', 'ドエ', 'エネ', 'ネル', 'ルギ', 'ギー'],
      ['回復', '復量'],
    ]);
    expect(queryRuns('会員価格はいくら？')).toEqual([['会員', '員価', '価格']]);
  });

  it('drops single-character latin tokens but keeps words', () => {
    expect(queryRuns('★2 の入場 IL')).toEqual([['入場'], ['il']]);
  });

  it('falls back to the raw tokens when everything would be dropped', () => {
    expect(queryRuns('いくら').flat().length).toBeGreaterThan(0);
  });
});

describe('scoreChunk / rankChunks', () => {
  const a = article('a', [
    ['', '遠征の報酬は週に一度受け取れる'],
    ['回復量と上限', '自然回復は三時間ごとに十五'],
  ]);
  const b = article('b', [['', '日課の一覧。回復の話はしない']]);

  it('counts distinct terms and occurrences in heading and body', () => {
    const [run] = queryRuns('回復量');
    const score = scoreChunk([run ?? []], a.chunks[1] ?? { heading: '', anchor: '', text: '' });
    expect(score.distinct).toBe(2);
    expect(score.total).toBeGreaterThan(0);
  });

  it('ranks the chunk that matches the most distinctive terms first', () => {
    const ranked = rankChunks('回復量', [b, a]);
    expect(ranked[0]?.id).toBe('a#1');
    expect(ranked[0]).toMatchObject({ heading: '回復量と上限', title: 'a' });
  });

  it('keeps at most 2 chunks per article and falls back to the first chunk', () => {
    const many = article(
      'm',
      Array.from({ length: 5 }, (_, i) => ['', `報酬の話 ${i}`] as [string, string]),
    );
    expect(rankChunks('報酬', [many]).map((c) => c.id)).toEqual(['m#0', 'm#1']);
    expect(rankChunks('まったく無関係な質問文', [a]).map((c) => c.id)).toEqual(['a#0']);
  });
});

describe('selectArticleIds', () => {
  const index = new MiniSearch(pageIndexOptions);
  index.addAll(
    ['遠征', '日課', '報酬', 'ギーナ', 'ルーン', 'クラス'].map((title) => ({
      id: title,
      title,
      aliases: '',
      tags: '',
      summary: '',
      headings: '',
      category: 'economy',
      confidence: 'high',
    })),
  );

  it('picks at most the top 5 indexed articles', () => {
    expect(topArticleIds(index, '遠征').length).toBeLessThanOrEqual(5);
    expect(topArticleIds(index, '遠征')[0]).toBe('遠征');
  });

  const entry = (id: string, fields: Record<string, string>): Record<string, string> => ({
    id,
    title: id,
    aliases: '',
    tags: '',
    summary: '',
    headings: '',
    category: 'economy',
    confidence: 'high',
    ...fields,
  });

  it('finds the article by a content word despite question phrasing', async () => {
    const ids = await selectArticleIds(index, 'ルーンの方法について教えて', async () => new Map());
    expect(ids).toEqual(['ルーン']);
  });

  it('ranks title matches above summary matches', async () => {
    const weighted = new MiniSearch(pageIndexOptions);
    weighted.addAll([
      entry('a', { title: '別の話', summary: '金策にも少し触れる' }),
      entry('b', { title: '金策' }),
    ]);
    const ids = await selectArticleIds(weighted, '金策', async () => new Map());
    expect(ids).toEqual(['b', 'a']);
  });

  it('adds at most one body-only article and drops articles with no field match', async () => {
    const weighted = new MiniSearch(pageIndexOptions);
    weighted.addAll([entry('head', { title: '遠征の入場' })]);
    const texts = new Map([
      ['body-1', '遠征の入場条件の説明'],
      ['body-2', '遠征の入場に必要な装備'],
      ['unrelated', '関係のない文章'],
    ]);
    const ids = await selectArticleIds(weighted, '遠征の入場', async () => texts);
    expect(ids[0]).toBe('head');
    expect(ids.filter((id) => id.startsWith('body'))).toHaveLength(1);
    expect(ids).not.toContain('unrelated');
  });

  it('expands synonyms to the article title', async () => {
    const weighted = new MiniSearch(pageIndexOptions);
    weighted.addAll([entry('kina-farming', { title: '金策' }), entry('other', { title: '強化' })]);
    const ids = await selectArticleIds(weighted, 'お金の稼ぎ方', async () => new Map());
    expect(ids).toEqual(['kina-farming']);
  });

  it('returns nothing for a question without content words', async () => {
    expect(await selectArticleIds(index, '？！', async () => new Map())).toEqual([]);
  });
});
