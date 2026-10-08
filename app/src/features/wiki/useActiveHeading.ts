import { useEffect, useState } from 'react';

/** ビューポート上端からこの割合までに入った最後の見出しを「現在」とする */
export const ACTIVE_LINE_RATIO = 0.3;

export interface HeadingPosition {
  readonly id: string;
  /** ビューポート上端からの距離（getBoundingClientRect().top） */
  readonly top: number;
}

/**
 * 文書順の見出し位置から現在の見出しを選ぶ。
 * 上部 30% の線より上にある最後の見出し。ページ末尾まで来たら最後の見出し。
 */
export function pickActiveHeading(
  positions: readonly HeadingPosition[],
  viewportHeight: number,
  atBottom = false,
): string | null {
  if (atBottom && positions.length > 0) return positions[positions.length - 1]?.id ?? null;
  const line = viewportHeight * ACTIVE_LINE_RATIO;
  let active: string | null = null;
  for (const { id, top } of positions) {
    if (top > line) break;
    active = id;
  }
  return active;
}

function measure(ids: readonly string[]): string | null {
  const positions = ids.flatMap((id) => {
    const el = document.getElementById(id);
    return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
  });
  const scrolled = window.scrollY > 0;
  const atBottom =
    scrolled && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  return pickActiveHeading(positions, window.innerHeight, atBottom);
}

/** スクロール位置に応じて現在の見出し ID を返す（目次のハイライト用。rAF で間引く） */
export function useActiveHeading(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return undefined;
    let frame = 0;
    const update = (): void => {
      frame = 0;
      setActive(measure(ids));
    };
    const schedule = (): void => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ids]);

  // 記事が切り替わった直後は前の記事の ID を返さない
  return active !== null && ids.includes(active) ? active : null;
}
