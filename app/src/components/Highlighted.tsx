import type { Segment } from '../lib/highlight';

interface HighlightedProps {
  readonly segments: readonly Segment[];
}

/** highlight() の結果を <mark> 付きで描画する */
export function Highlighted({ segments }: HighlightedProps) {
  return (
    <>
      {segments.map((s, i) =>
        s.hit ? (
          <mark
            key={i}
            className="rounded-[2px] bg-accent-soft text-inherit underline decoration-accent decoration-2 underline-offset-2"
          >
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
