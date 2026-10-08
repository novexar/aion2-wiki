// 変化結果 → Markdown レポート（日本語）。

const LIST_LIMIT = 15;
const FAILURE_LIMIT = 30;

const oneLine = (text) =>
  String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();

function bullets(lines, limit = LIST_LIMIT) {
  const shown = lines.slice(0, limit);
  const rest = lines.length - shown.length;
  return [...shown.map((l) => `- ${l}`), ...(rest > 0 ? [`- ほか ${rest} 件`] : [])];
}

function officialSection({ builds, steam }) {
  const out = ['## ① 公式告知の新規', ''];
  const lines = [
    ...(builds?.added ?? []).map((a) => `[告知索引] ${oneLine(a.title)} <${a.key}>`),
    ...(steam?.added ?? []).map((a) => `[Steam] ${oneLine(a.title)} <${a.link}>`),
  ];
  const initial = builds?.initial || steam?.initial;
  if (initial) out.push('初回実行のため、現在の一覧すべてを新規として扱っています。', '');
  out.push(...(lines.length ? bullets(lines) : ['新規なし。']), '');
  return out;
}

function dbSection(db) {
  const out = ['## ② DB バージョン・新規 URL（新トピック候補）', ''];
  if (db.versionChanged) {
    out.push(
      `- Global DB バージョン: ${db.versionChanged.from ?? '(未記録)'} → **${db.versionChanged.to}**`,
    );
  }
  const cats = Object.entries(db.newUrls);
  for (const [category, tails] of cats) {
    const sample = tails.slice(0, 5).join(', ');
    out.push(
      `- \`${category}/\` に新規 ${tails.length} 件${sample ? `（例: ${sample}${tails.length > 5 ? ' ほか' : ''}）` : ''}`,
    );
  }
  const others = Object.entries(db.categoryDeltas).filter(([c, d]) => !(c in db.newUrls) && d > 0);
  for (const [category, delta] of others)
    out.push(`- \`${category}/\` は +${delta} 件（URL 一覧は未保持）`);
  if (db.initial)
    out.push(
      '- 初回実行: 現在のバージョンと URL 数を基準として記録します（新規 URL は比較対象なし）。',
    );
  if (out.length === 2) out.push('変化なし。');
  out.push('');
  return out;
}

function communitySection({ feeds, sitemaps }) {
  const out = ['## ③ 攻略サイトの新着', ''];
  const lines = [];
  for (const [name, f] of Object.entries(feeds)) {
    for (const a of f.added) lines.push(`[${name}] ${oneLine(a.title)} <${a.link}>`);
  }
  for (const [name, s] of Object.entries(sitemaps)) {
    if (s.initial) continue;
    if (!s.changed) continue;
    const parts = [];
    if (s.countDelta) parts.push(`URL 数 ${s.countDelta > 0 ? '+' : ''}${s.countDelta}`);
    if (s.lastmodChanged)
      parts.push(`最新 lastmod ${s.lastmodChanged.from ?? '(なし)'} → ${s.lastmodChanged.to}`);
    lines.push(`[${name} sitemap] ${parts.join(' / ')}`);
  }
  if (Object.values(feeds).some((f) => f.initial))
    out.push('初回実行のため、現在の RSS 一覧すべてを新規として扱っています。', '');
  out.push(...(lines.length ? bullets(lines) : ['新着なし。']), '');
  return out;
}

function sourcesSection(sources) {
  const out = ['## ④ 変化した出典 URL と影響記事', ''];
  const lines = [
    ...sources.changed.map((c) => `${c.url} — ${c.field} が変化 → 影響記事: ${c.ids.join(', ')}`),
    ...sources.broken.map(
      (c) => `${c.url} — HTTP ${c.from} → ${c.to}（リンク切れ疑い）→ 影響記事: ${c.ids.join(', ')}`,
    ),
  ];
  out.push(...(lines.length ? bullets(lines, 40) : ['変化した出典 URL なし。']), '');
  out.push(
    `検査 ${sources.checked} URL / 基準値の新規記録 ${sources.baseline} / 検証子なしで検知不能 ${sources.undetectable}`,
    '',
  );
  if (sources.manual.length > 0) {
    out.push(
      `### 要目視（JS 描画の公式ページ。取得せず、公式告知の確認時に目視）: ${sources.manual.length} 件`,
      '',
    );
    out.push(
      ...bullets(
        sources.manual.map((m) => `${m.url} → ${m.ids.join(', ')}`),
        20,
      ),
      '',
    );
  }
  return out;
}

function failuresSection(failures) {
  const out = ['## ⑤ 取得失敗', ''];
  if (failures.length === 0) return [...out, '失敗なし。', ''];
  out.push(
    ...bullets(
      failures.map((f) => `${f.signal}: ${oneLine(f.detail)}`),
      FAILURE_LIMIT,
    ),
    '',
  );
  return out;
}

function actions(changes) {
  const { official, db, community, sources } = changes;
  const list = [];
  const officialCount = (official.builds?.added.length ?? 0) + (official.steam?.added.length ?? 0);
  if (officialCount > 0) {
    list.push(
      '公式告知の新規を `content/news/` に 1 本追加し、影響する記事を列挙して数値・日付・状態を確認する（①）',
    );
  }
  if (sources.changed.length + sources.broken.length > 0) {
    list.push(
      '変化した出典 URL ごとに、影響記事の該当箇所だけ差分確認する。リンク切れは代替出典へ差し替える（④）',
    );
  }
  if (db.versionChanged || Object.keys(db.newUrls).length > 0) {
    list.push(
      'DB バージョン更新・新規 URL から新トピック候補を選び、`research/RESEARCH-RULES.md` に従って調査・新規記事化する（②）',
    );
  }
  const feedAdded = Object.values(community.feeds).reduce((n, f) => n + f.added.length, 0);
  if (feedAdded > 0 || Object.values(community.sitemaps).some((s) => s.changed)) {
    list.push(
      '攻略サイトの新着は題名から既存記事との差分・新トピックを判断する。本文の全面確認はしない（③）',
    );
  }
  if (sources.manual.length > 0 && officialCount > 0) {
    list.push('要目視の公式ページは、公式告知の内容に関係する記事だけ確認する（④）');
  }
  return list.length ? list.map((a, i) => `${i + 1}. ${a}`) : ['なし（更新不要）。'];
}

export function renderReport(changes, { date, firstRun = false, stateCommitted = false } = {}) {
  const c = changes.counts;
  const head = [
    `# ソース更新レポート ${date}`,
    '',
    firstRun ? '> 初回実行（`state.json` なし）。' : '',
    `変化あり: ${changes.hasChanges ? 'はい' : 'いいえ'} — ① 公式 ${c.official} / ② DB ${c.db} / ③ 攻略 ${c.community} / ④ 出典 ${c.sources}（要目視 ${c.manual}）/ ⑤ 失敗 ${c.failures}`,
    '',
  ].filter((l, i) => l !== '' || i > 0);
  return [
    ...head,
    ...officialSection(changes.official),
    ...dbSection(changes.db),
    ...communitySection(changes.community),
    ...sourcesSection(changes.sources),
    ...failuresSection(changes.failures),
    '## 推奨アクション',
    '',
    ...actions(changes),
    '',
    stateCommitted
      ? '`state.json` を更新しました（このレポートの内容は処理済みとして扱われます）。'
      : '`state.json` は更新していません。処理後、PR を取り込んでから `npm run watch -- --commit-state` を実行します。',
    '',
  ].join('\n');
}
