// 生成済みデータ（npm run content の出力）を使う
import { describe, expect, it } from 'vitest';
import { articleById } from '../wiki/data';
import { loadChunkStore, resolveChunks } from './chunk-loader';

describe('chunk-loader', () => {
  it('keeps only positions in the store and resolves text per article on demand', async () => {
    const store = await loadChunkStore();
    const [first] = store.byId.values();
    expect(first).toBeDefined();
    if (!first) return;
    expect(first).not.toHaveProperty('text');

    const [chunk] = await resolveChunks([first]);
    expect(chunk?.text.length).toBeGreaterThan(0);
    expect(chunk?.title).toBe(articleById.get(first.articleId)?.title);
  });

  it('drops refs whose article or position does not exist', async () => {
    const chunks = await resolveChunks([
      { id: 'no-such-article#0', articleId: 'no-such-article', heading: '', anchor: '' },
    ]);
    expect(chunks).toEqual([]);
  });
});
