import type { ArticleRef, ChatTurn } from '../../lib/rag';
import { readJson, removeKey, STORAGE_KEYS } from '../../lib/storage';
import {
  MemoryRepository,
  openIdbRepository,
  type ChatRepository,
  type NewMessage,
  type StoredMessage,
} from './chat-repository';

export { newId } from './chat-repository';

/** 画面に表示するメッセージ */
export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'model';
  readonly text: string;
  readonly status: 'streaming' | 'done' | 'error';
  readonly refs?: readonly ArticleRef[];
  readonly error?: string;
}

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

export function fromStored(message: StoredMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    text: message.content,
    status: message.error ? 'error' : 'done',
    refs: message.citations,
    ...(message.error ? { error: message.error } : {}),
  };
}

export function toStored(message: ChatMessage, createdAt?: number): NewMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.text,
    citations: message.refs ?? [],
    ...(createdAt === undefined ? {} : { createdAt }),
    ...(message.status === 'error' && message.error ? { error: message.error } : {}),
  };
}

/** 旧実装（sessionStorage）の履歴を 1 つの会話として取り込み、元データを消す */
export async function migrateSessionHistory(repo: ChatRepository): Promise<void> {
  const legacy = readJson('session', STORAGE_KEYS.chat, isMessageList);
  removeKey('session', STORAGE_KEYS.chat);
  const messages = (legacy ?? []).filter((m) => m.status !== 'streaming' && m.text.trim());
  if (messages.length === 0) return;
  const start = Date.now() - messages.length;
  const conv = await repo.create(start);
  for (const [i, m] of messages.entries()) {
    await repo.append(conv.id, toStored(m, start + i));
  }
}

let repoPromise: Promise<ChatRepository> | null = null;

async function openRepository(): Promise<ChatRepository> {
  let repo: ChatRepository;
  try {
    repo = await openIdbRepository();
  } catch (error: unknown) {
    console.warn('IndexedDB を開けないため、会話履歴はメモリ上だけに保持します', error);
    repo = new MemoryRepository();
  }
  try {
    await migrateSessionHistory(repo);
  } catch (error: unknown) {
    console.warn('旧形式の会話履歴を取り込めませんでした', error);
  }
  return repo;
}

/** 会話履歴の保存先を 1 度だけ開く。IndexedDB が開けなければメモリ実装を返す */
export function getChatRepository(): Promise<ChatRepository> {
  repoPromise ??= openRepository();
  return repoPromise;
}

/** テスト用: 次回 getChatRepository() で開き直す */
export function resetChatRepository(): void {
  repoPromise = null;
}

/** 正常に完了したメッセージだけを会話履歴として Gemini に渡す */
export function toTurns(messages: readonly ChatMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.status === 'done' && m.text.trim())
    .map((m) => ({ role: m.role, text: m.text }));
}

/** 設定ページなど別の場所で履歴を変更したときの通知 */
export const HISTORY_EVENT = 'aion2wiki:chat-history';

export function notifyHistoryChanged(): void {
  window.dispatchEvent(new Event(HISTORY_EVENT));
}
