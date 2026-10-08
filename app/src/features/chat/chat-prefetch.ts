import { preloadGemini } from '../../lib/gemini';
import { warmRetrieval } from './chunk-loader';

type IdleScheduler = (callback: () => void) => void;

/** requestIdleCallback が無い環境（Safari 等）では setTimeout で代用する */
export const scheduleIdle: IdleScheduler = (callback) => {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(callback, { timeout: 2000 });
  else setTimeout(callback, 200);
};

let scheduled = false;

/** パネルを開いた時点で SDK と検索データを先読みする（アイドル時に 1 回だけ。失敗しても送信時に再試行される） */
export function prefetchChat(
  loaders: readonly (() => Promise<unknown>)[] = [preloadGemini, warmRetrieval],
  schedule: IdleScheduler = scheduleIdle,
): void {
  if (scheduled) return;
  scheduled = true;
  schedule(() => {
    for (const load of loaders) void load().catch(() => undefined);
  });
}

/** テスト用: 先読み済みフラグを戻す */
export function resetPrefetchForTest(): void {
  scheduled = false;
}
