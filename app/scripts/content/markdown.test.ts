// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderMarkdown } from './markdown';

const options = {
  resolve: (slug: string) =>
    slug === 'kinah' ? { href: '/AION2/wiki/economy/kinah', title: 'ギーナ' } : undefined,
  sourceIds: new Set(['S01']),
};

describe('renderMarkdown', () => {
  it('extracts h2/h3 headings with slugged ids for the TOC', async () => {
    const { headings, html } = await renderMarkdown(
      '## 回復と上限\n\n### Odyle の使い道\n\n#### 細目\n\n## 回復と上限\n',
      options,
    );
    expect(headings).toEqual([
      { id: '回復と上限', text: '回復と上限', depth: 2 },
      { id: 'odyle-の使い道', text: 'Odyle の使い道', depth: 3 },
      { id: '回復と上限-1', text: '回復と上限', depth: 2 },
    ]);
    expect(html).toContain('<h2 id="回復と上限">回復と上限<a class="heading-anchor"');
  });

  it('drops raw HTML and unsafe URL schemes', async () => {
    const { html } = await renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[a](javascript:alert(1)) [b](JaVa&#9;script:alert(1)) [c](data:text/html;base64,AAAA) ![d](javascript:x) [ok](https://example.com) [rel](/AION2/x)\n',
      options,
    );
    expect(html).not.toMatch(/<script|onerror|javascript:|data:/i);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="/AION2/x"');
  });

  it('renders GFM tables wrapped in a scrollable region', async () => {
    const { html } = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |\n', options);
    expect(html).toContain(
      '<div class="table-wrap" tabindex="0" role="region" aria-label="表"><table>',
    );
  });

  it('adds rel="noopener noreferrer" to external links', async () => {
    const { html } = await renderMarkdown('[公式](https://example.com)', options);
    expect(html).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">',
    );
  });

  it('drops raw HTML from markdown', async () => {
    const { html } = await renderMarkdown('<script>alert(1)</script>\n\ntext', options);
    expect(html).not.toContain('<script>');
  });

  it('transforms wikilinks and source refs and reports problems', async () => {
    const onMissingLink = vi.fn();
    const onMissingSource = vi.fn();
    const { html } = await renderMarkdown('[[kinah]] [[nope]] [S01] [S02]', {
      ...options,
      onMissingLink,
      onMissingSource,
    });
    expect(html).toContain('class="wikilink"');
    expect(html).toContain('href="#source-S01"');
    expect(onMissingLink).toHaveBeenCalledWith('nope');
    expect(onMissingSource).toHaveBeenCalledWith('S02');
  });
});
