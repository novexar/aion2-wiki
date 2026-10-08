// レビュー2 Phase E のスクリーンショット。使い方: cd app && npm run build && npx vite preview --port 4190 、別端末で
//   npm i --no-save playwright && node r2e-shots.mjs   (research/scripts/ にコピーして使う場合は app/ から実行)
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:4190/aion2-wiki';
const OUT = process.env.OUT ?? '../research/shots';
const browser = await chromium.launch();

const now = Date.now();
const convs = [
  ['c1', 'ギーナの稼ぎ方', now - 60_000],
  ['c2', '毎日やること', now - 3_600_000],
  ['c3', '報酬キューブを開けるのに必要なもの', now - 86_400_000],
  ['c4', '存在しない質問', now - 172_800_000],
];

async function seed(page) {
  await page.evaluate(
    async ({ convs, now }) => {
      const db = await new Promise((res, rej) => {
        const r = indexedDB.open('aion2wiki-chat');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const tx = db.transaction(['conversations', 'messages'], 'readwrite');
      for (const [id, title, t] of convs) {
        tx.objectStore('conversations').put({ id, title, createdAt: t, updatedAt: t });
        tx.objectStore('messages').put({ id: `${id}-u`, conversationId: id, role: 'user', content: title, citations: [], createdAt: t });
        const answer =
          id === 'c4'
            ? 'この Wiki に該当する記事がありません。'
            : '毎日の日課は**オードエネルギー**の消費と日課クエストです。\n\n- 日課クエスト\n- 遠征の消化\n- 週間コンテンツの確認';
        tx.objectStore('messages').put({ id: `${id}-m`, conversationId: id, role: 'model', content: answer, citations: [], createdAt: t + 1 });
      }
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    },
    { convs, now },
  );
}

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto(BASE + '/');
  await p.evaluate(() => localStorage.setItem('aion2wiki:gemini-api-key', 'AIzaSyTEST_1234567890abcdef'));
  await p.getByRole('button', { name: 'AI チャット' }).first().click();
  await p.waitForSelector('#chat-input');
  await seed(p);
  await p.reload();
  if (!(await p.locator('#chat-panel').isVisible())) {
    await p.getByRole('button', { name: 'AI チャット' }).first().click();
  }
  await p.waitForSelector('#chat-input');
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/r2e-chat-view-d-${scheme}.png` });
  await p.getByRole('button', { name: '履歴', exact: true }).click();
  await p.waitForSelector('ul[aria-label="履歴"]');
  await p.locator('ul[aria-label="履歴"] li').first().hover();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/r2e-chat-history-d-${scheme}.png` });
  await ctx.close();

  const shot = async (name, vp, fn) => {
    const c = await browser.newContext({ viewport: vp, colorScheme: scheme });
    const pg = await c.newPage();
    pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
    await fn(pg);
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: `${OUT}/r2e-${name}-${scheme}.png` });
    await c.close();
  };
  await shot('settings-d', { width: 1440, height: 900 }, async (pg) => {
    await pg.goto(BASE + '/settings');
    await pg.waitForSelector('main h1');
  });
  await shot('settings-m', { width: 390, height: 1100 }, async (pg) => {
    await pg.goto(BASE + '/settings');
    await pg.waitForSelector('main h1');
  });
  await shot('about-d', { width: 1440, height: 900 }, async (pg) => {
    await pg.goto(BASE + '/about');
    await pg.waitForSelector('main h1');
  });
  await shot('404-d', { width: 1440, height: 900 }, async (pg) => {
    await pg.goto(BASE + '/no-such-page');
    await pg.waitForSelector('main h1');
  });
  await shot('article-drawer-m', { width: 390, height: 900 }, async (pg) => {
    await pg.goto(BASE + '/wiki/classes/gladiator');
    await pg.waitForSelector('main h1');
    await pg.getByRole('button', { name: 'メニューを開く' }).click();
  });
  await shot('chat-sheet-m', { width: 390, height: 844 }, async (pg) => {
    await pg.goto(BASE + '/');
    await pg.getByRole('button', { name: 'AI チャット' }).first().click();
    await pg.waitForSelector('text=Google AI Studio');
  });
}
await browser.close();
