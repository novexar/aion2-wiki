import { describe, expect, it } from 'vitest';
import {
  daysUntil,
  eventRangeLabel,
  hasDistinctUpdates,
  jstDateKey,
  upcomingEvents,
} from './home-sections';
import type { ArticleEvent, NavArticle } from './types';

const article = (id: string, event?: ArticleEvent, updatedAt?: string): NavArticle => ({
  id,
  title: id,
  category: 'news',
  confidence: 'verified',
  updated: '2026-10-08',
  order: 1,
  ...(event ? { event } : {}),
  ...(updatedAt ? { updatedAt } : {}),
});

describe('upcomingEvents', () => {
  const list = [
    article('past', { starts: '2026-09-01', ends: '2026-10-07' }),
    article('ongoing-long', { starts: '2026-10-05', ends: '2026-11-02' }),
    article('ongoing-short', { starts: '2026-10-05', ends: '2026-10-16' }),
    article('starts-soon', { starts: '2026-10-14', ends: '2026-10-14' }),
    article('starts-later', { starts: '2026-10-15' }),
    article('deadline', { ends: '2026-10-10' }),
    article('no-event'),
  ];

  it('今日から 7 日以内に重なるものだけを、近い日付順に返す', () => {
    expect(upcomingEvents(list, '2026-10-08').map((e) => e.article.id)).toEqual([
      'deadline',
      'starts-soon',
      'ongoing-short',
      'ongoing-long',
    ]);
  });

  it('終了日当日はまだ含み、翌日には外れる', () => {
    expect(upcomingEvents(list, '2026-10-16').map((e) => e.article.id)).toContain('ongoing-short');
    expect(upcomingEvents(list, '2026-10-17').map((e) => e.article.id)).not.toContain(
      'ongoing-short',
    );
  });

  it('最大件数で切る', () => {
    expect(upcomingEvents(list, '2026-10-08', 2)).toHaveLength(2);
  });
});

describe('eventRangeLabel', () => {
  it.each([
    [{ starts: '2026-10-05', ends: '2026-10-16' }, '10/05〜10/16'],
    [{ ends: '2026-10-16' }, '〜10/16'],
    [{ starts: '2026-10-14' }, '10/14〜'],
    [{ starts: '2026-10-14', ends: '2026-10-14' }, '10/14'],
  ])('%o → %s', (event, label) => {
    expect(eventRangeLabel(event)).toBe(label);
  });
});

describe('daysUntil / jstDateKey', () => {
  it('切り上げで日数を数える', () => {
    const end = '2026-12-16T16:00:00+09:00';
    expect(daysUntil(end, new Date('2026-12-15T16:00:00+09:00'))).toBe(1);
    expect(daysUntil(end, new Date('2026-12-15T16:00:01+09:00'))).toBe(1);
    expect(daysUntil(end, new Date('2026-12-16T16:00:00+09:00'))).toBe(0);
  });

  it('日本時間の日付を返す', () => {
    expect(jstDateKey(new Date('2026-10-08T15:30:00Z'))).toBe('2026-10-09');
    expect(jstDateKey(new Date('2026-10-08T14:59:00Z'))).toBe('2026-10-08');
  });
});

describe('hasDistinctUpdates', () => {
  it('日付が同じでも更新日時が違えば true', () => {
    expect(
      hasDistinctUpdates([
        article('a', undefined, '2026-10-08T13:35:04+09:00'),
        article('b', undefined, '2026-10-08T08:41:07+09:00'),
      ]),
    ).toBe(true);
    expect(hasDistinctUpdates([article('a'), article('b')])).toBe(false);
  });
});
