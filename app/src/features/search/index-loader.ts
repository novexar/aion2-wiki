import MiniSearch from 'minisearch';
import { pageIndexOptions } from '../../lib/search-options';

type SerializedIndex = Parameters<typeof MiniSearch.loadJS>[0];

let pageIndexPromise: Promise<MiniSearch> | null = null;

/** 記事検索インデックスを初回のみ読み込む（検索 UI を開いた時点で取得） */
export function loadPageIndex(): Promise<MiniSearch> {
  pageIndexPromise ??= import('../../generated/search-index.json')
    .then((mod) => MiniSearch.loadJS(mod.default as unknown as SerializedIndex, pageIndexOptions))
    .catch((error: unknown) => {
      pageIndexPromise = null;
      throw error;
    });
  return pageIndexPromise;
}
