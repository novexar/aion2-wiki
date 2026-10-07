import { execFileSync } from 'node:child_process';

/**
 * contentDir 配下の各ファイルの最終コミット日時（ISO 8601）を返す。キーは contentDir からの相対パス（`/` 区切り）。
 * git が使えない・履歴がない場合は空の Map を返し、呼び出し側が frontmatter の updated に戻す。
 */
export function readGitDates(contentDir: string): ReadonlyMap<string, string> {
  const dates = new Map<string, string>();
  let out: string;
  try {
    out = execFileSync(
      'git',
      ['-C', contentDir, 'log', '--relative', '--format=@@%cI', '--name-only', '--', '.'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
    );
  } catch {
    return dates;
  }
  let current = '';
  for (const line of out.split('\n')) {
    if (line.startsWith('@@')) current = line.slice(2).trim();
    else if (line.trim() && current && !dates.has(line.trim())) dates.set(line.trim(), current);
  }
  return dates;
}
