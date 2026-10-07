import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const base = process.env.BASE_PATH ?? '/aion2-wiki/';

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

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), githubPagesPlugin()],
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
