// @vitest-environment node
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it, vi } from 'vitest';
import { remarkSourceRefs, remarkWikilink, replaceWikilinksWithText, splitText } from './wikilink';

const targets: Record<string, { href: string; title: string }> = {
  kinah: { href: '/AION2/wiki/economy/kinah', title: 'ギーナ' },
};

async function render(
  md: string,
  onMissing = vi.fn(),
  knownIds = new Set(['S01']),
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkWikilink, { resolve: (slug) => targets[slug], onMissing })
    .use(remarkSourceRefs, { knownIds, onMissing })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

describe('remarkWikilink', () => {
  it('converts [[slug]] to an internal link titled with the article title', async () => {
    const html = await render('詳しくは [[kinah]] を参照。');
    expect(html).toContain(
      '<a href="/AION2/wiki/economy/kinah" class="wikilink" data-slug="kinah">ギーナ</a>',
    );
  });

  it('supports custom labels and heading anchors', async () => {
    const html = await render('[[kinah#入手方法|稼ぎ方]]');
    expect(html).toContain(`href="/AION2/wiki/economy/kinah#${encodeURIComponent('入手方法')}"`);
    expect(html).toContain('>稼ぎ方</a>');
  });

  it('renders unknown targets as a non-link span and reports them', async () => {
    const onMissing = vi.fn();
    const html = await render('[[no-such-page]]', onMissing);
    expect(html).toContain('<span class="wikilink wikilink-missing"');
    expect(html).not.toContain('<a');
    expect(onMissing).toHaveBeenCalledWith('no-such-page');
  });

  it('converts multiple links in one text node and keeps surrounding text', async () => {
    const html = await render('A [[kinah]] B [[kinah|K]] C');
    expect(html).toMatch(/A <a[^>]*>ギーナ<\/a> B <a[^>]*>K<\/a> C/);
  });

  it('does not touch links inside inline code', async () => {
    const html = await render('`[[kinah]]`');
    expect(html).toContain('<code>[[kinah]]</code>');
  });

  it('ignores invalid slugs', async () => {
    const html = await render('[[Not Valid]]');
    expect(html).toContain('[[Not Valid]]');
  });
});

describe('remarkSourceRefs', () => {
  it('links known source ids to the sources list', async () => {
    const html = await render('根拠：[S01]');
    expect(html).toContain('<a href="#source-S01" class="source-ref">[S01]</a>');
  });

  it('leaves unknown ids as text and reports them', async () => {
    const onMissing = vi.fn();
    const html = await render('根拠：[S09]', onMissing);
    expect(html).toContain('根拠：[S09]');
    expect(onMissing).toHaveBeenCalledWith('S09');
  });
});

describe('replaceWikilinksWithText', () => {
  it('replaces links with labels, titles or the slug', () => {
    const resolve = (slug: string) => targets[slug]?.title;
    expect(replaceWikilinksWithText('[[kinah]] / [[kinah|金]] / [[x-y]]', resolve)).toBe(
      'ギーナ / 金 / x-y',
    );
  });
});

describe('splitText', () => {
  it('returns null when nothing matches', () => {
    expect(splitText('plain', /\[\[x\]\]/, () => ({ type: 'text', value: '' }))).toBeNull();
  });
});
