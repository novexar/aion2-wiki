import { Link } from 'react-router';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { categoryLabel } from '../../lib/categories';
import { LIST_COLUMNS } from '../../lib/layout';
import { articlePath } from '../../lib/paths';
import type { NavArticle } from '../../lib/types';

/** 関連記事の箇条書きリンク「タイトル · カテゴリ」 */
export function ArticleLinkGrid({ articles }: { readonly articles: readonly NavArticle[] }) {
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
  columns = false,
}: {
  readonly articles: readonly NavArticle[];
  readonly showCategory?: boolean;
  readonly showDate?: boolean;
  /** true なら 2 列（lg）／3 列（2xl）に段組みする */
  readonly columns?: boolean;
}) {
  return (
    <ul className={`border-t border-line ${columns ? LIST_COLUMNS : ''}`}>
      {articles.map((a) => (
        <li key={a.id} className="border-b border-line">
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
