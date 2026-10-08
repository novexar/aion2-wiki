import { useSyncExternalStore } from 'react';
import { readString, STORAGE_KEYS, writeString } from '../../lib/storage';

/** 右パネルの幅（px）。既定 24rem、最小 20rem、最大 40rem */
export const PANEL_DEFAULT_WIDTH = 384;
export const PANEL_MIN_WIDTH = 320;
export const PANEL_MAX_WIDTH = 640;

export interface ChatPanelState {
  readonly open: boolean;
  readonly width: number;
}

export function clampWidth(width: number): number {
  if (!Number.isFinite(width)) return PANEL_DEFAULT_WIDTH;
  return Math.round(Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, width)));
}

function readInitial(): ChatPanelState {
  const width = Number(readString('local', STORAGE_KEYS.chatPanelWidth));
  return {
    open: readString('local', STORAGE_KEYS.chatPanelOpen) === '1',
    width: width ? clampWidth(width) : PANEL_DEFAULT_WIDTH,
  };
}

// localStorage が使えない環境でも動くよう、状態の正はメモリに置き、保存は可能な範囲で行う
let state: ChatPanelState | null = null;
const listeners = new Set<() => void>();

function current(): ChatPanelState {
  state ??= readInitial();
  return state;
}

function update(next: Partial<ChatPanelState>): void {
  const prev = current();
  const merged = { ...prev, ...next };
  if (merged.open === prev.open && merged.width === prev.width) return;
  state = merged;
  if (merged.open !== prev.open) {
    writeString('local', STORAGE_KEYS.chatPanelOpen, merged.open ? '1' : '0');
  }
  if (merged.width !== prev.width) {
    writeString('local', STORAGE_KEYS.chatPanelWidth, String(merged.width));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getChatPanelState(): ChatPanelState {
  return current();
}

export function setChatPanelOpen(open: boolean): void {
  update({ open });
}

export function toggleChatPanel(): void {
  update({ open: !current().open });
}

export function setChatPanelWidth(width: number): void {
  update({ width: clampWidth(width) });
}

/** テスト用: 次回の読み出しで localStorage から読み直す */
export function resetChatPanelStore(): void {
  state = null;
  listeners.forEach((listener) => listener());
}

export function useChatPanel(): ChatPanelState {
  return useSyncExternalStore(subscribe, current, current);
}

/** 右パネルの DOM id（トグルの aria-controls） */
export const CHAT_PANEL_ID = 'chat-panel';
/** ヘッダーのトグルの DOM id（閉じたときのフォーカス先） */
export const CHAT_TOGGLE_ID = 'chat-toggle';
/** 入力欄の DOM id（開いたときのフォーカス先） */
export const CHAT_INPUT_ID = 'chat-input';

/** 入力欄（API キー未設定ならキー入力欄）へフォーカスする */
export function focusChatInput(): void {
  const panel = document.getElementById(CHAT_PANEL_ID);
  const target =
    document.getElementById(CHAT_INPUT_ID) ??
    panel?.querySelector<HTMLElement>('input[type="password"]') ??
    panel?.querySelector<HTMLElement>('button:not([disabled])');
  target?.focus();
}

/** Ctrl+J（Mac は ⌘J も）でどこからでも開閉する */
export function isToggleShortcut(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === 'j'
  );
}
