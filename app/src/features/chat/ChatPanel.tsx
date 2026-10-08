import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import { trapTab } from '../../lib/focus-trap';
import { usePresence } from '../../lib/use-presence';
import { useMediaQuery, WIDE_QUERY } from '../../lib/useMediaQuery';
import {
  CHAT_PANEL_ID,
  CHAT_TOGGLE_ID,
  focusChatInput,
  isToggleShortcut,
  setChatPanelOpen,
  toggleChatPanel,
  useChatPanel,
} from './chat-panel-store';
import { ResizeHandle } from './ResizeHandle';

const ChatPanelBody = lazy(() => import('./ChatPanelBody'));

/** 開いたら入力欄へ、閉じたらトグルへフォーカスを移す（初回は本文側が読み込み後に行う） */
function useFocusOnToggle(open: boolean): void {
  const previous = useRef(open);
  useEffect(() => {
    if (previous.current === open) return;
    previous.current = open;
    if (open) focusChatInput();
    else document.getElementById(CHAT_TOGGLE_ID)?.focus();
  }, [open]);
}

/** 閉じるスライド（160ms）の後に hidden にする */
const CLOSE_FALLBACK_MS = 160 + 80;

/** 他のモーダル（検索パレット・ドロワー）が開いているか */
function otherModalOpen(): boolean {
  return document.querySelector(`[aria-modal="true"]:not(#${CHAT_PANEL_ID})`) !== null;
}

/** モバイルの全画面シートでは背面のスクロールを止め、Tab を内側に閉じ込め、Esc で閉じる */
function useSheetBehavior(active: boolean, panelRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        // ほかのダイアログの Esc では閉じない
        if (!event.defaultPrevented && !otherModalOpen()) setChatPanelOpen(false);
        return;
      }
      trapTab(event, panelRef.current);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active, panelRef]);
}

/**
 * 右側のチャットパネル。開くと右から 240ms ease-out、閉じると 160ms ease-in でスライドする。lg 以上は右端の固定幅カラム（本文はその分だけ左に縮む）、
 * lg 未満は全画面シート。閉じても会話を保つため、一度開いたら DOM に残して hidden にする
 */
export function ChatPanel() {
  const { open, width } = useChatPanel();
  const desktop = useMediaQuery(WIDE_QUERY, true);
  // 本文（会話・入力欄）は初めて開いたときに読み込む
  const [loaded, setLoaded] = useState(open);
  if (open && !loaded) setLoaded(true);
  const { visible, done } = usePresence(open, CLOSE_FALLBACK_MS);
  // リサイズ中は transition を止める（幅の追従を遅らせない）
  const [resizing, setResizing] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isToggleShortcut(event)) return;
      event.preventDefault();
      toggleChatPanel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useFocusOnToggle(open);
  const sheet = open && !desktop;
  useSheetBehavior(sheet, panelRef);

  return (
    <aside
      ref={panelRef}
      id={CHAT_PANEL_ID}
      role={sheet ? 'dialog' : undefined}
      aria-modal={sheet || undefined}
      aria-label="AI チャット"
      hidden={!visible}
      data-open={open || undefined}
      data-resizing={resizing || undefined}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget) done();
      }}
      style={desktop ? { width } : undefined}
      className={`chat-panel fixed flex flex-col bg-canvas ${
        desktop ? 'inset-y-0 right-0 z-40 border-l border-line' : 'inset-0 z-50'
      }`}
    >
      {desktop && <ResizeHandle width={width} onResizingChange={setResizing} />}
      {loaded && (
        <Suspense fallback={<p className="px-4 py-6 text-sm text-fg-subtle">読み込み中</p>}>
          <ChatPanelBody />
        </Suspense>
      )}
    </aside>
  );
}
