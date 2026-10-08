/**
 * ルート遷移のフェードをどこで掛けるか（ui-direction.md 5.2 #1、5.5 の 2）
 * - home: 遷移フェードを省き、カテゴリ一覧の段差表示だけにする
 * - shell: /wiki/* は WikiShell の本文カラムだけをフェードし、サイドバーは動かさない
 * - page: それ以外はページ全体をフェードする
 */
export type RouteFadeScope = 'home' | 'shell' | 'page';

export function routeFadeScope(pathname: string): RouteFadeScope {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/wiki/')) return 'shell';
  return 'page';
}

let landed = false;

/** 最初の表示（直リンク・再読込）ではフェードしない。2 回目以降の画面だけ true */
export function consumeRouteEnter(): boolean {
  const animate = landed;
  landed = true;
  return animate;
}

/** テスト用 */
export function resetRouteEnter(): void {
  landed = false;
}
