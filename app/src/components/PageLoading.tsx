import { SKELETON_DELAY_MS, useDelayed } from '../lib/use-delayed';

const BAR = 'skeleton-bar rounded bg-muted';

/**
 * 読み込み中のスケルトン（見出し 1 本＋行 3 本）。250ms 以上かかったときだけ表示し、
 * 1.2s で opacity .5⇄1 を繰り返す（reduced motion では静止）
 */
export function PageLoading({ bare = false }: { readonly bare?: boolean }) {
  const show = useDelayed(SKELETON_DELAY_MS);
  return (
    <div className={bare ? '' : 'mx-auto max-w-3xl px-4 py-16'} role="status" aria-live="polite">
      {show && (
        <>
          <span className="sr-only">読み込み中</span>
          <div className="space-y-3" aria-hidden="true" data-skeleton="">
            <div className={`${BAR} h-7 w-2/3`} />
            <div className={`${BAR} h-4 w-full`} />
            <div className={`${BAR} h-4 w-11/12`} />
            <div className={`${BAR} h-4 w-5/6`} />
          </div>
        </>
      )}
    </div>
  );
}
