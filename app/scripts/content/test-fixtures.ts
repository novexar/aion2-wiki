/** テスト用: スキーマ準拠の記事 Markdown を組み立てる */
export interface FixtureOptions {
  readonly id: string;
  readonly category?: string;
  readonly title?: string;
  readonly body?: string;
  readonly extra?: string;
  readonly omit?: readonly string[];
  readonly overrides?: Readonly<Record<string, string>>;
}

export function articleMarkdown(options: FixtureOptions): string {
  const fields: Record<string, string> = {
    id: options.id,
    title: options.title ?? `記事 ${options.id}`,
    reading: 'きじ',
    category: options.category ?? 'basics',
    tags: '[タグA, タグB]',
    summary: 'テスト用の概要です。',
    confidence: 'verified',
    region: 'global',
    updated: '2026-10-08',
    aliases: '[Test Alias]',
    sources: [
      '',
      '  - id: S01',
      '    title: テスト出典',
      '    url: https://example.com/a',
      '    date: 2026-10-01',
      '    kind: guide',
    ].join('\n'),
    ...options.overrides,
  };
  const lines = Object.entries(fields)
    .filter(([key]) => !options.omit?.includes(key))
    .map(([key, value]) => `${key}:${value.startsWith('\n') ? '' : ' '}${value}`);
  return `---\n${lines.join('\n')}\n${options.extra ?? ''}---\n\n${options.body ?? '本文です。根拠：[S01]\n\n## 見出し\n\n内容。\n'}`;
}
