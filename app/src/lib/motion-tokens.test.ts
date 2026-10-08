import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DURATION, EASE, MAX_DURATION_MS, PANEL_MS } from './motion-tokens';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

describe('motion tokens', () => {
  it('CSS の --d-* と TS の DURATION が一致する', () => {
    expect(css).toContain(`--d-fast: ${DURATION.fast * 1000}ms`);
    expect(css).toContain(`--d-base: ${DURATION.base * 1000}ms`);
    expect(css).toContain(`--d-slow: ${DURATION.slow * 1000}ms`);
  });

  it('CSS の .chat-panel と TS の PANEL_MS が一致する', () => {
    expect(css).toContain(`transition: transform ${PANEL_MS.close}ms var(--ease-in)`);
    expect(css).toContain(`transition: transform ${PANEL_MS.open}ms var(--ease-out)`);
  });

  it('CSS の --ease-* と TS の EASE が一致する', () => {
    const bezier = (b: readonly number[]) => `cubic-bezier(${b.join(', ')})`;
    expect(css).toContain(`--ease-std: ${bezier(EASE.std)}`);
    expect(css).toContain(`--ease-out: ${bezier(EASE.out)}`);
    expect(css).toContain(`--ease-in: ${bezier(EASE.in)}`);
  });

  it('全 duration が 320ms 以下で、transition: all を使わない', () => {
    expect(Math.max(...Object.values(DURATION)) * 1000).toBeLessThanOrEqual(MAX_DURATION_MS);
    expect(css).not.toMatch(/transition:\s*all/);
  });
});

describe('reduced motion', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  const reduceBlocks = [
    ...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g),
  ]
    .map((m) => m[1] ?? '')
    .join('\n');

  it('motion は OS の設定に従う', () => {
    expect(app).toContain('reducedMotion="user"');
  });

  it('CSS の animation／transition は reduce で実質 0 になり、スケルトンは止まる', () => {
    expect(reduceBlocks).toMatch(/animation-duration: 0\.01ms !important/);
    expect(reduceBlocks).toMatch(/transition-duration: 0\.01ms !important/);
    expect(reduceBlocks).toMatch(/\.skeleton-bar \{\s*animation: none/);
  });

  it('無限ループの animation はスケルトンだけ', () => {
    expect(css.match(/infinite/g)).toHaveLength(1);
    expect(css).toMatch(/\.skeleton-bar \{\s*animation: skeleton-pulse[^;]*infinite/);
  });
});
