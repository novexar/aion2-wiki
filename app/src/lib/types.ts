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

/** ニュース記事の開催期間（YYYY-MM-DD。片方だけでもよい）。ホームの「今週の予定」に使う */
export interface ArticleEvent {
  readonly starts?: string;
  readonly ends?: string;
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
  /** git の最終コミット日時（ISO 8601）。並び替えに使う */
  readonly updatedAt?: string;
  readonly aliases: readonly string[];
  readonly reading?: string;
  /** カテゴリ内の閲覧順（小さい順） */
  readonly order: number;
  readonly event?: ArticleEvent;
}

/** 記事ページ用のフルデータ */
export interface Article extends ArticleMeta {
  readonly region: 'global';
  readonly related: readonly string[];
  readonly sources: readonly Source[];
  readonly html: string;
  readonly headings: readonly Heading[];
}

/** 初期バンドルに含めるナビ用の最小メタデータ（summary・tags・aliases は索引ページで遅延取得） */
export type NavArticle = Pick<
  ArticleMeta,
  'id' | 'title' | 'category' | 'confidence' | 'updated' | 'updatedAt' | 'order' | 'event'
>;

export interface NavCategory {
  readonly id: CategoryId;
  readonly label: string;
  readonly description: string;
  /** 閲覧順（order 昇順 → 読み） */
  readonly articles: readonly NavArticle[];
}

export interface NavData {
  readonly generatedAt: string;
  readonly categories: readonly NavCategory[];
  /** updated 降順 */
  readonly articles: readonly NavArticle[];
}

/** nav.json の形式。カテゴリは記事 ID の配列だけを持ち、data.ts で解決する */
export interface NavJson {
  readonly generatedAt: string;
  readonly categories: readonly { readonly id: CategoryId; readonly articles: readonly string[] }[];
  /** updated 降順 */
  readonly articles: readonly NavArticle[];
}

/** chunks.json に入れるチャンクの位置情報（本文は chunk-text/<articleId>.json から遅延取得） */
export interface ChunkRef {
  readonly id: string;
  readonly articleId: string;
  /** 見出しのパス（例: "報酬 > 週間上限"）。冒頭部分は空文字 */
  readonly heading: string;
  /** 見出しのアンカー ID（冒頭部分は空文字） */
  readonly anchor: string;
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
  readonly chunks: readonly ChunkRef[];
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
