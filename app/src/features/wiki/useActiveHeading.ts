import { useEffect, useState } from 'react';

/** スクロール位置に応じて現在の見出し ID を返す（目次のハイライト用） */
export function useActiveHeading(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return undefined;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = ids.find((id) => visible.has(id));
        if (first) {
          setActive(first);
          return;
        }
        // 見出しが画面上にない時は、画面より上にある最後の見出し
        const above = elements.filter((el) => el.getBoundingClientRect().top < 80);
        const last = above[above.length - 1];
        if (last) setActive(last.id);
      },
      { rootMargin: '-56px 0px -65% 0px', threshold: [0, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
