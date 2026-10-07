/**
 * チャット回答用の最小 Markdown パーサー。
 * HTML を生成せず構造データを返すので、React 側で安全に描画できる（XSS 対策）。
 */
export type Inline =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'strong'; readonly value: string }
  | { readonly type: 'code'; readonly value: string }
  | { readonly type: 'cite'; readonly value: string };

export type Block =
  | { readonly type: 'p'; readonly inlines: Inline[] }
  | { readonly type: 'ul'; readonly items: Inline[][] }
  | { readonly type: 'ol'; readonly items: Inline[][] };

const INLINE_RE = /\*\*([^*\n]+)\*\*|`([^`\n]+)`|\[([^[\]\n]{1,80})\](?!\()/g;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of src.matchAll(INLINE_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ type: 'text', value: src.slice(last, at) });
    if (m[1] !== undefined) out.push({ type: 'strong', value: m[1] });
    else if (m[2] !== undefined) out.push({ type: 'code', value: m[2] });
    else if (m[3] !== undefined) out.push({ type: 'cite', value: m[3].trim() });
    last = at + m[0].length;
  }
  if (last < src.length) out.push({ type: 'text', value: src.slice(last) });
  return out;
}

const UL_RE = /^\s*[-*・]\s+(.*)$/;
const OL_RE = /^\s*\d+[.)．]\s+(.*)$/;
const HEADING_RE = /^#{1,6}\s+/;

export function parseMiniMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: 'ul' | 'ol'; items: Inline[][] } | null = null;

  const flushParagraph = (): void => {
    if (paragraph.length > 0)
      blocks.push({ type: 'p', inlines: parseInline(paragraph.join('\n')) });
    paragraph = [];
  };
  const flushList = (): void => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const rawLine of src.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.replace(HEADING_RE, '');
    const ul = UL_RE.exec(line);
    const ol = ul ? null : OL_RE.exec(line);
    const listType = ul ? 'ul' : ol ? 'ol' : null;
    if (listType) {
      flushParagraph();
      if (!list || list.type !== listType) {
        flushList();
        list = { type: listType, items: [] };
      }
      list.items.push(parseInline((ul ?? ol)?.[1] ?? ''));
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}
