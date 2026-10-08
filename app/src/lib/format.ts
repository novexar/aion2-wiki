const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

const DATE_FORMAT = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const TIME_FORMAT = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** 日付の統一表記 `2026/10/08`。`YYYY-MM-DD` 文字列はタイムゾーンを介さず変換する。 */
export function formatDate(value: string | number | Date): string {
  if (typeof value === 'string') {
    const m = DATE_ONLY.exec(value);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  }
  return DATE_FORMAT.format(typeof value === 'string' ? new Date(value) : value);
}

/** 日時の統一表記 `2026/10/08 13:01` */
export function formatDateTime(value: number | Date): string {
  return `${formatDate(value)} ${TIME_FORMAT.format(value)}`;
}
