import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { normalizeBase } from './src/lib/paths';

const base = normalizeBase(process.env.BASE_PATH ?? '/aion2-wiki/');

/** GitHub Pages 用: SPA フォールバックの 404.html と .nojekyll を出力する */
function githubPagesPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'aion2-github-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await copyFile(path.join(outDir, 'index.html'), path.join(outDir, '404.html'));
      await writeFile(path.join(outDir, '.nojekyll'), '');
    },
  };
}

/** 開発サーバーは HMR 用のインラインスクリプトと WebSocket を使うため CSP を緩める（本番ビルドには影響しない） */
function devCspPlugin(): Plugin {
  return {
    name: 'aion2-dev-csp',
    apply: 'serve',
    transformIndexHtml: (html) =>
      html
        .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
        .replace("connect-src 'self'", "connect-src 'self' ws: http://localhost:*"),
  };
}

/**
 * Noto Sans JP の @font-face を調整する。
 * - font-display: optional: 初回は代替フォントで描画し、遅れて届いたフォントで全文を組み直さない（CLS 0）
 * - woff フォールバックを外す（woff2 は全ブラウザで使え、dist のファイル数が半分になる）
 */
function fontFacePlugin(): Plugin {
  return {
    name: 'aion2-font-face',
    enforce: 'pre',
    transform(code, id) {
      if (!/@fontsource[\\/]noto-sans-jp[\\/].*\.css$/.test(id.split('?')[0] ?? '')) return null;
      const next = code
        .replaceAll('font-display: swap', 'font-display: optional')
        .replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g, '');
      return { code: next, map: null };
    },
  };
}

/** 先読みする文字（ひらがな・カタカナ・英小文字・句読点・頻出漢字）。これらを含む 400 の分割を preload する */
const PRELOAD_PROBES = ['あ', 'ア', 'a', '、', '日', '本'].map((c) => c.codePointAt(0) ?? 0);

function inUnicodeRange(range: string, codePoint: number): boolean {
  return range.split(',').some((part) => {
    const [from, to = from] = part.replace('U+', '').split('-');
    return codePoint >= parseInt(from ?? '', 16) && codePoint <= parseInt(to ?? '', 16);
  });
}

/** 初期表示で必ず使う分割だけを <link rel="preload"> にする（約 90 ファイルの中から数本） */
function fontPreloadPlugin(): Plugin {
  return {
    name: 'aion2-font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const css = Object.values(ctx.bundle ?? {}).find(
          (file) => file.type === 'asset' && file.fileName.endsWith('.css'),
        );
        const source = css?.type === 'asset' ? String(css.source) : '';
        const hrefs = new Set<string>();
        for (const face of source.match(/@font-face\{[^}]*\}/g) ?? []) {
          if (!face.includes('font-weight:400')) continue;
          const range = /unicode-range:([^;}]*)/.exec(face)?.[1] ?? '';
          const url = /url\(([^)]+\.woff2)\)/.exec(face)?.[1];
          if (url && PRELOAD_PROBES.some((cp) => inUnicodeRange(range, cp))) hrefs.add(url);
        }
        return [...hrefs].map((href) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    fontFacePlugin(),
    react(),
    tailwindcss(),
    fontPreloadPlugin(),
    githubPagesPlugin(),
    devCspPlugin(),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@google/genai')) return 'genai';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/'))
            return 'react';
          if (id.includes('node_modules/react-router')) return 'router';
          return undefined;
        },
      },
    },
  },
});
