import { parseMiniMarkdown, type Inline } from '../../lib/mini-markdown';
import type { NavArticle } from '../../lib/types';
import { articleByTitle } from '../wiki/data';

/** 本文中で解決できた引用記事を、初出順に重複なしで返す（未解決の `[…]` は含めない） */
export function citedArticles(text: string): NavArticle[] {
  const found = new Map<string, NavArticle>();
  const visit = (inlines: readonly Inline[]): void => {
    for (const inline of inlines) {
      if (inline.type !== 'cite') continue;
      const article = articleByTitle.get(inline.value);
      if (article && !found.has(article.id)) found.set(article.id, article);
    }
  };
  for (const block of parseMiniMarkdown(text)) {
    if (block.type === 'p') visit(block.inlines);
    else block.items.forEach(visit);
  }
  return [...found.values()];
}
