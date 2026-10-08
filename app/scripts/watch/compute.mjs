// 取得結果 + 前回状態 + 記事一覧 → 変化・次回状態を計算する（純粋関数）。
import {
  TRACKED_CATEGORIES,
  MAX_STORED_ITEMS,
  buildReverseIndex,
  diffGamingTools,
  diffKeyed,
  diffSitemapLite,
  diffSourceHeaders,
  hasUnstableEtag,
  hasValidator,
  isManualCheckUrl,
  normalizeUrl,
} from './diff.mjs';

export const STATE_VERSION = 1;
export const FEED_NAMES = ['redfreshet', 'aion2-times'];
export const SITEMAP_NAMES = ['aion2maps', 'aion2hub'];

const toKeyed = (items) =>
  Object.fromEntries(
    items.slice(0, MAX_STORED_ITEMS).map((i) => [i.id, { title: i.title, link: i.link }]),
  );
const titles = (keyed) =>
  Object.fromEntries(Object.entries(keyed).map(([k, v]) => [k, v.title ?? v]));

function failureOf(signal, result) {
  return result && result.ok === false ? [{ signal, detail: result.error ?? 'unknown' }] : [];
}

/** 公式告知索引 + Steam ニュース */
function computeOfficial(prev, observed, next, failures) {
  const out = { builds: null, steam: null };
  failures.push(...failureOf('aion2builds 公式告知索引', observed.builds));
  if (observed.builds?.ok) {
    out.builds = diffKeyed(prev.officialIndex?.links, observed.builds.links);
    next.officialIndex = { links: observed.builds.links };
  }
  failures.push(...failureOf('Steam ニュース RSS', observed.steam));
  if (observed.steam?.ok) {
    const keyed = toKeyed(observed.steam.items);
    const prevTitles = prev.steam?.items ? titles(prev.steam.items) : undefined;
    const diff = diffKeyed(prevTitles, titles(keyed));
    out.steam = {
      ...diff,
      added: diff.added.map((a) => ({ ...a, link: keyed[a.key]?.link ?? a.key })),
    };
    next.steam = { items: keyed };
  }
  return out;
}

/** Global DB のバージョンと sitemap */
function computeDb(prev, observed, next, failures) {
  failures.push(...failureOf('gaming.tools /ja バージョン', observed.gtVersion));
  failures.push(...failureOf('gaming.tools sitemap', observed.gtSitemap));
  const before = prev.gamingTools;
  const cur = {
    version: observed.gtVersion?.ok ? observed.gtVersion.version : (before?.version ?? null),
    categories: observed.gtSitemap?.ok
      ? observed.gtSitemap.summary.categories
      : (before?.categories ?? {}),
    tails: observed.gtSitemap?.ok ? observed.gtSitemap.summary.tails : (before?.tails ?? {}),
  };
  next.gamingTools = cur;
  return diffGamingTools(before, cur);
}

/** 攻略サイトの新着（WordPress RSS と sitemap lastmod） */
function computeCommunity(prev, observed, next, failures) {
  const feeds = {};
  next.feeds = { ...(prev.feeds ?? {}) };
  for (const name of FEED_NAMES) {
    const res = observed.feeds?.[name];
    failures.push(...failureOf(`${name} RSS`, res));
    if (!res?.ok) continue;
    const keyed = toKeyed(res.items);
    const prevTitles = prev.feeds?.[name]?.items ? titles(prev.feeds[name].items) : undefined;
    const diff = diffKeyed(prevTitles, titles(keyed));
    feeds[name] = {
      ...diff,
      added: diff.added.map((a) => ({ ...a, link: keyed[a.key]?.link ?? a.key })),
    };
    next.feeds[name] = { items: keyed };
  }
  const sitemaps = {};
  next.sitemaps = { ...(prev.sitemaps ?? {}) };
  for (const name of SITEMAP_NAMES) {
    const res = observed.sitemaps?.[name];
    failures.push(...failureOf(`${name} sitemap`, res));
    if (!res?.ok) continue;
    const { count, maxLastmod } = res.summary;
    sitemaps[name] = diffSitemapLite(prev.sitemaps?.[name], { count, maxLastmod });
    next.sitemaps[name] = { count, maxLastmod };
  }
  return { feeds, sitemaps };
}

/** 記事の出典 URL（HEAD の検証子の変化）。plaync 系は要目視に分類する。 */
function computeSources(prev, observed, articles, next, failures) {
  const reverse = buildReverseIndex(articles);
  const result = { changed: [], broken: [], manual: [], baseline: 0, undetectable: 0, checked: 0 };
  next.sources = {};
  for (const [url, ids] of reverse) {
    if (isManualCheckUrl(url)) {
      result.manual.push({ url, ids });
      continue;
    }
    const cur = observed.heads?.[url];
    const before = prev.sources?.[url];
    if (!cur) {
      if (before) next.sources[url] = before;
      continue;
    }
    result.checked += 1;
    const verdict = diffSourceHeaders(before, cur, { ignoreEtag: hasUnstableEtag(url) });
    if (cur.error) failures.push({ signal: `出典 ${url}`, detail: cur.error });
    else if (cur.status >= 400 && verdict?.kind !== 'broken')
      failures.push({ signal: `出典 ${url}`, detail: `HTTP ${cur.status}` });
    if (verdict?.kind === 'baseline') result.baseline += 1;
    if (!cur.error && cur.status < 400 && !hasValidator(cur)) result.undetectable += 1;
    if (verdict?.kind === 'changed') result.changed.push({ url, ids, ...verdict });
    if (verdict?.kind === 'broken') result.broken.push({ url, ids, ...verdict });
    if (!cur.error && cur.status < 400) {
      next.sources[url] = {
        status: cur.status,
        etag: cur.etag ?? null,
        lastModified: cur.lastModified ?? null,
        contentLength: cur.contentLength ?? null,
      };
    } else if (before) {
      next.sources[url] = before;
    }
  }
  return result;
}

export function computeChanges(prevState, observed, articles) {
  const prev = prevState ?? {};
  const next = { ...prev, version: STATE_VERSION, updatedAt: observed.date };
  const failures = [];
  const official = computeOfficial(prev, observed, next, failures);
  const db = computeDb(prev, observed, next, failures);
  const community = computeCommunity(prev, observed, next, failures);
  const sources = computeSources(prev, observed, articles, next, failures);

  const sitemapChanged = Object.values(community.sitemaps).filter((s) => s.changed).length;
  const counts = {
    official: (official.builds?.added.length ?? 0) + (official.steam?.added.length ?? 0),
    db: (db.versionChanged ? 1 : 0) + Object.values(db.newUrls).reduce((n, l) => n + l.length, 0),
    community:
      Object.values(community.feeds).reduce((n, f) => n + f.added.length, 0) + sitemapChanged,
    sources: sources.changed.length + sources.broken.length,
    manual: sources.manual.length,
    failures: failures.length,
  };
  const hasChanges = counts.official + counts.community + counts.sources > 0 || db.changed;
  return {
    changes: { official, db, community, sources, failures, counts, hasChanges },
    nextState: next,
  };
}

export { TRACKED_CATEGORIES, normalizeUrl };
