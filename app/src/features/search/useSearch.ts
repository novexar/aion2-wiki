import type MiniSearch from 'minisearch';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { normalizeTexts, searchAllPages, type PageHit } from '../../lib/search';
import { loadPageIndex, loadPageTexts } from './index-loader';

export type SearchStatus = 'loading' | 'ready' | 'error';

export interface UseSearchOptions {
  readonly limit?: number;
  /** テスト用にインデックスの読み込み関数を差し替えられる */
  readonly loadIndex?: () => Promise<MiniSearch>;
  /** 本文スニペット用テキストの読み込み関数 */
  readonly loadTexts?: () => Promise<ReadonlyMap<string, string>>;
}

export interface UseSearchResult {
  readonly status: SearchStatus;
  readonly results: readonly PageHit[];
  /** limit で切る前の総件数 */
  readonly total: number;
  /** 結果が対応しているクエリ（入力中の遅延を考慮） */
  readonly query: string;
}

/** インデックスを遅延読込し、入力に追従して検索結果を返す */
export function useSearch(query: string, options: UseSearchOptions = {}): UseSearchResult {
  const { limit = 20, loadIndex = loadPageIndex, loadTexts = loadPageTexts } = options;
  const [index, setIndex] = useState<MiniSearch | null>(null);
  const [texts, setTexts] = useState<ReadonlyMap<string, string> | null>(null);
  const [failed, setFailed] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let active = true;
    loadIndex()
      .then((loaded) => {
        if (active) setIndex(loaded);
      })
      .catch((error: unknown) => {
        console.error('検索インデックスの読み込みに失敗しました', error);
        if (active) setFailed(true);
      });
    loadTexts()
      .then((loaded) => {
        if (active) setTexts(loaded);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [loadIndex, loadTexts]);

  const normalized = useMemo(() => (texts ? normalizeTexts(texts) : undefined), [texts]);
  const all = useMemo(
    () => (index ? searchAllPages(index, deferredQuery, normalized) : []),
    [index, normalized, deferredQuery],
  );
  const results = useMemo(
    () =>
      all.slice(0, limit).map((hit) => {
        const text = texts?.get(hit.id);
        return text ? { ...hit, text } : hit;
      }),
    [all, texts, limit],
  );

  const status: SearchStatus = failed ? 'error' : index ? 'ready' : 'loading';
  return { status, results, total: all.length, query: deferredQuery };
}
