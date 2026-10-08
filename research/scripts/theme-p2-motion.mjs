// テーマ Phase 2 のモーション確認（Issue #10）。
// 使い方: cd app && npm run build && npx vite preview --port 4183 、別端末で
//   npm i -D playwright（一時）→ BASE=http://localhost:4183/aion2-wiki node ../research/scripts/theme-p2-motion.mjs
// research/shots/theme-p2-motion-*.png と theme-p2-{home,article}-*.png を書き出し、計測値を標準出力に出す
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4183/aion2-wiki';
const OUT = fileURLToPath(new URL('../shots', import.meta.url));
const A1 = '/wiki/basics/character-creation';
const A2 = '/wiki/basics/chat-and-social';
const SIDEBAR = 'aside[aria-label="サイドバー"]';
const log = (...a) => console.log(...a);
const browser = await chromium.launch();

async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', ...opts });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => log('PAGEERROR', e.message));
  return p;
}
const wait = (p, ms) => p.waitForTimeout(ms);
const content = (p) => p.locator('main .grid > div.min-w-0').first();
const style = (loc, ...props) => loc.evaluate((el, ps) => ps.map((k) => getComputedStyle(el)[k]), props);

// ---------- (a) normal motion ----------
{
  const p = await page();
  await p.goto(BASE + A1);
  await p.waitForSelector('main h1');
  await p.evaluate(() => scrollTo(0, 600));
  await wait(p, 100);
  const sideBefore = await p.locator(SIDEBAR).boundingBox();
  await p.locator(`${SIDEBAR} a[href$="${A2}"]`).click();
  await wait(p, 40);
  const mid = await style(content(p), 'opacity', 'transform');
  const midScroll = await p.evaluate(() => scrollY);
  const sideMid = await p.locator(SIDEBAR).boundingBox();
  await p.screenshot({ path: `${OUT}/theme-p2-motion-route-1.png` });
  await wait(p, 300);
  await p.screenshot({ path: `${OUT}/theme-p2-motion-route-2.png` });
  const end = await style(content(p), 'opacity', 'transform');
  log('route +40ms', JSON.stringify(mid), 'scrollY', midScroll, '| end', JSON.stringify(end));
  log('sidebar box before/mid', JSON.stringify(sideBefore), JSON.stringify(sideMid));

  log('url', p.url(), 'expanded', await p.locator(`${SIDEBAR} button[aria-expanded="true"]`).count());
  const btn = p.locator(`${SIDEBAR} button[aria-controls="nav-basics"]`);
  const h0 = (await p.locator(`${SIDEBAR} .nav-collapse`).first().boundingBox()).height;
  await btn.click();
  await wait(p, 90);
  const h1 = (await p.locator(`${SIDEBAR} .nav-collapse`).first().boundingBox())?.height;
  await p.screenshot({ path: `${OUT}/theme-p2-motion-sidebar-1.png`, clip: { x: 0, y: 0, width: 720, height: 900 } });
  await wait(p, 300);
  const gone = await p.locator(`${SIDEBAR} .nav-collapse`).count();
  await btn.click();
  await wait(p, 90);
  const h2 = (await p.locator(`${SIDEBAR} .nav-collapse`).first().boundingBox()).height;
  await p.screenshot({ path: `${OUT}/theme-p2-motion-sidebar-2.png`, clip: { x: 0, y: 0, width: 720, height: 900 } });
  await wait(p, 300);
  const h3 = (await p.locator(`${SIDEBAR} .nav-collapse`).first().boundingBox()).height;
  log('sidebar h full', h0, 'closing+90', h1, 'count after close', gone, 'opening+90', h2, 'open', h3);

  const marker = p.locator('[data-toc-marker]');
  const tocLinks = p.locator('nav[aria-label="目次"] a[data-toc-id]');
  const n = await tocLinks.count();
  if (n >= 3) {
    await tocLinks.nth(0).click();
    await wait(p, 800);
    const y0 = Math.round((await marker.boundingBox())?.y ?? -1);
    await tocLinks.nth(n - 1).click();
    const ys = [];
    for (let i = 0; i < 14; i++) {
      ys.push(Math.round((await marker.boundingBox())?.y ?? -1));
      await wait(p, 30);
    }
    const target = Math.round((await tocLinks.nth(n - 1).boundingBox()).y);
    log('toc marker start', y0, 'samples', ys.join(','), 'target link y', target);
  } else log('toc links', n);

  await p.locator('#chat-toggle').click();
  await wait(p, 100);
  const tfOpen = (await style(p.locator('#chat-panel'), 'transform'))[0];
  await wait(p, 400);
  const tfOpened = (await style(p.locator('#chat-panel'), 'transform'))[0];
  await p.locator('#chat-toggle').click();
  await wait(p, 80);
  const closing = await p.locator('#chat-panel').evaluate((el) => [el.hidden, getComputedStyle(el).transform]);
  await wait(p, 300);
  const closed = await p.locator('#chat-panel').evaluate((el) => el.hidden);
  log('chat open+100', tfOpen, 'opened', tfOpened, 'closing+80', JSON.stringify(closing), 'closed hidden', closed);
  await p.context().close();
}

