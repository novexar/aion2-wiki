import MiniSearch from 'minisearch';
import type { SearchResult } from 'minisearch';
import { toHiragana } from './gojuon';
import { normalizeText, tokenizeQuery } from './tokenizer';
import type { Confidence, PageSearchStored } from './types';
import type { CategoryId } from './categories';

export interface PageHit {
  readonly id: string;
  readonly title: string;
  readonly category: CategoryId;
  readonly summary: string;
  readonly confidence: Confidence;
  readonly aliases: string;
  readonly score: number;
  /** 本文先頭 2,000 文字（読み込み後のみ） */
  readonly text?: string;
  /** true なら索引（題名・別名・タグ・概要・見出し）に無く、本文だけで一致した */
  readonly bodyOnly?: boolean;
}

/** OR 検索にフォールバックした時に、クエリ語の何割以上が一致すれば結果に残すか */
const OR_FALLBACK_MIN_RATIO = 0.5;

/**
 * まず AND（全 bigram 一致 ≒ 部分文字列一致）で検索し、0 件なら OR に緩める。
 * OR はノイズが多いので、一致したクエリ語の割合でふるいにかける。
 */
export function searchWithFallback(index: MiniSearch, query: string): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const strict = index.search(q, { combineWith: 'AND' });
  if (strict.length > 0) return strict;
  const total = tokenizeQuery(q).length;
  if (total === 0) return [];
  return index
    .search(q, { combineWith: 'OR' })
    .filter((r) => r.queryTerms.length / total >= OR_FALLBACK_MIN_RATIO);
}

function toPageHit(id: string, stored: PageSearchStored, score: number): PageHit {
  return {
    id,
    title: stored.title,
    category: stored.category,
    summary: stored.summary,
    confidence: stored.confidence,
    aliases: stored.aliases ?? '',
    score,
  };
}

const fromResult = (result: SearchResult): PageHit =>
  toPageHit(String(result.id), result as unknown as PageSearchStored, result.score);

/** 記事 ID → 正規化済み本文（normalizeText 済み）。本文一致の照合に使う */
export type NormalizedTexts = ReadonlyMap<string, string>;

export function normalizeTexts(texts: ReadonlyMap<string, string>): NormalizedTexts {
  return new Map([...texts].map(([id, text]) => [id, normalizeText(text)]));
}

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

/** 空白区切りの語がすべて本文に含まれる記事を、出現回数の多い順に返す */
export function searchBody(texts: NormalizedTexts, query: string): string[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const hits: { id: string; count: number }[] = [];
  for (const [id, text] of texts) {
    const counts = words.map((w) => countOccurrences(text, w));
    if (counts.every((c) => c > 0)) hits.push({ id, count: counts.reduce((a, b) => a + b, 0) });
  }
  return hits.sort((a, b) => b.count - a.count).map((h) => h.id);
}

const KANA_CHAR = /^[ぁ-ゖァ-ヺー]$/;
const prefixKey = (text: string): string => toHiragana(normalizeText(text.trim()));

/** 1 文字の仮名クエリか（部分一致では意味を成さないので前方一致だけにする） */
export function isSingleKana(query: string): boolean {
  return KANA_CHAR.test(query.trim());
}

/** 題名 → 別名の前方一致（仮名はひらがなに寄せて比較）。題名一致を先に、短い題名から */
export function searchPrefix(index: MiniSearch, query: string): PageHit[] {
  const key = prefixKey(query);
  if (!key) return [];
  const rank = (stored: PageSearchStored): number => {
    if (prefixKey(stored.title).startsWith(key)) return 0;
    const aliases = (stored.aliases ?? '').split(' / ');
    return aliases.some((a) => prefixKey(a).startsWith(key)) ? 1 : -1;
  };
  return index
    .search(MiniSearch.wildcard)
    .map((r) => ({ hit: fromResult(r), rank: rank(r as unknown as PageSearchStored) }))
    .filter((x) => x.rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.hit.title.length - b.hit.title.length ||
        a.hit.title.localeCompare(b.hit.title, 'ja'),
    )
    .map((x) => x.hit);
}

/**
 * 記事検索（件数制限なし）。題名・別名・タグ・概要・見出しの索引（AND）に本文の部分一致を後ろに足す。
 * どちらも 0 件なら索引の OR 検索に緩める。1 文字の仮名は題名・別名の前方一致だけ。
 */
export function searchAllPages(
  index: MiniSearch,
  query: string,
  texts?: NormalizedTexts,
): PageHit[] {
  const q = query.trim();
  if (!q) return [];
  if (isSingleKana(q)) return searchPrefix(index, q);
  const strict = index.search(q, { combineWith: 'AND' }).map(fromResult);
  const seen = new Set(strict.map((h) => h.id));
  const body = texts
    ? searchBody(texts, q).flatMap((id) => {
        const stored = seen.has(id) ? undefined : index.getStoredFields(id);
        return stored
          ? [{ ...toPageHit(id, stored as unknown as PageSearchStored, 0), bodyOnly: true }]
          : [];
      })
    : [];
  const hits = [...strict, ...body];
  if (hits.length > 0) return hits;
  return searchWithFallback(index, q).map(fromResult);
}

/** 記事検索の上位 limit 件 */
export function searchPages(
  index: MiniSearch,
  query: string,
  limit = 20,
  texts?: NormalizedTexts,
): PageHit[] {
  return searchAllPages(index, query, texts).slice(0, limit);
}
