// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ContentError } from './errors';
import { formatIssuePath, parseArticleFile } from './frontmatter';
import { articleMarkdown } from './test-fixtures';

const ctx = (basename: string, dirName = 'basics') => ({
  file: `content/${dirName}/${basename}.md`,
  basename,
  dirName,
});

function reasonsOf(fn: () => unknown): string[] {
  try {
    fn();
  } catch (error) {
    if (error instanceof ContentError) return [...error.reasons];
    throw error;
  }
  throw new Error('ContentError が投げられませんでした');
}

const NL = String.fromCharCode(10);

describe('parseArticleFile', () => {
  it('parses order as an integer and rejects fractions', () => {
    const ok = parseArticleFile(
      articleMarkdown({ id: 'kinah', extra: 'order: 12' + NL }),
      ctx('kinah'),
    );
    expect(ok.frontmatter.order).toBe(12);
    const reasons = reasonsOf(() =>
      parseArticleFile(articleMarkdown({ id: 'kinah', extra: 'order: 1.5' + NL }), ctx('kinah')),
    );
    expect(reasons.join()).toContain('order は整数');
  });

  it('parses a valid article and normalizes dates to YYYY-MM-DD', () => {
    const { frontmatter, body } = parseArticleFile(articleMarkdown({ id: 'kinah' }), ctx('kinah'));
    expect(frontmatter.id).toBe('kinah');
    expect(frontmatter.updated).toBe('2026-10-08');
    expect(frontmatter.sources[0]?.date).toBe('2026-10-01');
    expect(frontmatter.aliases).toEqual(['Test Alias']);
    expect(frontmatter.related).toEqual([]);
    expect(body).toContain('## 見出し');
  });

  it('accepts quoted string dates and optional reading', () => {
    const raw = articleMarkdown({
      id: 'a',
      overrides: { updated: "'2026-01-02'", reading: 'えー' },
    });
    const { frontmatter } = parseArticleFile(raw, ctx('a'));
    expect(frontmatter.updated).toBe('2026-01-02');
    expect(frontmatter.reading).toBe('えー');
  });

  it('reports missing required fields with the field name', () => {
    const reasons = reasonsOf(() =>
      parseArticleFile(articleMarkdown({ id: 'a', omit: ['summary', 'sources'] }), ctx('a')),
    );
    expect(reasons.some((r) => r.startsWith('summary:'))).toBe(true);
    expect(reasons.some((r) => r.startsWith('sources:'))).toBe(true);
  });

  it('rejects unknown categories', () => {
    const reasons = reasonsOf(() =>
      parseArticleFile(articleMarkdown({ id: 'a', category: 'raids' }), ctx('a')),
    );
    expect(reasons.join()).toContain('category');
  });

  it('rejects unverified confidence', () => {
    const reasons = reasonsOf(() =>
      parseArticleFile(
        articleMarkdown({ id: 'a', overrides: { confidence: 'unverified' } }),
        ctx('a'),
      ),
    );
    expect(reasons.join()).toContain('unverified は掲載不可');
  });

  it('enforces 2-6 tags, region global and valid dates', () => {
    const reasons = reasonsOf(() =>
      parseArticleFile(
        articleMarkdown({
          id: 'a',
          overrides: { tags: '[ひとつ]', region: 'korea', updated: '2026/10/08' },
        }),
        ctx('a'),
      ),
    );
    expect(reasons.join('\n')).toMatch(/tags は 2〜6 個/);
    expect(reasons.join('\n')).toMatch(/region/);
    expect(reasons.join('\n')).toMatch(/updated: 日付は YYYY-MM-DD/);
  });

  it('validates source entries with an indexed path', () => {
    const raw = articleMarkdown({
      id: 'a',
      overrides: {
        sources:
          '\n  - id: X1\n    title: t\n    url: ftp://example.com\n    date: 2026-10-01\n    kind: blog',
      },
    });
    const reasons = reasonsOf(() => parseArticleFile(raw, ctx('a')));
    expect(reasons.some((r) => r.startsWith('sources[0].id:'))).toBe(true);
    expect(reasons.some((r) => r.startsWith('sources[0].url:'))).toBe(true);
    expect(reasons.some((r) => r.startsWith('sources[0].kind:'))).toBe(true);
  });

  it('rejects duplicate source ids', () => {
    const src =
      '\n  - id: S01\n    title: a\n    url: https://a.example\n    date: 2026-10-01\n    kind: guide';
    const raw = articleMarkdown({ id: 'a', overrides: { sources: src + src.replace('\n', '\n') } });
    expect(reasonsOf(() => parseArticleFile(raw, ctx('a'))).join()).toContain('重複');
  });

  it('requires id to match the file name', () => {
    expect(
      reasonsOf(() => parseArticleFile(articleMarkdown({ id: 'abc' }), ctx('xyz'))).join(),
    ).toContain('ファイル名');
  });

  it('requires category to match the directory, except for _ directories', () => {
    const raw = articleMarkdown({ id: 'a', category: 'economy' });
    expect(reasonsOf(() => parseArticleFile(raw, ctx('a', 'basics'))).join()).toContain(
      'ディレクトリ名',
    );
    expect(parseArticleFile(raw, ctx('a', '_sample')).frontmatter.category).toBe('economy');
  });

  it('rejects files without frontmatter', () => {
    expect(reasonsOf(() => parseArticleFile('# no frontmatter', ctx('a'))).join()).toContain(
      'frontmatter',
    );
  });

  it('reports YAML syntax errors', () => {
    const raw = '---\nid: [unclosed\n---\nbody';
    expect(reasonsOf(() => parseArticleFile(raw, ctx('a'))).join()).toContain(
      'YAML を解析できません',
    );
  });

  it('includes the file name in the error message', () => {
    try {
      parseArticleFile(articleMarkdown({ id: 'a', omit: ['title'] }), ctx('a'));
    } catch (error) {
      expect((error as Error).message).toContain('content/basics/a.md');
    }
  });
});

describe('formatIssuePath', () => {
  it('formats nested paths', () => {
    expect(formatIssuePath(['sources', 0, 'url'])).toBe('sources[0].url');
    expect(formatIssuePath([])).toBe('');
  });
});
