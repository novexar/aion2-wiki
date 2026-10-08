/** モーションの共通値（ui-direction.md 5.1、index.css の --d-* / --ease-* と同じ値） */

/** 秒単位（motion の transition.duration 用） */
export const DURATION = {
  fast: 0.12,
  base: 0.2,
  slow: 0.32,
} as const;

type Bezier = readonly [number, number, number, number];

export const EASE: { readonly std: Bezier; readonly out: Bezier; readonly in: Bezier } = {
  std: [0.4, 0, 0.2, 1],
  out: [0.2, 0.7, 0.2, 1],
  in: [0.4, 0, 1, 1],
};

/** チャットパネルのスライド（ミリ秒）。index.css の .chat-panel と同じ値 */
export const PANEL_MS = { open: 240, close: 160 } as const;

/** どのアニメーションもこれを超えない（5.5 の 3） */
export const MAX_DURATION_MS = 320;
