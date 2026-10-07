import navJson from '../../generated/nav.json';
import { DAILY_LINKS } from '../../lib/categories';
import type { Article, ArticleMeta, NavData } from '../../lib/types';

/** ナビ・一覧用の軽量メタデータ（初期バンドルに含める） */
export const nav = navJson as unknown as NavData;

export const articleById: ReadonlyMap<string, ArticleMeta> = new Map(
  nav.articles.map((a) => [a.id, a]),
);

export const articleByTitle: ReadonlyMap<string, ArticleMeta> = new Map(
  nav.articles.map((a) => [a.title, a]),
);

/** 記事本文は 1 記事 1 チャンクで遅延読込 */
const pageModules = import.meta.glob<Article>('../../generated/pages/*.json', {
  import: 'default',
});

export async function loadArticle(id: string): Promise<Article | null> {
  const loader = pageModules[`../../generated/pages/${id}.json`];
  return loader ? loader() : null;
}

/** ホームの「日課・週課」: DAILY_LINKS の順に解決した記事 */
export function dailyArticles(): ArticleMeta[] {
  return DAILY_LINKS.flatMap((id) => {
    const meta = articleById.get(id);
    return meta ? [meta] : [];
  });
}
