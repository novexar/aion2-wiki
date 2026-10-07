// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { extractRelatedSection } from './related-section';

describe('extractRelatedSection', () => {
  it('removes the trailing 関連記事 section and returns its wikilink slugs', () => {
    const md = '## 本文\n\nテキスト\n\n## 関連記事\n\n- [[a-b]] — x\n- [[c|ラベル]]\n';
    const out = extractRelatedSection(md);
    expect(out.body).toBe('## 本文\n\nテキスト\n');
    expect(out.relatedIds).toEqual(['a-b', 'c']);
  });

  it('keeps sections that follow it', () => {
    const out = extractRelatedSection('## 関連記事\n\n- [[a]]\n\n## 次\n\nb\n');
    expect(out.body).toBe('## 次\n\nb\n');
  });

  it('leaves bodies without the section untouched', () => {
    const md = '## 本文\n\nx\n';
    expect(extractRelatedSection(md)).toEqual({ body: md, relatedIds: [] });
  });
});
