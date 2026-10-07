// @vitest-environment node
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { chunkIndexOptions, pageIndexOptions } from '../../src/lib/search-options';
import { searchChunks, searchPages } from '../../src/lib/search';
import type { Article, Chunk, ChunksData, NavData } from '../../src/lib/types';
import type { CategoryId } from '../../src/lib/categories';
import { buildContent, buildNav, byReadingOrder } from './build';
import { ContentBuildError } from './errors';
import { articleMarkdown } from './test-fixtures';

let root: string;
let contentDir: string;
let outDir: string;

async function put(rel: string, text: string): Promise<void> {
  const file = path.join(contentDir, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text, 'utf8');
}

async function readOut<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(path.join(outDir, name), 'utf8')) as T;
}

const run = (includeSamples = false) =>
  buildContent({
    contentDir,
    outDir,
    includeSamples,
    base: '/AION2',
    now: new Date('2026-10-08T00:00:00Z'),
  });

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'aion2-content-'));
  contentDir = path.join(root, 'content');
  outDir = path.join(root, 'out');
  await mkdir(contentDir, { recursive: true });
  await mkdir(outDir, { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('buildContent', () => {
  it('fails when there are no articles outside sample mode', async () => {
    await expect(run()).rejects.toThrow(/0 件/);
  });

  it('builds empty outputs when there are no articles in sample mode', async () => {
    await writeFile(path.join(contentDir, 'SCHEMA.md'), '# schema', 'utf8');
    const result = await run(true);
    expect(result.articles).toBe(0);
    const nav = await readOut<NavData>('nav.json');
    expect(nav.articles).toEqual([]);
    expect(nav.categories.length).toBeGreaterThan(5);
    const index = MiniSearch.loadJS(await readOut('search-index.json'), pageIndexOptions);
    expect(index.documentCount).toBe(0);
  });

  it('fails when the content directory is missing outside sample mode', async () => {
    await expect(
      buildContent({
        contentDir: path.join(root, 'missing'),
        outDir,
        includeSamples: false,
        base: '/',
      }),
    ).rejects.toThrow(/見つかりません/);
  });

  it('rejects duplicate titles and only warns on duplicate aliases', async () => {
    await put('basics/a.md', articleMarkdown({ id: 'a', title: '同名' }));
    await put('basics/b.md', articleMarkdown({ id: 'b', title: '同名' }));
    await expect(run()).rejects.toThrow(/basics\/a\.md, content\/basics\/b\.md|重複/);
  });

  it('builds even when the content directory does not exist in sample mode', async () => {
    const result = await buildContent({
      contentDir: path.join(root, 'missing'),
      outDir,
      includeSamples: true,
      base: '/',
    });
    expect(result.articles).toBe(0);
    expect(result.warnings[0]).toContain('見つかりません');
  });

  it('skips _-prefixed directories unless samples are included', async () => {
    await put('_sample/sample-a.md', articleMarkdown({ id: 'sample-a', category: 'guide' }));
    await put('basics/real.md', articleMarkdown({ id: 'real' }));
    expect((await run(false)).files).toEqual(['content/basics/real.md']);
    expect((await run(true)).files).toEqual([
      'content/_sample/sample-a.md',
      'content/basics/real.md',
    ]);
  });

  it('writes pages, nav, search index and chunks that work together', async () => {
    await put(
      'economy/kinah.md',
      articleMarkdown({
        id: 'kinah',
        category: 'economy',
        title: 'ギーナ',
        overrides: { aliases: '[Kinah]', updated: '2026-10-07' },
        extra: 'related: [odyle, ghost]\n',
        body: '基本通貨。[[odyle]] でも稼げる。根拠：[S01]\n\n## 入手方法\n\n日課で手に入る。',
      }),
    );
    await put(
      'dungeons/odyle.md',
      articleMarkdown({
        id: 'odyle',
        category: 'dungeons',
        title: 'オードエネルギー',
        body: '遠征報酬に使う資源。上限は560。',
      }),
    );

    const result = await run();
    expect(result.articles).toBe(2);
    expect(result.warnings.join()).toContain('"ghost" が存在しません');

    expect(result.warnings.join()).toContain('order が未設定です');
    const kinah = await readOut<Article>('pages/kinah.json');
    expect(kinah.related).toEqual(['odyle']);
    expect(kinah.order).toBe(999);
    expect(kinah.html).toContain('href="/AION2/wiki/dungeons/odyle"');
    expect(kinah.headings).toEqual([{ id: '入手方法', text: '入手方法', depth: 2 }]);

    const pages = await readOut<Article[]>('pages.json');
    expect(pages.map((p) => p.id).sort()).toEqual(['kinah', 'odyle']);

    const nav = await readOut<NavData>('nav.json');
    expect(nav.articles.map((a) => a.id)).toEqual(['odyle', 'kinah']); // updated 降順
    expect(nav.categories.find((c) => c.id === 'economy')?.articles[0]).not.toHaveProperty('html');

    const pageIndex = MiniSearch.loadJS(await readOut('search-index.json'), pageIndexOptions);
    expect(searchPages(pageIndex, 'kinah')[0]?.id).toBe('kinah');
    expect(searchPages(pageIndex, 'エネルギー')[0]).toMatchObject({
      id: 'odyle',
      category: 'dungeons',
    });

    const chunks = await readOut<ChunksData>('chunks.json');
    const chunkIndex = MiniSearch.loadJS(
      chunks.index as Parameters<typeof MiniSearch.loadJS>[0],
      chunkIndexOptions,
    );
    const byId = new Map<string, Chunk>(chunks.chunks.map((c) => [c.id, c]));
    const hits = searchChunks(chunkIndex, byId, '日課', 8);
    expect(hits[0]).toMatchObject({ articleId: 'kinah', heading: '入手方法' });
    expect(chunks.chunks.find((c) => c.articleId === 'kinah')?.text).toContain(
      'オードエネルギー でも稼げる',
    );
  });

  it('collects every invalid file into one error with file names', async () => {
    await put('basics/bad-one.md', articleMarkdown({ id: 'bad-one', omit: ['title'] }));
    await put('basics/bad-two.md', articleMarkdown({ id: 'other-id' }));
    await put('basics/good.md', articleMarkdown({ id: 'good' }));
    const error = await run().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContentBuildError);
    const message = (error as Error).message;
    expect(message).toContain('2 件');
    expect(message).toContain('content/basics/bad-one.md');
    expect(message).toContain('content/basics/bad-two.md');
  });

  it('rejects duplicate ids across categories', async () => {
    await put('basics/dup.md', articleMarkdown({ id: 'dup' }));
    await put('_x/dup.md', articleMarkdown({ id: 'dup' }));
    await expect(run(true)).rejects.toThrow(/重複/);
  });

  it('rejects markdown in unknown category directories but ignores empty ones and _-files', async () => {
    await mkdir(path.join(contentDir, 'images'), { recursive: true });
    await put('basics/_draft.md', 'not even frontmatter');
    await expect(run(true)).resolves.toMatchObject({ articles: 0 });
    await put('raids/x.md', articleMarkdown({ id: 'x' }));
    await expect(run(true)).rejects.toThrow(/未知のカテゴリーディレクトリ/);
  });
});

const meta = (id: string, title: string, reading?: string, order = 1, category = 'basics') => ({
  id,
  title,
  category: category as CategoryId,
  tags: [],
  summary: '',
  confidence: 'verified' as const,
  updated: '2026-10-08',
  aliases: [],
  order,
  ...(reading ? { reading } : {}),
});

describe('buildNav', () => {
  it('falls back to reading when order ties', () => {
    const nav = buildNav([meta('b', '漢字', 'あ'), meta('a', 'か')], new Date(0));
    expect(nav.categories.find((c) => c.id === 'basics')?.articles.map((a) => a.id)).toEqual([
      'b',
      'a',
    ]);
    expect(nav.generatedAt).toBe('1970-01-01T00:00:00.000Z');
  });

  it('sorts articles in a category by order before reading', () => {
    const nav = buildNav(
      [meta('a', 'あ', 'あ', 3), meta('c', 'さ', 'さ', 1), meta('b', 'か', 'か', 2)],
      new Date(0),
    );
    expect(nav.categories.find((c) => c.id === 'basics')?.articles.map((a) => a.id)).toEqual([
      'c',
      'b',
      'a',
    ]);
  });

  it('lists categories in reading order', () => {
    const nav = buildNav([], new Date(0));
    expect(nav.categories.map((c) => c.id)).toEqual([
      'guide',
      'basics',
      'leveling',
      'systems',
      'dungeons',
      'economy',
      'classes',
      'pvp',
      'tips',
      'faq',
      'news',
    ]);
  });
});

describe('byReadingOrder', () => {
  it('orders by category, then order, then reading', () => {
    const items = [
      meta('x', 'x', 'x', 1, 'news'),
      meta('y', 'y', 'y', 5, 'basics'),
      meta('z', 'z', 'z', 2, 'basics'),
      meta('g', 'g', 'g', 9, 'guide'),
    ];
    expect([...items].sort(byReadingOrder).map((a) => a.id)).toEqual(['g', 'z', 'y', 'x']);
  });
});
