# AION2 非公式Wiki デザイン方針検討（Issue #8）

- 日付: 2026-10-08
- 対象: live サイト https://novexar.github.io/aion2-wiki/ （`app/`、Vite 7 + React 19 + Tailwind v4、`motion` 14 導入済み）
- 前提: `research/ui-audit.md` 第 1 節・第 3 節の「ランディング化しない」「カード・装飾アイコン・塗りバッジを使わない」「本文の行長・行間・コントラストを下げない」は維持する。本書はその上に「AION2 らしい色」と「動き」を足す範囲を決める
- 成果物: 本書、`research/mockups/{a-aether-line,b-navy-banner,c-atreia-dual}.html`（生成元 `build.mjs`、コントラスト計算 `contrast.mjs`）、`research/shots/ref-*.png`（参考 10 枚）、`research/shots/direction-*.png`（案別 24 枚）、`research/shots/current-*.png`（現状 2 枚）
- 文言は live サイトと `content/basics/game-overview.md` から転記し、一切変えていない

## 0. 要約

1. 推奨は **B案「Navy Banner」**。ヘッダーとホーム上部の帯だけを公式の濃紺 `#0f1f3c` にし、CSS 生成の光彩と幾何モチーフを置く。本文は白／紺黒の無地のまま。金は「現在位置」と「見出し下の 28px 線」だけに使い、リンクはエーテル青にする。
2. 色は「紺を帯びた中立色（zinc → slate 寄り）」に全トークンを差し替える。全テキスト／背景ペアで WCAG AA（4.5:1）を満たすことを `contrast.mjs` で確認済み（最小 4.59:1、本文 17.8:1）。
3. モーションは 3 段の duration（120／200／320 ms）と 2 種の easing に限定し、`motion` の `MotionConfig reducedMotion="user"`・`AnimatePresence`・`layoutId` で 10 対象を実装する。本文テキストは動かさない。
4. 実装規模は S 13 件・M 8 件・L 0 件、3 Phase（トークンと帯 → モーション → 仕上げ）。承認後に別 Issue で着手する。

## 1. 参考分析（海外ゲーム Wiki／攻略サイト）

採取方法: Playwright Chromium 1440×900 でスクリーンショット（`research/shots/ref-*.png`）。配色・フォント・transition は同じページで `getComputedStyle` を集計した（body／main／リンク／h1／段落と、`a, button, li, td, th, input` に付いた transition・radius の出現回数）。

| サイト | 画面 | 本文背景 | 本文文字 | リンク | 本文 | transition（最多） | 角丸 |
|---|---|---|---|---|---|---|---|
| wiki.gg Terraria | `ref-terraria-wikigg.png`、`ref-terraria-wikigg-article.png` | `#5a433a`（html は `#b8bad0` ＋壁紙） | `#eae3d1` | `#9fecf0` | 14px／24px Helvetica | `background .3s ease`（50 箇所）、`.1s ease`（枠・影） | 7px／4px |
| Fextralife Elden Ring | `ref-fextralife-eldenring.png`、`ref-fextralife-article.png` | `#101013` | `#b4b2b0` | `#aaa38f`（金） | 14px／23.8px Helvetica Neue、h1 は Spectral（serif）21px | `background, color .15s ease`（100 箇所） | 60px（pill）／8px／4px |
| maxroll.gg（Diablo 4） | `ref-maxroll.png`、`ref-maxroll-guides.png` | `#0f0f0f` 系 | 白〜灰 | 白（ナビは赤下線で現在地） | Source Sans 系 15px | 計測不可（同意ダイアログ） | 4px |
| mobalytics.gg | `ref-mobalytics.png` | `#171233`（紫紺） | 白 | — | Roboto | `background-color, opacity, color .1s ease-in`（11 箇所）、`.3s ease` | 6px／3px |
| paimon.moe | `ref-paimon-moe.png` | `#25294a` | 白 | 白 | Poppins 16px／24px | `all .15s cubic-bezier(.4,0,1,1)`（17 箇所） | 12px／16px |
| Dota 2 Wiki（Fandom） | `ref-dota2-wiki.png` | `#1c1c1c`（外側 `#0f0f0f`） | `#b9b9b9` | `#63a2e2` | 14px／21px Rubik、h1 Radiance 36px/300 | `color .3s ease`（306 箇所） | 3px |
| Warframe Wiki | `ref-warframe-wiki.png` | `#19262f`（紺緑） | `#d5d5d5` | `#89c6e5` | 14px／22.4px Roboto、h1 Quantico | `background-color, color, border-color, box-shadow .1s ease` | 2px |

