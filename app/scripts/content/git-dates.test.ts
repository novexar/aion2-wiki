import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readGitDates } from './git-dates';

const dirs: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'git-dates-'));
  dirs.push(dir);
  return dir;
}
const run = (cwd: string, args: string[], env: NodeJS.ProcessEnv = {}) =>
  execFileSync('git', args, { cwd, env: { ...process.env, ...env }, stdio: 'ignore' });

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('readGitDates', () => {
  it('リポジトリ内のファイル（非 ASCII パス含む）の最終コミット日を返す', () => {
    const repo = tempDir();
    run(repo, ['init', '-q']);
    run(repo, ['config', 'user.email', 't@example.com']);
    run(repo, ['config', 'user.name', 't']);
    mkdirSync(join(repo, 'content', 'tips'), { recursive: true });
    writeFileSync(join(repo, 'content', 'tips', 'あ.md'), 'x');
    writeFileSync(join(repo, 'content', 'tips', 'a.md'), 'x');
    run(repo, ['add', '.']);
    run(repo, ['commit', '-q', '-m', 'init'], {
      GIT_COMMITTER_DATE: '2026-01-02T03:04:05+09:00',
      GIT_AUTHOR_DATE: '2026-01-02T03:04:05+09:00',
    });
    const warnings: string[] = [];
    const dates = readGitDates(join(repo, 'content'), (m) => warnings.push(m));
    expect(dates.get('tips/a.md')).toBe('2026-01-02T03:04:05+09:00');
    expect(dates.get('tips/あ.md')).toBe('2026-01-02T03:04:05+09:00');
    expect(warnings).toEqual([]);
  });

  it('git リポジトリでなければ警告して空の Map を返す', () => {
    const dir = tempDir();
    const warnings: string[] = [];
    expect(readGitDates(dir, (m) => warnings.push(m)).size).toBe(0);
    expect(warnings).toHaveLength(1);
  });
});
