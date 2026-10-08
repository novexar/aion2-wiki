/**
 * チャット用の検索。専用のチャンク索引は持たず、
 * 1) サイト検索索引（記事単位）で上位の記事を選び、
 * 2) その記事のチャンクを質問語の出現数で順位付けする。
 * ブラウザとテスト（Node）の両方から使えるよう、I/O を持たない関数だけを置く。
 */
import type MiniSearch from 'minisearch';
import type { CategoryId } from './categories';
import { PER_ARTICLE_LIMIT } from './rag';
import { contentWords, normalizeQuery } from './query-normalize';
import { searchWithFallback } from './search';
import { expandTerms, type SynonymDict } from './synonyms';
import { isLatinTerm } from './search-options';
import { normalizeText, tokenize, tokenizeQuery } from './tokenizer';
import type { ArticleChunk, Chunk } from './types';

/** チャンクを取りに行く記事数 */
export const TOP_ARTICLES = 5;

/** 記事検索索引で質問に近い記事 ID を上位から返す（重複なし） */
export function topArticleIds(index: MiniSearch, query: string, limit = TOP_ARTICLES): string[] {
  const ids = new Set<string>();
  for (const result of searchWithFallback(index, normalizeQuery(query))) {
    ids.add(String(result.id));
    if (ids.size >= limit) break;
  }
  return [...ids];
}

const STAR_GRADE = /★\d/gu;
const HIRAGANA_ONLY = /^[ぁ-ゖ]+$/u;

/**
 * 質問を語の塊（run）に分け、それぞれを bigram / 英単語にする。1 文字の英数字は除く。
 * 塊ごとに点数を平均するので、長い語（オードエネルギー）が短い語（回復量）を押し流さない。
 */
export function queryRuns(query: string): string[][] {
  // 「★3」は 1 桁の数字だが等級を表すので 1 語として保つ（tokenize は ★ と 1 桁数字を捨てる）
  const stars = [...new Set(Array.from(normalizeText(query).matchAll(STAR_GRADE), (m) => m[0]))];
  const runs = [...stars.map((star) => [star])]
    .concat(
      contentWords(query).map((run) =>
        tokenize(run).filter((t) => !isLatinTerm(t) || t.length >= 2),
      ),
    )

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

/** search-text.json は不変なので、正規化(NFKC)の結果をクエリをまたいで再利用する */
const normalizedTexts = new WeakMap<ReadonlyMap<string, string>, Map<string, string>>();

function normalizedBody(texts: ReadonlyMap<string, string>, id: string, text: string): string {
  let cache = normalizedTexts.get(texts);
  if (!cache) {
    cache = new Map();
    normalizedTexts.set(texts, cache);
  }
  let value = cache.get(id);
  if (value === undefined) {
    value = normalizeText(text);
    cache.set(id, value);
  }
  return value;
}

/** 記事選択のフィールド重み。題名 > 別名 > タグ > 要約 > 見出し > 本文 */
export const FIELD_WEIGHTS: Readonly<Record<string, number>> = {
  title: 8,
  aliases: 6,
  tags: 4,
  summary: 3,
  headings: 2,
};
export const BODY_WEIGHT = 1;
/** 同義語展開で足した語の重み（元の質問語を 1 とする） */
const EXPANDED_TERM_WEIGHT = 0.7;
/** 見出し系の一致が無い記事（本文一致のみ）を候補に入れる最大数 */
export const BODY_ONLY_LIMIT = 1;
/** 本文一致のみの記事に必要な、質問語の一致割合 */
const BODY_ONLY_MIN_RATIO = 0.5;

interface WeightedTerm {
  readonly term: string;
  readonly weight: number;
}

interface ArticleScore {
  headline: number;
  body: number;
}

function weightedTerms(query: string, synonyms: SynonymDict): WeightedTerm[] {
  const words = contentWords(query).map((term) => ({ term, weight: 1 }));
  const expanded = expandTerms(query, synonyms).map((term) => ({
    term,
    weight: EXPANDED_TERM_WEIGHT,
  }));
  return [...words, ...expanded];
}

/** 語が珍しいほど大きい重み（idf。最小 0.1）。どの記事にも出る語は軽くなる */
function rarity(df: number, total: number): number {
  return Math.max(0.1, Math.log((total + 1) / (df + 0.5)));
}

/** 語ごとに、見出し系フィールドへ一致した記事 → そのフィールド重みの最大値 */
function headlineMatches(index: MiniSearch, term: string): Map<string, number> {
  const matches = new Map<string, number>();
  for (const result of searchWithFallback(index, term)) {
    // 語を作る全 bigram が当たったフィールドだけを数える（別々のフィールドに散った一致は除く）
    const [first = [], ...rest] = Object.values(result.match);
    const fields = first.filter((f) => rest.every((other) => other.includes(f)));
    const best = Math.max(0, ...fields.map((f) => FIELD_WEIGHTS[f] ?? 0));
    if (best > 0) matches.set(String(result.id), best);
  }
  return matches;
}

/**
 * チャンクを取りに行く記事を選ぶ。質問の内容語（と同義語）ごとに、
 * 題名×8・別名×6・タグ×4・要約×3・見出し×2・本文×1 の重みで記事を採点する。
 * 見出し系フィールドに一語も当たらない記事は除き、本文一致のみの記事は BODY_ONLY_LIMIT 件まで。
 */
export async function selectArticleIds(
  index: MiniSearch,
  query: string,
  getTexts: () => Promise<ReadonlyMap<string, string>>,
  limit = TOP_ARTICLES,
  synonyms: SynonymDict = {},
): Promise<string[]> {
  const terms = weightedTerms(query, synonyms);
  if (terms.length === 0) return [];
  const texts = await getTexts();
  const scores = new Map<string, ArticleScore>();
  const entry = (id: string): ArticleScore => {
    const found = scores.get(id) ?? { headline: 0, body: 0 };
    scores.set(id, found);
    return found;
  };
  const bodyHits = new Map<string, number>();
  for (const { term, weight } of terms) {
    const headline = headlineMatches(index, term);
    const body = [...texts].filter(([id, text]) => normalizedBody(texts, id, text).includes(term));
    const total = Math.max(texts.size, 1);
    for (const [id, field] of headline) {
      entry(id).headline += field * weight * rarity(headline.size, total);
    }
    for (const [id] of body) {
      entry(id).body += BODY_WEIGHT * weight * rarity(body.length, total);
      bodyHits.set(id, (bodyHits.get(id) ?? 0) + 1);
    }
  }
  const ranked = [...scores]
    .map(([id, s]) => ({ id, ...s, total: s.headline + s.body }))
    .sort((a, b) => b.total - a.total);
  const picked: string[] = [];
  let bodyOnly = 0;
  for (const r of ranked) {
    if (picked.length >= limit) break;
    if (r.headline === 0) {
      const ratio = (bodyHits.get(r.id) ?? 0) / terms.length;
      if (bodyOnly >= BODY_ONLY_LIMIT || ratio < BODY_ONLY_MIN_RATIO) continue;
      bodyOnly += 1;
    }
    picked.push(r.id);
  }
  return picked;
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
  // 本文に質問語が無くても（題名・別名で選ばれた記事）、冒頭（導入）のチャンクは必ず候補に残す
  const picks = scored.some((s) => s.position === 0)
    ? scored
    : [...scored, { position: 0, score: NO_SCORE }];
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
