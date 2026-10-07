import { beforeEach, describe, expect, it } from 'vitest';
import { pushRecentId, readRecentIds } from './recent';

describe('recent articles', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the newest first without duplicates and at most 5', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'c']) pushRecentId(id);
    expect(readRecentIds()).toEqual(['c', 'f', 'e', 'd', 'b']);
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem('aion2wiki:recent-articles', '{"x":1}');
    expect(readRecentIds()).toEqual([]);
  });
});