// ---------- home stagger ----------
{
  const p = await page();
  await p.goto(BASE + '/');
  await wait(p, 40);
  const ops = await p
    .locator('section[aria-labelledby="categories-title"] li')
    .evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity).toFixed(2)));
  await p.screenshot({ path: `${OUT}/theme-p2-motion-home-stagger.png`, clip: { x: 0, y: 150, width: 1440, height: 520 } });
  log('home stagger opacities @~40ms', ops.join(','));
  await p.reload();
  await wait(p, 30);
  const again = await p
    .locator('section[aria-labelledby="categories-title"] li')
    .evaluateAll((els) => els.some((e) => e.className.includes('home-rise')));
  log('home-rise after reload (same session)?', again);
  await p.context().close();
}

// ---------- mobile drawer / toc ----------
{
  const p = await page({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await p.goto(BASE + A1);
  await p.waitForSelector('main h1');
  await p.locator('button[aria-label="メニューを開く"]').click();
  await wait(p, 80);
  const dx = (await p.locator('[role="dialog"]').boundingBox()).x;
  await wait(p, 300);
  const dx2 = (await p.locator('[role="dialog"]').boundingBox()).x;
  await p.keyboard.press('Escape');
  await wait(p, 60);
  const closingCount = await p.locator('[role="dialog"]').count();
  await wait(p, 300);
  log('drawer x +80/open', Math.round(dx), Math.round(dx2), 'present while closing', closingCount, 'after', await p.locator('[role="dialog"]').count());
  const det = p.locator('details.toc-details');
  if (await det.count()) {
    const hc = (await det.boundingBox()).height;
    await det.locator('summary').click();
    await wait(p, 90);
    const hm = (await det.boundingBox()).height;
    await wait(p, 300);
    const he = (await det.boundingBox()).height;
    log('mobile toc height closed/+90/end', Math.round(hc), Math.round(hm), Math.round(he));
  }
  await p.context().close();
}

// ---------- (b) reduced motion ----------
{
  const p = await page({ reducedMotion: 'reduce' });
  await p.goto(BASE + A1);
  await p.waitForSelector('main h1');
  await p.locator(`${SIDEBAR} a[href$="${A2}"]`).click();
  await wait(p, 30);
  const mid = await style(content(p), 'opacity', 'transform');
  await p.screenshot({ path: `${OUT}/theme-p2-motion-reduced-route.png` });
  const btn = p.locator(`${SIDEBAR} button[aria-controls="nav-basics"]`);
  await btn.click();
  await wait(p, 30);
  const cnt = await p.locator(`${SIDEBAR} .nav-collapse`).count();
  await btn.click();
  await wait(p, 30);
  const h = (await p.locator(`${SIDEBAR} .nav-collapse`).first().boundingBox()).height;
  await p.screenshot({ path: `${OUT}/theme-p2-motion-reduced-sidebar.png`, clip: { x: 0, y: 0, width: 720, height: 900 } });
  const tocLinks = p.locator('nav[aria-label="目次"] a[data-toc-id]');
  const n = await tocLinks.count();
  let tocJump = 'n/a';
  if (n >= 3) {
    await tocLinks.nth(n - 1).click();
    await wait(p, 30);
    const my = Math.round((await p.locator('[data-toc-marker]').boundingBox()).y);
    const ty = Math.round((await tocLinks.nth(n - 1).boundingBox()).y);
    tocJump = `${my} vs link ${ty}`;
  }
  await p.locator('#chat-toggle').click();
  await wait(p, 30);
  const tf = (await style(p.locator('#chat-panel'), 'transform'))[0];
  await p.goto(BASE + '/');
  await p.evaluate(() => sessionStorage.clear());
  await p.reload();
  await wait(p, 20);
  const ops = await p
    .locator('section[aria-labelledby="categories-title"] li')
    .evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)));
  log('REDUCED route+30', JSON.stringify(mid), '| sidebar count after close+30', cnt, 'reopen+30 h', h, '| chat+30', tf, '| toc marker+30', tocJump, '| home min opacity', Math.min(...ops));
  await p.context().close();
}

// ---------- static shots ----------
for (const scheme of ['light', 'dark']) {
  for (const w of [1440, 390]) {
    for (const [name, path] of [['home', '/'], ['article', A1]]) {
      const p = await page({ viewport: { width: w, height: w > 500 ? 900 : 844 }, colorScheme: scheme });
      await p.goto(BASE + path);
      await p.waitForSelector('main h1, main h2');
      await wait(p, 600);
      await p.screenshot({ path: `${OUT}/theme-p2-${name}-${w}-${scheme}.png` });
      await p.context().close();
    }
  }
}
await browser.close();
