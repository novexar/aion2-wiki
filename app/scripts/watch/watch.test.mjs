import { describe, expect, it, vi } from 'vitest';
import { computeChanges } from './compute.mjs';
import {
  buildReverseIndex,
  diffGamingTools,
  diffKeyed,
  diffSourceHeaders,
  isManualCheckUrl,
} from './diff.mjs';
import { createClient, fetchHead, fetchSignals } from './fetchers.mjs';
import {
  parseBuildsSources,
  parseGamingToolsVersion,
  parseRss,
  parseSitemap,
  summarizeSitemap,
} from './parsers.mjs';
import { parseHeaderDump } from './curl-transport.mjs';
import { renderReport } from './report.mjs';

const RSS = `<rss><channel>
<item><title>Fresh &amp; new</title><link>https://a.test/1</link><guid isPermaLink="false">g1</guid><pubDate>Wed, 07 Oct 2026</pubDate></item>
<item><title>Second</title><link><![CDATA[https://a.test/2]]></link></item>
</channel></rss>`;

describe('parsers', () => {
  it('parses RSS items with CDATA and entities, falling back to link as id', () => {
    const items = parseRss(RSS);
    expect(items).toEqual([
      { id: 'g1', title: 'Fresh & new', link: 'https://a.test/1', date: 'Wed, 07 Oct 2026' },
      { id: 'https://a.test/2', title: 'Second', link: 'https://a.test/2', date: '' },
    ]);
  });

  it('parses XML sitemaps and plain URL lists', () => {
    const xml =
      '<urlset><url><loc>https://x.test/a</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://x.test/b</loc></url></urlset>';
    expect(parseSitemap(xml)).toEqual([
      { loc: 'https://x.test/a', lastmod: '2026-10-01' },
      { loc: 'https://x.test/b', lastmod: '' },
    ]);
    expect(parseSitemap('https://x.test/a\nhttps://x.test/b\n')).toHaveLength(2);
  });

  it('summarizes sitemap categories, tracked tails and max lastmod', () => {
    const entries = parseSitemap(
      '<urlset><url><loc>https://x.test/items/b</loc><lastmod>2026-10-02</lastmod></url><url><loc>https://x.test/items/a</loc></url><url><loc>https://x.test/npcs/z</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://x.test/</loc></url></urlset>',
    );
    const s = summarizeSitemap(entries, ['items']);
    expect(s.count).toBe(4);
    expect(s.maxLastmod).toBe('2026-10-02');
    expect(s.categories).toEqual({ items: 2, npcs: 1, '(root)': 1 });
    expect(s.tails.items).toEqual(['a', 'b']);
  });

  it('extracts official links only from the official section', () => {
    const html =
      '<section id="official"><a href="https://aion2.plaync.com/n?id=1" rel="x"><span>Notice &amp; A</span></a></section><section id="platform"><a href="https://other.test/">Other</a></section>';
    expect(parseBuildsSources(html)).toEqual({ 'https://aion2.plaync.com/n?id=1': 'Notice & A' });
  });

  it('reads the global version string', () => {
    expect(parseGamingToolsVersion('<div>AION 2 グローバル版バージョン: 2.0.5.0</div>')).toBe(
      '2.0.5.0',
    );
    expect(parseGamingToolsVersion('<div>nothing</div>')).toBeNull();
  });
});

