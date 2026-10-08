// ネットワーク取得。fetch は差し替え可能（テストではモックを渡す）。
import {
  parseBuildsSources,
  parseGamingToolsVersion,
  parseRss,
  parseSitemap,
  summarizeSitemap,
} from './parsers.mjs';
import { TRACKED_CATEGORIES } from './diff.mjs';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
export const TIMEOUT_MS = 15_000;
export const SPACING_MS = 1_000;

export const SIGNAL_URLS = {
  builds: 'https://aion2builds.com/sources/',
  steam: 'https://store.steampowered.com/feeds/news/app/3393110/',
  gtPage: 'https://aion2.gaming.tools/ja',
  gtSitemap: 'https://aion2.gaming.tools/sitemap.xml',
  feeds: {
    redfreshet: 'https://redfreshet.com/feed/',
    'aion2-times': 'https://aion2-times.com/feed/',
  },
  sitemaps: {
    aion2maps: 'https://aion2maps.com/sitemap.xml',
    aion2hub: 'https://aion2hub.com/sitemap.xml',
  },
};

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** ホストごとに直列化し、同一ホストへのリクエストを spacingMs 以上空ける。ホスト間は並列。 */
export function createClient({
  fetchImpl = fetch,
  spacingMs = SPACING_MS,
  timeoutMs = TIMEOUT_MS,
  sleep = defaultSleep,
} = {}) {
  const tails = new Map();

  function schedule(url, task) {
    const host = new URL(url).host;
    const prev = tails.get(host) ?? Promise.resolve();
    const run = prev.then(task);
    tails.set(
      host,
      run.then(
        () => sleep(spacingMs),
        () => sleep(spacingMs),
      ),
    );
    return run;
  }

  function request(url, init = {}) {
    return schedule(url, () =>
      fetchImpl(url, {
        redirect: 'follow',
        ...init,
        headers: { 'user-agent': USER_AGENT, ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(timeoutMs),
      }),
    );
  }

  return { request };
}

const describeError = (e) =>
  e?.name === 'TimeoutError' ? 'タイムアウト' : (e?.cause?.code ?? e?.message ?? String(e));

async function getText(client, url) {
  const res = await client.request(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** 取得 + 解析を 1 つの { ok, ... } に包む。失敗しても例外は投げない。 */
async function guarded(fn) {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, error: describeError(e) };
  }
}

export async function fetchSignals(client) {
  const u = SIGNAL_URLS;
  const builds = await guarded(async () => ({
    links: parseBuildsSources(await getText(client, u.builds)),
  }));
  const steam = await guarded(async () => ({ items: parseRss(await getText(client, u.steam)) }));
  const gtVersion = await guarded(async () => {
    const version = parseGamingToolsVersion(await getText(client, u.gtPage));
    if (!version) throw new Error('バージョン文字列が見つからない（ページ構造の変更？）');
    return { version };
  });
  const gtSitemap = await guarded(async () => ({
    summary: summarizeSitemap(parseSitemap(await getText(client, u.gtSitemap)), TRACKED_CATEGORIES),
  }));
  const feeds = {};
  for (const [name, url] of Object.entries(u.feeds)) {
    feeds[name] = await guarded(async () => ({ items: parseRss(await getText(client, url)) }));
  }
  const sitemaps = {};
  for (const [name, url] of Object.entries(u.sitemaps)) {
    sitemaps[name] = await guarded(async () => ({
      summary: summarizeSitemap(parseSitemap(await getText(client, url))),
    }));
  }
  return { builds, steam, gtVersion, gtSitemap, feeds, sitemaps };
}

function headRecord(res) {
  const range = /\/(\d+)\s*$/.exec(res.headers.get('content-range') ?? '');
  return {
    status: res.status,
    etag: res.headers.get('etag'),
    lastModified: res.headers.get('last-modified'),
    contentLength: range?.[1] ?? res.headers.get('content-length'),
  };
}

/** HEAD。拒否された場合（403/405/501）は Range: bytes=0-0 の GET で検証子だけ取る。 */
export async function fetchHead(client, url) {
  try {
    let res = await client.request(url, { method: 'HEAD' });
    if ([403, 405, 501].includes(res.status)) {
      res = await client.request(url, { method: 'GET', headers: { range: 'bytes=0-0' } });
      await res.body?.cancel?.();
    }
    return headRecord(res);
  } catch (e) {
    return { error: describeError(e) };
  }
}

/** 出典 URL 全件の HEAD（ホスト間は並列、ホスト内は直列）。 */
export async function fetchHeads(client, urls) {
  const heads = {};
  await Promise.all(
    urls.map(async (url) => {
      heads[url] = await fetchHead(client, url);
    }),
  );
  return heads;
}
