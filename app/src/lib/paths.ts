/** ルーティング関連のパス組み立て */
export function articlePath(category: string, id: string, anchor?: string): string {
  const path = `/wiki/${category}/${id}`;
  return anchor ? `${path}#${encodeURIComponent(anchor)}` : path;
}

export function categoryPath(category: string): string {
  return `/wiki/${category}`;
}

export function searchPath(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`;
}

export function normalizeBase(base: string): string {
  const withLead = base.startsWith('/') ? base : `/${base}`;
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

/**
 * 記事 HTML 内のリンク（ベースパス付き）をルーター内パスに変換する。
 * サイト外・別オリジン・ベースパス外なら null。
 */
export function toRouterPath(href: string, base: string, origin: string): string | null {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const normalized = normalizeBase(base);
  if (!url.pathname.startsWith(normalized)) return null;
  return `/${url.pathname.slice(normalized.length)}${url.search}${url.hash}`;
}
