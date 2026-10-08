import type { Element, Root } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import { HeadingSlugger } from './slugger';

/** 表を横スクロール用のラッパーで囲む（キーボードでもスクロールできるよう tabindex を付与）。リージョン名は直前の見出し */
export const rehypeWrapTables: Plugin<[], Root> = () => (tree) => {
  let heading = '';
  let count = 0;
  visit(tree, 'element', (node: Element, index, parent) => {
    if (/^h[1-6]$/.test(node.tagName)) {
      // 見出しアンカー（末尾の "#"）は名前に含めない
      heading = hastToString(node).replace(/#$/, '').trim();
      return;
    }
    if (node.tagName !== 'table' || !parent || index === undefined) return;
    count += 1;
    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['table-wrap'],
        tabIndex: 0,
        role: 'region',
        ariaLabel: heading ? `${heading} の表` : `表 ${count}`,
      },
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
/** `//host`・`\host`・`/\host` はスキーム相対 URL になり、外部へ読み込みに行くので拒否する */
const NETWORK_PATH = /^[/\\]{2}|^\\/;

/** javascript: / data: など安全でない URL スキームの href・src を除去する（XSS 対策） */
export const rehypeStripUnsafeUrls: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    for (const name of ['href', 'src'] as const) {
      const value = node.properties[name];
      // 制御文字・空白で偽装されたスキーム（"java\tscript:"）も検出できるよう正規化してから判定する
      // eslint-disable-next-line no-control-regex
      const normalized = typeof value === 'string' ? value.replace(/[\u0000-\u0020]/g, '') : null;
      if (normalized === null) continue;
      if (NETWORK_PATH.test(normalized) || !SAFE_URL.test(normalized)) delete node.properties[name];
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

/** 先頭が `**ラベル**：` の blockquote を `<div class="callout" role="note" aria-label data-kind>` に変換する */
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
    node.tagName = 'div';
    node.properties = {
      className: ['callout'],
      role: 'note',
      ariaLabel: hastToString(strong).trim(),
      dataKind: kind,
    };
  });
};

const TRAILING_LABEL = /\s*根拠[：:]\s*$/;

/** 段落末尾の「…。根拠：[S01][S02]」を、ラベルなしの上付き出典 `<sup class="evidence">` に変える */
function wrapTrailingEvidence(p: Element): boolean {
  const idx = p.children.findLastIndex((c) => c.type === 'text' && TRAILING_LABEL.test(c.value));
  const label = p.children[idx];
  if (idx < 0 || label?.type !== 'text') return false;
  // 段落が出典だけのとき（先頭が「根拠：」）は結合側（rehypeEvidence）に任せる
  if (idx === 0 && label.value.replace(TRAILING_LABEL, '') === '') return false;
  const refs = p.children.slice(idx + 1);
  const onlyRefs = refs.every(
    (c) =>
      (c.type === 'text' && c.value.trim() === '') || (c.type === 'element' && c.tagName === 'a'),
  );
  const marks = refs.filter((c) => c.type === 'element');
  if (!onlyRefs || marks.length === 0) return false;
  label.value = label.value.replace(TRAILING_LABEL, '');
  p.children = [
    ...p.children.slice(0, idx + 1),
    { type: 'element', tagName: 'sup', properties: { className: ['evidence'] }, children: marks },
  ];
  return true;
}

/**
 * `根拠：[S01]` だけの段落を、直前の段落末尾のインライン上付き出典 `<sup class="evidence">` に結合する。
 * 直前が段落でない（表・リスト・見出し直後など）場合は、ラベルなしの出典段落として残す。
 */
export const rehypeEvidence: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'p' || !parent || index === undefined) return;
    if (wrapTrailingEvidence(node)) return;
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
