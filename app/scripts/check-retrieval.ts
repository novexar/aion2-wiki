/**
 * チャット検索の回帰確認。代表質問ごとに「参照記事（チャンク）」を表示する。
 * 使い方: npm run content && npx tsx scripts/check-retrieval.ts
 */
import MiniSearch from 'minisearch';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { selectContext } from '../src/lib/rag';
import { rankChunks, selectArticleIds, type ArticleChunks } from '../src/lib/retrieval';
import { pageIndexOptions } from '../src/lib/search-options';
import type { ArticleChunk, ArticleMeta } from '../src/lib/types';

const QUESTIONS = [
  'オードエネルギーの回復量は？',
  'ルーンの強化のやり方',
  '会員価格はいくら？',
  'リセット時刻はいつ？',
  '★2 の入場 IL はいくつ？',
  '毎日やること',
  'ギーナの稼ぎ方',
  '報酬キューブを開けるのに必要なもの',
  'おすすめのクラスは？',
  '週間コンテンツの上限',
];

const generated = path.resolve(import.meta.dirname, '../src/generated');
const read = (file: string): string => readFileSync(path.join(generated, file), 'utf8');

const index = MiniSearch.loadJSON(read('search-index.json'), pageIndexOptions);
const meta = new Map((JSON.parse(read('meta.json')) as ArticleMeta[]).map((m) => [m.id, m]));

function loadArticle(id: string): ArticleChunks | null {
  const m = meta.get(id);
  if (!m) return null;
  const chunks = JSON.parse(read(`chunk-text/${id}.json`)) as ArticleChunk[];
  return { articleId: id, title: m.title, category: m.category, chunks };
}

async function main(): Promise<void> {
  for (const question of QUESTIONS) {
    const texts = new Map(
      Object.entries(JSON.parse(read('search-text.json')) as Record<string, string>),
    );
    const ids = await selectArticleIds(index, question, async () => texts);
    const articles = ids.flatMap((id) => loadArticle(id) ?? []);
    const picked = selectContext(rankChunks(question, articles));
    const chars = picked.reduce((n, c) => n + c.text.length, 0);
    console.log(`\nQ: ${question}  (候補記事: ${ids.join(', ') || '-'})`);
    for (const c of picked) {
      console.log(`  - ${c.title}${c.heading ? ` > ${c.heading}` : ''}  [${c.text.length}字]`);
    }
    console.log(`  合計 ${chars} 字 / ${picked.length} 件`);
  }
}
void main();
