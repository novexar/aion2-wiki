// fetch 互換の curl トランスポート。
// aion2.gaming.tools などは Cloudflare が Node (undici) の TLS 指紋を弾くため（403 / cf-mitigated: challenge）、
// 既定では OS 付属の curl で取得する。curl が無い環境では呼び出し側が標準 fetch に切り替える。
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const MAX_BODY_BYTES = 32 * 1024 * 1024;

function run(args, execFileImpl = execFile) {
  return new Promise((resolve, reject) => {
    execFileImpl(
      'curl',
      args,
      { encoding: 'buffer', maxBuffer: MAX_BODY_BYTES, windowsHide: true },
      (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      },
    );
  });
}

export async function isCurlAvailable() {
  try {
    await run(['--version']);
    return true;
  } catch {
    return false;
  }
}

/** ヘッダーダンプ（リダイレクト時は複数ブロック）から最後の応答を { status, headers } にする。 */
export function parseHeaderDump(text) {
  const blocks = text
    .split(/\r?\n\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.startsWith('HTTP/'));
  const last = blocks.at(-1) ?? '';
  const [statusLine = '', ...lines] = last.split(/\r?\n/);
  const status = Number(/^HTTP\/\S+\s+(\d{3})/.exec(statusLine)?.[1] ?? 0);
  const headers = new Headers();
  for (const line of lines) {
    const i = line.indexOf(':');
    if (i > 0) headers.append(line.slice(0, i).trim(), line.slice(i + 1).trim());
  }
  return { status, headers };
}

function toCurlError(error, timeoutMs) {
  // curl の終了コード 28 はタイムアウト
  if (error?.code === 28)
    return Object.assign(new Error(`timeout ${timeoutMs}ms`), { name: 'TimeoutError' });
  return Object.assign(new Error(`curl 失敗 (終了コード ${error?.code ?? '?'})`), {
    cause: { code: `curl-${error?.code ?? '?'}` },
  });
}

export function createCurlFetch({ timeoutMs = 15_000, execFileImpl = execFile } = {}) {
  return async function curlFetch(url, init = {}) {
    const dir = await mkdtemp(path.join(tmpdir(), 'aion2-watch-'));
    const headerFile = path.join(dir, 'headers.txt');
    const method = init.method ?? 'GET';
    const args = [
      '-sS',
      '-L',
      '--max-redirs',
      '5',
      '--max-time',
      String(Math.ceil(timeoutMs / 1000)),
      '-D',
      headerFile,
    ];
    for (const [key, value] of Object.entries(init.headers ?? {})) {
      if (key.toLowerCase() === 'user-agent') args.push('-A', value);
      else if (key.toLowerCase() === 'range') args.push('-r', String(value).replace(/^bytes=/, ''));
      else args.push('-H', `${key}: ${value}`);
    }
    if (method === 'HEAD') args.push('-I');
    args.push('--', url);
    try {
      const body = await run(args, execFileImpl);
      const { status, headers } = parseHeaderDump(await readFile(headerFile, 'utf8'));
      return {
        ok: status >= 200 && status < 300,
        status,
        headers,
        text: async () => body.toString('utf8'),
        body: { cancel: async () => {} },
      };
    } catch (error) {
      throw toCurlError(error, timeoutMs);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  };
}
