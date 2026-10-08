// レビュー2 Phase D のスクリーンショット。使い方: cd app && npm run build && npx vite preview --port 4191 、別端末で
//   npm i --no-save playwright && BASE=http://localhost:4191/aion2-wiki node ../research/scripts/r2d-shots.mjs
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:4191/aion2-wiki';
const OUT = '../research/shots';
const browser = await chromium.launch();
const shot = async (name, vp, scheme, fn, fullPage = false) => {
  const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await fn(p);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/r2d-${name}-${scheme}.png`, fullPage });
  if (name.startsWith('home-1440')) {
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    console.log(name, scheme, 'scrollHeight', h, 'screens', (h / vp.height).toFixed(2));
  }
  await ctx.close();
};
const home = (p) => p.goto(BASE + '/').then(() => p.waitForSelector('#week-title, #categories-title'));
for (const scheme of ['light', 'dark']) {
  await shot('home-1440', { width: 1440, height: 900 }, scheme, home, true);
  await shot('home-1920', { width: 1920, height: 1080 }, scheme, home, true);
}
await shot('home-390', { width: 390, height: 844 }, 'light', home, true);
await shot('index-1440', { width: 1440, height: 900 }, 'light', async (p) => {
  await p.goto(BASE + '/index');
  await p.waitForSelector('#index-panel section');
});
await shot('index-latin-1440', { width: 1440, height: 900 }, 'light', async (p) => {
  await p.goto(BASE + '/index?view=latin');
  await p.waitForSelector('#index-panel section');
});
await shot('category-1440', { width: 1440, height: 900 }, 'light', async (p) => {
  await p.goto(BASE + '/wiki/basics');
  await p.waitForSelector('main h1');
});
for (const [slug, q] of [['odo', 'オード'], ['ken', '剣'], ['o1', 'オ']]) {
  await shot(`search-${slug}-1440`, { width: 1440, height: 900 }, 'light', async (p) => {
    await p.goto(BASE + '/search?q=' + encodeURIComponent(q));
    await p.waitForSelector('main ul li');
  }, slug === 'ken');
}
await shot('search-blank-1440', { width: 1440, height: 900 }, 'light', async (p) => {
  await p.goto(BASE + '/search');
  await p.waitForSelector('main h1');
});
await shot('palette-1440', { width: 1440, height: 900 }, 'light', async (p) => {
  await p.goto(BASE + '/wiki/basics');
  await p.waitForSelector('main h1');
  await p.keyboard.press('Control+K');
  await p.waitForSelector('[role="dialog"] [role="option"]');
});
await shot('palette-390', { width: 390, height: 844 }, 'light', async (p) => {
  await p.goto(BASE + '/wiki/basics');
  await p.waitForSelector('main h1');
  await p.getByRole('button', { name: 'サイト内検索を開く' }).first().click();
  await p.waitForSelector('[role="dialog"] [role="option"]');
});
await browser.close();