何が洗練して見えるか（共通点）:

- **ダーク基調＋ 2 色以内のアクセント**。背景は真っ黒ではなく、ゲームの色味を帯びた暗色（紫紺 `#171233`、紺緑 `#19262f`、紺 `#25294a`）。アクセントは「リンク色（水色か金）」と「現在地・強調（金か赤）」の 2 つまでで、それ以外は灰階調。
- **面の層分け**。body → main → 枠付きの面、の 3 段の明度差を一定（各 1〜2 段）に保ち、境界は 1px の線。影は 1 種類だけ（Dota 2: `0 3px 12px rgba(0,0,0,.3)`、mobalytics: `0 2px 10px rgba(12,9,31,.5)`）。
- **ヘッダーの帯**。サイト名・ナビ・検索を 1 本の濃色帯に収め、その直下にゲーム固有の「バナー帯」（Fextralife のロゴ帯、maxroll のキーアート帯、Warframe の背景画）を置く。本文はその下で無地になる。
- **タイポグラフィは地味**。本文 14〜16px のサンセリフ、太さ 400／700 のみ。見出しにだけ固有フォント（Spectral、Radiance、Quantico）を使う所が多いが、日本語 Wiki では見出しフォントを変える効果が薄く、Noto Sans JP のまま太さと罫線で差を付ける方が良い。
- **表の規律**。Fextralife のインフォボックス（`ref-fextralife-article.png` 右）は th 背景＋ 1px 枠＋ 8px 余白で統一、行の塗り分けはなし。wiki.gg も見出し行だけ色付き。
- **モーションは 100〜300ms の色変化のみ**。最多は `.1〜.15s ease` の background／color。`.3s` を全リンクに付けた Dota 2 はホバー応答が鈍い（306 箇所）。transform を伴う動きはどのサイトもほぼ無く、「動いている感」はホバーの面の変化と展開（ドロップダウン）で出している。

真似しないこと:

- 壁紙・キーアートの全面敷き（wiki.gg、Warframe）。本文が透けて読みにくく、著作物の扱いも難しい。
- 「WIN MORE IN …」型の LP ヒーロー（mobalytics）。監査 U-001〜U-005 で削除済みの型。
- 角丸 12〜16px のカード格子（paimon.moe）とサムネイル付きカード格子（maxroll）。本 Wiki は画像を持たないため、カードは空の枠になる。
- 全リンク `.3s` の遅い transition（Dota 2）、`all` 指定の transition（paimon.moe）。
- 広告枠・Discord 大型ボタン・左レール（maxroll、Fandom）。
- 見出しの全大文字セリフ（Fextralife）と角の切れたタブ（Warframe）。ゲーム UI の模倣は日本語では浮く。

## 2. AION2 の配色抽出

取得方法:

1. `curl -A "Mozilla/5.0 …"` で https://aion2.plaync.com/en-us （→ `/en-us/index`）と https://aion2.ncsoft.jp/ （→ `/ja/contents`）の HTML を取得し、参照 CSS（EN: `assets.playnccdn.com/static-nc-home/2.8.5/css/nc-home-aion2global.css` 101KB、JP: `/_next/static/css/*.css` 8 本 186KB）から 16 進色と rgba を集計、セレクタ文脈を確認した。
2. 両サイトを Playwright でフルページ撮影し（作業用一時ディレクトリに保存、リポジトリには入れない）、`pngjs` で領域ごとに 16 段階に量子化した色の出現率を集計した。
3. 金は公式 CSS に文字色 `#ebe487`（淡い金）しかなく、ロゴ・装飾の金はキービジュアルの髪と混ざって領域抽出できなかったため、現行トークン `#c9a227`／`#d4af37` を維持する。

