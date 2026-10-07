import navJson from '../../generated/nav.json';
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

/** 「今日の日課」: 日課/デイリータグの記事。なければ初心者ガイド */
export function dailyArticles(limit = 6): ArticleMeta[] {
  const tagged = nav.articles.filter((a) => a.tags.some((t) => /日課|デイリー|毎日/.test(t)));
  const picked = tagged.length > 0 ? tagged : nav.articles.filter((a) => a.category === 'guide');
  return picked.slice(0, limit);
}
