import { useSyncExternalStore } from 'react';
import { useChatPanel } from '../features/chat/chat-panel-store';
import { useMediaQuery, WIDE_QUERY } from './useMediaQuery';

/** WikiShell の左サイドバー・右目次を出すかどうか */
export interface ShellColumns {
  readonly sidebar: boolean;
  readonly toc: boolean;
  /** true ならチャットパネルの分だけ狭くなっている（Tailwind の lg/xl 指定が使えない） */
  readonly squeezed: boolean;
}

const LG = 1024;
/** PAGE_CONTAINER の左右 padding（sm:px-6） */
const CONTAINER_PADDING = 48;
const SIDEBAR = 288 + 32;
const TOC = 208 + 32;
/** これより狭くなるなら目次（さらに狭ければサイドバー）を隠す。40rem */
export const MIN_CONTENT = 640;

/** ビューポート幅とパネル幅（閉じていれば 0）から列構成を決める */
export function shellColumns(viewport: number, panel: number): ShellColumns {
  if (viewport < LG) return { sidebar: false, toc: false, squeezed: false };
  if (panel <= 0) return { sidebar: true, toc: true, squeezed: false };
  const content = viewport - panel - CONTAINER_PADDING - SIDEBAR;
  const sidebar = content >= MIN_CONTENT;
  return { sidebar, toc: sidebar && content - TOC >= MIN_CONTENT, squeezed: true };
}

function subscribeResize(notify: () => void): () => void {
  window.addEventListener('resize', notify);
  return () => window.removeEventListener('resize', notify);
}

function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth,
    () => LG,
  );
}

export function useShellColumns(): ShellColumns {
  const wide = useMediaQuery(WIDE_QUERY, true);
  const panel = useChatPanel();
  const viewport = useViewportWidth();
  if (!wide) return { sidebar: false, toc: false, squeezed: false };
  // matchMedia が lg 以上と言うなら viewport も lg 以上として扱う（jsdom 等で innerWidth が当てにならない）
  return shellColumns(Math.max(viewport, LG), panel.open ? panel.width : 0);
}
