import MiniSearch from 'minisearch';
import indexUrl from '../../generated/search-index.json?url';
import textUrl from '../../generated/search-text.json?url';
import { pageIndexOptions } from '../../lib/search-options';

let pageIndexPromise: Promise<MiniSearch> | null = null;
let pageTextsPromise: Promise<ReadonlyMap<string, string>> | null = null;

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/** 記事検索インデックスを初回のみ fetch して読み込む（検索 UI を開いた時点で取得） */
export function loadPageIndex(): Promise<MiniSearch> {
  pageIndexPromise ??= fetchText(indexUrl)
    .then((json) => MiniSearch.loadJSON(json, pageIndexOptions))
    .catch((error: unknown) => {
      pageIndexPromise = null;
      throw error;
    });
  return pageIndexPromise;
}

/** 記事 ID → 本文先頭 2,000 文字（スニペット用）。失敗時は空の Map を返す */
export function loadPageTexts(): Promise<ReadonlyMap<string, string>> {
  pageTextsPromise ??= fetchText(textUrl)
    .then((json) => new Map(Object.entries(JSON.parse(json) as Record<string, string>)))
    .catch((error: unknown) => {
      console.error('検索用本文の読み込みに失敗しました', error);
      pageTextsPromise = null;
      return new Map<string, string>();
    });
  return pageTextsPromise;
}