| 用途 | HEX | 根拠 |
|---|---|---|
| 濃紺（ニュース帯の背景） | `#0f1f3c` | EN CSS `.nchome-news{background:#0f1f3c url(...)}` |
| 濃紺（イベント帯） | `#0a1024` | EN CSS `.nchome-event{background-color:#0a1024}` |
| 紺黒（フッター） | `#020a1a` | EN CSS `.wrap-footer{background:#020a1a}`。画面サンプルでも (0,2950,1440,494) の 95% が `#001020` |
| 紺グレー（フッター内枠） | `#161f2c`／`#1f2b3c` | EN CSS `.footer-change-wrap` |
| ヒーロー下端のマスク | `rgba(7,19,40,.9)`≈`#071328` | EN CSS `.trailer__visual-mask` の gradient |
| ヒーロー上部（ヘッダー裏） | `#001010`〜`#101020` | EN 画面 (0,0,1440,100) の上位色 |
| JP ヘッダー帯 | `#203050`／`#204060` | JP 画面 (0,0,1440,56) の上位 2 色 |
| エーテル・シアン（文字） | `#70d2ff` | EN CSS `.event__server{color:#70d2ff}` |
| エーテル・シアン（hover） | `#90e1ff` | EN CSS `.shortcut__items:hover` |
| エーテルの光（中央の門） | `#c0f0ff`／`#a0d0f0` | JP 画面 (690,235,60,60) の 40% |
| 青（カテゴリ文字） | `#5693cd` | EN CSS `.cmazit__category` |
| 青（ボタン塗り） | `#3d82bf`（`rgba(61,130,191)`） | EN CSS `.event__link` の gradient／border。画面「Learn more」ボタン (620,2490,200,60) は `#4090d0`／`#3080c0` |
| 青（深） | `#1566b3` | EN CSS `.event__link::after` の gradient |
| 淡い金（文字） | `#ebe487` | EN CSS `.event__server[data-server^=오리진]{color:#ebe487}` |
| 天族側（キービジュアル左） | `#505080`／`#6070a0`／`#90a0c0`／`#a0b0d0` | JP 画面 (60,100,220,620)。銀白〜薄い群青 |
| 魔族側（キービジュアル右） | `#6040e0`／`#7050e0`／`#8050c0` | JP 画面 (1250,100,190,600)、「事前登録」タブ (1330,380,110,140) は `#8050c0`／`#6030a0` |

まとめ: AION2 の公式配色は「濃紺 `#0a1024`〜`#0f1f3c` の地に、エーテル・シアン `#70d2ff` と淡い金 `#ebe487` の光、天族＝銀白・薄群青、魔族＝紫」。赤や緑は使われていない。

## 3. カラーテーマ案

### 3.1 境界（AION2 らしさを足す範囲）

| 置く場所 | 許可する表現 | 禁止 |
|---|---|---|
| ヘッダー | 濃紺の帯、白文字、下端 1px の青→金グラデーション線、ロゴ横の 10px 菱形（金） | 画像、グロー文字、透過で本文が透けること |
| ホーム上部の帯 | 濃紺グラデーション、放射状の光彩（シアン・金、不透明度 ≤ 22%）、幾何モチーフ（≤ 7%）、検索欄 | 48px 見出し、スローガン、CTA、キーアート |
| サイドバー・目次 | 現在位置の 2px 金線、hover の `muted` 塗り | 色付きの背景、アイコン |
| 記事本文 | リンク＝青、h2 下罫線の左 28px を金、コールアウト左 2px 線（注意＝琥珀、韓国版のみ＝紫、補足＝青） | 背景色・テクスチャ・塗り付きコールアウト・色文字・グラデーション文字 |
| 表 | th 背景 `surface`、行 hover `surface` | 行の縞、色付き枠 |
| フッター | `surface` 塗り（B 案）か濃紺（C 案） | — |
| 全体 | 中立色を紺寄りにする（zinc → slate） | 彩度のある背景 |

判断基準: 「読んでいる最中に視界に入る面（本文幅 44rem の内側と表）には色相を置かない」。色相は読み始める前（ヘッダー・帯）と、目を離した時の目印（現在位置・見出し線）だけに置く。

### 3.2 トークン（Light / Dark）