describe('diff helpers', () => {
  it('diffKeyed treats a missing previous as initial (all added)', () => {
    expect(diffKeyed(undefined, { a: 'A' })).toMatchObject({
      initial: true,
      added: [{ key: 'a', title: 'A' }],
    });
    const d = diffKeyed({ a: 'A', b: 'B' }, { a: 'A', c: 'C' });
    expect(d.added).toEqual([{ key: 'c', title: 'C' }]);
    expect(d.removed).toEqual([{ key: 'b', title: 'B' }]);
  });

  it('diffGamingTools reports version change and new tracked URLs', () => {
    const prev = { version: '2.0.5.0', categories: { items: 1, npcs: 1 }, tails: { items: ['a'] } };
    const cur = {
      version: '2.0.6.0',
      categories: { items: 2, npcs: 1 },
      tails: { items: ['a', 'b'] },
    };
    const d = diffGamingTools(prev, cur);
    expect(d.versionChanged).toEqual({ from: '2.0.5.0', to: '2.0.6.0' });
    expect(d.newUrls).toEqual({ items: ['b'] });
    expect(d.changed).toBe(true);
    expect(diffGamingTools(cur, cur).changed).toBe(false);
  });

  it('diffSourceHeaders prefers ETag, then Last-Modified, then length', () => {
    const base = { status: 200, etag: '"1"', lastModified: 'Mon', contentLength: '10' };
    expect(diffSourceHeaders(undefined, base)).toEqual({ kind: 'baseline' });
    expect(diffSourceHeaders(base, { ...base })).toEqual({ kind: 'same' });
    expect(diffSourceHeaders(base, { ...base, etag: '"2"' })).toMatchObject({
      kind: 'changed',
      field: 'etag',
    });
    expect(
      diffSourceHeaders({ ...base, etag: null }, { ...base, etag: '"2"', lastModified: 'Tue' }),
    ).toMatchObject({
      kind: 'changed',
      field: 'lastModified',
    });
    expect(diffSourceHeaders(base, { ...base, etag: '"9"' }, { ignoreEtag: true })).toEqual({
      kind: 'same',
    });
    expect(diffSourceHeaders({ status: 200 }, { status: 200 })).toEqual({ kind: 'undetectable' });
    expect(diffSourceHeaders(base, { status: 404 })).toMatchObject({ kind: 'broken', to: 404 });
    expect(diffSourceHeaders(base, { error: 'x' })).toEqual({ kind: 'failed' });
  });

  it('classifies plaync hosts as manual-check and builds the reverse index', () => {
    expect(isManualCheckUrl('https://aion2.plaync.com/en-us/board')).toBe(true);
    expect(isManualCheckUrl('https://aion2maps.com/x')).toBe(false);
    const idx = buildReverseIndex([
      { id: 'a', sources: [{ url: 'https://x.test/p#frag' }, { url: 'https://x.test/p' }] },
      { id: 'b', sources: [{ url: 'https://x.test/p' }] },
    ]);
    expect(idx.get('https://x.test/p')).toEqual(['a', 'b']);
  });
});

const articles = [
  {
    id: 'art-a',
    sources: [{ url: 'https://x.test/p1' }, { url: 'https://aion2.plaync.com/notice/1' }],
  },
  { id: 'art-b', sources: [{ url: 'https://x.test/p2' }] },
];

const prevState = {
  officialIndex: { links: { 'https://o.test/1': 'Old notice' } },
  steam: { items: { s1: { title: 'Steam 1', link: 'https://s.test/1' } } },
  gamingTools: { version: '2.0.5.0', categories: { quests: 1 }, tails: { quests: ['q1'] } },
  feeds: { redfreshet: { items: { r1: { title: 'R1', link: 'https://r.test/1' } } } },
  sitemaps: { aion2maps: { count: 10, maxLastmod: '2026-10-01' } },
  sources: {
    'https://x.test/p1': { status: 200, etag: '"a"', lastModified: null, contentLength: '5' },
    'https://x.test/p2': { status: 200, etag: null, lastModified: null, contentLength: '5' },
  },
};

function observed(overrides = {}) {
  return {
    date: '2026-10-08',
    builds: { ok: true, links: { 'https://o.test/1': 'Old notice' } },
    steam: { ok: true, items: [{ id: 's1', title: 'Steam 1', link: 'https://s.test/1' }] },
    gtVersion: { ok: true, version: '2.0.5.0' },
    gtSitemap: {
      ok: true,
      summary: { count: 1, maxLastmod: '', categories: { quests: 1 }, tails: { quests: ['q1'] } },
    },
    feeds: {
      redfreshet: { ok: true, items: [{ id: 'r1', title: 'R1', link: 'https://r.test/1' }] },
      'aion2-times': { ok: true, items: [] },
    },
    sitemaps: {
      aion2maps: { ok: true, summary: { count: 10, maxLastmod: '2026-10-01' } },
      aion2hub: { ok: true, summary: { count: 3, maxLastmod: '' } },
    },
    heads: {
      'https://x.test/p1': { status: 200, etag: '"a"', lastModified: null, contentLength: '5' },
      'https://x.test/p2': { status: 200, etag: null, lastModified: null, contentLength: '5' },
    },
    ...overrides,
  };
}

