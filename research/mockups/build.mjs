// 方針検討用モックアップ生成: node research/mockups/build.mjs → a-aether-line.html / b-navy-banner.html / c-atreia-dual.html
// 文言は live サイト（2026-10-08）と content/basics/game-overview.md から転記。URL パラメータ ?theme=dark&page=article で切替。
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens } from './contrast.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const categories = [
  ['初心者ガイド', 7, '最初の 1 週間・Lv45 まで・日課', ['初日ガイド', '1週目ガイド', 'IL700→1400ガイド']],
  ['基本', 35, '操作・用語・アカウント・キャラクター', ['AION2とは', '対応環境と必要スペック', 'Steam版とPURPLE版']],
  ['レベリング', 23, 'Lv1〜45・覚醒・IL 上げ', ['レベル上げ1〜45', '天族ルート', '魔族ルート']],
  ['システム', 43, 'スキル・スティグマ・強化・製作', ['スキルと特化', 'スティグマ', 'スキルのリセット']],
  ['ダンジョン', 34, '遠征・超越・悪夢・レイド・フィールドボス', ['ダンジョンの種類', '遠征の基本', 'オードエネルギー']],
  ['経済', 19, 'ギーナ・取引所・メンバーシップ', ['通貨一覧', 'ギーナと刻印ギーナ', 'キューナ']],
  ['クラス', 14, '8 クラスの個別記事', ['グラディエーター', 'テンプラー', 'アサシン']],
  ['PvP', 13, 'アビス・要塞戦・アリーナ', ['PvPの全体像', 'アビスの概要', 'アビスポイントとショップ']],
  ['小技', 21, '時短・設定・落とし穴', ['初心者がやりがちな失敗', '取り返しのつかない要素', '初日チェックリスト']],
  ['FAQ', 9, 'よくある質問', ['FAQ アカウント', 'FAQ キャラクター', 'FAQ 経済']],
  ['ニュース', 17, '公式告知・既知の問題・韓国版との差', ['グローバル版の日程', '公式ローンチFAQ', '既知の不具合と回避策']],
];
const daily = ['日課と週課チェック', 'リセット時刻', '使命クエスト', 'シューゴフェスタ', '次元侵攻', 'デイリーダンジョン'];
const basicsArticles = ['AION2とは', '対応環境と必要スペック', 'Steam版とPURPLE版', 'NCアカウントとPURPLE', 'リージョンとサーバー', 'サーバー移動', '天族と魔族の違い', 'ストーリーと世界観', 'クラス一覧', 'おすすめクラス', 'キャラクター作成', 'キャラクター削除と作り直し', '基本操作とキー設定', '画面とメニュー名', 'おすすめ設定', 'コントローラー対応', 'ゲーム内マクロ', '戦闘の基本', 'ステータスの意味', 'ダメージ計算の仕組み', '状態異常', '飛行とグライド', '移動の基本', '死亡と復活', 'パーティとマッチング', '役割とパーティバフ', 'レギオン', 'チャットとフレンド'];
const toc = ['基本情報', '世界観をひとことで', '前作 AION を知らなくても大丈夫？', 'グローバル版の仕様（2026年10月時点）', 'グローバル版開始までの経緯', '韓国版との関係'];

const a = (t) => `<a href="#">${t}</a>`;
const src = (ids) => `<p class="src">出典: ${ids.map((i) => `<a href="#">[${i}]</a>`).join(' ')}</p>`;
const table = (rows, head) => `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
  .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
  .join('')}</tbody></table></div>`;

const header = `
<header class="hdr">
  <div class="wrap hdr-in">
    <button class="icon-btn menu" aria-label="メニューを開く"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
    <a class="logo" href="#"><span class="logo-mark" aria-hidden="true"></span>AION2 非公式Wiki</a>
    <nav class="hdr-nav" aria-label="メイン"><a href="#">索引</a><a href="#">このサイトについて</a></nav>
    <div class="hdr-right">
      <button class="hdr-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span>検索</span><kbd>Ctrl</kbd><kbd>K</kbd></button>
      <button class="icon-btn only-m" aria-label="検索"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
      <a class="hdr-chat" href="#">チャット</a>
      <button class="icon-btn" aria-label="設定"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>
    </div>
  </div>
</header>`;

const footer = `
<footer class="ftr"><div class="wrap ftr-in"><p>非公式のファンサイトです。NC（NCSOFT）とは関係ありません。</p><p><a href="#">このサイトについて</a><a href="#">GitHub</a></p></div></footer>`;

