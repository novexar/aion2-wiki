import { skipToContent } from '../lib/skip-link';
import { Menu, Search, Settings, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { NavLink, useMatch, useNavigate } from 'react-router';
import { useCloseSettings } from '../lib/use-close-settings';
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

type NavTone = 'header' | 'drawer';

/** ヘッダー（濃色地）とドロワー（明色地）で文字色を切り替える */
function navClass({ isActive }: { isActive: boolean }, tone: NavTone = 'header'): string {
  const base = 'rounded px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors';
  if (tone === 'drawer') {
    return `${base} flex min-h-11 items-center ${
      isActive ? 'bg-muted font-semibold text-fg' : 'text-fg hover:bg-muted'
    }`;
  }
  return `${base} ${
    isActive ? 'font-medium text-white' : 'text-header-muted hover:bg-white/8 hover:text-white'
  }`;
}

export function Header() {
  const { open } = useSearchPalette();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const chat = useChatPanel();
  const navigate = useNavigate();
  const closeSettings = useCloseSettings();
  const settingsOpen = useMatch('/settings') !== null;
  // ホームは帯に検索欄があるので、ヘッダーの検索ボタンは出さない（Ctrl/⌘+K は有効）
  const onHome = useMatch('/') !== null;
  // 左サイドバー（カテゴリ）が出ていないときはメニューから辿れるようにする
  const { sidebar, squeezed } = useShellColumns();
  // パネルで狭くなりサイドバーも隠れる幅では、ナビはメニューに任せ検索欄を縮める
  const narrow = squeezed && !sidebar;

  return (
    <header className="sticky top-0 z-40 h-(--header-h) hdr-line border-b bg-header-bg text-header-fg">
      <a
        href="#main"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-fg focus:px-3 focus:py-2 focus:text-canvas"
      >
        本文へスキップ
      </a>
      <div className={`${PAGE_CONTAINER} flex h-full items-center gap-2`}>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`size-9 items-center justify-center rounded text-header-muted hover:bg-white/8 hover:text-white ${
            sidebar ? 'hidden' : 'inline-flex'
          }`}
          aria-label="メニューを開く"
          aria-expanded={drawerOpen}
        >
          <Menu aria-hidden="true" className="size-[18px]" />
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
            className={`group hidden h-9 items-center gap-2 rounded border border-white/22 bg-white/6 px-2.5 text-sm text-header-muted transition-colors hover:border-white/45 hover:text-white ${
              onHome ? '' : 'sm:flex'
            } ${narrow ? 'w-44' : 'w-64 xl:w-80'}`}
            aria-label="サイト内検索を開く"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search aria-hidden="true" className="size-[18px]" />
            <span className="flex-1 text-left">検索</span>
            <span className="flex items-center gap-0.5">
              <Kbd tone="header">{modKeyLabel()}</Kbd>
              <span aria-hidden="true" className="text-[11px] text-header-muted">
                +
              </span>
              <Kbd tone="header">K</Kbd>
            </span>
          </button>
          <button
            type="button"
            onClick={() => open()}
            className={`size-9 items-center justify-center rounded text-header-muted hover:bg-white/8 hover:text-white sm:hidden ${
              onHome ? 'hidden' : 'inline-flex'
            }`}
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
            title={`AI チャット（${modKeyLabel()}+J）`}
            aria-label="AI チャット"
            className={`inline-flex h-9 items-center gap-1.5 rounded px-2.5 text-sm whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white ${
              chat.open ? 'bg-white/10 font-medium text-white' : 'text-header-muted'
            }`}
          >
            <Sparkles aria-hidden="true" className="size-[18px]" />
            <span className="max-sm:hidden">AI チャット</span>
          </button>
          <button
            type="button"
            onClick={settingsOpen ? closeSettings : () => navigate('/settings')}
            aria-expanded={settingsOpen}
            aria-label="設定"
            title="設定"
            className={`inline-flex size-9 items-center justify-center rounded transition-colors hover:bg-white/8 hover:text-white ${
              settingsOpen ? 'bg-white/10 text-white' : 'text-header-muted'
            }`}
          >
            <Settings aria-hidden="true" className="size-[18px]" />
          </button>
        </div>
      </div>
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} title="メニュー">
        <nav
          aria-label="メイン（モバイル）"
          className="mb-4 flex flex-col gap-0.5 border-b border-line pb-3"
        >
          {[{ to: '/', label: 'ホーム' }, ...NAV_ITEMS].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={closeDrawer}
              className={(state) => navClass(state, 'drawer')}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              closeDrawer();
              setChatPanelOpen(true);
            }}
            className={`${navClass({ isActive: false }, 'drawer')} gap-2 text-left`}
          >
            <Sparkles aria-hidden="true" className="size-[18px]" />
            AI チャット
          </button>
        </nav>
        <CategoryNav onNavigate={closeDrawer} />
      </MobileDrawer>
    </header>
  );
}