| トークン | Light | Dark | 用途 | 現行からの変更 |
|---|---|---|---|---|
| canvas | `#ffffff` | `#0a0e17` | 背景 1 | Dark を zinc 黒 `#09090b` → 紺黒。EN フッター `#020a1a` とイベント帯 `#0a1024` の中間 |
| surface | `#f7f8fb` | `#0f141f` | 背景 2（th、選択行、フッター） | 青みを足す |
| muted | `#eef1f6` | `#161c29` | 背景 3（hover、Kbd） | 同上 |
| line | `#e1e5ee` | `#232b3a` | 区切り線 | 同上 |
| line-strong | `#c9d0dd` | `#35405a` | 表の上下罫線 | 同上 |
| line-input | `#7f8799` | `#6f7a93` | 入力・secondary ボタン枠 | 3.60:1／4.49:1 |
| fg | `#141821` | `#f2f4f8` | 前景 1（本文） | ほぼ同じ |
| fg-muted | `#4b5262` | `#a4acbb` | 前景 2（補助） | 青み |
| fg-subtle | `#656d7e` | `#8a93a4` | 前景 3（メタ、12px 以上） | 青み |
| accent | `#c9a227` | `#d4af37` | 金: 現在位置の線、h2 の 28px 線、ロゴの菱形、primary ボタン塗り | 同じ |
| accent-strong | `#7f640f` | `#e2c15a` | 金の文字版（Light のフォーカスリングにも使う） | 同じ。リンクには使わない |
| link | `#1d5ca8` | `#8ec8ff` | 本文リンク、出典番号 | **新設**。金 → 青（公式 `#1566b3`／`#70d2ff` を AA まで調整） |
| aether | `#3d82bf` | `#70d2ff` | 装飾のみ（ヘッダー下線・帯の光彩）。文字には使わない | 新設 |
| header-bg / header-fg / header-muted | `#0f1f3c` / `#eef2f8` / `#aab6cc` | `#060a14` / `#eef2f8` / `#aab6cc` | ヘッダーと帯 | 新設 |
| ok-fg（検証済み） | `#166534` | `#86efac` | バッジ文字・枠 | 同じ |
| info-fg（公式） | `#1b4f91` | `#8ec8ff` | バッジ文字・枠、「補足」コールアウト線 | 青 → エーテル青 |
| warn-fg（要確認） | `#92400e` | `#fcd34d` | バッジ文字・枠、「注意」コールアウト線 | 同じ |
| kr-fg（韓国版のみ） | `#6a3fc0` | `#b9a0f0` | コールアウト線 | **新設**。魔族の紫 `#8050c0` を AA まで調整（現行は info 色） |
| danger-fg | `#b91c1c` | `#fca5a5` | 削除確認など | 同じ |
| shadow | `0 1px 2px rgb(0 0 0/.04), 0 8px 24px rgb(0 0 0/.08)` | `0 1px 2px rgb(0 0 0/.4), 0 12px 32px rgb(0 0 0/.5)` | パレット・ドロワーのみ | 同じ |

### 3.3 コントラスト比（`node research/mockups/contrast.mjs` の出力）

Light

| text ＼ bg | canvas #ffffff | surface #f7f8fb | muted #eef1f6 |
|---|---|---|---|
| fg #141821 | 17.76 | 16.72 | 15.69 |
| fg-muted #4b5262 | 7.83 | 7.37 | 6.91 |
| fg-subtle #656d7e | 5.20 | 4.89 | 4.59 |
| accent-strong #7f640f | 5.63 | 5.30 | 4.97 |
| link #1d5ca8 | 6.67 | 6.28 | 5.89 |
| ok-fg #166534 | 7.13 | 6.71 | 6.30 |
| info-fg #1b4f91 | 8.16 | 7.68 | 7.21 |
| warn-fg #92400e | 7.09 | 6.68 | 6.26 |
| danger-fg #b91c1c | 6.47 | 6.09 | 5.71 |
| kr-fg #6a3fc0 | 6.81 | 6.41 | 6.01 |
| header-fg #eef2f8 on header-bg #0f1f3c | 14.59 | | |
| header-muted #aab6cc on header-bg | 8.02 | | |
| accent-contrast #1c1505 on accent #c9a227（primary ボタン） | 7.49 | | |
| line-input #7f8799 on canvas（非テキスト 3:1） | 3.60 | | |
| accent #c9a227 on canvas（フォーカスリング 3:1） | 2.42 ✗ → Light のリング色は accent-strong `#7f640f`（5.63）にする | | |

Dark

