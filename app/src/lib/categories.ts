/** content/ のカテゴリー定義（content/SCHEMA.md と同期） */
export const CATEGORY_IDS = [
  'guide',
  'basics',
  'leveling',
  'systems',
  'dungeons',
  'pvp',
  'economy',
  'classes',
  'news',
  'tips',
  'faq',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface CategoryInfo {
  readonly id: CategoryId;
  readonly label: string;
  readonly description: string;
}

export const CATEGORIES: readonly CategoryInfo[] = [
  { id: 'guide', label: '初心者ガイド', description: '始めたばかりの人向けのロードマップ' },
  { id: 'basics', label: '基本', description: 'ゲーム概要・種族・クラス一覧・操作・用語' },
  { id: 'leveling', label: 'レベリング', description: 'Lv1→45、覚醒、45到達後の流れ' },
  { id: 'systems', label: 'システム', description: 'スキル・スティグマ・強化・製作など' },
  { id: 'dungeons', label: 'ダンジョン', description: '遠征・超越・悪夢・レイド・フィールドボス' },
  { id: 'pvp', label: 'PvP', description: 'アビス・要塞戦・PvPの基礎' },
  { id: 'economy', label: '経済', description: 'ギーナ・取引所・メンバーシップ・金策' },
  { id: 'classes', label: 'クラス', description: '8クラスの個別ページ' },
  { id: 'news', label: 'ニュース', description: '公式告知・既知の問題・韓国版との差' },
  { id: 'tips', label: '小技', description: '時短・UX・初心者の落とし穴' },
  { id: 'faq', label: 'FAQ', description: 'よくある質問' },
];

const CATEGORY_MAP: ReadonlyMap<string, CategoryInfo> = new Map(CATEGORIES.map((c) => [c.id, c]));

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_MAP.has(value);
}

export function getCategory(id: string): CategoryInfo | undefined {
  return CATEGORY_MAP.get(id);
}

export function categoryLabel(id: string): string {
  return CATEGORY_MAP.get(id)?.label ?? id;
}
