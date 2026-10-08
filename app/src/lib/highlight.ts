import { tokenizeQuery } from './tokenizer';

export interface Segment {
  readonly text: string;
  readonly hit: boolean;
}

/** 元テキストの各文字に対する一致フラグを計算する（NFKC・小文字化して比較） */
function computeMarks(chars: readonly string[], query: string): boolean[] {
  const marks = chars.map(() => false);
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return marks;

  let normalized = '';
  const owner: number[] = [];
  chars.forEach((ch, i) => {
    const n = ch.normalize('NFKC').toLowerCase();
    normalized += n;
    for (let k = 0; k < n.length; k += 1) owner.push(i);
  });

  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const at = normalized.indexOf(token, from);
      if (at === -1) break;
      for (let k = at; k < at + token.length; k += 1) {
        const idx = owner[k];
        if (idx !== undefined) marks[idx] = true;
      }
      from = at + 1;
    }
  }
  return marks;
}

/** テキストを「一致部分 / それ以外」のセグメントに分ける */
export function highlight(text: string, query: string): Segment[] {
  const chars = Array.from(text);
  if (chars.length === 0) return [];
  const marks = computeMarks(chars, query);
  const segments: Segment[] = [];
  let current = '';
  let currentHit = marks[0] ?? false;
  chars.forEach((ch, i) => {
    const hit = marks[i] ?? false;
    if (hit !== currentHit && current) {
      segments.push({ text: current, hit: currentHit });
      current = '';
    }
    currentHit = hit;
    current += ch;
  });
  if (current) segments.push({ text: current, hit: currentHit });
  return segments;
}

/** 最初の一致箇所を中心に maxLength 文字前後を切り出す */
export function makeSnippet(text: string, query: string, maxLength = 120): Segment[] {
  const chars = Array.from(text);
  if (chars.length <= maxLength) return highlight(text, query);
  const marks = computeMarks(chars, query);
  const first = marks.indexOf(true);
  const start =
    first <= 0
      ? 0
      : Math.max(0, Math.min(first - Math.floor(maxLength / 3), chars.length - maxLength));
  const end = Math.min(chars.length, start + maxLength);
  const body = chars.slice(start, end).join('');
  const segments = highlight(body, query);
  return [
    ...(start > 0 ? [{ text: '…', hit: false }] : []),
    ...segments,
    ...(end < chars.length ? [{ text: '…', hit: false }] : []),
  ];
}

/** 最初の一致箇所の前後 radius 文字を切り出す。一致がなければ null */
export function makeContextSnippet(text: string, query: string, radius = 80): Segment[] | null {
  const chars = Array.from(text);
  const marks = computeMarks(chars, query);
  const first = marks.indexOf(true);
  if (first < 0) return null;
  let last = first;
  while (marks[last + 1]) last += 1;
  const start = Math.max(0, first - radius);
  const end = Math.min(chars.length, last + 1 + radius);
  const flat = chars
    .slice(start, end)
    .join('')
    .replace(/\s*[|｜]\s*/g, ' / ')
    .replace(/\s+/g, ' ');
  return [
    ...(start > 0 ? [{ text: '…', hit: false }] : []),
    ...highlight(flat, query),
    ...(end < chars.length ? [{ text: '…', hit: false }] : []),
  ];
}