| text ＼ bg | canvas #0a0e17 | surface #0f141f | muted #161c29 |
|---|---|---|---|
| fg #f2f4f8 | 17.53 | 16.73 | 15.48 |
| fg-muted #a4acbb | 8.45 | 8.07 | 7.46 |
| fg-subtle #8a93a4 | 6.24 | 5.96 | 5.51 |
| accent-strong #e2c15a | 11.04 | 10.53 | 9.75 |
| link #8ec8ff | 10.90 | 10.40 | 9.62 |
| ok-fg #86efac | 13.75 | 13.12 | 12.14 |
| info-fg #8ec8ff | 10.90 | 10.40 | 9.62 |
| warn-fg #fcd34d | 13.38 | 12.77 | 11.82 |
| danger-fg #fca5a5 | 10.17 | 9.70 | 8.98 |
| kr-fg #b9a0f0 | 8.59 | 8.20 | 7.59 |
| header-fg #eef2f8 on header-bg #060a14 | 17.61 | | |
| header-muted #aab6cc on header-bg | 9.68 | | |
| accent-contrast #1c1505 on accent #d4af37 | 8.62 | | |
| line-input #6f7a93 on canvas | 4.49 | | |
| accent #d4af37 on canvas（フォーカスリング） | 9.18 | | |

全テキストペアが AA（4.5:1）を満たし、fg と fg-muted は AAA（7:1）を満たす。Light で唯一落ちるのは金のフォーカスリング（現行も同じ 2.42）で、Light のリングを `accent-strong` に替えて解消する。

## 4. 質感・画像

- 公式画像・キービジュアルは使わない（著作権）。使うのは CSS 生成のみ。
- **帯のグラデーション**: `linear-gradient(180deg, #0a1024, #0f1f3c)` を地にし、`radial-gradient(ellipse 60% 120% at 15% 0%, rgb(112 210 255 / .22), transparent 60%)`（エーテルの光）と `radial-gradient(ellipse 50% 100% at 95% 100%, rgb(201 162 39 / .18), transparent 60%)`（金）を重ねる。Dark では不透明度を .16／.14 に落とす。
- **幾何モチーフ**: 60°／120° に交差する 1px の線を 96×166px のタイルで並べ（翼・結晶の面を連想させる菱形格子）、不透明度 7%、`mask-image: linear-gradient(90deg, transparent 35%, #000)` で右側だけに出す。B 案の帯で使用。
- **粒子**: C 案のみ `radial-gradient(circle, #fff 1px, transparent 1.5px)` 28px タイル、不透明度 5%。B 案では使わない（線と粒子の併用はうるさい）。
- **ノイズ**: 必要なら SVG `feTurbulence` を data URI にして 3% で重ねる（モックでは未使用。帯のバンディング対策としてのみ検討）。
- **ビネット**: 帯の下端を `linear-gradient(180deg, transparent, rgb(0 0 0 / .25))` で締めても良い。本文との境界は 1px の `line`。
- **記事本文は無地**。記事ヘッダー（タイトル・別名・バッジ）にも面を敷かない（C 案は上限を示すため敷いているが、推奨しない）。
- 将来画像を入れるなら、自作の抽象的な翼のシルエット SVG（単色、不透明度 ≤ 8%）を帯の右端に置く程度。

## 5. モーション設計

### 5.1 共通の値

| トークン | 値 | 用途 |
|---|---|---|
| `--d-fast` | 120ms | 色・枠・下線（hover、focus、押下） |
| `--d-base` | 200ms | 展開・折りたたみ、目次マーカー、パレット、ドロワー |
| `--d-slow` | 320ms | ルート遷移、チャットパネルのスライド、ホームの段差表示の末尾 |
| `--ease-std` | `cubic-bezier(.4, 0, .2, 1)` | 色変化・サイズ変化 |
| `--ease-out` | `cubic-bezier(.2, .7, .2, 1)` | 入場（opacity + 4〜8px の移動） |
| `--ease-in` | `cubic-bezier(.4, 0, 1, 1)` | 退場。duration は入場の 60%（120ms） |

### 5.2 対象一覧

