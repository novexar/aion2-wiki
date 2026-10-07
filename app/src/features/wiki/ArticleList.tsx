import { Link } from 'react-router';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { categoryLabel } from '../../lib/categories';
import { articlePath } from '../../lib/paths';
import type { ArticleMeta } from '../../lib/types';

/** 関連記事の箇条書きリンク「タイトル · カテゴリ」 */
export function ArticleLinkGrid({ articles }: { readonly articles: readonly ArticleMeta[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm marker:text-fg-subtle">
      {articles.map((a) => (
        <li key={a.id}>
          <Link to={articlePath(a.category, a.id)} className="text-fg hover:underline">
            {a.title}
          </Link>
          <span className="text-fg-subtle"> · {categoryLabel(a.category)}</span>
        </li>
      ))}
    </ul>
  );
}

/** 行形式の記事一覧（日付｜タイトル｜カテゴリ）。要約は出さず、バッジは要確認・公式のみ */
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
            className="group flex items-baseline gap-x-4 px-1 py-2 transition-colors hover:bg-surface"
          >
            {showDate && (
              <time
                dateTime={a.updated}
                className="w-[5.5rem] shrink-0 text-xs text-fg-subtle tabular-nums max-sm:hidden"
              >
                {a.updated}
              </time>
            )}
            <span className="min-w-0 flex-1">
              <span className="text-fg group-hover:underline group-hover:underline-offset-4">
                {a.title}
              </span>{' '}
              <ConfidenceBadge confidence={a.confidence} size="sm" hideVerified />
            </span>
            {showCategory && (
              <span className="shrink-0 text-xs text-fg-subtle max-sm:hidden">
                {categoryLabel(a.category)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
