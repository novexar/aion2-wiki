import { useSyncExternalStore } from 'react';

/** CSS メディアクエリの一致状態を返す。matchMedia が無い環境では fallback */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window.matchMedia !== 'function') return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : fallback),
    () => fallback,
  );
}

export const WIDE_QUERY = '(min-width: 80rem)';
