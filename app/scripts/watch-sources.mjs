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

const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD（ローカル日付）

async function main() {
  const commitState = process.argv.includes('--commit-state');
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

  const report = renderReport(changes, {
    date,
    firstRun: prevState === null,
    stateCommitted: commitState,
  });
  await fs.mkdir(watchDir, { recursive: true });
  const c = changes.counts;
  if (commitState) {
    await fs.writeFile(statePath, `${JSON.stringify(nextState, null, 2)}\n`);
    console.log(
      `state.json を更新しました。直前の内容: 公式 ${c.official} / DB ${c.db} / 攻略 ${c.community} / 出典 ${c.sources}`,
    );
  } else {
    const reportPath = path.join(watchDir, `report-${date}.md`);
    await fs.writeFile(reportPath, report);
    console.log(`レポート: ${path.relative(repoRoot, reportPath)}`);
    console.log(
      changes.hasChanges
        ? `変化あり — 公式 ${c.official} / DB ${c.db} / 攻略 ${c.community} / 出典 ${c.sources}（要目視 ${c.manual}、失敗 ${c.failures}）`
        : `変化なし（要目視 ${c.manual}、失敗 ${c.failures}）`,
    );
  }
  process.exitCode = changes.hasChanges && !commitState ? 1 : 0;
}

main().catch((e) => {
  // 想定外の失敗でも検知結果を壊さないよう、状態は触らず終了コード 2 で知らせる。
  console.error(`watch-sources 失敗: ${e?.stack ?? e}`);
  process.exitCode = 2;
});
