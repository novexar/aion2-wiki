import type { NavArticle } from '../../lib/types';
import type { PrevNextProps } from './PrevNext';

/** 同カテゴリの閲覧順（order）で、現在の記事の前後を返す */
export function adjacentArticles(
  articles: readonly NavArticle[],
  currentId: string,
): PrevNextProps {
  const i = articles.findIndex((a) => a.id === currentId);
  if (i < 0) return { prev: null, next: null };
  return { prev: articles[i - 1] ?? null, next: articles[i + 1] ?? null };
}
