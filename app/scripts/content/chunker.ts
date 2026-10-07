import GithubSlugger from 'github-slugger';
import type { List, Root, RootContent, Table } from 'mdast';
import { toString as mdToString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import type { CategoryId } from '../../src/lib/categories';
import type { Chunk } from '../../src/lib/types';
import { replaceWikilinksWithText } from './wikilink';

export const DEFAULT_CHUNK_SIZE = 600;

export interface ChunkInput {
  readonly articleId: string;
  readonly category: CategoryId;
  readonly title: string;
  readonly markdown: string;
  readonly resolveTitle?: (slug: string) => string | undefined;
  readonly maxChars?: number;
}

interface Section {
  readonly heading: string;
  readonly anchor: string;
  readonly blocks: string[];
}

function tableToText(table: Table): string {
  return table.children
    .map((row) => row.children.map((cell) => mdToString(cell).trim()).join(' | '))
    .join('\n');
}

function listToText(list: List): string {
  const start = list.start ?? 1;
  return list.children
    .map((item, i) => `${list.ordered ? `${start + i}.` : '-'} ${mdToString(item).trim()}`)
    .join('\n');
}

/** ブロックノードをプレーンテキストにする（表は行ごとに「 | 」区切り） */
export function blockToText(node: RootContent): string {
  switch (node.type) {
    case 'table':
      return tableToText(node);
    case 'list':
      return listToText(node);
    case 'code':
      return node.value;
    case 'html':
    case 'thematicBreak':
    case 'definition':
      return '';
    case 'blockquote':
      return node.children.map(blockToText).filter(Boolean).join('\n');
    default:
      return mdToString(node).trim();
  }
}

/** 文の区切り（。！？改行）で分割し、長すぎる文は機械的に切る */
export function splitLongText(text: string, maxChars: number): string[] {
  const sentences = text.match(/[^。！？!?\n]+[。！？!?]?\n?|\n/g) ?? [text];
  const parts: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current.trim()) {
      parts.push(current.trim());
      current = '';
    }
    if (sentence.length > maxChars) {
      for (let i = 0; i < sentence.length; i += maxChars) {
        const piece = sentence.slice(i, i + maxChars).trim();
        if (piece) parts.push(piece);
      }
      continue;
    }
    current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** ブロックを順に詰め、maxChars 前後のチャンクにまとめる */
export function packBlocks(blocks: readonly string[], maxChars: number): string[] {
  const out: string[] = [];
  let current = '';
  const flush = (): void => {
    if (current.trim()) out.push(current.trim());
    current = '';
  };
  for (const block of blocks) {
    if (!block.trim()) continue;
    if (block.length > maxChars) {
      flush();
      out.push(...splitLongText(block, maxChars));
      continue;
    }
    if (current && current.length + block.length + 1 > maxChars) flush();
    current = current ? `${current}\n${block}` : block;
  }
  flush();
  return out;
}

function parseSections(tree: Root): Section[] {
  const slugger = new GithubSlugger();
  const sections: Section[] = [{ heading: '', anchor: '', blocks: [] }];
  let h2 = '';
  for (const node of tree.children) {
    if (node.type === 'heading') {
      const text = mdToString(node).trim();
      // rehype-slug と同じ順序・同じ規則で全見出しの ID を払い出し、アンカーを一致させる
      const anchor = slugger.slug(text);
      if (node.depth <= 2) {
        h2 = text;
        sections.push({ heading: text, anchor, blocks: [] });
        continue;
      }
      if (node.depth === 3) {
        sections.push({ heading: h2 ? `${h2} > ${text}` : text, anchor, blocks: [] });
        continue;
      }
      sections[sections.length - 1]?.blocks.push(text);
      continue;
    }
    sections[sections.length - 1]?.blocks.push(blockToText(node));
  }
  return sections;
}

/** 記事本文を RAG 用のチャンクに分割する（見出しの文脈付き） */
export function chunkArticle(input: ChunkInput): Chunk[] {
  const maxChars = input.maxChars ?? DEFAULT_CHUNK_SIZE;
  const markdown = replaceWikilinksWithText(
    input.markdown,
    input.resolveTitle ?? (() => undefined),
  );
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const sections = parseSections(tree);

  const chunks: Chunk[] = [];
  for (const section of sections) {
    for (const text of packBlocks(section.blocks, maxChars)) {
      chunks.push({
        id: `${input.articleId}#${chunks.length}`,
        articleId: input.articleId,
        category: input.category,
        title: input.title,
        heading: section.heading,
        anchor: section.anchor,
        text,
      });
    }
  }
  return chunks;
}