describe('computeChanges', () => {
  it('reports no change when nothing differs (aion2hub baseline is not a change)', () => {
    const { changes } = computeChanges(prevState, observed(), articles);
    expect(changes.hasChanges).toBe(false);
    expect(changes.sources.manual).toEqual([
      { url: 'https://aion2.plaync.com/notice/1', ids: ['art-a'] },
    ]);
    expect(changes.counts).toMatchObject({
      official: 0,
      db: 0,
      community: 0,
      sources: 0,
      manual: 1,
    });
  });

  it('detects new official posts, DB changes, feed items, and changed sources with affected articles', () => {
    const obs = observed({
      builds: {
        ok: true,
        links: { 'https://o.test/1': 'Old notice', 'https://o.test/2': 'New notice' },
      },
      steam: {
        ok: true,
        items: [
          { id: 's2', title: 'Maintenance', link: 'https://s.test/2' },
          { id: 's1', title: 'Steam 1', link: 'https://s.test/1' },
        ],
      },
      gtVersion: { ok: true, version: '2.0.6.0' },
      gtSitemap: {
        ok: true,
        summary: {
          count: 2,
          maxLastmod: '',
          categories: { quests: 2 },
          tails: { quests: ['q1', 'q2'] },
        },
      },
      feeds: {
        redfreshet: {
          ok: true,
          items: [
            { id: 'r2', title: 'R2', link: 'https://r.test/2' },
            { id: 'r1', title: 'R1', link: 'https://r.test/1' },
          ],
        },
        'aion2-times': { ok: true, items: [] },
      },
      sitemaps: {
        aion2maps: { ok: true, summary: { count: 12, maxLastmod: '2026-10-07' } },
        aion2hub: { ok: true, summary: { count: 3, maxLastmod: '' } },
      },
      heads: {
        'https://x.test/p1': { status: 200, etag: '"b"', lastModified: null, contentLength: '5' },
        'https://x.test/p2': { status: 404 },
      },
    });
    const { changes, nextState } = computeChanges(prevState, obs, articles);
    expect(changes.hasChanges).toBe(true);
    expect(changes.official.builds.added.map((a) => a.key)).toEqual(['https://o.test/2']);
    expect(changes.official.steam.added[0]).toMatchObject({ key: 's2', link: 'https://s.test/2' });
    expect(changes.db.versionChanged.to).toBe('2.0.6.0');
    expect(changes.db.newUrls).toEqual({ quests: ['q2'] });
    expect(changes.community.feeds.redfreshet.added.map((a) => a.key)).toEqual(['r2']);
    expect(changes.community.sitemaps.aion2maps).toMatchObject({ changed: true, countDelta: 2 });
    expect(changes.sources.changed).toMatchObject([
      { url: 'https://x.test/p1', ids: ['art-a'], field: 'etag' },
    ]);
    expect(changes.sources.broken).toMatchObject([
      { url: 'https://x.test/p2', ids: ['art-b'], to: 404 },
    ]);
    expect(nextState.gamingTools.version).toBe('2.0.6.0');
    expect(nextState.sources['https://x.test/p1'].etag).toBe('"b"');

    // 次回状態を使えば同じ観測結果は「変化なし」になる
    expect(computeChanges(nextState, obs, articles).changes.hasChanges).toBe(false);
  });

  it('treats a missing state as initial and keeps previous state for failed signals', () => {
    const first = computeChanges(null, observed(), articles);
    expect(first.changes.hasChanges).toBe(true);
    expect(first.changes.official.builds.initial).toBe(true);
    expect(first.changes.sources.baseline).toBe(2);

    const failed = observed({
      steam: { ok: false, error: 'HTTP 500' },
      heads: { 'https://x.test/p1': { error: 'タイムアウト' } },
    });
    const { changes, nextState } = computeChanges(prevState, failed, articles);
    expect(changes.hasChanges).toBe(false);
    expect(changes.failures.map((f) => f.signal)).toEqual(
      expect.arrayContaining(['Steam ニュース RSS', '出典 https://x.test/p1']),
    );
    expect(nextState.steam).toEqual(prevState.steam);
    expect(nextState.sources['https://x.test/p1']).toEqual(prevState.sources['https://x.test/p1']);
  });
});

