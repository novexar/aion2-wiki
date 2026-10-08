import type { Element, Root } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import { HeadingSlugger } from './slugger';

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
    node.properties.className = ['external'];
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

/** 見出しに id を付ける（全角記号は `-` に置換） */
export const rehypeHeadingIds: Plugin<[], Root> = () => (tree) => {
  const slugger = new HeadingSlugger();
  visit(tree, 'element', (node: Element) => {
    if (!/^h[1-6]$/.test(node.tagName) || node.properties.id) return;
    node.properties.id = slugger.slug(hastToString(node));
  });
};

const CALLOUT_KINDS: Readonly<Record<string, string>> = {
  注意: 'caution',
  要確認: 'caution',
  韓国版のみ: 'kr',
  補足: 'note',
};

/** 先頭が `**ラベル**：` の blockquote を `<aside class="callout" data-kind>` に変換する */
export const rehypeCallouts: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'blockquote') return;
    const para = node.children.find((c): c is Element => c.type === 'element');
    const strong = para?.children.find((c) => !(c.type === 'text' && c.value.trim() === ''));
    if (!para || para.tagName !== 'p' || strong?.type !== 'element' || strong.tagName !== 'strong')
      return;
    const kind = CALLOUT_KINDS[hastToString(strong).trim()];
    const next = para.children[para.children.indexOf(strong) + 1];
    if (!kind || next?.type !== 'text' || !/^\s*[：:]/.test(next.value)) return;
    node.tagName = 'aside';
    node.properties = { className: ['callout'], dataKind: kind };
  });
};

/**
 * `根拠：[S01]` だけの段落を、直前の段落末尾のインライン上付き出典 `<sup class="evidence">` に結合する。
 * 直前が段落でない（表・リスト・見出し直後など）場合は、ラベルなしの出典段落として残す。
 */
export const rehypeEvidence: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'p' || !parent || index === undefined) return;
    const first = node.children[0];
    if (first?.type !== 'text' || !/^根拠[：:]\s*/.test(first.value)) return;
    const rest = node.children.slice(1);
    const refs = [
      ...(first.value.replace(/^根拠[：:]\s*/, '')
        ? [{ ...first, value: first.value.replace(/^根拠[：:]\s*/, '') }]
        : []),
      ...rest,
    ];
    const prev = parent.children
      .slice(0, index)
      .reverse()
      .find((c) => !(c.type === 'text' && c.value.trim() === ''));
    if (prev?.type === 'element' && prev.tagName === 'p') {
      const marks = refs.filter((c) => !(c.type === 'text' && c.value.trim() === ''));
      prev.children.push({
        type: 'element',
        tagName: 'sup',
        properties: { className: ['evidence'] },
        children: marks,
      });
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
    node.children = refs;
    node.properties.className = ['evidence'];
    return undefined;
  });
};
