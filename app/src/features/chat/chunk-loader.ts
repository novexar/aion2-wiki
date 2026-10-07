import MiniSearch from 'minisearch';
import { chunkIndexOptions } from '../../lib/search-options';
import type { Chunk, ChunkRef, ChunksData } from '../../lib/types';
import { articleById } from '../wiki/data';

type SerializedIndex = Parameters<typeof MiniSearch.loadJS>[0];

export interface ChunkStore {
  readonly index: MiniSearch;
  readonly byId: ReadonlyMap<string, ChunkRef>;
}

let storePromise: Promise<ChunkStore> | null = null;

/** RAG 用のチャンク索引（位置情報のみ）を初回だけ読み込む */
export function loadChunkStore(): Promise<ChunkStore> {
  storePromise ??= import('../../generated/chunks.json')
    .then((mod) => {
      const data = mod.default as unknown as ChunksData;
      return {
        index: MiniSearch.loadJS(data.index as SerializedIndex, chunkIndexOptions),
        byId: new Map(data.chunks.map((c) => [c.id, c])),
      };
    })
    .catch((error: unknown) => {
      storePromise = null;
      throw error;
    });
  return storePromise;
}

/** 記事ごとのチャンク本文（chunk-text/<articleId>.json）。必要な記事の分だけ読み込む */
const textModules = import.meta.glob<readonly string[]>('../../generated/chunk-text/*.json', {
  import: 'default',
});

const textCache = new Map<string, Promise<readonly string[]>>();

function loadArticleTexts(articleId: string): Promise<readonly string[]> {
  const cached = textCache.get(articleId);
  if (cached) return cached;
  const loader = textModules[`../../generated/chunk-text/${articleId}.json`];
  const promise = (loader ? loader() : Promise.resolve([] as readonly string[])).catch(
    (error: unknown) => {
      textCache.delete(articleId);
      throw error;
    },
  );
  textCache.set(articleId, promise);
  return promise;
}

/** チャンク ID の末尾（#n）が記事内の位置 */
function chunkPosition(ref: ChunkRef): number {
  return Number(ref.id.slice(ref.id.lastIndexOf('#') + 1));
}

/** 位置情報に本文・記事タイトル・カテゴリを補ってチャンクにする（本文が無いものは除く） */
export async function resolveChunks(refs: readonly ChunkRef[]): Promise<Chunk[]> {
  const ids = [...new Set(refs.map((r) => r.articleId))];
  const texts = new Map(
    await Promise.all(ids.map(async (id) => [id, await loadArticleTexts(id)] as const)),
  );
  return refs.flatMap((ref) => {
    const meta = articleById.get(ref.articleId);
    const text = texts.get(ref.articleId)?.[chunkPosition(ref)];
    if (!meta || text === undefined) return [];
    return [{ ...ref, title: meta.title, category: meta.category, text }];
  });
}