describe('renderReport', () => {
  it('contains the five sections, recommended actions, and the state note', () => {
    const { changes } = computeChanges(
      prevState,
      observed({
        steam: { ok: true, items: [{ id: 's9', title: 'New', link: 'https://s.test/9' }] },
      }),
      articles,
    );
    const md = renderReport(changes, { date: '2026-10-08' });
    for (const h of [
      '## ① 公式告知の新規',
      '## ② DB バージョン',
      '## ③ 攻略サイトの新着',
      '## ④ 変化した出典 URL と影響記事',
      '## ⑤ 取得失敗',
      '## 推奨アクション',
    ]) {
      expect(md).toContain(h);
    }
    expect(md).toContain('`content/news/`');
    expect(md).toContain('--commit-state');
  });
});

describe('fetchers (mock fetch)', () => {
  const res = (status, headers = {}, body = '') => ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => body,
    body: { cancel: async () => {} },
  });

  it('sends a browser UA, falls back to a ranged GET on 405, and never throws', async () => {
    const calls = [];
    const fetchImpl = vi.fn(async (url, init) => {
      calls.push({
        url,
        method: init.method,
        ua: init.headers['user-agent'],
        range: init.headers.range,
      });
      if (url.includes('boom')) throw Object.assign(new Error('x'), { name: 'TimeoutError' });
      if (init.method === 'HEAD') return res(405);
      return res(206, { etag: '"z"', 'content-range': 'bytes 0-0/1234' });
    });
    const client = createClient({ fetchImpl, spacingMs: 0, sleep: async () => {} });
    expect(await fetchHead(client, 'https://h.test/a')).toEqual({
      status: 206,
      etag: '"z"',
      lastModified: null,
      contentLength: '1234',
    });
    expect(calls.map((c) => c.method)).toEqual(['HEAD', 'GET']);
    expect(calls[1].range).toBe('bytes=0-0');
    expect(calls[0].ua).toMatch(/Mozilla/);
    expect(await fetchHead(client, 'https://h.test/boom')).toEqual({ error: 'タイムアウト' });
  });

  it('records signal failures without crashing', async () => {
    const fetchImpl = async (url) => (url.includes('steam') ? res(200, {}, RSS) : res(500));
    const client = createClient({ fetchImpl, spacingMs: 0, sleep: async () => {} });
    const s = await fetchSignals(client);
    expect(s.steam.ok).toBe(true);
    expect(s.steam.items).toHaveLength(2);
    expect(s.builds).toEqual({ ok: false, error: 'HTTP 500' });
    expect(s.feeds.redfreshet.ok).toBe(false);
  });
});

describe('curl transport', () => {
  it('uses the last response block of a redirected header dump', () => {
    const dump = [
      'HTTP/1.1 308 Permanent Redirect',
      'Location: /x/',
      '',
      'HTTP/2 200 ',
      'ETag: "abc"',
      'Content-Length: 12',
      '',
      '',
    ].join('\r\n');
    const { status, headers } = parseHeaderDump(dump);
    expect(status).toBe(200);
    expect(headers.get('etag')).toBe('"abc"');
    expect(headers.get('content-length')).toBe('12');
  });
});
