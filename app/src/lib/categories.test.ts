import { describe, expect, it } from 'vitest';
import { articleById } from '../features/wiki/data';
import { CATEGORIES, DAILY_LINKS, FEATURED_LINKS, SEASON_END } from './categories';

describe('CATEGORIES lead', () => {
  it('names at most 3 existing articles per category', () => {
    for (const c of CATEGORIES) {
      expect(c.lead?.length ?? 0).toBeLessThanOrEqual(3);
      for (const id of c.lead ?? []) expect(articleById.has(id), `${c.id}: ${id}`).toBe(true);
    }
  });
});

describe('FEATURED_LINKS / DAILY_LINKS / SEASON_END', () => {
  it('names 6 existing articles each and an existing season article', () => {
    for (const ids of [FEATURED_LINKS, DAILY_LINKS]) {
      expect(ids).toHaveLength(6);
      for (const id of ids) expect(articleById.has(id), id).toBe(true);
    }
    expect(articleById.has(SEASON_END.articleId)).toBe(true);
    expect(Number.isNaN(Date.parse(SEASON_END.at))).toBe(false);
  });
});
