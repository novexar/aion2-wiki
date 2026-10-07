import navJson from '../../generated/nav.json';
import { CATEGORIES, DAILY_LINKS } from '../../lib/categories';
import type { Article, ArticleMeta, NavArticle, NavData, NavJson } from '../../lib/types';

const raw = navJson as unknown as NavJson;

export const articleById: ReadonlyMap<string, NavArticle> = new Map(
  raw.articles.map((a) => [a.id, a]),
);

export const articleByTitle: ReadonlyMap<string, NavArticle> = new Map(
  raw.articles.map((a) => [a.title, a]),
);

const resolveIds = (ids: readonly string[]): NavArticle[] =>
  ids.flatMap((id) => {
    const meta = articleById.get(id);
    return meta ? [meta] : [];
  });

/** ナビ・一覧用の軽量メタデータ（初期バンドルに含める）。カテゴリは CATEGORIES の順 */
export const nav: NavData = {
  generatedAt: raw.generatedAt,
  categories: CATEGORIES.map((c) => ({
    ...c,
    articles: resolveIds(raw.categories.find((x) => x.id === c.id)?.articles ?? []),
  })),
  articles: raw.articles,
};

/** 記事本文は 1 記事 1 チャンクで遅延読込 */
const pageModules = import.meta.glob<Article>('../../generated/pages/*.json', {
  import: 'default',
});

export async function loadArticle(id: string): Promise<Article | null> {
  const loader = pageModules[`../../generated/pages/${id}.json`];
  return loader ? loader() : null;
}

let metaPromise: Promise<readonly ArticleMeta[]> | null = null;

/** 索引用の全メタデータ（summary・tags・aliases・reading を含む）。初回のみ読み込む */
export function loadAllMeta(): Promise<readonly ArticleMeta[]> {
  metaPromise ??= import('../../generated/meta.json')
    .then((mod) => mod.default as unknown as readonly ArticleMeta[])
    .catch((error: unknown) => {
      metaPromise = null;
      throw error;
    });
  return metaPromise;
}

/** ホームの「日課・週課」: DAILY_LINKS の順に解決した記事 */
export function dailyArticles(): NavArticle[] {
  return resolveIds(DAILY_LINKS);
}
