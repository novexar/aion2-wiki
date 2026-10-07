import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { PAGE_CONTAINER } from '../lib/layout';
import { REPO_URL } from '../lib/site';
import { Header } from './Header';
import { PageLoading } from './PageLoading';
import { ScrollManager } from './ScrollManager';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-line">
        <div
          className={`${PAGE_CONTAINER} flex flex-col gap-2 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>非公式のファンサイトです。NC（NCSOFT）とは関係ありません。</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-fg">
              このサイトについて
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