| # | 対象 | 動き | duration／easing | 実装 | 現状 |
|---|---|---|---|---|---|
| 1 | ルート遷移（記事⇄記事、ホーム） | 新ページを opacity 0→1、y 6px→0。退場はフェードのみ | 入 200ms ease-out／出 120ms ease-in | `App.tsx` の `Outlet` を `AnimatePresence mode="wait"` と `motion.div key={pathname}` で包む。`ScrollManager` のスクロール復元は退場完了後に実行 | なし |
| 2 | サイドバーのカテゴリ開閉 | 一覧の高さ 0→auto、chevron 90° 回転 | 200ms ease-std | `CategoryNav.tsx` で `motion.ul initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}`。chevron は CSS `transition: transform` | chevron のみ |
| 3 | 目次の現在位置マーカー | 2px の金線が見出し間を滑る | 200ms ease-out | `Toc.tsx` の左線を `motion.span layoutId="toc-marker"` にし、active の `li` にだけ描画 | 即時切替 |
| 4 | hover／focus | 背景（muted）・文字・枠・下線色の変化 | 120ms ease-std | CSS `transition` をトークンで統一（`index.css` に `.t-fast` ユーティリティ、または `@theme` に `--default-transition-duration`） | 一部のみ |
| 5 | チャットパネル | 開く: x 100%→0。閉じる: x 0→100%。リサイズ中は transition なし | 320ms ease-out／閉 200ms ease-in | `ChatPanel.tsx` を `motion.aside` に。`ResizeHandle` のドラッグ中は `transition={{duration:0}}`（`isResizing` フラグ） | 即時 |
| 6 | 検索パレット | 背景 opacity、本体 opacity + y −8px + scale .98→1 | 120ms／140ms ease-out（現状維持） | 実装済み（`CommandPalette.tsx`） | あり |
| 7 | スケルトン／読込 | 「読み込み中」文字をやめ、見出し 1 本と行 3 本の灰色バーを 1.2s の opacity .5⇄1 で点滅 | 1200ms ease-in-out 無限（reduced では静止） | `PageLoading.tsx` と `Suspense fallback`。250ms 以上かかった時だけ表示（`delay` で初期非表示） | 文字 |
| 8 | ボタン押下 | `:active` で scale .98 | 120ms ease-std | `button-class.ts` に `active:scale-[.98] transition-transform` | なし |
| 9 | コールアウト出現 | ページ入場と同時に opacity 0→1（個別の遅延なし）。スクロール連動はしない | ルート遷移に含める | `.callout` に単独の animation は付けない | なし |
| 10 | ホームのカテゴリ一覧の段差表示 | 行ごとに 24ms ずつ遅らせて opacity 0→1、y 6px→0。初回表示のみ | 320ms ease-out、遅延 ≤ 11×24＝264ms | `HomePage.tsx` の `li` に `style={{animationDelay}}` の CSS animation（`@keyframes rise`）。`sessionStorage` に表示済みフラグを置き、戻る操作では再生しない | なし |
| 11 | モバイルドロワー | 左から x −100%→0、背景 opacity | 200ms ease-out／閉 160ms ease-in | `MobileDrawer.tsx` を `motion.div` に | 即時 |
| 12 | 目次（モバイル `details`） | 展開を高さアニメーション | 200ms ease-std | `Toc.tsx` の `details` を `motion` の `height:auto` に置換するか、CSS `interpolate-size: allow-keywords` を使う | 即時 |

### 5.3 `motion` の使い方

- `App.tsx` の `<MotionConfig reducedMotion="user">` は導入済み。これにより `prefers-reduced-motion: reduce` 時は `motion` の transform／layout アニメーションが自動で無効になり、opacity だけ残る。
- ルート遷移は `AnimatePresence` を `Layout` の中、`Outlet` の外に置く。`mode="wait"` で退場→入場を直列にし、スクロール位置の復元は `onExitComplete` で行う。
- 目次マーカーは `layoutId`（共有レイアウトアニメーション）を使う。DOM 位置の差分から移動量を計算するため、見出しの高さが違っても滑る。
- 高さ 0→auto は `motion.ul` の `animate={{height:'auto'}}` で可能（`overflow:hidden` を併用）。
- 数値の遅延（段差表示）は `motion` を使わず CSS animation で行い、バンドルを増やさない。
- `useReducedMotion()` で reduced 時にスケルトンの点滅を止める。

### 5.4 `prefers-reduced-motion` 時の挙動

- transform・height・layout のアニメーションは全て無効（`MotionConfig` と `index.css` の既存の `@media (prefers-reduced-motion: reduce)` 規則）。
- opacity のフェード（ルート遷移・パレット）は 0.01ms に短縮され実質即時になる。
- スケルトンは静止、段差表示は一括表示。
- 設定ページに「アニメーション: システムに従う／オフ」を置くかは任意（S）。`MotionConfig reducedMotion` に `"always"` を渡すだけで実装できる。

### 5.5 過剰にしないルール

