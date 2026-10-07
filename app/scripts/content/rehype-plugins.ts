import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

/** 表を横スクロール用のラッパーで囲む（キーボードでもスクロールできるよう tabindex を付与） */
export const rehypeWrapTables: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'table' || !parent || index === undefined) return;
    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: '表' },
      children: [node],
    };
    parent.children.splice(index, 1, wrapper);
    return [SKIP, index + 1];
  });
};

/** 外部リンクを新規タブ + noopener noreferrer にする */
export const rehypeExternalLinks: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'a') return;
    const href = node.properties.href;
    if (typeof href !== 'string' || !/^https?:\/\//.test(href)) return;
    node.properties.target = '_blank';
    node.properties.rel = ['noopener', 'noreferrer'];
  });
};

const SAFE_URL = /^(?:https?:|mailto:|#|\/|\.{1,2}\/|[^:]*$)/i;

/** javascript: / data: など安全でない URL スキームの href・src を除去する（XSS 対策） */
export const rehypeStripUnsafeUrls: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    for (const name of ['href', 'src'] as const) {
      const value = node.properties[name];
      // 制御文字・空白で偽装されたスキーム（"java\tscript:"）も検出できるよう正規化してから判定する
      // eslint-disable-next-line no-control-regex
      const normalized = typeof value === 'string' ? value.replace(/[\u0000-\u0020]/g, '') : null;
      if (normalized !== null && !SAFE_URL.test(normalized)) delete node.properties[name];
    }
  });
};
