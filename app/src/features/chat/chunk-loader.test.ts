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
// 特定の記事 id に依存しないよう、生成済みデータから対象を選ぶ
const metas = JSON.parse(readFileSync(path.join(generated, 'meta.json'), 'utf8')) as {
  id: string;
  title: string;
}[];
const chunkCount = (id: string): number =>
  (JSON.parse(readFileSync(path.join(generated, 'chunk-text', `${id}.json`), 'utf8')) as unknown[])
    .length;
const target = metas.find((m) => m.title.length >= 4 && chunkCount(m.id) >= 1);
const contextArticle = metas.find((m) => m.id !== target?.id && chunkCount(m.id) >= 2);
if (!target || !contextArticle) throw new Error('生成済みデータに十分な記事がありません');
const question = `${target.title}について教えて`;

vi.mock('../search/index-loader', () => ({
  loadPageIndex: async () => index,
  loadPageTexts: async () => texts,
  loadSynonyms: async () => ({}),
}));

const { retrieveChunks, prependArticleChunks } = await import('./chunk-loader');

describe('chunk-loader', () => {
  it('loads only the matching articles and returns chunk text with headings', async () => {
    const chunks = await retrieveChunks({ history: [], question });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((c) => c.text.length > 0 && c.title.length > 0)).toBe(true);
    expect(chunks.some((c) => c.articleId === target.id)).toBe(true);
    expect(new Set(chunks.map((c) => c.articleId)).size).toBeLessThanOrEqual(5);
  });

  it('puts the context article first, up to 2 chunks, without duplicates', async () => {
    const chunks = await retrieveChunks({
      history: [],
      question,
      contextArticleId: contextArticle.id,
    });
    expect(chunks.slice(0, 2).map((c) => c.id)).toEqual([
      `${contextArticle.id}#0`,
      `${contextArticle.id}#1`,
    ]);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });

  it('rejects with AbortError when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      retrieveChunks({ history: [], question, signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('drops the context article when it has no chunks', () => {
    expect(prependArticleChunks(undefined, [])).toEqual([]);
  });
});
