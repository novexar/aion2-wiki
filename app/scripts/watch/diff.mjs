// 前回状態と今回の取得結果の差分計算（純粋関数。ネットワークもファイルも触らない）。

export const TRACKED_CATEGORIES = ['activities', 'maps', 'quests', 'items'];
export const MAX_STORED_ITEMS = 60;
// リクエストごとに ETag が変わる（複数オリジンで値が揺れる）ホスト。Last-Modified / Content-Length だけで比較する。
const UNSTABLE_ETAG_HOSTS = ['aion2.gaming.tools'];
const MANUAL_HOST_SUFFIXES = ['plaync.com', 'ncsoft.jp'];

/** JS 描画で取得できない公式サイトの URL かどうか（「要目視」扱い）。 */
export function isManualCheckUrl(url) {
  try {
    const host = new URL(url).hostname;
    return MANUAL_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
  } catch {
    return false;
  }
}

export function hasUnstableEtag(url) {
  try {
    return UNSTABLE_ETAG_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}

/** 記事一覧 [{ id, sources: [{ url }] }] から 出典 URL → 記事 id[] の逆引き表を作る。 */
export function buildReverseIndex(articles) {
  const index = new Map();
  for (const article of articles) {
    for (const source of article.sources ?? []) {
      if (!source?.url) continue;
      const key = normalizeUrl(source.url);
      const ids = index.get(key) ?? [];
      if (!ids.includes(article.id)) ids.push(article.id);
      index.set(key, ids);
    }
  }
  return index;
}

/** { key: title } 同士の集合差。prev が undefined（初回）なら cur 全件が追加扱い。 */
export function diffKeyed(prev, cur) {
  const before = prev ?? {};
  const added = Object.keys(cur)
    .filter((k) => !(k in before))
    .map((key) => ({ key, title: cur[key] }));
  const removed = prev
    ? Object.keys(before)
        .filter((k) => !(k in cur))
        .map((key) => ({ key, title: before[key] }))
    : [];
  return { added, removed, initial: prev === undefined };
}

export function diffGamingTools(prev, cur) {
  const versionChanged =
    cur.version && prev?.version !== cur.version
      ? { from: prev?.version ?? null, to: cur.version }
      : null;
  const newUrls = {};
  const categoryDeltas = {};
  for (const [category, count] of Object.entries(cur.categories ?? {})) {
    const delta = count - (prev?.categories?.[category] ?? 0);
    if (prev && delta !== 0) categoryDeltas[category] = delta;
    const tails = cur.tails?.[category];
    if (!tails) continue;
    const known = new Set(prev?.tails?.[category] ?? []);
    const fresh = tails.filter((t) => !known.has(t));
    if (prev && fresh.length > 0) newUrls[category] = fresh;
  }
  const newUrlCount = Object.values(newUrls).reduce((n, list) => n + list.length, 0);
  const otherDeltas = Object.entries(categoryDeltas).filter(
    ([c, d]) => !TRACKED_CATEGORIES.includes(c) && d > 0,
  );
  return {
    versionChanged,
    newUrls,
    categoryDeltas,
    initial: !prev,
    changed: Boolean(versionChanged) || newUrlCount > 0 || otherDeltas.length > 0,
  };
}

export function diffSitemapLite(prev, cur) {
  if (!prev) return { initial: true, changed: false, countDelta: 0, lastmodChanged: null };
  const countDelta = cur.count - prev.count;
  const lastmodChanged =
    cur.maxLastmod && cur.maxLastmod !== prev.maxLastmod
      ? { from: prev.maxLastmod || null, to: cur.maxLastmod }
      : null;
  return {
    initial: false,
    changed: countDelta !== 0 || Boolean(lastmodChanged),
    countDelta,
    lastmodChanged,
  };
}

/** HEAD 結果の比較。両方に存在する検証子（ETag > Last-Modified > Content-Length）だけを見る。 */
export function diffSourceHeaders(prev, cur, { ignoreEtag = false } = {}) {
  if (!cur) return null;
  if (!prev) return { kind: 'baseline' };
  if (cur.error) return { kind: 'failed' };
  if (prev.status < 400 && cur.status >= 400)
    return { kind: 'broken', from: prev.status, to: cur.status };
  if (cur.status >= 400) return { kind: 'failed' };
  const fields = ignoreEtag
    ? ['lastModified', 'contentLength']
    : ['etag', 'lastModified', 'contentLength'];
  for (const field of fields) {
    if (prev[field] && cur[field]) {
      return prev[field] === cur[field]
        ? { kind: 'same' }
        : { kind: 'changed', field, from: prev[field], to: cur[field] };
    }
  }
  return { kind: cur.etag || cur.lastModified || cur.contentLength ? 'same' : 'undetectable' };
}

export function hasValidator(head) {
  return Boolean(head && (head.etag || head.lastModified || head.contentLength));
}
