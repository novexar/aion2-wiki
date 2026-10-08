import type {
  ChatExport,
  ChatRepository,
  Conversation,
  NewMessage,
  StoredMessage,
} from './chat-repository';

function isInvalidState(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'InvalidStateError'
  );
}

/**
 * IndexedDB の接続が閉じられた（別タブのバージョン更新・ブラウザによる切断）あとも使い続けられる
 * ChatRepository。接続喪失の通知があれば次の操作の前に開き直し、閉じた接続で
 * InvalidStateError になった操作は 1 度だけ開き直して再試行する。
 */
export class ReopeningRepository implements ChatRepository {
  private stale = false;
  /** 開き直し中の Promise（同時に呼ばれても reopen は 1 回だけ） */
  private refreshing: Promise<void> | null = null;

  constructor(
    private inner: ChatRepository,
    private readonly reopen: () => Promise<ChatRepository>,
  ) {}

  get persistent(): boolean {
    return this.inner.persistent;
  }

  /** 接続を失ったことを知らされたとき（次の操作で開き直す） */
  markLost(): void {
    this.stale = true;
  }

  private refresh(): Promise<void> {
    this.refreshing ??= this.reopenOnce().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  private async reopenOnce(): Promise<void> {
    // await の前に下ろす（開き直し中の markLost() を消さない）
    this.stale = false;
    this.inner = await this.reopen();
  }

  private async run<T>(operation: (repo: ChatRepository) => Promise<T>): Promise<T> {
    if (this.stale || this.refreshing) await this.refresh();
    const used = this.inner;
    try {
      return await operation(used);
    } catch (error: unknown) {
      if (!isInvalidState(error)) throw error;
      // 古い接続の失敗で、すでに別の操作が開き直し済みなら再度開き直さない
      if (this.inner === used) await this.refresh();
      return operation(this.inner);
    }
  }

  list(): Promise<Conversation[]> {
    return this.run((r) => r.list());
  }
  create(now?: number): Promise<Conversation> {
    return this.run((r) => r.create(now));
  }
  messages(conversationId: string): Promise<StoredMessage[]> {
    return this.run((r) => r.messages(conversationId));
  }
  append(conversationId: string, message: NewMessage): Promise<Conversation | null> {
    return this.run((r) => r.append(conversationId, message));
  }
  renameTitle(conversationId: string, title: string): Promise<void> {
    return this.run((r) => r.renameTitle(conversationId, title));
  }
  delete(conversationId: string): Promise<void> {
    return this.run((r) => r.delete(conversationId));
  }
  deleteAll(): Promise<void> {
    return this.run((r) => r.deleteAll());
  }
  exportAll(): Promise<ChatExport> {
    return this.run((r) => r.exportAll());
  }
  estimateBytes(): Promise<number> {
    return this.run((r) => r.estimateBytes());
  }
}
