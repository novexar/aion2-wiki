// レビュー2 Phase A のスクリーンショット。使い方: cd app && npm run build && npx vite preview --port 4190 、別端末で
//   npm i --no-save playwright && BASE=http://localhost:4190/aion2-wiki node r2a-shots.mjs
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:4190/aion2-wiki';
const OUT = '../research/shots';
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const shot = async (name, vp, fn) => {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
    await fn(p);
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/r2a-${name}-${scheme}.png` });
    await ctx.close();
  };
  await shot('table-m', { width: 390, height: 900 }, async (p) => {
    await p.goto(BASE + '/wiki/basics/glossary');
    await p.waitForSelector('.table-wrap');
    await p.locator('.table-wrap').first().scrollIntoViewIfNeeded();
  });
  await shot('article-d', { width: 1440, height: 900 }, async (p) => {
    await p.goto(BASE + '/wiki/classes/gladiator');
    await p.waitForSelector('main h1');
    await p.locator('sup.evidence').first().scrollIntoViewIfNeeded();
  });
  await shot('tag-d', { width: 1440, height: 900 }, async (p) => {
    await p.goto(BASE + '/index?view=tag');
    await p.waitForSelector('main h1');
  });
  await shot('drawer-m', { width: 390, height: 900 }, async (p) => {
    await p.goto(BASE + '/');
    await p.getByRole('button', { name: 'メニューを開く' }).click();
  });
  await shot('chat-d', { width: 1440, height: 900 }, async (p) => {
    await p.goto(BASE + '/');
    await p.getByRole('button', { name: 'AI チャット' }).first().click();
    await p.waitForSelector('text=Google AI Studio');
  });
  await shot('home-d', { width: 1440, height: 900 }, async (p) => p.goto(BASE + '/'));
  await shot('toc-1280', { width: 1280, height: 800 }, async (p) => {
    await p.goto(BASE + '/wiki/classes/gladiator');
    await p.waitForSelector('main h1');
  });
}
await browser.close();
