import { readJson, writeJson } from './storage';

const KEY = 'aion2wiki:recent-articles';
export const RECENT_LIMIT = 5;

const isIdList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

/** 直近に開いた記事 ID（新しい順、最大 5 件） */
export function readRecentIds(): readonly string[] {
  return (readJson('local', KEY, isIdList) ?? []).slice(0, RECENT_LIMIT);
}

export function pushRecentId(id: string): void {
  const next = [id, ...readRecentIds().filter((x) => x !== id)].slice(0, RECENT_LIMIT);
  writeJson('local', KEY, next);
}
