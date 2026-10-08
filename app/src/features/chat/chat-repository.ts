import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ArticleRef } from '../../lib/rag';

/** 会話（履歴一覧の 1 行） */
export interface Conversation {
  readonly id: string;
  /** 最初の質問の先頭 TITLE_LENGTH 文字。質問前は空文字 */
  readonly title: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface StoredMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly role: 'user' | 'model';
  readonly content: string;
  readonly citations: readonly ArticleRef[];
  readonly createdAt: number;
  readonly error?: string;
}

export type ConversationExport = Conversation & { readonly messages: StoredMessage[] };

export interface ChatExport {
  readonly version: 1;
  readonly exportedAt: number;
  readonly conversations: readonly ConversationExport[];
}

export type NewMessage = Omit<StoredMessage, 'conversationId' | 'createdAt'> & {
  readonly createdAt?: number;
};

/** 会話履歴の保存先。IndexedDB とメモリの 2 実装がある */
export interface ChatRepository {
  /** false ならメモリ上だけで動作している（タブを閉じると消える） */
  readonly persistent: boolean;
  list(): Promise<Conversation[]>;
  create(now?: number): Promise<Conversation>;
  messages(conversationId: string): Promise<StoredMessage[]>;
  /** 追加後の会話を返す。会話が無ければ null */
  append(conversationId: string, message: NewMessage): Promise<Conversation | null>;
  renameTitle(conversationId: string, title: string): Promise<void>;
  delete(conversationId: string): Promise<void>;
  deleteAll(): Promise<void>;
  exportAll(): Promise<ChatExport>;
  /** 保存量の目安（JSON 換算のバイト数） */
  estimateBytes(): Promise<number>;
}

export const TITLE_LENGTH = 30;
/** この量を超えたら古い会話の削除を促す */
export const WARN_BYTES = 5 * 1024 * 1024;
export const DB_NAME = 'aion2wiki-chat';
const DB_VERSION = 1;

