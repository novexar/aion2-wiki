import { Menu, Search, Settings } from 'lucide-react';
import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import {
  CHAT_PANEL_ID,
  CHAT_TOGGLE_ID,
  setChatPanelOpen,
  toggleChatPanel,
  useChatPanel,
} from '../features/chat/chat-panel-store';
import { useSearchPalette } from '../features/search/search-context';
import { PAGE_CONTAINER } from '../lib/layout';
import { useShellColumns } from '../lib/shell-layout';
import { modKeyLabel } from '../lib/platform';
import { CategoryNav } from './CategoryNav';
import { Kbd } from './Kbd';
import { Logo } from './Logo';
import { MobileDrawer } from './MobileDrawer';

const NAV_ITEMS = [
  { to: '/index', label: '索引' },
  { to: '/about', label: 'このサイトについて' },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
    isActive ? 'text-fg font-medium' : 'text-fg-muted hover:text-fg hover:bg-muted'
  }`;
}

export function Header() {
  const { open } = useSearchPalette();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const chat = useChatPanel();
  // 左サイドバー（カテゴリ）が出ていないときはメニューから辿れるようにする
  const { sidebar, squeezed } = useShellColumns();
  // パネルで狭くなりサイドバーも隠れる幅では、ナビはメニューに任せ検索欄を縮める
  const narrow = squeezed && !sidebar;

  return (
    <header className="sticky top-0 z-40 h-(--header-h) border-b border-line bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-canvas"
      >
        本文へスキップ
      </a>
      <div className={`${PAGE_CONTAINER} flex h-full items-center gap-2`}>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`size-9 items-center justify-center rounded-md text-fg-muted hover:bg-muted hover:text-fg ${
            sidebar ? 'hidden' : 'inline-flex'
          }`}
          aria-label="メニューを開く"
          aria-expanded={drawerOpen}
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
        <Logo />
        <nav
          aria-label="メイン"
          className={`ml-4 hidden items-center gap-0.5 ${narrow ? '' : 'md:flex'}`}
        >
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
            className={`group hidden h-9 items-center gap-2 rounded border border-line-input bg-surface px-2.5 text-sm text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg-muted sm:flex ${
              narrow ? 'w-44' : 'w-56 lg:w-64'
            }`}
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
          <button
            id={CHAT_TOGGLE_ID}
            type="button"
            onClick={toggleChatPanel}
            aria-expanded={chat.open}
            aria-controls={CHAT_PANEL_ID}
            aria-keyshortcuts="Control+J"
            title={`チャット（${modKeyLabel()}+J）`}
            className={`h-9 rounded-md px-2.5 text-sm whitespace-nowrap transition-colors hover:bg-muted hover:text-fg ${
              chat.open ? 'bg-muted font-medium text-fg' : 'text-fg-muted'
            }`}
          >
            チャット
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
          <button
            type="button"
            onClick={() => {
              closeDrawer();
              setChatPanelOpen(true);
            }}
            className={`${navClass({ isActive: false })} text-left`}
          >
            チャット
          </button>
        </nav>
        <CategoryNav onNavigate={closeDrawer} />
      </MobileDrawer>
    </header>
  );
}
