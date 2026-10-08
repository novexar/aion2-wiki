import type { ArticleEvent, NavArticle } from './types';

/** 「今週の予定」の範囲（今日を含む日数） */
export const WEEK_DAYS = 7;
/** 「今週の予定」の最大行数 */
export const UPCOMING_LIMIT = 5;

const DAY_MS = 86_400_000;
const FAR_PAST = '0000-01-01';
const FAR_FUTURE = '9999-12-31';

/** ゲーム内の日付は日本時間で数える（日次リセットも JST 基準） */
const JST_DATE = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' });

/** `now` の日本時間の日付（YYYY-MM-DD） */
export function jstDateKey(now: Date): string {
  return JST_DATE.format(now);
}

function addDays(dateKey: string, days: number): string {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export interface UpcomingEvent {
  readonly article: NavArticle;
  readonly event: ArticleEvent;
}

/** 今日から WEEK_DAYS 日の間に開催中・開始・終了する記事。近い日付（開始前なら開始日、開催中なら終了日）順 */
export function upcomingEvents(
  articles: readonly NavArticle[],
  today: string,
  limit = UPCOMING_LIMIT,
): UpcomingEvent[] {
  const weekEnd = addDays(today, WEEK_DAYS - 1);
  const sortKey = (e: ArticleEvent): string =>
    e.starts && e.starts > today ? e.starts : (e.ends ?? e.starts ?? today);
  return articles
    .flatMap((article) => (article.event ? [{ article, event: article.event }] : []))
    .filter(
      ({ event }) => (event.starts ?? FAR_PAST) <= weekEnd && (event.ends ?? FAR_FUTURE) >= today,
    )
    .sort(
      (a, b) =>
        sortKey(a.event).localeCompare(sortKey(b.event)) ||
        a.article.title.localeCompare(b.article.title, 'ja'),
    )
    .slice(0, limit);
}

const monthDay = (dateKey: string): string => `${dateKey.slice(5, 7)}/${dateKey.slice(8, 10)}`;

/** 期間の表記: `10/05〜10/16`、`〜10/16`、`10/14〜`、同日は `10/14` */
export function eventRangeLabel(event: ArticleEvent): string {
  const { starts, ends } = event;
  if (starts && ends)
    return starts === ends ? monthDay(starts) : `${monthDay(starts)}〜${monthDay(ends)}`;
  if (ends) return `〜${monthDay(ends)}`;
  return starts ? `${monthDay(starts)}〜` : '';
}

/** `target` まで残り何日か（切り上げ）。過ぎていれば 0 以下 */
export function daysUntil(target: string, now: Date): number {
  return Math.ceil((Date.parse(target) - now.getTime()) / DAY_MS);
}

/** 「最近の更新」を出すか: 更新日時（無ければ日付）が 2 種類以上あるとき */
export function hasDistinctUpdates(articles: readonly NavArticle[]): boolean {
  return new Set(articles.map((a) => a.updatedAt ?? a.updated)).size > 1;
}
