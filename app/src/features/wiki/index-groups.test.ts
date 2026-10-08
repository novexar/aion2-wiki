import { describe, expect, it } from 'vitest';
import { META } from '../../test/fixtures';
import { aliasPreview, groupArticles, isIndexView, matchesFilter, tagCounts } from './index-groups';

describe('groupArticles', () => {
  it('groups by gojuon row with reading support', () => {
    const groups = groupArticles(META, 'kana');
    expect(groups.map((g) => g.label)).toEqual(['あ行', 'か行']);
    expect(groups[0]?.entries.map((e) => e.article.id)).toEqual(['expedition', 'odyle-energy']);
  });

  it('groups by latin alias for A–Z', () => {
    const groups = groupArticles(META, 'latin');
    expect(groups.map((g) => g.key)).toEqual(['K', 'O']);
    expect(groups[0]?.entries[0]?.label).toBe('Kinah');
  });

  it('groups by category in category order', () => {
    expect(groupArticles(META, 'category').map((g) => g.key)).toEqual(['dungeons', 'economy']);
  });

  it('groups by tag and filters to one tag', () => {
    expect(groupArticles(META, 'tag').map((g) => g.key)).toContain('遠征');
    const only = groupArticles(META, 'tag', { tag: '遠征' });
    expect(only).toHaveLength(1);
    expect(only[0]?.entries).toHaveLength(2);
  });

  it('applies the text filter to titles, aliases and tags', () => {
    expect(groupArticles(META, 'category', { filter: 'kinah' })[0]?.entries[0]?.article.id).toBe(
      'kinah',
    );
    expect(matchesFilter(META[0]!, '日課')).toBe(true);
    expect(matchesFilter(META[0]!, '  ')).toBe(true);
    expect(matchesFilter(META[0]!, '存在しない')).toBe(false);
  });
});

describe('tagCounts / isIndexView', () => {
  it('counts tags by frequency', () => {
    expect(tagCounts(META)[0]).toEqual({ tag: '遠征', count: 2 });
  });

  it('validates view names', () => {
    expect(isIndexView('kana')).toBe(true);
    expect(isIndexView('x')).toBe(false);
    expect(isIndexView(null)).toBe(false);
  });
});

describe('aliasPreview', () => {
  it('別名は 2 件まで出し、残りを数える', () => {
    expect(aliasPreview(['a', 'b', 'c', 'd'])).toEqual({ shown: ['a', 'b'], rest: 2 });
    expect(aliasPreview(['a'])).toEqual({ shown: ['a'], rest: 0 });
    expect(aliasPreview([])).toEqual({ shown: [], rest: 0 });
  });
});
