// 生成済みデータ（npm run content の出力）を使う
import MiniSearch from 'minisearch';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { pageIndexOptions } from '../../lib/search-options';

const generated = path.resolve(process.cwd(), 'src/generated');
const index = MiniSearch.loadJSON(
  readFileSync(path.join(generated, 'search-index.json'), 'utf8'),
  pageIndexOptions,
);
const texts = new Map(
  Object.entries(
    JSON.parse(readFileSync(path.join(generated, 'search-text.json'), 'utf8')) as Record<
      string,
      string
    >,
  ),
);
vi.mock('../search/index-loader', () => ({
  loadPageIndex: async () => index,
  loadPageTexts: async () => texts,
}));

const { retrieveChunks, prependArticleChunks } = await import('./chunk-loader');

describe('chunk-loader', () => {
  it('loads only the matching articles and returns chunk text with headings', async () => {
    const chunks = await retrieveChunks({ history: [], question: 'リセット時刻はいつ？' });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((c) => c.text.length > 0 && c.title.length > 0)).toBe(true);
    expect(chunks.some((c) => c.articleId === 'reset-times')).toBe(true);
    expect(new Set(chunks.map((c) => c.articleId)).size).toBeLessThanOrEqual(5);
  });

  it('puts the context article first, up to 2 chunks, without duplicates', async () => {
    const chunks = await retrieveChunks({
      history: [],
      question: 'リセット時刻はいつ？',
      contextArticleId: 'kina-farming',
    });
    expect(chunks.slice(0, 2).map((c) => c.id)).toEqual(['kina-farming#0', 'kina-farming#1']);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });

  it('drops the context article when it has no chunks', () => {
    expect(prependArticleChunks(undefined, [])).toEqual([]);
  });
});
