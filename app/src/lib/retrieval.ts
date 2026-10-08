/**
 * チャット用の検索。専用のチャンク索引は持たず、
 * 1) サイト検索索引（記事単位）で上位の記事を選び、
 * 2) その記事のチャンクを質問語の出現数で順位付けする。
 * ブラウザとテスト（Node）の両方から使えるよう、I/O を持たない関数だけを置く。
 */
import type MiniSearch from 'minisearch';
import type { CategoryId } from './categories';
import { PER_ARTICLE_LIMIT } from './rag';
import { searchWithFallback } from './search';
import { isLatinTerm } from './search-options';
import { normalizeText, tokenize, tokenizeQuery } from './tokenizer';
import type { ArticleChunk, Chunk } from './types';

/** チャンクを取りに行く記事数 */
export const TOP_ARTICLES = 5;

/** 記事検索索引で質問に近い記事 ID を上位から返す（重複なし） */
export function topArticleIds(index: MiniSearch, query: string, limit = TOP_ARTICLES): string[] {
  const ids = new Set<string>();
  for (const result of searchWithFallback(index, query)) {
    ids.add(String(result.id));
    if (ids.size >= limit) break;
  }
  return [...ids];
}

/** 質問を語の塊に分ける区切り（助詞・空白・句読点）。助詞をまたぐ bigram は作らない */
const RUN_SEPARATOR = /[のはがをにでともへ\s、。,.?？!！]+/u;

const HIRAGANA_ONLY = /^[ぁ-ゖ]+$/u;

/**
 * 質問を語の塊（run）に分け、それぞれを bigram / 英単語にする。1 文字の英数字は除く。
 * 塊ごとに点数を平均するので、長い語（オードエネルギー）が短い語（回復量）を押し流さない。
 */
export function queryRuns(query: string): string[][] {
  const runs = normalizeText(query)
    .split(RUN_SEPARATOR)
    .map((run) => tokenize(run).filter((t) => !isLatinTerm(t) || t.length >= 2))
    .filter((terms) => terms.length > 0);
  // ひらがなだけの短い塊（いくら・いつ・どう。bigram 2 個以下）は質問の言い回しで、記事の語ではない
  const content = runs.filter(
    (terms) => terms.length > 2 || !terms.every((t) => HIRAGANA_ONLY.test(t)),
  );
  if (content.length > 0) return content;
  if (runs.length > 0) return runs;
  const all = tokenizeQuery(query);
  return all.length > 0 ? [all] : [];
}

/** 質問に含まれる語（重複なし） */
export function queryTerms(query: string): string[] {
  return [...new Set(queryRuns(query).flat())];
}

/** 記事検索索引で足りないとき、本文冒頭（search-text.json）に質問語が多く含まれる記事を返す */
export function bodyArticleIds(
  texts: ReadonlyMap<string, string>,
  query: string,
  limit = TOP_ARTICLES,
  minRatio = 0.5,
): string[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const hits: { id: string; distinct: number; total: number }[] = [];
  for (const [id, text] of texts) {
    const { distinct, total } = scoreText([terms], normalizeText(text));
    if (distinct / terms.length >= minRatio) hits.push({ id, distinct, total });
  }
  return hits
    .sort((a, b) => b.distinct - a.distinct || b.total - a.total)
    .slice(0, limit)
    .map((h) => h.id);
}

/** 索引の上位からこの件数は必ず残し、残りの枠に本文一致の記事を入れる */
export const INDEX_KEEP = 3;

/**
 * チャンクを取りに行く記事を選ぶ。記事検索索引の上位 INDEX_KEEP 件 →
 * 本文冒頭（search-text.json）に質問語が多く出る記事 → 索引の残り、の順に limit 件まで。
 * 索引は題名・見出し中心で本文の語（「入場 IL」など）を持たないため、本文一致で補う。
 */
export async function selectArticleIds(
  index: MiniSearch,
  query: string,
  getTexts: () => Promise<ReadonlyMap<string, string>>,
  limit = TOP_ARTICLES,
): Promise<string[]> {
  const indexed = topArticleIds(index, query, limit);
  const body = bodyArticleIds(await getTexts(), query, limit);
  return [...new Set([...indexed.slice(0, INDEX_KEEP), ...body, ...indexed])].slice(0, limit);
}

export interface ChunkScore {
  /** 一致した質問語（重複なし）の数 */
  readonly distinct: number;
  /** 質問語の出現回数の合計 */
  readonly total: number;
  /** 一致した質問語の重みの合計（候補全体で珍しい語ほど重い。見出しの一致は 1.5 倍） */
  readonly weight: number;
}

