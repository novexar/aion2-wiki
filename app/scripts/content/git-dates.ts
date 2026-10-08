import { execFileSync } from 'node:child_process';

type Warn = (message: string) => void;

function git(contentDir: string, args: readonly string[]): string {
  return execFileSync('git', ['-C', contentDir, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * contentDir 配下の各ファイルの最終コミット日時（ISO 8601）を返す。キーは contentDir からの相対パス（`/` 区切り）。
 * git が使えない・履歴がない・shallow clone（全ファイルが同じ日付になる）の場合は警告して空の Map を返し、
 * 呼び出し側が frontmatter の updated に戻す。
 */
export function readGitDates(
  contentDir: string,
  warn: Warn = (message) => console.warn(`[content] 警告: ${message}`),
): ReadonlyMap<string, string> {
  const dates = new Map<string, string>();
  let out: string;
  try {
    if (git(contentDir, ['rev-parse', '--is-shallow-repository']).trim() === 'true') {
      warn('shallow clone のため git の更新日を使えません（frontmatter の updated を使います）');
      return dates;
    }
    // core.quotepath=off: 非 ASCII のパスを引用符付きで出力させない
    out = git(contentDir, [
      '-c',
      'core.quotepath=off',
      'log',
      '--relative',
      '--format=@@%cI',
      '--name-only',
      '--',
      '.',
    ]);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    warn(`git の更新日を取得できませんでした（frontmatter の updated を使います）: ${reason}`);
    return dates;
  }
  let current = '';
  for (const line of out.split('\n')) {
    if (line.startsWith('@@')) current = line.slice(2).trim();
    else if (line.trim() && current && !dates.has(line.trim())) dates.set(line.trim(), current);
  }
  return dates;
}
