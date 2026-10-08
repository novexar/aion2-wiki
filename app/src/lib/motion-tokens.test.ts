import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DURATION, EASE, MAX_DURATION_MS } from './motion-tokens';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

describe('motion tokens', () => {
  it('CSS の --d-* と TS の DURATION が一致する', () => {
    expect(css).toContain(`--d-fast: ${DURATION.fast * 1000}ms`);
    expect(css).toContain(`--d-base: ${DURATION.base * 1000}ms`);
    expect(css).toContain(`--d-slow: ${DURATION.slow * 1000}ms`);
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
