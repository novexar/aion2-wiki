// 更新検知スクリプト（LLM なし）。使い方: npm run watch [-- --commit-state]
// 本文は取得しない。前回状態 research/watch/state.json と比較し、
// research/watch/report-YYYY-MM-DD.md を出力する。変化ありなら終了コード 1、なしなら 0。
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { computeChanges } from './watch/compute.mjs';
import { buildReverseIndex, isManualCheckUrl } from './watch/diff.mjs';
import { createClient, fetchHeads, fetchSignals } from './watch/fetchers.mjs';
import { createCurlFetch, isCurlAvailable } from './watch/curl-transport.mjs';
import { renderReport } from './watch/report.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const contentDir = path.join(repoRoot, 'content');
const watchDir = path.join(repoRoot, 'research', 'watch');
const statePath = path.join(watchDir, 'state.json');
const lastRunPath = path.join(watchDir, 'last-run.json');

async function listMarkdown(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((e) => !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map((e) =>
        e.isDirectory() ? listMarkdown(path.join(dir, e.name)) : [path.join(dir, e.name)],
      ),
  );
  return files.flat().filter((f) => f.endsWith('.md') && path.basename(f) !== 'SCHEMA.md');
}

async function loadArticles() {
  const files = await listMarkdown(contentDir);
  const articles = [];
  for (const file of files) {
    try {
      const { data } = matter(await fs.readFile(file, 'utf8'));
      if (data.id)
        articles.push({
          id: String(data.id),
          sources: Array.isArray(data.sources) ? data.sources : [],
        });
    } catch (e) {
      console.error(`frontmatter 読み取り失敗: ${path.relative(repoRoot, file)} (${e.message})`);
    }
  }
  return articles;
}

async function loadState() {
  try {
    return JSON.parse(await fs.readFile(statePath, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    console.error(`state.json を読めないため初回扱いにします: ${e.message}`);
    return null;
  }
}

/** キーを再帰的に並べ替えて差分を安定させる。 */
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, sortKeys(value[k])]),
    );
  }
  return value;
}

const stringifyState = (state) => `${JSON.stringify(sortKeys(state), null, 2)}\n`;

/** 直前の `npm run watch` の結果を state.json に反映する（再取得しない）。 */
async function commitLastRun() {
  let last;
  try {
    last = JSON.parse(await fs.readFile(lastRunPath, 'utf8'));
  } catch {
    console.error(
      'research/watch/last-run.json がありません。先に npm run watch を実行してください。',
    );
    return 2;
  }
  await fs.writeFile(statePath, stringifyState(last.nextState));
  console.log(`state.json を更新しました（${last.date} の検知結果）。`);
  return 0;
}

/** 主要な信号がすべて失敗したか（ネットワーク断など）。 */
function allSignalsFailed(signals) {
  const results = [
    signals.builds,
    signals.steam,
    signals.gtVersion,
    signals.gtSitemap,
    ...Object.values(signals.feeds),
    ...Object.values(signals.sitemaps),
  ];
  return results.every((r) => r?.ok === false);
}

const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD（ローカル日付）

async function main() {
  if (process.argv.includes('--commit-state')) {
    process.exitCode = await commitLastRun();
    return;
  }
  const date = today();
  const [articles, prevState] = await Promise.all([loadArticles(), loadState()]);
  // Cloudflare 配下のサイトは Node の fetch を弾くため、curl があれば curl で取得する。
  const useCurl = await isCurlAvailable();
  if (!useCurl)
    console.warn(
      'curl が見つからないため標準 fetch で取得します（一部サイトは 403 になる場合があります）',
    );
  const client = createClient(useCurl ? { fetchImpl: createCurlFetch() } : {});

  const reverse = buildReverseIndex(articles);
  const urls = [...reverse.keys()].filter((u) => !isManualCheckUrl(u));
  console.log(
    `記事 ${articles.length} 本 / 出典 URL ${reverse.size} 件（HEAD 対象 ${urls.length}）を確認します…`,
  );

  const [signals, heads] = await Promise.all([fetchSignals(client), fetchHeads(client, urls)]);
  const { changes, nextState } = computeChanges(prevState, { date, ...signals, heads }, articles);

  if (allSignalsFailed(signals)) {
    console.error(
      'すべての信号の取得に失敗しました（ネットワーク未接続？）。レポートと状態は更新しません。',
    );
    process.exitCode = 2;
    return;
  }

  const report = renderReport(changes, { date, firstRun: prevState === null });
  await fs.mkdir(watchDir, { recursive: true });
  const c = changes.counts;
  const reportPath = path.join(watchDir, `report-${date}.md`);
  await fs.writeFile(reportPath, report);
  // --commit-state が再取得せずに state.json へ反映できるよう、この回の結果を保存する。
  await fs.writeFile(lastRunPath, stringifyState({ date, nextState }));
  console.log(`レポート: ${path.relative(repoRoot, reportPath)}`);
  console.log(
    changes.hasChanges
      ? `変化あり — 公式 ${c.official} / DB ${c.db} / 攻略 ${c.community} / 出典 ${c.sources}（要目視 ${c.manual}、失敗 ${c.failures}）`
      : `変化なし（要目視 ${c.manual}、失敗 ${c.failures}）`,
  );
  process.exitCode = changes.hasChanges ? 1 : 0;
}

main().catch((e) => {
  // 想定外の失敗でも検知結果を壊さないよう、状態は触らず終了コード 2 で知らせる。
  console.error(`watch-sources 失敗: ${e?.stack ?? e}`);
  process.exitCode = 2;
});
