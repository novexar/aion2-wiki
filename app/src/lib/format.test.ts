import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './format';

describe('format', () => {
  it('formats ISO date strings as YYYY/MM/DD', () => {
    expect(formatDate('2026-10-08')).toBe('2026/10/08');
  });

  it('formats timestamps as YYYY/MM/DD', () => {
    expect(formatDate(new Date(2026, 0, 5, 3, 4))).toBe('2026/01/05');
  });

  it('formats date times with 24h clock', () => {
    expect(formatDateTime(new Date(2026, 9, 8, 13, 1))).toBe('2026/10/08 13:01');
  });
});
