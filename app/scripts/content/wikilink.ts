import type { Link, PhrasingContent, Root, Text } from 'mdast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

export const WIKILINK_RE = /\[\[([a-z0-9]+(?:-[a-z0-9]+)*)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
export const SOURCE_REF_RE = /\[(S\d{2,3})\]/g;

export interface WikilinkTarget {
  readonly href: string;
  readonly title: string;
}

export interface WikilinkOptions {
  /** slug → リンク先。未知の slug なら undefined */
  readonly resolve: (slug: string) => WikilinkTarget | undefined;
  /** 未解決リンクの通知 */
  readonly onMissing?: (slug: string) => void;
  /** `#hash` 付きリンクの通知（見出しとの照合は全記事の描画後に行う） */
  readonly onHash?: (slug: string, hash: string) => void;
}

function wikilinkNode(
  slug: string,
  hash: string | undefined,
  label: string | undefined,
  options: WikilinkOptions,
): PhrasingContent {
  const target = options.resolve(slug);
  if (!target) {
    options.onMissing?.(slug);
    return {
      type: 'emphasis',
      data: {
        hName: 'span',
        hProperties: {
          className: ['wikilink', 'wikilink-missing'],
          title: '未作成の記事',
          dataSlug: slug,
        },
      },
      children: [{ type: 'text', value: label ?? slug }],
    };
  }
  if (hash) options.onHash?.(slug, hash.trim());
  const link: Link = {
    type: 'link',
    url: hash ? `${target.href}#${encodeURIComponent(hash.trim())}` : target.href,
    data: { hProperties: { className: ['wikilink'], dataSlug: slug } },
    children: [{ type: 'text', value: label ?? target.title }],
  };
  return link;
}

/** テキストを正規表現で分割し、一致部分をノードに置換する。一致がなければ null */
export function splitText(
  value: string,
  re: RegExp,
  build: (match: RegExpExecArray) => PhrasingContent,
): PhrasingContent[] | null {
  const pattern = new RegExp(re.source, 'g');
  const out: PhrasingContent[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    if (match.index > last) out.push({ type: 'text', value: value.slice(last, match.index) });
    out.push(build(match));
    last = match.index + match[0].length;
  }
  if (out.length === 0) return null;
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
  return out;
}

function replaceTextNodes(
  tree: Root,
  re: RegExp,
  build: (match: RegExpExecArray) => PhrasingContent,
): void {
  visit(tree, 'text', (node: Text, index, parent) => {
    if (!parent || index === undefined) return;
    if (parent.type === 'link' || parent.type === 'linkReference') return;
    const replaced = splitText(node.value, re, build);
    if (!replaced) return;
    parent.children.splice(index, 1, ...(replaced as typeof parent.children));
    return [SKIP, index + replaced.length];
  });
}

/** `[[slug]]` / `[[slug|表示名]]` / `[[slug#見出し]]` を内部リンクに変換する remark プラグイン */
export const remarkWikilink: Plugin<[WikilinkOptions], Root> = (options) => (tree) => {
  replaceTextNodes(tree, WIKILINK_RE, (m) => wikilinkNode(m[1] ?? '', m[2], m[3]?.trim(), options));
};

export interface SourceRefOptions {
  readonly knownIds: ReadonlySet<string>;
  readonly onMissing?: (id: string) => void;
}

/** 本文の `[S01]` を出典一覧へのアンカーリンクに変換する remark プラグイン */
export const remarkSourceRefs: Plugin<[SourceRefOptions], Root> = (options) => (tree) => {
  replaceTextNodes(tree, SOURCE_REF_RE, (m) => {
    const id = m[1] ?? '';
    if (!options.knownIds.has(id)) {
      options.onMissing?.(id);
      return { type: 'text', value: m[0] };
    }
    return {
      type: 'link',
      url: `#source-${id}`,
      data: { hProperties: { className: ['source-ref'] } },
      children: [{ type: 'text', value: `[${id}]` }],
    };
  });
};

/** プレーンテキスト化用: wikilink を表示名に置換する */
export function replaceWikilinksWithText(
  text: string,
  resolveTitle: (slug: string) => string | undefined,
): string {
  return text.replace(
    new RegExp(WIKILINK_RE.source, 'g'),
    (_all: string, slug: string, _hash: string | undefined, label: string | undefined) =>
      label?.trim() ?? resolveTitle(slug) ?? slug,
  );
}
