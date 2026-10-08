import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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

/** モバイルの全画面シートでは背面のスクロールを止め、Esc で閉じる */
function useSheetBehavior(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setChatPanelOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);
}

/**
 * 右側のチャットパネル。lg 以上は右端の固定幅カラム（本文はその分だけ左に縮む）、
 * lg 未満は全画面シート。閉じても会話を保つため、一度開いたら DOM に残して hidden にする
 */
export function ChatPanel() {
  const { open, width } = useChatPanel();
  const desktop = useMediaQuery(WIDE_QUERY, true);
  // 本文（会話・入力欄）は初めて開いたときに読み込む
  const [loaded, setLoaded] = useState(open);
  if (open && !loaded) setLoaded(true);

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
  useSheetBehavior(open && !desktop);

  return (
    <aside
      id={CHAT_PANEL_ID}
      role="complementary"
      aria-label="チャット"
      hidden={!open}
      style={desktop ? { width } : undefined}
      className={`chat-panel-in fixed flex flex-col bg-canvas ${
        desktop ? 'inset-y-0 right-0 z-40 border-l border-line' : 'inset-0 z-50'
      }`}
    >
      {desktop && <ResizeHandle width={width} />}
      {loaded && (
        <Suspense fallback={<p className="px-4 py-6 text-sm text-fg-subtle">読み込み中</p>}>
          <ChatPanelBody />
        </Suspense>
      )}
    </aside>
  );
}
