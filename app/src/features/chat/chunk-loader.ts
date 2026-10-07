import MiniSearch from 'minisearch';
import { chunkIndexOptions } from '../../lib/search-options';
import type { Chunk, ChunksData } from '../../lib/types';

type SerializedIndex = Parameters<typeof MiniSearch.loadJS>[0];

export interface ChunkStore {
  readonly index: MiniSearch;
  readonly byId: ReadonlyMap<string, Chunk>;
}

let storePromise: Promise<ChunkStore> | null = null;

/** RAG 用のチャンクとインデックスを初回のみ読み込む */
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