1. 本文テキスト（段落・表・リスト）には animation も transition も付けない。
2. 1 画面で「入場アニメーション」は 1 種類まで（ルート遷移があるページでは段差表示を重ねない。ホームは遷移フェードを省き段差表示のみ）。
3. duration は 320ms を上限、無限ループはスケルトンだけ。
4. スクロール連動（reveal、parallax）は使わない。
5. hover で transform（浮き上がり）を付けるのは C 案のカードのみで、推奨案では付けない。
6. `transition: all` は禁止。プロパティを列挙する。
7. 色の transition は 120ms に統一し、150ms を超えると「もっさり」に感じる（Dota 2 の 300ms が反面教師）。
8. ページ遷移の退場は 120ms 以内。クリックから新ページの文字が見えるまで 350ms を超えない。

## 6. モックアップ

生成: `node research/mockups/build.mjs`。各 HTML は `?page=home|article&theme=light|dark` で切替。撮影は Playwright（1440×900、390×844 DPR2）で `research/shots/direction-<案>-<page>-<幅>-<theme>.png` の 24 枚。

### A案 Aether Line（`a-aether-line.html`）

1. 狙い: 現行構成を一切動かさず、「紺寄りの中立色」「青リンク」「金の現在位置」「ページ最上部の 2px 金→シアン線」だけで AION2 らしさを出す最小案。
2. 差分: ヘッダーは白／紺黒のまま（Dark は 88% 透過＋ blur）。ホームの帯なし。ロゴ横に金とシアンの菱形。
3. 評価: 読みやすさは現行と同等で実装 1 日。ただし「海外 Wiki の雰囲気」はほぼ出ず、オーナー要望（オシャレでモダン）には届かない。

### B案 Navy Banner（`b-navy-banner.html`、推奨）

1. 狙い: Fextralife・maxroll 型の「濃色ヘッダー＋バナー帯＋無地の本文」を、画像を使わず CSS の光彩と幾何モチーフで作る。
2. 差分: ヘッダーを公式濃紺 `#0f1f3c`（Dark `#060a14`）、下端に青→金の 1px 線。ホーム上部にタイトル・説明・検索を載せた帯（光彩＋菱形格子）。h2 とセクション見出しの下罫線の左 28px を金。フッターを `surface`。
3. 評価: 本文の行長・行間・コントラストは現行と同じ。ヘッダーが濃くなることで検索・ナビの視認性が上がり、記事ページでも「AION2 のサイト」と分かる。帯は 190px（モバイル 160px）で、カテゴリ一覧は 1440×900 の初期表示に 11 行すべて入る。

### C案 Atreia Dual（`c-atreia-dual.html`、装飾の上限）

1. 狙い: B 案に天族（空色）／魔族（紫）の対比と面の層分けを足し、「ここまでやるとゲームっぽくなる」上限を示す。
2. 差分: 帯を左シアン→右紫のグラデーション＋粒子、タイトル中央寄せ。カテゴリと日課を `surface` の枠付き面に、hover で浮き上がり。サイドバーを `surface` 面、記事ヘッダーを面で囲む。h2 に金の菱形、「韓国版のみ」コールアウトに紫の薄い塗り。ヘッダーは blur 付き。
3. 評価: 見栄えはするが、中央寄せの帯は監査で排除した LP の型に戻り、カード面は「画像のないカード」になる。記事ヘッダーの面とコールアウトの塗りは監査 3.5 に反する。採用するなら帯の対比色だけを B 案に移す。

### スクリーンショット

| 案 | ホーム 1440 | ホーム 390 | 記事 1440 | 記事 390 |
|---|---|---|---|---|
| A | `direction-a-home-1440-light.png`／`-dark.png` | `direction-a-home-390-light.png`／`-dark.png` | `direction-a-article-1440-light.png`／`-dark.png` | `direction-a-article-390-light.png`／`-dark.png` |
| B | `direction-b-home-1440-light.png`／`-dark.png` | `direction-b-home-390-light.png`／`-dark.png` | `direction-b-article-1440-light.png`／`-dark.png` | `direction-b-article-390-light.png`／`-dark.png` |
| C | `direction-c-home-1440-light.png`／`-dark.png` | `direction-c-home-390-light.png`／`-dark.png` | `direction-c-article-1440-light.png`／`-dark.png` | `direction-c-article-390-light.png`／`-dark.png` |

現状との比較: `current-home.png`、`current-article.png`（live、1440 Light）。

## 7. 推奨案と実装見積

