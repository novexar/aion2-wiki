import { Link } from 'react-router';
import { formatDate } from '../../lib/format';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { categoryLabel } from '../../lib/categories';
import { LIST_COLUMNS, LIST_ITEM } from '../../lib/layout';
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

/** 行形式の記事一覧（日付｜タイトル｜カテゴリ）。バッジは要確認・公式のみ */
export function ArticleRows({
  articles,
  showCategory = false,
  showDate = false,
  columns = false,
  summaries,
}: {
  readonly articles: readonly NavArticle[];
  readonly showCategory?: boolean;
  readonly showDate?: boolean;
  /** true なら 2 列（lg）／3 列（2xl）に段組みする */
  readonly columns?: boolean;
  /** 記事 id → 要約。渡すと 48px の行にタイトルと要約 1 行を出す（読込中は空行で高さを保つ） */
  readonly summaries?: ReadonlyMap<string, string>;
}) {
  const withSummary = summaries !== undefined;
  return (
    <ul className={`border-t border-line ${columns ? LIST_COLUMNS : ''}`}>
      {articles.map((a) => (
        <li key={a.id} className={`border-b border-line ${LIST_ITEM}`}>
          <Link
            to={articlePath(a.category, a.id)}
            className={`group flex gap-x-4 px-1 transition-colors hover:bg-surface ${
              withSummary ? 'min-h-12 items-center py-1' : 'items-baseline py-2'
            }`}
          >
            {showDate && (
              <time
                dateTime={a.updated}
                className="w-[5.5rem] shrink-0 text-xs text-fg-subtle tabular-nums max-sm:hidden"
              >
                {formatDate(a.updated)}
              </time>
            )}
            <span className="min-w-0 flex-1">
              <span className="block">
                <span className="text-fg group-hover:underline group-hover:underline-offset-4">
                  {a.title}
                </span>{' '}
                <ConfidenceBadge confidence={a.confidence} size="sm" hideVerified />
              </span>
              {withSummary && (
                <span className="line-clamp-1 min-h-[1lh] text-[13px] text-fg-muted">
                  {summaries.get(a.id)}
                </span>
              )}
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
