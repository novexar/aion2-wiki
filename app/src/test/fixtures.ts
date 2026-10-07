import MiniSearch from 'minisearch';
import { CATEGORIES } from '../lib/categories';
import { pageIndexOptions } from '../lib/search-options';
import type { ArticleMeta, NavData } from '../lib/types';

export const META: ArticleMeta[] = [
  {
    id: 'odyle-energy',
    title: 'オードエネルギー',
    category: 'dungeons',
    tags: ['遠征', '日課'],
    summary: 'ダンジョン報酬の受取に使う資源。',
    confidence: 'verified',
    updated: '2026-10-08',
    aliases: ['Odyle Energy'],
  },
  {
    id: 'kinah',
    title: 'ギーナ',
    category: 'economy',
    tags: ['金策', '取引所'],
    summary: 'ゲーム内通貨。取引所で使う。',
    confidence: 'community',
    updated: '2026-10-07',
    aliases: ['Kinah'],
  },
  {
    id: 'expedition',
    title: '遠征',
    category: 'dungeons',
    tags: ['遠征', 'ダンジョン'],
    summary: '少人数ダンジョン。',
    confidence: 'official',
    updated: '2026-10-01',
    aliases: [],
    reading: 'えんせい',
  },
];

export const NAV: NavData = {
  generatedAt: '2026-10-08T00:00:00.000Z',
  categories: CATEGORIES.map((c) => ({ ...c, articles: META.filter((m) => m.category === c.id) })),
  articles: META,
};

export function buildPageIndex(): MiniSearch {
  const index = new MiniSearch(pageIndexOptions);
  index.addAll(
    META.map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      confidence: m.confidence,
      summary: m.summary,
      aliases: m.aliases.join(' / '),
      tags: m.tags.join(' '),
      headings: '',
      body: m.summary,
    })),
  );
  return index;
}

/** features/wiki/data のモック実装 */
export function mockWikiData() {
  return {
    nav: NAV,
    articleById: new Map(META.map((m) => [m.id, m])),
    articleByTitle: new Map(META.map((m) => [m.title, m])),
    loadArticle: async () => null,
    dailyArticles: () => META.slice(0, 1),
  };
}
