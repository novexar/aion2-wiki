import type { ArticleRef, ChatTurn } from '../../lib/rag';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from '../../lib/storage';

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'model';
  readonly text: string;
  readonly status: 'streaming' | 'done' | 'error';
  readonly refs?: readonly ArticleRef[];
  readonly error?: string;
}

/** sessionStorage に保存する件数の上限 */
const MAX_STORED = 40;

function isMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    (v.role === 'user' || v.role === 'model') &&
    typeof v.text === 'string' &&
    (v.status === 'done' || v.status === 'error' || v.status === 'streaming')
  );
}

function isMessageList(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every(isMessage);
}

export function loadHistory(): ChatMessage[] {
  const list = readJson('session', STORAGE_KEYS.chat, isMessageList) ?? [];
  // ストリーミング途中で閉じたものは完了扱い
  return list.map((m) => (m.status === 'streaming' ? { ...m, status: 'done' as const } : m));
}

export function saveHistory(messages: readonly ChatMessage[]): void {
  writeJson(
    'session',
    STORAGE_KEYS.chat,
    messages.filter((m) => m.status !== 'streaming').slice(-MAX_STORED),
  );
}

export function clearHistory(): void {
  removeKey('session', STORAGE_KEYS.chat);
}

/** 正常に完了したメッセージだけを会話履歴として Gemini に渡す */
export function toTurns(messages: readonly ChatMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.status === 'done' && m.text.trim())
    .map((m) => ({ role: m.role, text: m.text }));
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
