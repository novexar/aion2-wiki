/** ビルドスクリプトとアプリで共有する生成データの型 */
import type { CategoryId } from './categories';

export type Confidence = 'official' | 'verified' | 'community';
export type SourceKind = 'official' | 'database' | 'guide' | 'community';

export interface Source {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly date: string;
  readonly kind: SourceKind;
}

export interface Heading {
  readonly id: string;
  readonly text: string;
  readonly depth: 2 | 3;
}

/** 一覧・検索・ナビに使う軽量メタデータ */
export interface ArticleMeta {
  readonly id: string;
  readonly title: string;
  readonly category: CategoryId;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly confidence: Confidence;
  readonly updated: string;
  readonly aliases: readonly string[];
  readonly reading?: string;
}

/** 記事ページ用のフルデータ */
export interface Article extends ArticleMeta {
  readonly region: 'global';
  readonly related: readonly string[];
  readonly sources: readonly Source[];
  readonly html: string;
  readonly headings: readonly Heading[];
}

export interface NavCategory {
  readonly id: CategoryId;
  readonly label: string;
  readonly description: string;
  readonly articles: readonly ArticleMeta[];
}

export interface NavData {
  readonly generatedAt: string;
  readonly categories: readonly NavCategory[];
  /** updated 降順 */
  readonly articles: readonly ArticleMeta[];
}

export interface Chunk {
  readonly id: string;
  readonly articleId: string;
  readonly category: CategoryId;
  readonly title: string;
  /** 見出しのパス（例: "報酬 > 週間上限"）。冒頭部分は空文字 */
  readonly heading: string;
  /** 見出しのアンカー ID（冒頭部分は空文字） */
  readonly anchor: string;
  readonly text: string;
}

export interface ChunksData {
  readonly chunks: readonly Chunk[];
  /** MiniSearch.toJSON() の結果（MiniSearch.loadJS で復元） */
  readonly index: unknown;
}

/** 記事検索インデックスの格納フィールド */
export interface PageSearchStored {
  readonly id: string;
  readonly title: string;
  readonly category: CategoryId;
  readonly summary: string;
  readonly confidence: Confidence;
  readonly aliases: string;
}
