import { describe, expect, it } from 'vitest';
import { parseInline, parseMiniMarkdown } from './mini-markdown';

describe('parseInline', () => {
  it('parses bold, code and citations', () => {
    expect(parseInline('上限は **560** です `x` [オードエネルギー]')).toEqual([
      { type: 'text', value: '上限は ' },
      { type: 'strong', value: '560' },
      { type: 'text', value: ' です ' },
      { type: 'code', value: 'x' },
      { type: 'text', value: ' ' },
      { type: 'cite', value: 'オードエネルギー' },
    ]);
  });

  it('does not treat markdown links as citations', () => {
    expect(parseInline('[a](https://x)')).toEqual([{ type: 'text', value: '[a](https://x)' }]);
  });

  it('keeps HTML as plain text', () => {
    expect(parseInline('<img src=x onerror=alert(1)>')).toEqual([
      { type: 'text', value: '<img src=x onerror=alert(1)>' },
    ]);
  });
});

describe('parseMiniMarkdown', () => {
  it('groups paragraphs and lists', () => {
    const blocks = parseMiniMarkdown('段落1\n続き\n\n- a\n- b\n1. x\n2) y\n\n## 見出し\n最後');
    expect(blocks.map((b) => b.type)).toEqual(['p', 'ul', 'ol', 'p']);
    expect(blocks[0]).toEqual({ type: 'p', inlines: [{ type: 'text', value: '段落1\n続き' }] });
    expect(blocks[1]).toEqual({
      type: 'ul',
      items: [[{ type: 'text', value: 'a' }], [{ type: 'text', value: 'b' }]],
    });
    expect(blocks[3]).toEqual({ type: 'p', inlines: [{ type: 'text', value: '見出し\n最後' }] });
  });

  it('ends a list when a paragraph line follows', () => {
    expect(parseMiniMarkdown('- a\ntext').map((b) => b.type)).toEqual(['ul', 'p']);
  });

  it('handles CRLF and empty input', () => {
    expect(parseMiniMarkdown('')).toEqual([]);
    expect(parseMiniMarkdown('a\r\n\r\nb')).toHaveLength(2);
  });
});
