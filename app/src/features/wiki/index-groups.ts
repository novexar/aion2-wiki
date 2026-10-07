import { CATEGORIES } from '../../lib/categories';
import { GOJUON_ROWS, kanaGroup, latinGroup, OTHER_GROUP } from '../../lib/gojuon';
import { normalizeText } from '../../lib/tokenizer';
import type { ArticleMeta } from '../../lib/types';

export type IndexView = 'kana' | 'latin' | 'category' | 'tag';

export const INDEX_VIEWS: readonly { value: IndexView; label: string }[] = [
  { value: 'kana', label: '五十音' },
  { value: 'latin', label: 'A–Z' },
  { value: 'category', label: 'カテゴリ' },
  { value: 'tag', label: 'タグ' },
];

export function isIndexView(value: string | null): value is IndexView {
  return INDEX_VIEWS.some((v) => v.value === value);
}

export interface IndexEntry {
  readonly article: ArticleMeta;
  /** 表示名（A–Z では英語の別名を使う） */
  readonly label: string;
}

export interface IndexGroup {
  readonly key: string;
  readonly label: string;
  readonly entries: readonly IndexEntry[];
}

const sortEntries = (entries: IndexEntry[]): IndexEntry[] =>
  entries.sort((a, b) =>
    (a.article.reading ?? a.label).localeCompare(b.article.reading ?? b.label, 'ja'),
  );

/** 絞り込み語がタイトル・別名・タグ・概要のどれかに含まれるか */
export function matchesFilter(article: ArticleMeta, filter: string): boolean {
  const f = normalizeText(filter.trim());
  if (!f) return true;
  const haystack = normalizeText(
    [article.title, ...article.aliases, ...article.tags, article.summary].join(' '),
  );
  return haystack.includes(f);
}

function groupKana(articles: readonly ArticleMeta[]): IndexGroup[] {
  const order = [...GOJUON_ROWS, OTHER_GROUP] as string[];
  const map = new Map<string, IndexEntry[]>();
  for (const a of articles) {
    const key = kanaGroup(a);
    map.set(key, [...(map.get(key) ?? []), { article: a, label: a.title }]);
  }
  return order
    .filter((k) => map.has(k))
    .map((k) => ({
      key: k,
      label: k === OTHER_GROUP ? OTHER_GROUP : `${k}行`,
      entries: sortEntries(map.get(k) ?? []),
    }));
}

function groupLatin(articles: readonly ArticleMeta[]): IndexGroup[] {
  const map = new Map<string, IndexEntry[]>();
  for (const a of articles) {
    const g = latinGroup(a);
    if (!g) continue;
    map.set(g.letter, [...(map.get(g.letter) ?? []), { article: a, label: g.label }]);
  }
  return [...map.keys()].sort().map((k) => ({
    key: k,
    label: k,
    entries: (map.get(k) ?? []).sort((a, b) => a.label.localeCompare(b.label, 'en')),
  }));
}

function groupCategory(articles: readonly ArticleMeta[]): IndexGroup[] {
  return CATEGORIES.map((c) => ({
    key: c.id,
    label: c.label,
    entries: sortEntries(
      articles.filter((a) => a.category === c.id).map((a) => ({ article: a, label: a.title })),
    ),
  })).filter((g) => g.entries.length > 0);
}

function groupTag(articles: readonly ArticleMeta[], tag: string | null): IndexGroup[] {
  const map = new Map<string, IndexEntry[]>();
  for (const a of articles) {
    for (const t of a.tags) {
      if (tag && t !== tag) continue;
      map.set(t, [...(map.get(t) ?? []), { article: a, label: a.title }]);
    }
  }
  return [...map.keys()]
    .sort((a, b) => a.localeCompare(b, 'ja'))
    .map((k) => ({ key: k, label: `#${k}`, entries: sortEntries(map.get(k) ?? []) }));
}

export function groupArticles(
  articles: readonly ArticleMeta[],
  view: IndexView,
  options: { filter?: string; tag?: string | null } = {},
): IndexGroup[] {
  const filtered = articles.filter((a) => matchesFilter(a, options.filter ?? ''));
  switch (view) {
    case 'kana':
      return groupKana(filtered);
    case 'latin':
      return groupLatin(filtered);
    case 'category':
      return groupCategory(filtered);
    case 'tag':
      return groupTag(filtered, options.tag ?? null);
  }
}

/** タグと出現回数（多い順） */
export function tagCounts(articles: readonly ArticleMeta[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of articles) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja'));
}