export function titleFrom(question: string): string {
  return [...question.replace(/\s+/g, ' ').trim()].slice(0, TITLE_LENGTH).join('');
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function byUpdatedDesc(a: Conversation, b: Conversation): number {
  return b.updatedAt - a.updatedAt;
}

function byCreatedAsc(a: StoredMessage, b: StoredMessage): number {
  return a.createdAt - b.createdAt;
}

function toStored(conversationId: string, input: NewMessage): StoredMessage {
  return { ...input, conversationId, createdAt: input.createdAt ?? Date.now() };
}

function touched(conv: Conversation, message: StoredMessage): Conversation {
  const title = conv.title || (message.role === 'user' ? titleFrom(message.content) : '');
  return { ...conv, title, updatedAt: Math.max(conv.updatedAt, message.createdAt) };
}

function sizeOf(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

function buildExport(
  conversations: readonly Conversation[],
  messages: readonly StoredMessage[],
): ChatExport {
  return {
    version: 1,
    exportedAt: Date.now(),
    conversations: [...conversations].sort(byUpdatedDesc).map((c) => ({
      ...c,
      messages: messages.filter((m) => m.conversationId === c.id).sort(byCreatedAsc),
    })),
  };
}

interface ChatDB extends DBSchema {
  conversations: { key: string; value: Conversation; indexes: { updatedAt: number } };
  messages: { key: string; value: StoredMessage; indexes: { conversationId: string } };
}

class IdbRepository implements ChatRepository {
  readonly persistent = true;

  constructor(private readonly db: IDBPDatabase<ChatDB>) {}

  async list(): Promise<Conversation[]> {
    return (await this.db.getAll('conversations')).sort(byUpdatedDesc);
  }

  async create(now = Date.now()): Promise<Conversation> {
    const conv: Conversation = { id: newId(), title: '', createdAt: now, updatedAt: now };
    await this.db.put('conversations', conv);
    return conv;
  }

  async messages(conversationId: string): Promise<StoredMessage[]> {
    const list = await this.db.getAllFromIndex('messages', 'conversationId', conversationId);
    return list.sort(byCreatedAsc);
  }

  async append(conversationId: string, input: NewMessage): Promise<Conversation | null> {
    const tx = this.db.transaction(['conversations', 'messages'], 'readwrite');
    const conv = await tx.objectStore('conversations').get(conversationId);
    if (!conv) {
      await tx.done;
      return null;
    }
    const message = toStored(conversationId, input);
    const next = touched(conv, message);
    await Promise.all([
      tx.objectStore('messages').put(message),
      tx.objectStore('conversations').put(next),
      tx.done,
    ]);
    return next;
  }

  async renameTitle(conversationId: string, title: string): Promise<void> {
    const tx = this.db.transaction('conversations', 'readwrite');
    const conv = await tx.store.get(conversationId);
    if (conv) await tx.store.put({ ...conv, title: title.trim() });
    await tx.done;
  }

  async delete(conversationId: string): Promise<void> {
    const tx = this.db.transaction(['conversations', 'messages'], 'readwrite');
    const messages = tx.objectStore('messages');
    const keys = await messages.index('conversationId').getAllKeys(conversationId);
    await Promise.all([
      ...keys.map((key) => messages.delete(key)),
      tx.objectStore('conversations').delete(conversationId),
      tx.done,
    ]);
  }

  async deleteAll(): Promise<void> {
    const tx = this.db.transaction(['conversations', 'messages'], 'readwrite');
    await Promise.all([
      tx.objectStore('conversations').clear(),
      tx.objectStore('messages').clear(),
      tx.done,
    ]);
  }

  async exportAll(): Promise<ChatExport> {
    const [conversations, messages] = await Promise.all([
      this.db.getAll('conversations'),
      this.db.getAll('messages'),
    ]);
    return buildExport(conversations, messages);
  }

  async estimateBytes(): Promise<number> {
    const [conversations, messages] = await Promise.all([
      this.db.getAll('conversations'),
      this.db.getAll('messages'),
    ]);
    return sizeOf(conversations) + sizeOf(messages);
  }
}

/** IndexedDB が使えない環境（プライベートモード等）向け。タブを閉じると消える */
export class MemoryRepository implements ChatRepository {
  readonly persistent = false;
  private conversations: readonly Conversation[] = [];
  private stored: readonly StoredMessage[] = [];

  list(): Promise<Conversation[]> {
    return Promise.resolve([...this.conversations].sort(byUpdatedDesc));
  }

  create(now = Date.now()): Promise<Conversation> {
    const conv: Conversation = { id: newId(), title: '', createdAt: now, updatedAt: now };
    this.conversations = [...this.conversations, conv];
    return Promise.resolve(conv);
  }

  messages(conversationId: string): Promise<StoredMessage[]> {
    return Promise.resolve(
      this.stored.filter((m) => m.conversationId === conversationId).sort(byCreatedAsc),
    );
  }

  append(conversationId: string, input: NewMessage): Promise<Conversation | null> {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) return Promise.resolve(null);
    const message = toStored(conversationId, input);
    const next = touched(conv, message);
    this.stored = [...this.stored.filter((m) => m.id !== message.id), message];
    this.conversations = this.conversations.map((c) => (c.id === conversationId ? next : c));
    return Promise.resolve(next);
  }

  renameTitle(conversationId: string, title: string): Promise<void> {
    this.conversations = this.conversations.map((c) =>
      c.id === conversationId ? { ...c, title: title.trim() } : c,
    );
    return Promise.resolve();
  }

  delete(conversationId: string): Promise<void> {
    this.conversations = this.conversations.filter((c) => c.id !== conversationId);
    this.stored = this.stored.filter((m) => m.conversationId !== conversationId);
    return Promise.resolve();
  }

  deleteAll(): Promise<void> {
    this.conversations = [];
    this.stored = [];
    return Promise.resolve();
  }

  exportAll(): Promise<ChatExport> {
    return Promise.resolve(buildExport(this.conversations, this.stored));
  }

  estimateBytes(): Promise<number> {
    return Promise.resolve(sizeOf(this.conversations) + sizeOf(this.stored));
  }
}

/**
 * @param onConnectionLost 他タブのバージョン更新やブラウザによる切断で接続が使えなくなった時に呼ぶ
 */
export async function openIdbRepository(onConnectionLost?: () => void): Promise<ChatRepository> {
  if (typeof indexedDB === 'undefined') throw new Error('IndexedDB がありません');
  const db = await openDB<ChatDB>(DB_NAME, DB_VERSION, {
    blocking() {
      // 別タブがバージョンを上げようとしている。接続を閉じて譲る
      db.close();
      onConnectionLost?.();
    },
    terminated() {
      onConnectionLost?.();
    },
    upgrade(database) {
      const conversations = database.createObjectStore('conversations', { keyPath: 'id' });
      conversations.createIndex('updatedAt', 'updatedAt');
      const messages = database.createObjectStore('messages', { keyPath: 'id' });
      messages.createIndex('conversationId', 'conversationId');
    },
  });
  return new IdbRepository(db);
}