const home = `
<main class="home">
  <section class="band"><div class="wrap band-in">
    <h1>AION2 非公式Wiki</h1>
    <p class="desc">AION2（グローバル版）の攻略情報。235 記事、最終更新 2026-10-08。</p>
    <button class="searchbox"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span>検索</span><kbd>Ctrl</kbd><kbd>K</kbd></button>
  </div></section>
  <div class="wrap">
    <section class="cats">
      <h2 class="sec-title">カテゴリ</h2>
      <ul class="cat-list">${categories
        .map(
          ([l, n, d, leads], i) => `<li style="--i:${i}"><a class="cat-name" href="#">${l}</a><span class="cat-n">${n}</span><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg><div class="cat-body"><p class="cat-desc">${d}</p><p class="cat-leads">${leads.map(a).join(' · ')}</p></div></li>`,
        )
        .join('')}</ul>
    </section>
    <section class="daily"><h2>日課・週課</h2><ul>${daily.map((d) => `<li>${a(d)}</li>`).join('')}</ul></section>
    <p class="all"><a href="#">すべての記事（索引）</a></p>
  </div>
</main>`;

const sidebar = `
<aside class="side"><nav aria-label="カテゴリ"><ul class="side-cats">
  <li><button class="side-cat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg><span>初心者ガイド</span><span class="n">7</span></button></li>
  <li><button class="side-cat open"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg><span>基本</span><span class="n">35</span></button>
    <ul class="side-arts"><li><a href="#">一覧（35）</a></li>${basicsArticles.map((t, i) => `<li><a href="#"${i === 0 ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></li>
  ${categories.slice(2).map(([l, n]) => `<li><button class="side-cat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg><span>${l}</span><span class="n">${n}</span></button></li>`).join('')}
</ul></nav></aside>`;

const tocHtml = `
<aside class="toc"><p class="toc-title">目次</p><ul>${toc.map((t, i) => `<li><a href="#"${i === 0 ? ' class="active"' : ''}>${t}</a></li>`).join('')}</ul><a class="top" href="#">ページ上部へ</a></aside>
<details class="toc-m"><summary>目次<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></summary><ul>${toc.map((t) => `<li>${a(t)}</li>`).join('')}</ul></details>`;

const article = `
<main class="article">
  <div class="wrap shell">
    ${sidebar}
    <div class="body">
      <nav class="crumb" aria-label="パンくず"><a href="#">ホーム</a><span>›</span><a href="#">基本</a><span>›</span><span>AION2とは</span></nav>
      <header class="art-head">
        <h1>AION2とは</h1>
        <p class="aliases">AION 2、アイオン2、Aion 2 Global、グローバル版とは、エンジン、韓国版とグローバル版の経緯</p>
        <p class="meta"><span class="badge ok">検証済み</span><span>2026-10-08 更新</span></p>
      </header>
      ${tocHtml.split('<details')[1] ? `<details${tocHtml.split('<details')[1]}` : ''}
      <div class="prose">
        <p>AION2（アイオン2）は、NC（2026年3月までの社名は NCSOFT）が開発・運営する MMORPG です。2008年に韓国で始まり日本でも長く遊ばれた「AION（The Tower of Eternity）」の正統続編で、舞台は前作から200年後の世界です。韓国・台湾では2025年11月19日に先行サービスが始まり、日本を含むグローバル版は2026年10月5日（月）22:00（日本時間）に正式サービスを開始しました。基本プレイ無料で、PC（Steam / PURPLE）専用です。</p>
        ${src(['S01', 'S02', 'S03'])}
        <h2 id="h1">基本情報</h2>
        ${table(
          [
            ['タイトル', 'AION2（アイオン2）'],
            ['開発・運営', 'NC（旧 NCSOFT）。北米・南米・欧州・オセアニアは NC America、日本は NC Japan が窓口'],
            ['ジャンル', 'MMORPG（タンク・ヒーラー・DPS のロール制、5人パーティ、10人レイド）'],
            ['エンジン', 'Unreal Engine 5'],
            ['先行サービス', '韓国・台湾：2025年11月19日（PC とスマートフォンのクロスプレイ）'],
            ['グローバル版', '2026年9月30日 アーリーアクセス（ファウンダーズパック購入者）、10月5日 正式サービス。PC 専用'],
            ['料金', '基本プレイ無料。任意の月額メンバーシップ（日本：2,350円／30日、米国：$14.99）、ディーヴァパス、見た目中心のショップ'],
            ['日本公式サイト', '<a class="ext" href="#">https://aion2.ncsoft.jp/</a>'],
            ['公式 Discord', 'discord.gg/aion2official（NC 公式）。NC Japan は日本語サーバーを別途案内'],
          ],
          ['項目', '内容'],
        )}
        ${src(['S01', 'S02', 'S04', 'S05'])}
        <h2 id="h2">世界観をひとことで</h2>
        <p>AION2 の世界「アトレイア」は前作の約36倍の広さとされ、「見えるところは全部行ける」をコンセプトに、空の飛行だけでなく水中探索もできます。アイオンの塔が崩壊し、ディーヴァ（翼を持つ半神）たちが龍族（バラウル）の圧政の下で力を失いつつある時代が舞台です。プレイヤーは <strong>天族（Elyos）</strong> か <strong>魔族（Asmodian）</strong> のどちらかに所属し、両陣営は別々のサーバーで物語を進め、アビスなどの争奪地域で敵対します。詳しくは ${a('ストーリーと世界観')} と ${a('天族と魔族の違い')} を参照してください。</p>
        ${src(['S03', 'S06'])}
        <h2 id="h3">前作 AION を知らなくても大丈夫？</h2>
        <p>問題ありません。ストーリーは新規プレイヤーを前提に展開され、日本公式サイトでも世界観紹介「二つの世界の物語」が公開されています。前作経験者向けに言うと、「ほぼ制限なしの飛行」「転職なしでクラスを直接選択」「失敗しても壊れない装備強化」「PvP のオン／オフ」「ガチャなし」など、遊びやすさに関わる部分はほぼ全面的に作り直されています。</p>
        ${src(['S01', 'S06'])}
        <h2 id="h4">グローバル版の仕様（2026年10月時点）</h2>
        ${table(
          [
            ['レベル上限', '45'],
            ['クラス', '8種（グラディエーター、テンプラー、アサシン、レンジャー、ソーサラー、スピリットマスター、クレリック、チャンター）'],
            ['最高装備等級', '唯一（金）。シーズン1には英雄等級は実装しないと公式配信で明言'],
            ['シーズン', 'シーズン1は2026年9月30日〜12月16日 07:00 UTC（日本時間16:00）'],
            ['遠征（5人ダンジョン）', '6種。探険／征服の2モード'],
            ['聖域レイド（10人）', 'ルドラ（正式開始時に一時削除、再登場日は10月16日までに告知予定）'],
            ['言語', 'UI・字幕：日本語、英語、フランス語、ドイツ語、スペイン語、ポルトガル語（ブラジル）、ロシア語、韓国語。音声：日本語、英語、韓国語'],
            ['自動狩り', 'なし'],
            ['ガチャ', 'なし（有料の翼・ペットは見た目のみ）'],
          ],
          ['項目', 'グローバル版'],
        )}
        ${src(['S02', 'S04', 'S05'])}
        <div class="callout" data-kind="kr"><p><strong>韓国版のみ</strong>：韓国・台湾版は2026年7月1日の大型アップデート「Chapter 1. 砂と霜の地」でレベル上限50、9クラス目「拳星（Brawler）」が追加されています。グローバル版はおよそ1年遅れの内容で始まっており、これらは未実装です。グローバル版への実装時期は未発表です。</p></div>
        ${src(['S01', 'S03'])}
        <h2 id="h5">グローバル版開始までの経緯</h2>
        ${table(
          [
            ['2025-11-19', '韓国・台湾でサービス開始'],
            ['2026-04-21', 'グローバル版を2026年内に PC で提供すると発表'],
            ['2026-06-05', 'Summer Game Fest で9月リリースを予告'],
            ['2026-07-22', 'ファウンダーズパック販売開始'],
            ['2026-08-25', 'gamescom で10月5日の正式開始日を発表'],
            ['2026-09-17〜19', 'Launch Scale Test（誰でも参加可、Lv37 まで、データは全消去）'],
            ['2026-09-30', 'アーリーアクセス開始（日本時間23:00。予定は22:00だったが1時間遅延）'],
            ['2026-10-05', '正式サービス開始（日本時間22:00）。Steam 同時接続のピークは 397,905 人'],
            ['2026-10-07', '最初の定期メンテナンス'],
          ],
          ['日付', '出来事'],
        )}
        ${src(['S02', 'S04'])}
        <h2 id="h6">韓国版との関係</h2>
        <p>グローバル版は韓国・台湾版とは別サービスで、キャラクターや進行の引き継ぎはできません。コンテンツは共通の開発チームが作り、バランス調整は地域ごとに別チームが担当すると説明されています。韓国版の攻略情報を読むときは、レベル上限・クラス数・装備等級・経済仕様が違う点に注意してください。</p>
        ${src(['S01', 'S05'])}
        <h2 id="h7">関連記事</h2>
        <ul class="related">
          <li>${a('対応環境と必要スペック')} — 対応プラットフォームと必要スペック</li>
          <li>${a('Steam版とPURPLE版')} — Steam 版と PURPLE 版の違い</li>
          <li>${a('リージョンとサーバー')} — リージョンとサーバーの選び方</li>
          <li>${a('クラス一覧')} — 8クラスの一覧</li>
        </ul>
      </div>
    </div>
    ${tocHtml.split('<details')[0]}
  </div>
</main>`;

const vars = (t) => Object.entries(t).map(([k, v]) => `--${k}:${v};`).join('');

const baseCss = `
:root{${vars(tokens.light)}--header-h:56px;--gold:#c9a227;--gold-soft:rgb(201 162 39/.14);--aether-soft:rgb(61 130 191/.12);--kr-soft:rgb(106 63 192/.12);--radius:4px;--shadow:0 1px 2px rgb(0 0 0/.04),0 8px 24px rgb(0 0 0/.08);--ease-out:cubic-bezier(.2,.7,.2,1);--ease-std:cubic-bezier(.4,0,.2,1);--d-fast:120ms;--d-base:200ms;--d-slow:320ms}
[data-theme=dark]{${vars(tokens.dark)}--gold:#d4af37;--gold-soft:rgb(212 175 55/.16);--aether-soft:rgb(112 210 255/.1);--kr-soft:rgb(185 160 240/.12);--shadow:0 1px 2px rgb(0 0 0/.4),0 12px 32px rgb(0 0 0/.5)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--canvas);color:var(--fg);font:400 16px/1.6 'Noto Sans JP',system-ui,-apple-system,'Hiragino Sans','Yu Gothic UI',sans-serif;-webkit-font-smoothing:antialiased;min-width:320px}
a{color:inherit;text-decoration:none}
a:hover{text-decoration:underline;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);text-underline-offset:.2em}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
kbd{font:11px/1 ui-monospace,Menlo,Consolas,monospace;padding:3px 5px;border:1px solid var(--line-strong);border-radius:3px;color:var(--fg-subtle);background:var(--canvas)}
svg{flex:none}
.wrap{max-width:1360px;margin:0 auto;padding:0 40px}
@media(max-width:640px){.wrap{padding:0 16px}}
/* header */
.hdr{position:sticky;top:0;z-index:40;height:var(--header-h);background:var(--canvas);border-bottom:1px solid var(--line)}
.hdr-in{display:flex;align-items:center;gap:8px;height:100%}
.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:6px;color:var(--fg-muted);transition:background-color var(--d-fast) var(--ease-std),color var(--d-fast) var(--ease-std)}
.icon-btn:hover{background:var(--muted);color:var(--fg)}
.menu{display:none}
.logo{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:15px;white-space:nowrap}
.logo:hover{text-decoration:none}
.logo-mark{display:none}
.hdr-nav{display:flex;gap:2px;margin-left:16px}
.hdr-nav a{padding:6px 10px;border-radius:6px;font-size:14px;color:var(--fg-muted);transition:background-color var(--d-fast) var(--ease-std),color var(--d-fast) var(--ease-std)}
.hdr-nav a:hover{background:var(--muted);color:var(--fg);text-decoration:none}
.hdr-right{margin-left:auto;display:flex;align-items:center;gap:4px}
.hdr-search{display:flex;align-items:center;gap:8px;height:36px;width:256px;padding:0 10px;border:1px solid var(--line-input);border-radius:var(--radius);background:var(--surface);color:var(--fg-subtle);font-size:14px;transition:border-color var(--d-fast),color var(--d-fast)}
.hdr-search span{flex:1;text-align:left}
.hdr-search:hover{border-color:var(--fg-subtle);color:var(--fg-muted)}
.hdr-chat{padding:6px 10px;border-radius:6px;font-size:14px;color:var(--fg-muted)}
.only-m{display:none}
@media(max-width:900px){.menu{display:inline-flex}.hdr-nav{display:none}}
@media(max-width:640px){.hdr-search,.hdr-chat{display:none}.only-m{display:inline-flex}}
/* home */
.band-in{padding-top:32px}
.band h1{margin:0;font-size:20px;font-weight:600;line-height:1.4}
.desc{margin:4px 0 0;font-size:14px;color:var(--fg-muted)}
.searchbox{margin-top:16px;display:flex;align-items:center;gap:12px;height:40px;width:100%;max-width:672px;padding:0 12px;border:1px solid var(--line-input);border-radius:var(--radius);background:var(--canvas);color:var(--fg-subtle);font-size:16px;text-align:left;transition:border-color var(--d-fast),box-shadow var(--d-base) var(--ease-out)}
.searchbox span{flex:1}
.searchbox:hover{border-color:var(--fg-subtle);color:var(--fg-muted)}
.searchbox kbd{display:none}@media(min-width:640px){.searchbox kbd{display:inline-block}}
.cats{margin-top:48px}
.sec-title{margin:0;padding-bottom:8px;border-bottom:1px solid var(--line);font-size:18px;font-weight:700}
.cat-list{list-style:none;margin:0;padding:0;column-count:2;column-gap:40px}
@media(max-width:900px){.cat-list{column-count:1}}
.cat-list li{position:relative;break-inside:avoid;display:grid;grid-template-columns:112px 40px minmax(0,1fr);gap:0 12px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--line);animation:rise var(--d-slow) var(--ease-out) both;animation-delay:calc(var(--i)*24ms)}
.cat-name{font-weight:700}
.cat-n{text-align:right;font-size:13px;color:var(--fg-subtle);font-variant-numeric:tabular-nums}
.chev{display:none;color:var(--fg-subtle);align-self:center}
.cat-body{min-width:0;font-size:13px}
.cat-desc{margin:0;color:var(--fg-muted)}
.cat-leads{margin:2px 0 0;color:var(--fg-subtle)}
.cat-leads a{color:var(--fg)}
@media(max-width:640px){.cat-list li{grid-template-columns:minmax(0,1fr) auto auto}.cat-body{display:none}.chev{display:block}.cat-name::after{content:'';position:absolute;inset:0}}
.daily{margin-top:48px;display:flex;align-items:baseline;gap:24px}
.daily h2{margin:0;font-size:16px;font-weight:700;flex:none}
.daily ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;font-size:14px}
.daily li+li::before{content:'·';padding:0 8px;color:var(--fg-subtle)}
@media(max-width:640px){.daily{display:block}.daily h2{padding-bottom:8px;border-bottom:1px solid var(--line);font-size:18px}.daily ul{display:block}.daily li{border-bottom:1px solid var(--line);padding:8px 0}.daily li+li::before{content:none}}
.all{margin:32px 0 48px;font-size:14px}
.all a{color:var(--link);text-decoration:underline;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);text-underline-offset:.2em}
@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* footer */
.ftr{border-top:1px solid var(--line);margin-top:32px}
.ftr-in{display:flex;justify-content:space-between;gap:16px;padding:24px 40px;font-size:13px;color:var(--fg-subtle)}
.ftr p{margin:0}.ftr p a{margin-left:16px}
@media(max-width:640px){.ftr-in{flex-direction:column;padding:24px 16px}}
/* article shell */
.shell{display:grid;grid-template-columns:256px minmax(0,1fr) 240px;gap:0 40px;padding:0 40px}
@media(max-width:1100px){.shell{grid-template-columns:minmax(0,1fr)}.side,.toc{display:none}}
@media(max-width:640px){.shell{padding:0 16px}}
.side{border-right:1px solid var(--line);padding:24px 12px 24px 0}
.side-cats{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.side-cat{display:flex;align-items:center;gap:6px;width:100%;padding:6px;border-radius:6px;font-size:13px;font-weight:500;color:var(--fg-muted);text-align:left;transition:background-color var(--d-fast),color var(--d-fast)}
.side-cat:hover{background:var(--muted);color:var(--fg)}
.side-cat svg{color:var(--fg-subtle);transition:transform var(--d-base) var(--ease-out)}
.side-cat.open svg{transform:rotate(90deg)}
.side-cat .n{margin-left:auto;font-size:11px;font-weight:400;color:var(--fg-subtle);font-variant-numeric:tabular-nums}
.side-arts{list-style:none;margin:2px 0 8px 14px;padding:0 0 0 8px;border-left:1px solid var(--line)}
.side-arts a{display:block;padding:5px 8px;margin-left:-9px;border-left:2px solid transparent;border-radius:0 4px 4px 0;font-size:13px;color:var(--fg-muted);transition:background-color var(--d-fast),color var(--d-fast),border-color var(--d-fast)}
.side-arts a:hover{background:var(--muted);color:var(--fg);text-decoration:none}
.side-arts a[aria-current]{border-left-color:var(--gold);color:var(--fg);font-weight:500}
.body{padding:32px 0 48px}
.crumb{display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--fg-muted)}
.crumb span{color:var(--fg-subtle)}
.art-head{margin-top:16px}
.art-head h1{margin:0;font-size:28px;line-height:1.35;font-weight:700}
@media(max-width:640px){.art-head h1{font-size:24px}}
.aliases{margin:6px 0 0;font-size:13px;color:var(--fg-muted)}
.meta{margin:12px 0 0;display:flex;gap:12px;align-items:center;font-size:13px;color:var(--fg-muted)}
.badge{display:inline-block;padding:1px 6px;border:1px solid;border-radius:3px;font-size:11px;line-height:1.5}
.badge.ok{color:var(--ok-fg);border-color:color-mix(in srgb,var(--ok-fg) 45%,transparent)}
.prose{margin-top:32px}
.prose>:not(.table-wrap){max-width:44rem}
.prose p{margin:0 0 1em;line-height:1.8}
.prose a{color:var(--link);text-decoration:underline;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);text-underline-offset:.2em;transition:text-decoration-color var(--d-fast)}
.prose a:hover{text-decoration-color:currentColor}
.prose a.ext::after{content:'\\2197';margin-left:.15em;font-size:.85em;text-decoration:none;display:inline-block}
.src{font-size:12px;color:var(--fg-subtle);margin-top:-.6em}
.src a{color:var(--link)}
.prose h2{margin:2em 0 .8em;padding-bottom:6px;border-bottom:1px solid var(--line);font-size:20px;line-height:1.45;font-weight:700}
.table-wrap{margin:0 0 1em;overflow-x:auto;font-size:15px}
.prose table{border-collapse:collapse;width:100%;border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line-strong)}
.prose th,.prose td{padding:8px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);line-height:1.6}
.prose thead th{background:var(--surface);font-weight:700;font-size:14px}
.prose tbody th{font-weight:400;white-space:nowrap;color:var(--fg-muted)}
.prose tbody tr{transition:background-color var(--d-fast)}
.prose tbody tr:hover{background:var(--surface)}
.callout{margin:0 0 1em;padding:.25em 0 .25em 1em;border-left:2px solid var(--line-strong)}
.callout[data-kind=kr]{border-left-color:var(--kr-fg)}
.callout p{margin:0}
.related{margin:0;padding-left:1.2em;line-height:1.8}
.related li::marker{color:var(--fg-subtle)}
.toc{position:sticky;top:calc(var(--header-h) + 16px);align-self:start;padding:32px 0;font-size:13px}
.toc-title{margin:0 0 8px;font-size:12px;font-weight:700}
.toc ul{list-style:none;margin:0;padding:0;border-left:1px solid var(--line);position:relative}
.toc a{display:block;margin-left:-1px;padding:4px 4px 4px 12px;border-left:2px solid transparent;color:var(--fg-muted);line-height:1.4;transition:color var(--d-fast),border-color var(--d-base) var(--ease-out)}
.toc a:hover{color:var(--fg);text-decoration:none}
.toc a.active{border-left-color:var(--gold);color:var(--fg)}
.toc .top{display:inline-block;margin-top:12px;font-size:12px;color:var(--fg-muted)}
.toc-m{display:none;margin:24px 0 0;border-bottom:1px solid var(--line)}
.toc-m summary{list-style:none;display:flex;justify-content:space-between;align-items:center;padding:10px 0;font-size:14px;font-weight:500;cursor:pointer}
.toc-m summary svg{color:var(--fg-subtle);transition:transform var(--d-base) var(--ease-out)}
.toc-m[open] summary svg{transform:rotate(180deg)}
.toc-m ul{margin:0;padding:0 0 12px 1.2em;font-size:13px;line-height:1.9}
@media(max-width:1100px){.toc-m{display:block}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

const variantCss = {
  a: `
/* A: Aether Line — 現行構成を維持し、ヘッダー上端の 2px ライン、紺を帯びた中立色、エーテル青のリンク、金の現在位置マーカーだけを足す */
.hdr::before{content:'';position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg,var(--gold) 0%,#70d2ff 55%,transparent 100%)}
.hdr{position:sticky}
.logo-mark{display:inline-block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,var(--gold),#70d2ff);border-radius:1px}
.sec-title{border-bottom-color:var(--line-strong)}
.band-in{padding-top:40px}
[data-theme=dark] .hdr{background:color-mix(in srgb,var(--canvas) 88%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
`,
  b: `
/* B: Navy Banner — ヘッダーとホーム上部の帯を公式の濃紺 #0f1f3c にし、CSS 生成の光彩と微細な幾何モチーフを置く。本文は白／紺黒の無地のまま */
.hdr{background:var(--header-bg);border-bottom-color:color-mix(in srgb,var(--header-bg) 60%,#3d82bf);color:var(--header-fg)}
.hdr::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,transparent,rgb(112 210 255/.55) 30%,rgb(201 162 39/.6) 70%,transparent)}
.logo{color:var(--header-fg)}
.logo-mark{display:inline-block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,#ebe487,var(--gold));border-radius:1px;box-shadow:0 0 8px rgb(112 210 255/.5)}
.hdr-nav a,.hdr-chat,.hdr .icon-btn{color:var(--header-muted)}
.hdr-nav a:hover,.hdr .icon-btn:hover{background:rgb(255 255 255/.08);color:#fff}
.hdr-chat:hover{color:#fff}
.hdr-search{background:rgb(255 255 255/.06);border-color:rgb(255 255 255/.22);color:var(--header-muted)}
.hdr-search:hover{border-color:rgb(255 255 255/.45);color:#fff}
.hdr kbd{background:rgb(255 255 255/.06);border-color:rgb(255 255 255/.22);color:var(--header-muted)}
.band{position:relative;overflow:hidden;background:var(--header-bg);color:var(--header-fg);border-bottom:1px solid var(--line)}
.band::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 120% at 15% 0%,rgb(112 210 255/.22),transparent 60%),radial-gradient(ellipse 50% 100% at 95% 100%,rgb(201 162 39/.18),transparent 60%),linear-gradient(180deg,#0a1024 0%,#0f1f3c 100%)}
.band::after{content:'';position:absolute;inset:0;opacity:.07;background-image:linear-gradient(60deg,transparent 49.5%,#fff 49.5%,#fff 50.5%,transparent 50.5%),linear-gradient(120deg,transparent 49.5%,#fff 49.5%,#fff 50.5%,transparent 50.5%);background-size:96px 166px;mask-image:linear-gradient(90deg,transparent 35%,#000 100%);-webkit-mask-image:linear-gradient(90deg,transparent 35%,#000 100%)}
.band-in{position:relative;padding:36px 40px 40px}
.band h1{font-size:22px;color:#fff}
.band .desc{color:var(--header-muted)}
.searchbox{background:rgb(255 255 255/.08);border-color:rgb(255 255 255/.28);color:var(--header-muted);backdrop-filter:blur(4px)}
.searchbox:hover{border-color:#fff;color:#fff;box-shadow:0 0 0 4px rgb(112 210 255/.15)}
.searchbox kbd{background:rgb(255 255 255/.06);border-color:rgb(255 255 255/.22);color:var(--header-muted)}
@media(max-width:640px){.band-in{padding:28px 16px 28px}}
.cats{margin-top:40px}
.sec-title,.prose h2{position:relative}
.sec-title::after,.prose h2::after{content:'';position:absolute;left:0;bottom:-1px;width:28px;height:2px;background:var(--gold)}
.ftr{background:var(--surface)}
[data-theme=dark] .band::before{background:radial-gradient(ellipse 60% 120% at 15% 0%,rgb(112 210 255/.16),transparent 60%),radial-gradient(ellipse 50% 100% at 95% 100%,rgb(212 175 55/.14),transparent 60%),linear-gradient(180deg,#060a14 0%,#0b1630 100%)}
`,
  c: `
/* C: Atreia Dual — B に加えて天族（空色）／魔族（紫）の対比をホーム帯とサイドバーに置き、ホームとサイドバーを surface の面で層分けする。装飾の上限 */
.hdr{background:color-mix(in srgb,var(--header-bg) 92%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom-color:rgb(255 255 255/.08);color:var(--header-fg)}
.hdr::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,rgb(112 210 255/.7),rgb(201 162 39/.6) 50%,rgb(185 160 240/.7))}
.logo{color:var(--header-fg)}
.logo-mark{display:inline-block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,#70d2ff,#ebe487 50%,#b9a0f0);border-radius:1px}
.hdr-nav a,.hdr-chat,.hdr .icon-btn{color:var(--header-muted)}
.hdr-nav a:hover,.hdr .icon-btn:hover{background:rgb(255 255 255/.08);color:#fff}
.hdr-search{background:rgb(255 255 255/.06);border-color:rgb(255 255 255/.22);color:var(--header-muted)}
.hdr kbd,.searchbox kbd{background:rgb(255 255 255/.06);border-color:rgb(255 255 255/.22);color:var(--header-muted)}
.band{position:relative;overflow:hidden;background:#0a1024;color:var(--header-fg)}
.band::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgb(112 210 255/.28) 0%,transparent 45%,transparent 55%,rgb(120 70 220/.32) 100%),radial-gradient(circle at 50% 120%,rgb(201 162 39/.25),transparent 45%),linear-gradient(180deg,#060a14,#0f1f3c)}
.band::after{content:'';position:absolute;inset:0;opacity:.05;background-image:radial-gradient(circle,#fff 1px,transparent 1.5px);background-size:28px 28px}
.band-in{position:relative;padding:40px 40px 44px;text-align:center}
.band h1{font-size:24px;color:#fff;letter-spacing:0}
.band .desc{color:var(--header-muted)}
.searchbox{margin:20px auto 0;background:rgb(10 14 23/.55);border-color:rgb(255 255 255/.3);color:var(--header-muted)}
.searchbox:hover{border-color:#fff;color:#fff;box-shadow:0 0 0 4px rgb(112 210 255/.18)}
@media(max-width:640px){.band-in{padding:28px 16px 32px}}
.cats{margin-top:32px}
.sec-title{border:0;padding:0 0 12px;font-size:16px;color:var(--fg-muted);font-weight:700}
.cat-list{column-gap:24px}
.cat-list li{border:1px solid var(--line);border-radius:6px;background:var(--surface);padding:12px 16px;margin-bottom:8px;transition:border-color var(--d-fast),transform var(--d-base) var(--ease-out),box-shadow var(--d-base) var(--ease-out)}
.cat-list li:hover{border-color:var(--line-strong);box-shadow:var(--shadow);transform:translateY(-1px)}
.cat-list li::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,#70d2ff,#b9a0f0);opacity:0;transition:opacity var(--d-fast)}
.cat-list li:hover::before{opacity:1}
.daily{padding:16px;border:1px solid var(--line);border-radius:6px;background:var(--surface)}
.ftr{background:var(--header-bg);color:var(--header-muted);border-top:0}
.ftr-in{color:var(--header-muted)}
.side{background:var(--surface);border-right:1px solid var(--line);margin-left:-40px;padding-left:40px;padding-right:12px}
.side-cat.open{color:var(--fg)}
.side-arts a[aria-current]{background:var(--gold-soft);border-left-color:var(--gold)}
.art-head{padding:20px 24px;margin:16px -24px 0;border:1px solid var(--line);border-radius:6px;background:linear-gradient(90deg,var(--surface),var(--canvas))}
.art-head h1{font-size:30px}
.prose h2{border:0;padding-left:14px}
.prose h2::before{content:'';position:absolute;left:0;top:.45em;width:6px;height:6px;transform:rotate(45deg);background:var(--gold)}
.prose h2{position:relative}
.callout{background:var(--kr-soft);border-radius:0 6px 6px 0;padding:.6em 1em}
.prose thead th{background:var(--muted)}
.toc ul{border-left-color:var(--line-strong)}
.toc a.active{background:var(--gold-soft)}
`,
};

const page = (variant, name, desc) => `<!doctype html>
<html lang="ja" data-variant="${variant}" data-theme="light" data-page="home">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${baseCss}${variantCss[variant]}
[data-page=home] .article,[data-page=article] .home{display:none}
</style>
<script>
(()=>{const q=new URLSearchParams(location.search);const h=document.documentElement;
h.dataset.theme=q.get('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
h.dataset.page=q.get('page')||'home';})();
</script>
</head>
<body>
${header}
${home}
${article}
${footer}
</body></html>`;

const out = [
  ['a', 'a-aether-line', 'A: 現行構成にライン・紺系中立色・青リンク・金マーカーだけを足す'],
  ['b', 'b-navy-banner', 'B: 濃紺ヘッダー＋ホーム帯（CSS 光彩・幾何モチーフ）、本文は無地'],
  ['c', 'c-atreia-dual', 'C: B ＋天族／魔族の対比色と面の層分け（装飾の上限）'],
];
for (const [v, file, desc] of out) {
  writeFileSync(join(here, `${file}.html`), page(v, `AION2 Wiki 方針案 ${v.toUpperCase()}`, desc));
  console.log('wrote', file + '.html');
}
