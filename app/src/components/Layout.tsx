import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { useChatPanel } from '../features/chat/chat-panel-store';
import { ChatPanel } from '../features/chat/ChatPanel';
import { PAGE_CONTAINER } from '../lib/layout';
import { useMediaQuery, WIDE_QUERY } from '../lib/useMediaQuery';
import { REPO_URL } from '../lib/site';
import { Header } from './Header';
import { PageLoading } from './PageLoading';
import { ScrollManager } from './ScrollManager';

export function Layout() {
  const panel = useChatPanel();
  const desktop = useMediaQuery(WIDE_QUERY, true);
  // lg 以上でパネルを開いている間は、ページ全体をパネル幅だけ左に縮める（重ねない）
  const style = panel.open && desktop ? { paddingRight: panel.width } : undefined;
  return (
    <div className="flex min-h-dvh flex-col" style={style}>
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-line bg-surface">
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
      <ChatPanel />
    </div>
  );
}
