// 検知スクリプト用の軽量パーサ（正規表現ベース。依存なし）。本文は解析しない。

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

export function decodeEntities(text) {
  return String(text)
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function stripCdata(text) {
  const m = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(text);
  return (m ? m[1] : decodeEntities(text)).trim();
}

function tagText(block, tag) {
  const m = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(block);
  return m ? stripCdata(m[1]) : '';
}

/** RSS 2.0 の item を { id, title, link, date } の配列にする。id は guid、なければ link。 */
export function parseRss(xml) {
  return String(xml)
    .split('<item>')
    .slice(1)
    .map((chunk) => chunk.split('</item>')[0] ?? '')
    .map((block) => {
      const link = tagText(block, 'link');
      const guid = tagText(block, 'guid');
      return {
        id: guid || link,
        title: tagText(block, 'title'),
        link,
        date: tagText(block, 'pubDate'),
      };
    })
    .filter((item) => item.id);
}

/** sitemap（XML、または URL を空白区切りで並べたテキスト）を { loc, lastmod } の配列にする。 */
export function parseSitemap(text) {
  const src = String(text);
  if (src.includes('<loc>')) {
    return [...src.matchAll(/<url>([\s\S]*?)<\/url>/g)]
      .map((m) => ({ loc: tagText(m[1] ?? '', 'loc'), lastmod: tagText(m[1] ?? '', 'lastmod') }))
      .filter((e) => e.loc);
  }
  return src
    .split(/\s+/)
    .filter((s) => /^https?:\/\//.test(s))
    .map((loc) => ({ loc, lastmod: '' }));
}

/** sitemap から件数・最大 lastmod・パス先頭セグメント別の件数と、指定カテゴリの URL 末尾を集計する。 */
export function summarizeSitemap(entries, trackedCategories = []) {
  const categories = {};
  const tails = Object.fromEntries(trackedCategories.map((c) => [c, []]));
  let maxLastmod = '';
  for (const { loc, lastmod } of entries) {
    if (lastmod > maxLastmod) maxLastmod = lastmod;
    let segments;
    try {
      segments = new URL(loc).pathname.split('/').filter(Boolean);
    } catch {
      continue;
    }
    const category = segments[0] ?? '(root)';
    categories[category] = (categories[category] ?? 0) + 1;
    if (tails[category]) tails[category].push(segments.slice(1).join('/'));
  }
  for (const key of Object.keys(tails)) tails[key] = [...new Set(tails[key])].sort();
  return { count: entries.length, maxLastmod, categories, tails };
}

/** aion2builds.com/sources/ の公式告知索引（#official 節）の外部リンクを { url: title } にする。 */
export function parseBuildsSources(html) {
  const src = String(html);
  const start = src.indexOf('id="official"');
  const end = start >= 0 ? src.indexOf('id="platform"', start) : -1;
  const section = start >= 0 ? src.slice(start, end > start ? end : undefined) : src;
  const links = {};
  for (const m of section.matchAll(/<a\s[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const title = decodeEntities((m[2] ?? '').replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim();
    links[decodeEntities(m[1] ?? '')] = title;
  }
  return links;
}

/** aion2.gaming.tools/ja の「グローバル版バージョン: x.y.z.w」を取り出す。 */
export function parseGamingToolsVersion(html) {
  const m = /グローバル版バージョン[:：]\s*([0-9]+(?:\.[0-9]+)+)/.exec(String(html));
  return m ? (m[1] ?? null) : null;
}
