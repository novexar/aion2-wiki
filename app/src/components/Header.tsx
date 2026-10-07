import { Menu, Search, Settings } from 'lucide-react';
import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { useSearchPalette } from '../features/search/search-context';
import { modKeyLabel } from '../lib/platform';
import { CategoryNav } from './CategoryNav';
import { Kbd } from './Kbd';
import { Logo } from './Logo';
import { MobileDrawer } from './MobileDrawer';

const NAV_ITEMS = [
  { to: '/index', label: '索引' },
  { to: '/chat', label: 'チャット' },
  { to: '/about', label: 'このサイトについて' },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-2.5 py-1.5 text-sm transition-colors ${
    isActive ? 'text-fg font-medium' : 'text-fg-muted hover:text-fg hover:bg-muted'
  }`;
}

export function Header() {
  const { open } = useSearchPalette();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <header className="sticky top-0 z-40 h-(--header-h) border-b border-line bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-canvas"
      >
        本文へスキップ
      </a>
      <div className="mx-auto flex h-full max-w-[90rem] items-center gap-2 px-3 sm:px-5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-muted hover:text-fg lg:hidden"
          aria-label="メニューを開く"
          aria-expanded={drawerOpen}
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
        <Logo />
        <nav aria-label="メイン" className="ml-4 hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => open()}
            className="group hidden h-9 w-56 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-sm text-fg-subtle transition-colors hover:border-line-strong hover:text-fg-muted sm:flex lg:w-64"
            aria-label="サイト内検索を開く"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search aria-hidden="true" className="size-4" />
            <span className="flex-1 text-left">検索</span>
            <span className="flex gap-0.5">
              <Kbd>{modKeyLabel()}</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-muted hover:text-fg sm:hidden"
            aria-label="サイト内検索を開く"
          >
            <Search aria-hidden="true" className="size-[18px]" />
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-fg ${
                isActive ? 'text-fg' : 'text-fg-muted'
              }`
            }
            aria-label="設定"
            title="設定"
          >
            <Settings aria-hidden="true" className="size-[18px]" />
          </NavLink>
        </div>
      </div>
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} title="メニュー">
        <nav
          aria-label="メイン（モバイル）"
          className="mb-4 flex flex-col gap-0.5 border-b border-line pb-3"
        >
          {[{ to: '/', label: 'ホーム' }, ...NAV_ITEMS].map((item) => (
            <NavLink key={item.to} to={item.to} end onClick={closeDrawer} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <CategoryNav onNavigate={closeDrawer} />
      </MobileDrawer>
    </header>
  );
}
