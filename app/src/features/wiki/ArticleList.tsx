import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { categoryLabel } from '../../lib/categories';
import { articlePath } from '../../lib/paths';
import type { ArticleMeta } from '../../lib/types';

/** 関連記事などのリンクグリッド（区切り線ベースで角丸カードを並べない） */
export function ArticleLinkGrid({ articles }: { readonly articles: readonly ArticleMeta[] }) {
  return (
    <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
      {articles.map((a) => (
        <li key={a.id} className="bg-canvas">
          <Link
            to={articlePath(a.category, a.id)}
            className="group flex h-full flex-col gap-1 p-4 transition-colors hover:bg-surface focus-visible:bg-surface"
          >
            <span className="text-xs text-fg-subtle">{categoryLabel(a.category)}</span>
            <span className="flex items-center gap-1.5 font-medium text-fg">
              {a.title}
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 text-fg-subtle transition-transform group-hover:translate-x-0.5"
              />
            </span>
            <span className="line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
              {a.summary}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 行形式の記事一覧（カテゴリページ・更新履歴） */
export function ArticleRows({
  articles,
  showCategory = false,
  showDate = false,
}: {
  readonly articles: readonly ArticleMeta[];
  readonly showCategory?: boolean;
  readonly showDate?: boolean;
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {articles.map((a) => (
        <li key={a.id}>
          <Link
            to={articlePath(a.category, a.id)}
            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 px-1 py-3 transition-colors hover:bg-surface sm:grid-cols-[auto_1fr_auto]"
          >
            {showDate && (
              <time
                dateTime={a.updated}
                className="text-xs text-fg-subtle tabular-nums max-sm:hidden"
              >
                {a.updated}
              </time>
            )}
            <span className="min-w-0">
              <span className="font-medium text-fg group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
                {a.title}
              </span>
              <span className="mt-0.5 line-clamp-1 block text-[13px] text-fg-muted">
                {a.summary}
              </span>
            </span>
            <span className="flex items-center gap-2">
              {showCategory && (
                <span className="text-xs text-fg-subtle max-sm:hidden">
                  {categoryLabel(a.category)}
                </span>
              )}
              <ConfidenceBadge confidence={a.confidence} size="sm" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
