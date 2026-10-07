import type { Element, Root as HastRoot } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified, type Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Heading } from '../../src/lib/types';
import { rehypeExternalLinks, rehypeStripUnsafeUrls, rehypeWrapTables } from './rehype-plugins';
import { remarkSourceRefs, remarkWikilink, type WikilinkTarget } from './wikilink';

export interface RenderOptions {
  readonly resolve: (slug: string) => WikilinkTarget | undefined;
  readonly sourceIds: ReadonlySet<string>;
  readonly onMissingLink?: (slug: string) => void;
  readonly onHashLink?: (slug: string, hash: string) => void;
  readonly onMissingSource?: (id: string) => void;
}

export interface RenderResult {
  readonly html: string;
  readonly headings: readonly Heading[];
}

/** h2/h3 を目次用に収集する（rehype-slug の後、autolink の前に実行） */
export function collectHeadings(tree: HastRoot): Heading[] {
  const headings: Heading[] = [];
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
    const id = node.properties.id;
    if (typeof id !== 'string') return;
    headings.push({ id, text: hastToString(node).trim(), depth: node.tagName === 'h2' ? 2 : 3 });
  });
  return headings;
}

const rehypeCollectHeadings: Plugin<[], HastRoot> = () => (tree, file) => {
  file.data.headings = collectHeadings(tree);
};

declare module 'vfile' {
  interface DataMap {
    headings: Heading[];
  }
}

export async function renderMarkdown(
  markdown: string,
  options: RenderOptions,
): Promise<RenderResult> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikilink, {
      resolve: options.resolve,
      onMissing: options.onMissingLink,
      onHash: options.onHashLink,
    })
    .use(remarkSourceRefs, { knownIds: options.sourceIds, onMissing: options.onMissingSource })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCollectHeadings)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
      content: { type: 'text', value: '#' },
    })
    .use(rehypeWrapTables)
    .use(rehypeStripUnsafeUrls)
    .use(rehypeExternalLinks)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), headings: file.data.headings ?? [] };
}
