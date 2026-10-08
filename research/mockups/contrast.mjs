// WCAG 2.x コントラスト比の計算。node research/mockups/contrast.mjs で表を出力
const L = (hex) => {
  const [r, g, b] = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(2); };

export const tokens = {
  light: {
    canvas: '#ffffff', surface: '#f7f8fb', muted: '#eef1f6',
    line: '#e1e5ee', 'line-strong': '#c9d0dd', 'line-input': '#7f8799',
    fg: '#141821', 'fg-muted': '#4b5262', 'fg-subtle': '#656d7e',
    accent: '#c9a227', 'accent-strong': '#7f640f', aether: '#3d82bf', 'aether-deep': '#1d5ca8',
    link: '#1d5ca8', 'ok-fg': '#166534', 'info-fg': '#1b4f91', 'warn-fg': '#92400e', 'danger-fg': '#b91c1c',
    'kr-fg': '#6a3fc0', 'header-bg': '#0f1f3c', 'header-fg': '#eef2f8', 'header-muted': '#aab6cc',
  },
  dark: {
    canvas: '#0a0e17', surface: '#0f141f', muted: '#161c29',
    line: '#232b3a', 'line-strong': '#35405a', 'line-input': '#6f7a93',
    fg: '#f2f4f8', 'fg-muted': '#a4acbb', 'fg-subtle': '#8a93a4',
    accent: '#d4af37', 'accent-strong': '#e2c15a', aether: '#70d2ff', 'aether-deep': '#8ec8ff',
    link: '#8ec8ff', 'ok-fg': '#86efac', 'info-fg': '#8ec8ff', 'warn-fg': '#fcd34d', 'danger-fg': '#fca5a5',
    'kr-fg': '#b9a0f0', 'header-bg': '#060a14', 'header-fg': '#eef2f8', 'header-muted': '#aab6cc',
  },
};
const textTokens = ['fg', 'fg-muted', 'fg-subtle', 'accent-strong', 'link', 'ok-fg', 'info-fg', 'warn-fg', 'danger-fg', 'kr-fg'];
const bgTokens = ['canvas', 'surface', 'muted'];
const mark = (r, min) => (r >= min ? '' : ' ✗');
const rows = [];
for (const [mode, t] of Object.entries(tokens)) {
  rows.push(`\n### ${mode}\n\n| text ＼ bg | ${bgTokens.map((b) => `${b} ${t[b]}`).join(' | ')} |`, `|---|${bgTokens.map(() => '---').join('|')}|`);
  for (const tx of textTokens) rows.push(`| ${tx} ${t[tx]} | ${bgTokens.map((b) => { const r = +ratio(t[tx], t[b]); return `${r.toFixed(2)}${mark(r, tx === 'fg-subtle' ? 4.5 : 4.5)}`; }).join(' | ')} |`);
  rows.push(`| header-fg ${t['header-fg']} on header-bg ${t['header-bg']} | ${ratio(t['header-fg'], t['header-bg'])} | | |`);
  rows.push(`| header-muted ${t['header-muted']} on header-bg | ${ratio(t['header-muted'], t['header-bg'])} | | |`);
  rows.push(`| accent-contrast #1c1505 on accent ${t.accent}（primary ボタン） | ${ratio('#1c1505', t.accent)} | | |`);
  rows.push(`| line-input ${t['line-input']} on canvas（非テキスト 3:1） | ${ratio(t['line-input'], t.canvas)} | | |`);
  rows.push(`| line-strong ${t['line-strong']} on canvas（装飾のみ） | ${ratio(t['line-strong'], t.canvas)} | | |`);
  rows.push(`| accent ${t.accent} on canvas（フォーカスリング 3:1） | ${ratio(t.accent, t.canvas)} | | |`);
}
if (process.argv[1]?.endsWith('contrast.mjs')) console.log(rows.join('\n'));
