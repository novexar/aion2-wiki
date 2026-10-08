import { rankChunks, selectArticleIds, type ArticleChunks } from '../../lib/retrieval';
import { retrievalQuery, type ChatTurn } from '../../lib/rag';
import type { ArticleChunk, Chunk } from '../../lib/types';
import { loadPageIndex, loadPageTexts } from '../search/index-loader';
import { articleById } from '../wiki/data';

/** 記事ごとのチャンク（chunk-text/<articleId>.json）。必要な記事の分だけ読み込む */
const textModules = import.meta.glob<readonly ArticleChunk[]>('../../generated/chunk-text/*.json', {
  import: 'default',
});

const textCache = new Map<string, Promise<readonly ArticleChunk[]>>();

function loadArticleChunks(articleId: string): Promise<readonly ArticleChunk[]> {
  const cached = textCache.get(articleId);
  if (cached) return cached;
  const loader = textModules[`../../generated/chunk-text/${articleId}.json`];
  const promise = (loader ? loader() : Promise.resolve([] as readonly ArticleChunk[])).catch(
    (error: unknown) => {
      textCache.delete(articleId);
      throw error;
    },
  );
  textCache.set(articleId, promise);
  return promise;
}

/** 検索用の索引と本文（記事検索と共通）を先に読み込んでおく */
export function warmRetrieval(): Promise<unknown> {
  return Promise.all([loadPageIndex(), loadPageTexts()]);
}

/** 「この記事を文脈に含める」で先頭に加えるチャンク数の上限 */
export const ARTICLE_CONTEXT_LIMIT = 2;

async function loadArticles(ids: readonly string[]): Promise<ArticleChunks[]> {
  const loaded = await Promise.all(
    ids.map(async (id) => {
      const meta = articleById.get(id);
      if (!meta) return null;
      const chunks = await loadArticleChunks(id);
      return { articleId: id, title: meta.title, category: meta.category, chunks };
    }),
  );
  return loaded.filter((a): a is ArticleChunks => a !== null);
}

/** 指定記事の先頭チャンクを検索結果の前に置く（重複は除く） */
export function prependArticleChunks(
  own: ArticleChunks | undefined,
  found: readonly Chunk[],
  limit = ARTICLE_CONTEXT_LIMIT,
): Chunk[] {
  if (!own) return [...found];
  const head: Chunk[] = own.chunks.slice(0, limit).map((c, i) => ({
    id: `${own.articleId}#${i}`,
    articleId: own.articleId,
    category: own.category,
    title: own.title,
    heading: c.heading,
    anchor: c.anchor,
    text: c.text,
  }));
  const ids = new Set(head.map((c) => c.id));
  return [...head, ...found.filter((c) => !ids.has(c.id))];
}

export interface RetrieveOptions {
  readonly history: readonly ChatTurn[];
  readonly question: string;
  /** 指定があれば、その記事の先頭チャンクを結果の先頭に加える */
  readonly contextArticleId?: string | null;
}

/**
 * 質問に関係するチャンクを返す。
 * 記事検索索引で上位 5 記事を選び → その記事のチャンクだけ読み込み → 質問語の出現数で並べる。
 */
export async function retrieveChunks(options: RetrieveOptions): Promise<Chunk[]> {
  const query = retrievalQuery(options.history, options.question);
  const index = await loadPageIndex();
  const ids = await selectArticleIds(index, query, loadPageTexts);
  const [articles, own] = await Promise.all([
    loadArticles(ids),
    options.contextArticleId ? loadArticles([options.contextArticleId]) : Promise.resolve([]),
  ]);
  return prependArticleChunks(own[0], rankChunks(query, articles));
}
