import { describe, expect, it } from 'vitest';
import { articleById } from '../features/wiki/data';
import { CATEGORIES } from './categories';

describe('CATEGORIES lead', () => {
  it('names at most 3 existing articles per category', () => {
    for (const c of CATEGORIES) {
      expect(c.lead?.length ?? 0).toBeLessThanOrEqual(3);
      for (const id of c.lead ?? []) expect(articleById.has(id), `${c.id}: ${id}`).toBe(true);
    }
  });
});
