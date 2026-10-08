/** localStorage / sessionStorage の安全なラッパー（プライベートモード等で例外が出ても落ちない） */
export type StoreKind = 'local' | 'session';

export const STORAGE_KEYS = {
  apiKey: 'aion2wiki:gemini-api-key',
  model: 'aion2wiki:gemini-model',
  theme: 'aion2wiki:theme',
  faction: 'aion2wiki:faction',
  chat: 'aion2wiki:chat-history',
  chatPanelOpen: 'aion2wiki:chat-panel-open',
  chatPanelWidth: 'aion2wiki:chat-panel-width',
  recentArticles: 'aion2wiki:recent-articles',
  homeStaggerPlayed: 'aion2wiki:home-stagger-played',
} as const;

/** 同一タブ内での変更通知用イベント名 */
export const STORAGE_EVENT = 'aion2wiki:storage';

function getStore(kind: StoreKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function notify(key: string): void {
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  } catch {
    // 通知の失敗は無視（保存自体は完了している）
  }
}

export function readString(kind: StoreKind, key: string): string | null {
  try {
    return getStore(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeString(kind: StoreKind, key: string, value: string): boolean {
  try {
    const store = getStore(kind);
    if (!store) return false;
    store.setItem(key, value);
    notify(key);
    return true;
  } catch {
    return false;
  }
}

export function removeKey(kind: StoreKind, key: string): void {
  try {
    getStore(kind)?.removeItem(key);
    notify(key);
  } catch {
    // 削除できなくても致命的ではない
  }
}

export function readJson<T>(
  kind: StoreKind,
  key: string,
  guard: (value: unknown) => value is T,
): T | null {
  const raw = readString(kind, key);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJson(kind: StoreKind, key: string, value: unknown): boolean {
  try {
    return writeString(kind, key, JSON.stringify(value));
  } catch {
    return false;
  }
}
