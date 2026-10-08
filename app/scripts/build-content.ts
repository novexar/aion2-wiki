/**
 * content/ → src/generated/{pages.json, pages/*.json, search-index.json, chunks.json, nav.json}
 *
 * 使い方:
 *   npx tsx scripts/build-content.ts            # 本番（content/_* を除外）
 *   INCLUDE_SAMPLES=1 npx tsx scripts/build-content.ts   # content/_sample を含める
 * 環境変数:
 *   BASE_PATH      サイトのベースパス（既定 '/aion2-wiki/'、vite.config.ts と同じ）
 *   CONTENT_DIR    content ディレクトリ（既定 '../content'）
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContent } from './content/build';
import { ContentBuildError } from './content/errors';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.resolve(appDir, process.env.CONTENT_DIR ?? '../content');
const outDir = path.resolve(appDir, 'src/generated');
const includeSamples =
  process.env.INCLUDE_SAMPLES === '1' || process.env.INCLUDE_SAMPLES === 'true';

async function main(): Promise<void> {
  const started = Date.now();
  const result = await buildContent({
    contentDir,
    outDir,
    includeSamples,
    base: process.env.BASE_PATH ?? '/aion2-wiki/',
  });
  for (const warning of result.warnings) console.warn(`[content] 警告: ${warning}`);
  console.log(
    `[content] ${result.articles} 記事 / ${result.chunks} チャンクを出力しました` +
      `（サンプル${includeSamples ? 'を含む' : 'を除外'}、${Date.now() - started}ms）`,
  );
}

main().catch((error: unknown) => {
  if (error instanceof ContentBuildError) {
    console.error(`[content] ${error.message}`);
  } else {
    console.error('[content] 予期しないエラー:', error);
  }
  process.exit(1);
});
