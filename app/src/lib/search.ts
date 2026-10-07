import type MiniSearch from 'minisearch';
import type { SearchResult } from 'minisearch';
import { tokenizeQuery } from './tokenizer';
import type { Chunk, Confidence, PageSearchStored } from './types';
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

function toPageHit(result: SearchResult): PageHit {
  const stored = result as unknown as PageSearchStored & { score: number };
  return {
    id: String(result.id),
    title: stored.title,
    category: stored.category,
    summary: stored.summary,
    confidence: stored.confidence,
    aliases: stored.aliases ?? '',
    score: result.score,
  };
}

export function searchPages(index: MiniSearch, query: string, limit = 20): PageHit[] {
  return searchWithFallback(index, query).slice(0, limit).map(toPageHit);
}

/** RAG 用: 上位 limit 件のチャンクを返す */
export function searchChunks(
  index: MiniSearch,
  chunksById: ReadonlyMap<string, Chunk>,
  query: string,
  limit = 8,
): Chunk[] {
  const out: Chunk[] = [];
  for (const result of searchWithFallback(index, query)) {
    const chunk = chunksById.get(String(result.id));
    if (chunk) out.push(chunk);
    if (out.length >= limit) break;
  }
  return out;
}
