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
  const recent = nav.articles.slice(0, 8);
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
          className="mt-6 flex h-9 w-full max-w-xl items-center gap-3 rounded border border-line-strong bg-canvas px-3 text-left text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg-muted"
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

      <section className="py-12" aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-lg font-semibold">
          カテゴリ
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {nav.categories.map((c) => (
            <li key={c.id} className="bg-canvas">
              <Link
                to={categoryPath(c.id)}
                className="group flex h-full flex-col gap-1 p-5 transition-colors hover:bg-surface"
              >
                <span className="flex items-center justify-between">
                  <span className="font-medium text-fg">{c.label}</span>
                  <span className="text-xs text-fg-subtle tabular-nums">
                    {c.articles.length} 記事
                  </span>
                </span>
                <span className="text-[13px] leading-relaxed text-fg-muted">{c.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-12 pb-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="daily-title">
          <h2 id="daily-title" className="text-lg font-semibold">
            今日の日課
          </h2>
          <p className="mt-1 text-[13px] text-fg-subtle">毎日の確認に使う記事へのショートカット</p>
          {daily.length === 0 ? (
            <p className="mt-5 text-sm text-fg-muted">記事はまだありません。</p>
          ) : (
            <ol className="mt-5 list-decimal space-y-1 pl-6 text-sm marker:text-fg-subtle">
              {daily.map((a) => (
                <li key={a.id} className="py-1">
                  <Link to={articlePath(a.category, a.id)} className="text-fg hover:underline">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="updates-title">
          <h2 id="updates-title" className="text-lg font-semibold">
            更新履歴
          </h2>
          <p className="mt-1 text-[13px] text-fg-subtle">最近調査・更新された記事</p>
          <div className="mt-5">
            {recent.length === 0 ? (
              <p className="text-sm text-fg-muted">記事はまだありません。</p>
            ) : (
              <ArticleRows articles={recent} showCategory showDate />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