推奨: **B案**。理由は (1) 本文側の変更がトークン差替えと h2 の金線だけで、監査で確定した可読性ルールを一つも破らない、(2) 参考 7 サイトに共通する「濃色ヘッダー＋バナー帯＋無地の本文」の構造そのもので、海外 Wiki の見え方になる、(3) 公式の濃紺・シアン・金をそのまま使うため AION2 の公式サイトから来た人に連続性がある、(4) 画像を一切使わず著作権と転送量の問題がない。C 案の「帯の左右対比色」は B 案のオプションとして Phase 3 に残す。

難易度: S＝トークン・スタイル差替え（〜1 時間）、M＝コンポーネント修正とテスト（半日）、L＝画面再設計（1 日以上）。

### Phase 1: トークンと帯（S 7、M 2）

| # | 内容 | 対象 | 難易度 |
|---|---|---|---|
| 1-1 | 3.2 のトークンを `index.css` の `:root`／`[data-theme=dark]`／`@theme inline` に反映（link、aether、header-*、kr-fg を新設） | `app/src/index.css` | S |
| 1-2 | 本文リンク・出典番号を `link` に、Light のフォーカスリングを `accent-strong` に | `index.css` `.prose-wiki a`、`:focus-visible` | S |
| 1-3 | 「韓国版のみ」コールアウトの左線を `kr-fg` に | `index.css` `.callout[data-kind='kr']` | S |
| 1-4 | h2 とホームのセクション見出しの下罫線に 28px の金線 | `index.css` `.prose-wiki h2`、`HomePage.tsx` `SECTION_TITLE` | S |
| 1-5 | ヘッダーを濃紺に（文字・ナビ・検索・Kbd・アイコンの色を header-* に差替え、下端のグラデーション線） | `Header.tsx`、`Logo.tsx`（菱形）、`Kbd.tsx` | M |
| 1-6 | ホーム上部の帯（タイトル・説明・検索を帯の中へ、光彩と幾何モチーフは CSS クラス `.band`） | `HomePage.tsx`、`index.css` | M |
| 1-7 | フッターを `surface` 塗りに | `Layout.tsx` | S |
| 1-8 | モバイルドロワーの見出し部を濃紺に揃える | `MobileDrawer.tsx` | S |
| 1-9 | 既存スクリーンショットテスト／コンポーネントテストの色参照を更新 | `components.test.tsx` ほか | S |

### Phase 2: モーション（S 5、M 5）

| # | 内容 | 対象 | 難易度 |
|---|---|---|---|
| 2-1 | duration／easing トークンと hover／focus の transition 統一（5.2 #4、#8） | `index.css`、`button-class.ts` | S |
| 2-2 | ルート遷移（#1）とスクロール復元の順序 | `App.tsx` or `Layout.tsx`、`ScrollManager.tsx` | M |
| 2-3 | サイドバー開閉（#2） | `CategoryNav.tsx` | M |
| 2-4 | 目次マーカーの `layoutId`（#3） | `Toc.tsx` | M |
| 2-5 | チャットパネルのスライドとリサイズ中の無効化（#5） | `ChatPanel.tsx`、`ResizeHandle.tsx` | M |
| 2-6 | モバイルドロワーのスライド（#11） | `MobileDrawer.tsx` | M |
| 2-7 | スケルトン（#7、250ms 遅延表示） | `PageLoading.tsx`、`WikiShell.tsx` の fallback | S |
| 2-8 | ホームの段差表示（#10、初回のみ） | `HomePage.tsx` | S |
| 2-9 | モバイル目次の展開（#12） | `Toc.tsx` | S |
| 2-10 | reduced-motion の確認（Playwright で `reducedMotion: 'reduce'` のスクリーンショット比較） | `app/e2e` or `src/test` | S |

### Phase 3: 仕上げ（S 1、M 1）

| # | 内容 | 対象 | 難易度 |
|---|---|---|---|
| 3-1 | Dark ヘッダーの 92% 透過＋ blur（スクロール時に本文が薄く透ける演出。Light では不透明のまま） | `Header.tsx` | S |
| 3-2 | 帯の左右対比色（C 案のシアン→紫）を設定で選べる「陣営テーマ」にするか判断。やる場合は `data-faction` 属性で帯の光彩色だけ切替 | `SettingsPage.tsx`、`index.css` | M |

合計: S 13、M 8、L 0。Phase 1 で見た目の 8 割が決まるため、Phase 1 を先に Issue 化してレビューし、Phase 2 は 5.2 の表を 1 件 1 PR で進める。
