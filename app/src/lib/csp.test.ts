// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

describe('Content-Security-Policy', () => {
  const csp = /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/.exec(html)?.[1] ?? '';

  it('is present and restricts scripts to same origin', () => {
    expect(csp).toContain("default-src 'self'");
    expect(csp).toMatch(/script-src 'self'(;|$)/);
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).toContain("object-src 'none'");
  });

  it('only allows the Gemini API as an external connection', () => {
    const connect = /connect-src ([^;]+)/.exec(csp)?.[1] ?? '';
    expect(connect.split(' ')).toEqual(["'self'", 'https://generativelanguage.googleapis.com']);
  });

  it('has no inline scripts (theme init is an external file)', () => {
    expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
    expect(html).toContain('theme-init.js');
  });
});
