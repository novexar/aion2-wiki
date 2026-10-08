import { ChevronRight, Search } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { Kbd } from '../components/Kbd';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { useSearchPalette } from '../features/search/search-context';
import { dailyArticles, nav } from '../features/wiki/data';
import { categoryLabel } from '../lib/categories';
import { staggerDelayMs, useHomeStagger } from '../lib/home-stagger';
import { PAGE_CONTAINER } from '../lib/layout';
import { articlePath, categoryPath } from '../lib/paths';
import { modKeyLabel } from '../lib/platform';
import type { NavArticle, NavCategory } from '../lib/types';

/** ホームのカテゴリ行に並べる先頭記事の数（order 順） */
const LEAD_ARTICLES = 3;
const RECENT_LIMIT = 10;

const SECTION_TITLE = 'sec-title border-b border-line pb-2 text-lg font-bold';

function SearchBox() {
  const { open } = useSearchPalette();
  return (
    <button
      type="button"
      onClick={() => open()}
      className="band-search mt-4 flex h-10 w-full max-w-[42rem] items-center gap-3 rounded border border-white/28 bg-white/8 px-3 text-left text-header-muted backdrop-blur-sm hover:border-white hover:text-white"
      aria-label="サイト内検索を開く"
    >
      <Search aria-hidden="true" className="size-4" />
      <span className="flex-1 truncate">検索</span>
      <span className="hidden gap-0.5 sm:flex">
        <Kbd tone="header">{modKeyLabel()}</Kbd>
        <Kbd tone="header">K</Kbd>
      </span>
    </button>
  );
}

function CategoryRow({
  category: c,
  riseDelay,
}: {
  readonly category: NavCategory;
  /** 段差表示の遅延（ms）。undefined なら動かさない */
  readonly riseDelay?: number;
}) {
  return (
    <li
      style={riseDelay === undefined ? undefined : { animationDelay: `${riseDelay}ms` }}
      className={`${riseDelay === undefined ? '' : 'home-rise '}relative grid break-inside-avoid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-3 border-b border-line py-2 sm:grid-cols-[7rem_2.5rem_minmax(0,1fr)]`}
    >
      <Link
        to={categoryPath(c.id)}
        className="font-bold text-fg hover:underline max-sm:after:absolute max-sm:after:inset-0"
      >
        {c.label}
      </Link>
      <span className="text-right text-[13px] text-fg-subtle tabular-nums">
        {c.articles.length}
      </span>
      <ChevronRight aria-hidden="true" className="size-4 self-center text-fg-subtle sm:hidden" />
      <div className="min-w-0 text-[13px] max-sm:hidden">
        <p className="text-fg-muted">{c.description}</p>
        <p className="mt-0.5 text-fg-subtle">
          {c.articles.slice(0, LEAD_ARTICLES).map((a, i) => (
            <Fragment key={a.id}>
              {i > 0 && ' · '}
              <Link to={articlePath(a.category, a.id)} className="text-fg hover:underline">
                {a.title}
              </Link>
            </Fragment>
          ))}
        </p>
      </div>
    </li>
  );
}

function DailyLinks({ articles }: { readonly articles: readonly NavArticle[] }) {
  return (
    <section
      className="mt-8 sm:mt-12 sm:flex sm:items-baseline sm:gap-6"
      aria-labelledby="daily-title"
    >
      <h2
        id="daily-title"
        className="text-lg font-bold max-sm:border-b max-sm:border-line max-sm:pb-2 sm:shrink-0 sm:text-base"
      >
        日課・週課
      </h2>
      <ul className="text-sm sm:flex sm:flex-wrap">
        {articles.map((a, i) => (
          <li key={a.id} className="border-b border-line sm:border-0">
            {i > 0 && (
              <span aria-hidden="true" className="px-2 text-fg-subtle max-sm:hidden">
                ·
              </span>
            )}
            <Link
              to={articlePath(a.category, a.id)}
              className="inline-block py-2 text-fg hover:underline sm:py-0"
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentUpdates({ articles }: { readonly articles: readonly NavArticle[] }) {
  return (
    <section className="mt-8 sm:mt-12" aria-labelledby="updates-title">
      <h2 id="updates-title" className={SECTION_TITLE}>
        最近の更新
      </h2>
      <ul>
        {articles.map((a) => (
          <li key={a.id} className="border-b border-line">
            <Link
              to={articlePath(a.category, a.id)}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-2 hover:bg-surface sm:grid-cols-[6rem_minmax(0,1fr)_7rem_4rem]"
            >
              <time
                dateTime={a.updated}
                className="col-start-1 row-start-2 text-xs text-fg-subtle tabular-nums sm:row-start-1"
              >
                <span className="max-sm:hidden">{a.updated}</span>
                <span className="sm:hidden">{a.updated.slice(5)}</span>
              </time>
              <span className="col-start-1 row-start-1 min-w-0 truncate text-sm text-fg group-hover:underline sm:col-start-2">
                {a.title}
              </span>
              <span className="col-start-2 row-start-1 text-xs text-fg-subtle sm:col-start-3">
                {categoryLabel(a.category)}
              </span>
              <span className="max-sm:hidden sm:col-start-4 sm:row-start-1">
                <ConfidenceBadge confidence={a.confidence} size="sm" hideVerified />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage() {
  useDocumentMeta();
  const daily = dailyArticles();
  const total = nav.articles.length;
  const lastUpdated = nav.articles.reduce((m, a) => (a.updated > m ? a.updated : m), '');
  const hasDistinctDates = new Set(nav.articles.map((a) => a.updated)).size > 1;
  const stagger = useHomeStagger();

  return (
    <>
      <section className="band">
        <div className={`${PAGE_CONTAINER} relative pt-6 pb-6 sm:pt-9 sm:pb-[42px]`}>
          <h1 className="text-[22px] leading-[1.4] font-semibold text-white">AION2 非公式Wiki</h1>
          <p className="mt-1 text-sm text-header-muted">
            <span className="max-sm:hidden">
              AION2（グローバル版）の攻略情報。{total} 記事、最終更新 {lastUpdated}。
            </span>
            <span className="sm:hidden">
              {total} 記事 · {lastUpdated} 更新
            </span>
          </p>
          <SearchBox />
        </div>
      </section>

      <div className={`${PAGE_CONTAINER} pt-8 pb-12 sm:pt-10`}>
        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className={SECTION_TITLE}>
            カテゴリ
          </h2>
          <ul className="lg:columns-2 lg:gap-10">
            {nav.categories.map((c, i) => (
              <CategoryRow
                key={c.id}
                category={c}
                riseDelay={stagger ? staggerDelayMs(i) : undefined}
              />
            ))}
          </ul>
        </section>

        {daily.length > 0 && <DailyLinks articles={daily} />}
        {hasDistinctDates && <RecentUpdates articles={nav.articles.slice(0, RECENT_LIMIT)} />}

        <p className="mt-6 text-sm">
          <Link to="/index" className="text-link underline underline-offset-4">
            すべての記事（索引）
          </Link>
        </p>
      </div>
    </>
  );
}
