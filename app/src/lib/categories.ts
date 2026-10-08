/** content/ のカテゴリー定義（content/SCHEMA.md と同期）。配列順 = 閲覧順（サイドバー・ホーム・索引） */
export const CATEGORY_IDS = [
  'guide',
  'basics',
  'leveling',
  'systems',
  'dungeons',
  'economy',
  'classes',
  'pvp',
  'tips',
  'faq',
  'news',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface CategoryInfo {
  readonly id: CategoryId;
  readonly label: string;
  readonly description: string;
  /** ホームに出す代表記事の ID（編集者指定、最大 3 本）。未指定なら先頭 3 本 */
  readonly lead?: readonly string[];
}

export const CATEGORIES: readonly CategoryInfo[] = [
  {
    id: 'guide',
    label: '初心者ガイド',
    description: '最初の 1 週間・Lv45 まで・日課',
    lead: ['guide-day-1', 'guide-week-1', 'guide-daily-routine'],
  },
  {
    id: 'basics',
    label: '基本',
    description: '操作・用語・アカウント・キャラクター',
    lead: ['game-overview', 'glossary', 'controls-and-keybinds'],
  },
  {
    id: 'leveling',
    label: 'レベリング',
    description: 'Lv1〜45・覚醒・IL 上げ',
    lead: ['leveling-1-to-45-overview', 'what-to-do-at-45', 'first-week-progression-plan'],
  },
  {
    id: 'systems',
    label: 'システム',
    description: 'スキル・スティグマ・強化・製作',
    lead: ['enhancement', 'daevanion-boards', 'potential'],
  },
  {
    id: 'dungeons',
    label: 'ダンジョン',
    description: '遠征・超越・悪夢・レイド・フィールドボス',
    lead: ['dungeons-overview', 'expeditions-and-odyle', 'nightmare'],
  },
  {
    id: 'economy',
    label: '経済',
    description: 'ギーナ・取引所・メンバーシップ',
    lead: ['currencies-overview', 'kina-farming', 'market-and-exchange'],
  },
  {
    id: 'classes',
    label: 'クラス',
    description: '8 クラスの個別記事',
    lead: ['classes-overview', 'class-tier-and-recommendation', 'class-roles'],
  },
  {
    id: 'pvp',
    label: 'PvP',
    description: 'アビス・要塞戦・アリーナ',
    lead: ['pvp-overview', 'abyss-overview', 'arena-1v1-5v5'],
  },
  {
    id: 'tips',
    label: '小技',
    description: '時短・設定・落とし穴',
    lead: ['beginner-mistakes', 'day-one-checklist', 'irreversible-choices'],
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'よくある質問',
    lead: ['faq-account-and-platform', 'faq-combat', 'faq-troubleshooting'],
  },
  {
    id: 'news',
    label: 'ニュース',
    description: '公式告知・既知の問題・韓国版との差',
    lead: ['global-launch-timeline', 'known-issues', 'global-vs-korea'],
  },
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

/** ホームの「日課・週課」に並べる記事 ID（編集者が選ぶ固定 6 本） */
export const DAILY_LINKS: readonly string[] = [
  'daily-and-weekly-checklist',
  'reset-times',
  'duty-quests',
  'shugo-festa',
  'dimensional-invasion',
  'daily-dungeon',
];

/** ホームの「はじめての人へ」とパレットの空状態に並べる記事 ID（編集者が選ぶ固定 6 本） */
export const FEATURED_LINKS: readonly string[] = [
  'guide-day-1',
  'game-overview',
  'class-tier-and-recommendation',
  'leveling-1-to-45-overview',
  'irreversible-choices',
  'beginner-mistakes',
];

/** シーズン終了日時（content/news/season-1-end-notice.md の日次リセット 16:00 JST） */
export const SEASON_END = {
  label: 'シーズン1',
  articleId: 'season-1-end-notice',
  at: '2026-12-16T16:00:00+09:00',
} as const;
