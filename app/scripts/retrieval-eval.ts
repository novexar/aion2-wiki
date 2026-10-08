/**
 * チャット検索の評価。scripts/retrieval-eval.json の質問ごとに
 *  - hit@5: 候補 5 記事に正解記事が含まれる率
 *  - chunk-hit: プロンプトに入る抜粋の先頭 3,000 字に正解記事のチャンクが入る率
 * を出す。使い方: npm run content && npm run eval:retrieval
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { selectContext } from '../src/lib/rag';
import { rankChunks, selectArticleIds, type ArticleChunks } from '../src/lib/retrieval';
import { pageIndexOptions } from '../src/lib/search-options';
import type { ArticleChunk, ArticleMeta } from '../src/lib/types';

interface EvalCase {
  readonly q: string;
  readonly expect: readonly string[];
}

const CHUNK_WINDOW = 3000;
const dir = import.meta.dirname;
const generated = path.resolve(dir, '../src/generated');
const read = (file: string): string => readFileSync(path.join(generated, file), 'utf8');

const cases = JSON.parse(readFileSync(path.join(dir, 'retrieval-eval.json'), 'utf8')) as EvalCase[];
const index = MiniSearch.loadJSON(read('search-index.json'), pageIndexOptions);
const meta = new Map((JSON.parse(read('meta.json')) as ArticleMeta[]).map((m) => [m.id, m]));
const texts = new Map(
  Object.entries(JSON.parse(read('search-text.json')) as Record<string, string>),
);

function loadArticle(id: string): ArticleChunks | null {
  const m = meta.get(id);
  if (!m) return null;
  const chunks = JSON.parse(read(`chunk-text/${id}.json`)) as ArticleChunk[];
  return { articleId: id, title: m.title, category: m.category, chunks };
}

async function evaluate(c: EvalCase): Promise<{ hit: boolean; chunkHit: boolean; ids: string[] }> {
  const ids = await selectArticleIds(index, c.q, async () => texts);
  const picked = selectContext(rankChunks(c.q, ids.flatMap((id) => loadArticle(id) ?? [])));
  const hit = ids.some((id) => c.expect.includes(id));
  let offset = 0;
  let chunkHit = false;
  for (const chunk of picked) {
    if (offset < CHUNK_WINDOW && c.expect.includes(chunk.articleId)) chunkHit = true;
    offset += chunk.text.length;
  }
  return { hit, chunkHit, ids };
}

async function main(): Promise<void> {
  let hits = 0;
  let chunkHits = 0;
  for (const c of cases) {
    const r = await evaluate(c);
    hits += r.hit ? 1 : 0;
    chunkHits += r.chunkHit ? 1 : 0;
    const mark = `${r.hit ? 'H' : '-'}${r.chunkHit ? 'C' : '-'}`;
    const miss = r.hit ? '' : `  (期待: ${c.expect.join('|')})`;
    console.log(`${mark} ${c.q}  -> ${r.ids.join(', ')}${miss}`);
  }
  const pct = (n: number): string => `${n}/${cases.length} (${((n / cases.length) * 100).toFixed(1)}%)`;
  console.log(`\nhit@5: ${pct(hits)}\nchunk-hit: ${pct(chunkHits)}`);
}
void main();
