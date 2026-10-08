import { useEffect, useState } from 'react';
import { readString, STORAGE_KEYS, writeString } from './storage';

/** 行ごとの遅延（ms） */
export const STAGGER_STEP_MS = 24;
/** 1 行の入場（ms） */
export const STAGGER_DURATION_MS = 200;
/** 段差表示の全体（最後の行の入場終了）を 320ms 以内に収める */
export const STAGGER_TOTAL_MS = 320;

/** i 行目の animation-delay。遅延は STAGGER_TOTAL_MS − STAGGER_DURATION_MS で頭打ち */
export function staggerDelayMs(index: number): number {
  return Math.min(Math.max(0, index) * STAGGER_STEP_MS, STAGGER_TOTAL_MS - STAGGER_DURATION_MS);
}

/** セッション内でホームを初めて表示したときだけ true（戻る操作・再訪では再生しない） */
export function useHomeStagger(): boolean {
  const [play] = useState(() => readString('session', STORAGE_KEYS.homeStaggerPlayed) !== '1');
  useEffect(() => {
    writeString('session', STORAGE_KEYS.homeStaggerPlayed, '1');
  }, []);
  return play;
}
