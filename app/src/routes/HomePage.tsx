import { ArrowRight, MessageSquare, Search } from 'lucide-react';
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

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <section className="border-b border-line py-14 sm:py-20" aria-labelledby="hero-title">
        <p className="text-sm font-medium text-accent-strong">AION2 グローバル版 · 非公式</p>
        <h1
          id="hero-title"
          className="mt-3 text-[2rem] leading-tight font-bold tracking-tight text-balance sm:text-5xl"
        >
          調べて、確かめて、相談できる Wiki
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fg-muted sm:text-base">
          システム・ダンジョン・経済・クラスの情報を、出典と信頼度つきでまとめています。
          分からないことは Wiki の記事だけを根拠に答えるチャットにも聞けます。
        </p>
        <button
          type="button"
          onClick={() => open()}
          className="mt-8 flex h-13 w-full max-w-xl items-center gap-3 rounded-lg border border-line-strong bg-canvas px-4 text-left text-fg-subtle shadow-sm transition-colors hover:border-fg-subtle hover:text-fg-muted"
          aria-label="サイト内検索を開く"
        >
          <Search aria-hidden="true" className="size-5" />
          <span className="flex-1 truncate">記事・用語・英語名で検索（例: ギーナ / Kinah）</span>
          <span className="hidden gap-0.5 sm:flex">
            <Kbd>{modKeyLabel()}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link to="/chat" className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg">
            <MessageSquare aria-hidden="true" className="size-4" />
            チャットで相談する
          </Link>
          <Link
            to="/index"
            className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
          >
            索引から探す
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
          <span className="text-fg-subtle">{total} 記事</span>
        </div>
      </section>

      <section className="py-12" aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-lg font-semibold tracking-tight">
          カテゴリー
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
          <h2 id="daily-title" className="text-lg font-semibold tracking-tight">
            今日の日課
          </h2>
          <p className="mt-1 text-[13px] text-fg-subtle">毎日の確認に使う記事へのショートカット</p>
          {daily.length === 0 ? (
            <p className="mt-5 text-sm text-fg-muted">記事は準備中です。</p>
          ) : (
            <ol className="mt-5 space-y-1">
              {daily.map((a, i) => (
                <li key={a.id}>
                  <Link
                    to={articlePath(a.category, a.id)}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded border border-line font-mono text-xs text-fg-subtle group-hover:border-accent group-hover:text-accent-strong">
                      {i + 1}
                    </span>
                    <span className="min-w-0 truncate text-sm text-fg">{a.title}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="ml-auto size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="updates-title">
          <h2 id="updates-title" className="text-lg font-semibold tracking-tight">
            更新履歴
          </h2>
          <p className="mt-1 text-[13px] text-fg-subtle">最近調査・更新された記事</p>
          <div className="mt-5">
            {recent.length === 0 ? (
              <p className="text-sm text-fg-muted">記事は準備中です。</p>
            ) : (
              <ArticleRows articles={recent} showCategory showDate />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
