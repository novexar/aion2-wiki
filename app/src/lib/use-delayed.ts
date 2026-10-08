import { useEffect, useState } from 'react';

/** 読み込みが速いときに一瞬だけ出るのを避けるため、スケルトンはこの時間を過ぎてから出す */
export const SKELETON_DELAY_MS = 250;

/** マウントから delayMs 経過したら true になる */
export function useDelayed(delayMs: number): boolean {
  const [elapsed, setElapsed] = useState(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) return undefined;
    const timer = window.setTimeout(() => setElapsed(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);
  return elapsed;
}