/** 見出しに質問語が含まれるときの重みの倍率 */
const HEADING_BOOST = 1.5;

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  for (
    let i = haystack.indexOf(needle);
    i !== -1;
    i = haystack.indexOf(needle, i + needle.length)
  ) {
    count += 1;
  }
  return count;
}

function scoreText(
  runs: readonly (readonly string[])[],
  body: string,
  heading = '',
  idf: ReadonlyMap<string, number> = new Map(),
): ChunkScore {
  let distinct = 0;
  let total = 0;
  let weight = 0;
  for (const run of runs) {
    for (const term of run) {
      const n = countOccurrences(body, term);
      const inHeading = heading !== '' && heading.includes(term);
      if (n === 0 && !inHeading) continue;
      distinct += 1;
      total += n;
      // 塊の中の一致は平均する（長い語が点数を独占しない）
      weight += ((idf.get(term) ?? 1) * (inHeading ? HEADING_BOOST : 1)) / run.length;
    }
  }
  return { distinct, total, weight };
}

/** 質問の語の塊（queryRuns）がチャンクの見出し + 本文に出る度合い */
export function scoreChunk(
  runs: readonly (readonly string[])[],
  chunk: ArticleChunk,
  idf?: ReadonlyMap<string, number>,
): ChunkScore {
  return scoreText(runs, normalizeText(chunk.text), normalizeText(chunk.heading), idf);
}

/** 候補チャンク全体での質問語の重み（log((N+1)/(df+0.5))）。どのチャンクにも出る語は軽くなる */
export function termWeights(
  terms: readonly string[],
  chunks: readonly ArticleChunk[],
): Map<string, number> {
  const haystacks = chunks.map((c) => normalizeText(`${c.heading} ${c.text}`));
  return new Map(
    terms.map((term) => {
      const df = haystacks.filter((h) => h.includes(term)).length;
      return [term, Math.max(0.1, Math.log((haystacks.length + 1) / (df + 0.5)))] as const;
    }),
  );
}

/** 記事ごとのチャンクと表示用メタ情報（記事は関連度順に並べる） */
export interface ArticleChunks {
  readonly articleId: string;
  readonly title: string;
  readonly category: CategoryId;
  readonly chunks: readonly ArticleChunk[];
}

interface Candidate {
  readonly chunk: Chunk;
  readonly score: ChunkScore;
  readonly articleRank: number;
}

function toChunk(article: ArticleChunks, position: number): Chunk | undefined {
  const raw = article.chunks[position];
  if (!raw) return undefined;
  return {
    id: `${article.articleId}#${position}`,
    articleId: article.articleId,
    category: article.category,
    title: article.title,
    heading: raw.heading,
    anchor: raw.anchor,
    text: raw.text,
  };
}

const NO_SCORE: ChunkScore = { distinct: 0, total: 0, weight: 0 };

function candidatesOf(
  article: ArticleChunks,
  articleRank: number,
  runs: readonly (readonly string[])[],
  idf: ReadonlyMap<string, number>,
  perArticle: number,
): Candidate[] {
  const scored = article.chunks
    .map((raw, position) => ({ position, score: scoreChunk(runs, raw, idf) }))
    .filter((s) => s.score.distinct > 0)
    .sort((a, b) => b.score.weight - a.score.weight || b.score.total - a.score.total)
    .slice(0, perArticle);
  // 本文に質問語が無くても（題名・別名で選ばれた記事）、冒頭のチャンクは候補に残す
  const picks = scored.length > 0 ? scored : [{ position: 0, score: NO_SCORE }];
  return picks.flatMap(({ position, score }) => {
    const chunk = toChunk(article, position);
    return chunk ? [{ chunk, score, articleRank }] : [];
  });
}

/**
 * 記事（関連度順）のチャンクを質問語の一致で順位付けして返す。
 * 一致した語の重み → 出現回数 → 記事の関連度の順。同一記事は perArticle 件まで。
 */
export function rankChunks(
  query: string,
  articles: readonly ArticleChunks[],
  perArticle = PER_ARTICLE_LIMIT,
): Chunk[] {
  const runs = queryRuns(query);
  const idf = termWeights(
    runs.flat(),
    articles.flatMap((a) => a.chunks),
  );
  // 記事検索で上位だった記事のチャンクを少し優遇する（1 位 ×1.5、2 位 ×1.25 …）
  const priored = (c: Candidate): number => c.score.weight * (1 + 0.5 / (c.articleRank + 1));
  return articles
    .flatMap((article, rank) => candidatesOf(article, rank, runs, idf, perArticle))
    .sort(
      (a, b) =>
        priored(b) - priored(a) || b.score.total - a.score.total || a.articleRank - b.articleRank,
    )
    .map((c) => c.chunk);
}
