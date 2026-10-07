import { Search } from 'lucide-react';
import { Link } from 'react-router';
import { Kbd } from '../components/Kbd';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { useSearchPalette } from '../features/search/search-context';
import { ArticleRows } from '../features/wiki/ArticleList';
import { dailyArticles, nav } from '../features/wiki/data';
import { articlePath, categoryPath } from '../lib/paths';
import { modKeyLabel } from '../lib/platform';

export default function HomePage() {
  useDocumentMeta();
  const { open } = useSearchPalette();
  const daily = dailyArticles();
  const recent = nav.articles.slice(0, 10);
  const hasDistinctDates = new Set(nav.articles.map((a) => a.updated)).size > 1;
  const total = nav.articles.length;
  const lastUpdated = nav.articles.reduce((m, a) => (a.updated > m ? a.updated : m), '');

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <section className="border-b border-line py-8" aria-labelledby="hero-title">
        <h1 id="hero-title" className="text-xl font-semibold">
          AION2 非公式Wiki
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          AION2（グローバル版）の攻略情報。{total} 記事、最終更新 {lastUpdated}。
        </p>
        <button
          type="button"
          onClick={() => open()}
          className="mt-6 flex h-9 w-full max-w-xl items-center gap-3 rounded border border-line-input bg-canvas px-3 text-left text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg-muted"
          aria-label="サイト内検索を開く"
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="flex-1 truncate">検索</span>
          <span className="hidden gap-0.5 sm:flex">
            <Kbd>{modKeyLabel()}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </section>

      <section className="py-8" aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-lg font-semibold">
          カテゴリ
        </h2>
        <ul className="mt-4 border-y border-line lg:columns-2 lg:gap-8 lg:border-y-0">
          {nav.categories.map((c) => (
            <li
              key={c.id}
              className="grid break-inside-avoid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-line py-2 first:lg:border-t last:border-b-0 sm:grid-cols-[7rem_3rem_minmax(0,1fr)] lg:border-b lg:last:border-b"
            >
              <Link to={categoryPath(c.id)} className="font-bold text-fg hover:underline">
                {c.label}
              </Link>
              <span className="text-right text-xs text-fg-subtle tabular-nums sm:pt-0.5">
                {c.articles.length}
              </span>
              <div className="col-span-2 min-w-0 text-[13px] sm:col-span-1">
                <p className="text-fg-muted">{c.description}</p>
                <p className="mt-0.5 text-fg-subtle">
                  {c.articles.slice(0, 3).map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && '、'}
                      <Link to={articlePath(a.category, a.id)} className="text-fg hover:underline">
                        {a.title}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {daily.length > 0 && (
        <section className="pb-8" aria-labelledby="daily-title">
          <h2 id="daily-title" className="text-lg font-semibold">
            日課・週課
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {daily.map((a) => (
              <li key={a.id}>
                <Link
                  to={articlePath(a.category, a.id)}
                  className="block px-1 py-2 text-fg hover:bg-surface hover:underline"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasDistinctDates && (
        <section className="pb-16" aria-labelledby="updates-title">
          <h2 id="updates-title" className="text-lg font-semibold">
            最近の更新
          </h2>
          <div className="mt-4">
            <ArticleRows articles={recent} showCategory showDate />
          </div>
        </section>
      )}
    </div>
  );
}
