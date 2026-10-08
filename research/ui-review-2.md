# UI/UX レビュー 第 2 回（テーマ・モーション実装後）

- 対象: `main` 4d02ded（`git archive HEAD` を別ディレクトリでビルドし `vite preview` で確認。作業ツリーで進行中の Issue #12 の変更は含まない）
- 方法: Playwright（Chromium 145）で 1440×900 / 1920×1080 / 2560×1200 / 390×844、light / dark を撮影。`research/shots/review2-*.png` 149 枚。計測値は `getComputedStyle` と `getBoundingClientRect` の実測
- 参照ルール: `research/ui-audit.md` §1・§3、`research/ui-direction.md` §0・§3・§5、Issue #12
- Issue #12 が扱う 4 点（全幅、ホームのサイドバー、「AI チャット」表記とスパークル、サイドバー行の大型化）は本表では再掲しない。§3 で「仕様をどこまで広げるべきか」だけ述べる

## 1. 総評

1. 骨格（紺のヘッダー、金の現在位置、青リンク、罫線だけの表）は Stripe Docs / MDN 寄りに整い、第 1 回で指摘した「LP 型ホーム」「装飾過多」はほぼ解消した。ここから先は細部の詰めで、致命傷は少ないが「素人が作った Wiki」に見える粗が 30 か所ほど残る。
2. 最悪なのはモバイルの表。`overflow-wrap: anywhere` と `min-width: min(100%, 76ch)` の組合せで 4 列表が 390px に押し込まれ、「Asmodia / ns」「Gladiato / r」と英単語が途中で折れる（review2-article-long-m-light-1200.png）。読めない。
3. 段落ごとの「出典: [S01] [S03]」行は 12px、リンクは 9.6px・高さ 14px。1 記事に 25 個。本文より小さい文字を 8 行も挟む Wiki は他に無い。モバイルでは押せない。
4. 索引の「タグ」ビューは 601 個の `#タグ` チップを「見出しへ移動」として描画する。画面 3 枚分のチップ壁で、索引として機能していない。
5. ホームは 1440 で 830px、1920 で 700px で終わり、下 1/3 が空白。「最近の更新」は全記事の日付が同一なので非表示、「人気」「今週の予定」「シーズン終了まで」は無い。情報サイトのトップとしてまだ薄い。
6. チャットの初回体験が弱い。キー未設定時は「例」の 3 行が灰色で並ぶだけ、キー発行先のリンクも無い（compact フォームには無い）。何ができる機能か分からないまま入力欄だけがある。
7. 文字サイズが 9.6 / 11 / 12 / 12.8 / 13 / 14 / 15 / 16 / 17 / 20 / 32 の 11 段階、角丸が 4 / 6 / 12px の 3 種、入力高さが 36 / 40 / 48px の 3 種。ui-audit §3 の表と一致していない箇所が多く、「揃えた」感が出ない。
8. モバイルドロワーのメインナビ（ホーム・索引・…）が白地にヘッダー用の薄青 `#aab6cc`（2.0:1）で描かれる。コントラスト不合格の明確なバグ。

## 2. 指摘一覧

優先度: P1 = バグまたは読めない／押せない、P2 = 品質・一貫性、P3 = 磨き。難易度: S（1 ファイル・1 時間以内）、M（複数ファイル・半日）、L（設計変更・1 日以上）。file:line は 4d02ded 時点。

### 2.1 記事ページ

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-001 | P1 | 記事（390） | 表 | `.prose-wiki { overflow-wrap: anywhere }`（index.css:198）と `table { min-width: min(100%, 76ch) }`（:371）、`td { min-width: 5em }`（:388）で、用語集の 4 列表がセル幅 81/81/70/125px に潰れ「Asmodia／ns」「Gladiato／r」と英単語が途中で折れる（review2-article-long-m-light-1200.png） | `td, th { overflow-wrap: normal; word-break: keep-all }`。`table { min-width: max(100%, 列数×9rem) }` 相当を `.table-wrap` の横スクロールに任せる。具体的には `@media (max-width: 640px) { .prose-wiki table { min-width: 40rem } }` を追加し、`.table-wrap` の `overflow-x: auto` で横スクロール。右端フェードは既存の実装で出る | S |
| R-002 | P1 | 記事 | 出典 | 段落末の `p.evidence`（rehype-plugins.ts:88）は 12px、中のリンク `a.source-ref` は `0.8em` で 9.6px・高さ 14px・幅 23px（measure: evidenceLink）。グラディエーター記事で 8 行・25 リンク。モバイルでは押せない（WCAG 2.5.8 の 24px 未満） | evidence 行を廃止し、段落末尾にインライン上付き `[1][3]` を付ける（MDN / Wikipedia 方式）。`a.source-ref` は `font-size: 0.75rem`（12px）、`padding: 0 .2em`、`line-height: 1` で高さ 16px 以上を確保し、`display: inline-block; min-height: 24px; vertical-align: top` でタップ領域を取る。rehype 側で `根拠：` 段落を前段落末に結合する | M |
| R-003 | P1 | 記事 | 出典 | 本文中の「根拠：[S02][S05]」（content 由来、ArticlePage の MID 記事 1 段落目）と、rehype が付ける「出典: [S01] [S03]」の 2 表記が同じ画面に並ぶ。「根拠」と「出典」の使い分けが読者に伝わらない | rehype-plugins.ts:81 のラベルを「根拠:」に統一するか、content 側の「根拠：」をすべて段末 evidence に変換する。表記は 1 つにする（推奨: R-002 の上付き化で両方消す） | S |
| R-004 | P2 | 記事 | タイトル行 | 別名行 `article.aliases.join('、')`（ArticlePage.tsx:89）が 13px fg-subtle で h1 直下に並び、「Wisdom Stone、知恵の石(刻印)、スキルポイント、スキルポイントを増やす消耗品」と読める。別名と検索用キーワードが混ざり、サブタイトルに見える | 別名行の先頭に「別名: 」ラベルを付け、検索用キーワード（例「スキルポイントを増やす消耗品」）は content 側で `aliases` から `tags`／`keywords` に分離。表示は 2 件までにして「他 n 件」で折りたたむ。または h1 直下に `article.summary`（平均 93 字）を 15px fg-muted のリード文として出し、別名は末尾のタグ行に移す | M |
| R-005 | P2 | 記事 | メタ | 全 235 記事が `updated: 2026-10-08`。「2026-10-08 更新」（ArticlePage.tsx:94）は情報量ゼロで、「検証済み」バッジも 205/235 で既定値 | 日付が全記事同一の間はメタ行から日付を落とし、「検証済み」は記事ヘッダーでも非表示にして「公式」「要確認」だけ出す（`hideVerified` を渡す）。日付は `sources[].date` の最大値を「出典確認日」として出す方が誠実 | S |
| R-006 | P2 | 記事 | 見出し | 末尾の `h2#sources`「出典」と `h2#related`「関連記事」は `text-base font-semibold`（16px/600、SourcesList.tsx:22、ArticlePage.tsx:135）で、本文 h2（20px/700、金の 28px 線）と階層が違う。見出し scale が記事内で 2 系統 | 本文と同じ `prose-wiki h2` 相当にする（20px/700、下罫線＋金線）か、意図的に小さくするなら 17px/700（h3 相当）に揃えて目次にも載せる | S |
| R-007 | P2 | 記事 | 余白 | 関連記事の最終行からフッターまで 32px（articleBottom 8317 → footerTop 8349）。`py-8` の下 32px だけ。読み終わりの余韻が無く、フッターが本文に食い込んで見える（review2-article-long-d-light-bottom-settled.png） | 記事カラムの下余白を `pb-16`（64px）、記事末尾に `前の記事／次の記事` ナビ（R-008）を置いてからフッター | S |
| R-008 | P2 | 記事 | ナビ | 前後記事ナビが無い（prevNext=0）。サイドバーは `order` による閲覧順で並んでいるのに、記事末で次へ進む導線が無い | ArticlePage 末尾に `nav aria-label="前後の記事"` を追加。同カテゴリ内で `order` の前後を 2 列（左「← 前: タイトル」右「次: タイトル →」）、13px ラベル＋15px タイトル、罫線上下。Stripe / Vercel Docs の pagination と同じ | M |
| R-009 | P2 | 記事 | 目次 | ページ先頭では目次に現在位置が無い（tocActiveAtTop=0）。最初の見出しまでスクロールするまで金線が出ない | `useActiveHeading` で activeId が null のときは先頭見出しを active 扱いにする（`headingIds[0]`）。目次は常にどこか 1 行が強調されている状態にする | S |
| R-010 | P2 | 記事 | 目次 | 目次行の hover が文字色の変化だけ（Toc.tsx:57 `hover:text-fg`）。review2-hover-toc.png で違いが分からない | `hover:bg-muted` を追加し、行全体を `block` のまま `-mx-2 px-2 rounded-[4px]` で面にする | S |
| R-011 | P3 | 記事 | 目次 | 目次の見出し「目次」が 12px/700（Toc.tsx:124）。サイドバーのカテゴリ 13px、本文 16px と比べて最小 | 13px/700 に統一（ui-audit §3.1「補助 13px」） | S |
| R-012 | P2 | 記事 | 表 | 1920 で表幅が 591px（基本情報）〜 783px（用語集）で止まり、h2 の罫線は 944px まで伸びる。表の右端と見出し線の右端が揃わず、ラグが出る（review2-article-mid-w-light.png: table right 943 / h2 right 1296） | `.prose-wiki table { width: 100% }`（列数が少ない表は `td:last-child { width: auto }` で余白を最終列へ）。または表幅を `max-width: 80ch` に揃え、h2 の罫線も同じ幅にする。どちらかに決める（Issue #12 の「表はカラム幅いっぱい」なら前者） | S |
| R-013 | P3 | 記事 | 表 | `th` が `0.8125rem`（13px）、`td` が `0.875rem`（14px）。見出しの方が小さい表は Stripe / MDN に無い | `th` を 14px のまま `font-weight: 600; color: fg-muted` だけで差を付ける | S |
| R-014 | P2 | 記事 | コールアウト | 3 種（注意 232 / 韓国版のみ 70 / 補足 3）がすべて同じ `padding: .25em 0 .25em 1em`、ラベルは `<strong>注意：</strong>` のインライン。本文と同じ 16px/1.8 なので、本文との区別が左 2px 線だけ（review2-article-short-d-light.png） | コールアウトを 15px/1.7、`padding: .5em 0 .5em 1em`、`margin: 1.4em 0` にして本文より半歩引く。ラベルは `display:block; font-size: 13px; letter-spacing: 0; color: var(--warn-fg)`（種類色）で 1 行目に独立させる。`data-kind='note'` の線色 `--info-fg` が未定義（index.css:303-308 には caution / kr のみ） → `.callout[data-kind='note'] { border-left-color: var(--info-fg) }` を追加 | S |
| R-015 | P3 | 記事 | コールアウト | `aside.callout` が 305 個ランドマーク（complementary）として露出する（landmarks: aside ×2 が無名）。スクリーンリーダーのランドマーク一覧が汚れる | rehype で `aside` → `div role="note"`（WAI-ARIA の note ロール）に変更し、`aria-label` に種類名を付ける | S |
| R-016 | P3 | 記事 | 表 | すべての表が `role="region" aria-label="表"`（rehype-plugins.ts:14）。1 記事に 9 個の同名リージョン | `aria-label` を直前の見出しテキスト（`${heading} の表`）にする。無ければ `表 ${n}` | S |
| R-017 | P2 | 記事 | リンク | 本文リンクは `--link`（青）だが、UI 内のリンクに `text-accent-strong`（金）が残る: SearchPage.tsx:67「索引」、ApiKeyForm.tsx:140「Google AI Studio」、AboutPage.tsx:22 ExtLink、MessageContent.tsx:30 の引用番号。ui-direction §3.2 は「accent-strong はリンクに使わない」 | 4 か所を `text-link` に置換。引用番号は `a.source-ref` と同じ青 | S |
| R-018 | P3 | 記事 | パンくず | パンくず 13px、`mb-4`。最後の項目が記事タイトルで、h1 と 24px 差で同じ文言が 2 回並ぶ | 最後の項目（現在ページ）を省き「ホーム › システム」だけにする。MDN / Stripe はこの形 | S |
| R-019 | P3 | 記事 | 見出し | h1 が 32px（`sm:text-[2rem]`、ArticlePage.tsx:85）。ui-audit §3.1 は 28px | `text-[1.75rem]`（28px）に戻し、`leading-[1.35]` | S |
| R-020 | P3 | 記事 | タグ | 「タグ: 知恵の石、スキルポイント、…」が 13px の読点区切りで、リンクであることが hover まで分からない | 各タグを `text-link` にするか、索引タグビューと同じ `#タグ` 表記で 12px 枠付きチップ（index の群見出しと揃える） | S |
| R-021 | P3 | 記事 | 操作 | 「誤りを報告 ↗」「チャットで質問する」が本文と同じ 14px fg の文字リンクで、出典一覧と関連記事の間に浮いている | 出典の h2 と同じ行の右端に 13px fg-muted で寄せる（Zenn の「記事の編集をリクエスト」位置） | S |

### 2.2 ホーム・帯・ヘッダー

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-022 | P1 | ホーム | 情報量 | 1440 でコンテンツが y=830 で終わり、1920 では 700px（homeGeo1920: contentBottom 1015 = footerTop）で下 1/3 が空白（review2-home-w-light.png）。「最近の更新」は `hasDistinctDates` が false で非表示（HomePage.tsx:193）。カテゴリ 11 行＋日課 6 本＋索引リンクしか無い | 下記 R-023〜R-026 の節を追加し、1440 で最低 1.5 画面分にする。順序: 帯 → カテゴリ → 今週の予定／シーズン → 最近の更新 → よく読まれている → 日課・週課 → 索引 | M |
| R-023 | P2 | ホーム | 節 | 「今週の予定」「シーズン終了まで」が無い。`news` カテゴリに「グローバル版の日程」「シーズン1の終了日」があるのに、トップから辿れない | `content/` のニュース記事 frontmatter に `event: { starts, ends }` を持たせ、HomePage に「今週の予定」節（日付 tabular-nums 13px ＋ タイトル、最大 5 行）と「シーズン終了まで n 日」の 1 行（終了日 - today を build 時ではなく client で算出）を追加 | M |
| R-024 | P2 | ホーム | 節 | 「最近の更新」は日付が同一のため消えている。表示条件 `hasDistinctDates` 自体は正しいが、代替が無い | content の `updated` を実際の編集日にする（git log から生成: `git log -1 --format=%cs -- content/x.md`）。build-content で `updated` 未指定時に git 日付を補完し、「最近の更新」を 10 行表示。日付列は `YYYY-MM-DD` のまま | M |
| R-025 | P3 | ホーム | 節 | 「人気」「おすすめ」が無い。アクセス解析は無いので「人気」は作れない | 編集者が選ぶ「まず読む 6 本」（`FEATURED_LINKS`）を `categories.ts` の `DAILY_LINKS` と同じ形で追加し、「はじめての人へ」節として 2 列で出す | S |
| R-026 | P2 | ホーム | 重複 | 帯の h1「AION2 非公式Wiki」（22px）がヘッダーのロゴ文言と 100px 以内で 2 回並ぶ。帯の検索ボックス（h-10）とヘッダーの検索ボタン（h-9）も 150px 以内に 2 つ（review2-home-d-light.png） | 帯の h1 を「AION2 グローバル版 攻略 Wiki」のように役割説明に変えるか、h1 を `sr-only` にして帯は説明文＋検索だけにする。帯の検索を残すならヘッダーの検索ボタンはホームでは非表示（`useMatch('/')` で判定） | S |
| R-027 | P2 | ホーム | カテゴリ行 | 代表記事 3 本が `c.articles.slice(0, 3)`（HomePage.tsx:68）で「クラス = グラディエーター・テンプラー・アサシン」「FAQ = FAQ アカウント・FAQ キャラクター・FAQ 経済」と機械的。Issue #12 の「代表記事」をこのまま出しても価値が無い | `categories.ts` に `lead: readonly string[]` を追加して編集者が選ぶ（例 クラス = クラス一覧・おすすめクラス・クラスの役割分類）。未指定時のみ先頭 3 本 | S |
| R-028 | P2 | ホーム（390） | 情報量 | モバイルではカテゴリの説明と代表記事が `max-sm:hidden`（HomePage.tsx:65）で消え、カテゴリ名＋件数＋chevron の 11 行だけになる。ドロワーの内容と完全に重複 | モバイルでも説明 1 行（13px fg-muted、`line-clamp-1`）を出す。代表記事は省略してよい | S |
| R-029 | P3 | 帯 | 装飾 | `.band-search:hover` に `box-shadow: 0 0 0 4px rgb(112 210 255 / .15)`（index.css:679）の水色グロー。サイト内で唯一のグロー hover で、AI 製 LP の定番表現 | グローを削除し、`hover:border-white` だけにする。`.logo-mark` の `box-shadow: 0 0 8px rgb(112 210 255 / .5)`（:635）も同様に外す | S |
| R-030 | P3 | 帯 | 文言 | 「AION2（グローバル版）の攻略情報。235 記事、最終更新 2026-10-08。」の「最終更新」が全記事同一日で意味を持たない。日付の `-` 区切りは JP サイトでは少数派 | R-024 が入るまで「235 記事」だけにする。日付を出すなら `2026/10/08` 表記に統一（RecentUpdates、SourcesList、ConversationList の `10/8 13:01` と揃える） | S |
| R-031 | P2 | ヘッダー | 角丸 | ヘッダー内のボタンが `rounded-md`（6px: メニュー、ナビ、チャット、設定）と `rounded`（4px: 検索）で混在（measure: navLink 6px / searchBtn 4px）。ui-audit §3.4 は「ボタン・入力 4px」 | ヘッダー内はすべて `rounded`（4px）に統一。`rounded-md` は Header.tsx:27, 57, 96, 109, 121、MobileDrawer.tsx:76、SettingsPage.tsx:253、Composer.tsx:45、CommandPalette.tsx:259 | S |
| R-032 | P3 | ヘッダー | アイコン | 検索アイコン 16px（`size-4`）、設定 18px（`size-[18px]`）、メニュー 20px（`size-5`）、サイドバー chevron 14px。同じ列に 3 サイズ | ヘッダー内アイコンは 18px に統一（`size-[18px]`）。サイドバー・パンくずの chevron は 14px のまま | S |
| R-033 | P3 | ヘッダー | 検索ボタン | 検索ボタンの `w-56 lg:w-64` が固定幅で、1920 でも 256px。Kbd `Ctrl` `K` が右端に貼り付く | `w-64 xl:w-80`。Kbd は 1 つにまとめ `Ctrl K`（`<kbd>Ctrl</kbd>+<kbd>K</kbd>` の `+` を 11px fg-subtle で挟む） | S |
| R-034 | P3 | ヘッダー | 現在位置 | ナビの現在位置（索引）が `font-medium text-white` だけ（Header.tsx:28）。review2-index-d-light.png では「索引」と「このサイトについて」の差が白と薄青の色差だけ | 現在位置に `bg-white/10`（チャット開状態と同じ）を付ける。aria-current は NavLink が付けている（確認済み: 索引:page） | S |
| R-035 | P2 | ヘッダー（dark） | 区切り | ダークでヘッダー `#060a14` とページ背景 `#0a0e17` の明度差が小さく、ホームの帯（`#060a14`→`#0b1630`）と連続して 250px の黒帯に見える（review2-home-d-dark.png）。`.hdr-line::after` のグラデーション線は 55% 透過で見えない | dark の `--header-bg` を `#0c1428`（帯より一段明るい紺）にするか、`.hdr-line::after` の不透明度を dark で 0.9 に上げる。ヘッダー下に 1px の `--line-strong` を足す | S |
| R-036 | P2 | ヘッダー（iOS） | theme-color | `<meta name="theme-color" content="#ffffff">`（index.html:11）と dark `#09090b`（:12）。ヘッダーは `#0f1f3c` / `#060a14` なので iOS Safari のステータスバーがヘッダーと色違いになる。dark の値は旧 zinc 黒で現トークンとも不一致 | light `#0f1f3c`、dark `#060a14` に変更（ヘッダー色に合わせる） | S |

### 2.3 サイドバー・モバイルドロワー

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-037 | P1 | ドロワー（390） | コントラスト | ドロワーのメインナビ（ホーム・索引・このサイトについて・チャット）が `navClass` を流用し `text-header-muted`（#aab6cc）で白地に描かれる（Header.tsx:135, 145）。実測 color rgb(170,182,204) on #fff = 2.0:1（review2-drawer-m-light.png） | ドロワー専用クラス `text-fg hover:bg-muted` を使う。`navClass` に `tone` 引数を足す | S |
| R-038 | P2 | サイドバー | 現在位置 | 現在カテゴリのラベルが他と同じ `text-fg-muted font-medium`（CategoryNav.tsx:38）で、開いている chevron 以外に印が無い。review2-article-mid-d-light.png で「クラス」が他カテゴリと同じ色 | 現在カテゴリ（`isCurrent`）は `text-fg font-semibold`。Issue #12 の「カテゴリ行 15px semibold」は全行に掛かるので、現在カテゴリは加えて `text-fg`、他は `text-fg-muted` で差を付ける | S |
| R-039 | P2 | サイドバー | hover | 記事行の hover が `hover:border-line-strong hover:text-fg`（CategoryNav.tsx:89）。線が 2px の薄灰で、review2-hover-nav-row.png では「アサシン」の文字が濃くなっただけに見える | Issue #12 の「hover は背景のみ」に加えて `hover:bg-muted` を行全体（`-ml-[9px]` 込み）に掛け、左線は現在位置だけに使う | S |
| R-040 | P2 | サイドバー | スクロール | 深い位置の記事（翼: 現在行 top 869/900）を直接開くと、現在行が画面下端ギリギリで、次の記事は見えない。サイドバー内は `scrollTop 0` のまま（sidebarScroll） | `CategoryNav` マウント時と `slug` 変更時に `a[aria-current=page]` を `scrollIntoView({ block: 'center', behavior: 'instant' })`。ただしユーザーがサイドバーをスクロール中なら実行しない（`scrollTop` が 0 以外なら skip） | S |
| R-041 | P3 | サイドバー | 行 | 「一覧（43）」行（CategoryNav.tsx:73）がカテゴリ行の件数「43」と二重。「一覧」だけでは何の一覧か分からない | 「システムの記事一覧」のようにカテゴリ名を含めるか、件数を落として「すべて見る」。Stripe は「Overview」 | S |
| R-042 | P3 | サイドバー | 空 | `category.articles.length === 0` の「準備中」（CategoryNav.tsx:77）は現在発生しないが、文言が 1 語で素っ気ない | 「記事はまだありません」 | S |
| R-043 | P2 | サイドバー | 下端 | `sticky` 箱の `py-6`（WikiShell.tsx:38）で、最下行がビューポート下端 24px 手前で切れる。スクロールバー `scroll-thin` は Windows でも出るが、末尾に余白が無く「まだ下がある」ことが分からない | 内側に `pb-16` を追加。末尾に 1px の `border-t` と「索引へ」リンクを置くと終端が分かる | S |
| R-044 | P3 | ドロワー | 幅 | `w-[min(20rem,86vw)]` = 320px at 390。閉じるボタンの右に 70px の背景しか残らず、背景タップで閉じる操作が狭い | `w-[min(18rem,80vw)]`（288px） | S |
| R-045 | P3 | サイドバー | フォーカス順 | Tab 順が skip → ロゴ → ナビ 2 → 検索 → チャット → 設定 → カテゴリ 11 → 展開中の記事 n → 本文。本文の最初のリンクまで最大 60 回。skip link は `#main` に飛ぶが、`main` の最初はサイドバー | skip link の飛び先を記事カラム（`id="content"`、`tabIndex=-1`）にし、2 本目の skip「サイドバーを飛ばす」をサイドバー先頭に `sr-only focus:not-sr-only` で置く | S |

### 2.4 索引・カテゴリ

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-046 | P1 | 索引（タグ） | バグ | `view=tag` で `groups.length > 1` の「見出しへ移動」nav（IndexPage.tsx:154-166）が 601 タグ分の `#タグ` チップを描画し、画面 3 枚分のチップ壁になる（review2-index-tag-d-light.png）。上の「タグで絞り込み」行（114 タグ）と二重 | タグビューではジャンプ nav を描画しない（`view !== 'tag' && groups.length > 1`）。タグ未選択時は群を作らず「タグを選んでください」とタグ一覧だけ出す。タグ一覧は件数降順ではなく五十音順＋件数で、`MIN_TAG_COUNT` 以上だけ、残りは「すべて表示」 | S |
| R-047 | P2 | 索引（五十音） | 読み | 「その他」が 26 件（11%）: FAQ ×9、IL ×7、Lv45、Twitch ×2、PvP ×2、NC、Steam、DPS、1週目、AION2とは。`reading` が「FAQあかうんと」「IL1400から…」と英字始まりのため `kanaGroup` が null（gojuon.ts:36） | content 側で `reading` を仮名始まりに直す: FAQ→「えふえーきゅー」、IL→「あいえる」、Lv→「れべる」、Twitch→「ついっち」、PvP→「ぴーぶいぴー」、NC→「えぬしー」、Steam→「すちーむ」、DPS→「でぃーぴーえす」、1週目→「いっしゅうめ」、AION2→「あいおんつー」。build-content で `reading` が仮名始まりでなければ警告 | S |
| R-048 | P3 | 索引（五十音） | 群名 | 「その他」は残っても英数字始まりなので「英数字」が正確 | `OTHER_GROUP = '英数字'`（gojuon.ts:5） | S |
| R-049 | P2 | 索引 | 行 | 各行が「タイトル — 別名1、別名2、…（最大 10 個）」で 2〜3 行に伸びる（index-d-light-full.png）。別名は検索用で、一覧に全部出す必要は無い。Wikipedia 索引は 1 行 1 項目 | 別名は 2 件まで＋「他 n」。または A–Z ビューでだけ英語別名を出し、五十音ビューは「タイトル ｜ カテゴリ」の 1 行にする。行高 32px に固定 | S |
| R-050 | P3 | 索引（A–Z） | 表記 | 別名由来のラベルが「alts」「Amp」と小文字・略語で並ぶ。`latinGroup` は最初に英字で始まる候補を採る（gojuon.ts:49） | 表示ラベルは先頭を大文字化（`label[0].toUpperCase()`）。候補は「英字始まりで最長」を採り、略語（4 文字以下の全大文字）は後回し | S |
| R-051 | P3 | 索引 | 絞り込み | プレースホルダ「タイトルで絞り込み」だが `matchesFilter` は別名・タグ・概要も対象（index-groups.ts:40） | 「絞り込み」に短縮（ui-audit §3.5「placeholder は 1 語」） | S |
| R-052 | P3 | 索引 | タブ | `role=tablist` の枠が `rounded-lg`（8px、IndexPage.tsx:86）＋ `bg-surface`。他の segmented（設定のテーマ）は `rounded`（4px）＋ `border-line-input` | 設定の ThemeSetting と同じ見た目に統一（4px、line-input、選択は `bg-muted font-medium`） | S |
| R-053 | P2 | カテゴリ | 情報量 | カテゴリページはタイトルだけの 2〜3 列リスト（review2-category-d-light.png）。何の記事か分からず、サイドバーの一覧と同じ情報 | 各行に `summary` を 13px fg-muted `line-clamp-1` で添える（MDN の landing と同じ）。1 列（`columns` なし）で 48px 行にする | S |
| R-054 | P3 | カテゴリ | 見出し | h1 の下「操作・用語・アカウント・キャラクター」（16px fg-muted）と「35 記事」（14px fg-subtle）が 2 行に分かれ、どちらも説明として弱い | 「35 記事 · 操作・用語・アカウント・キャラクター」の 1 行 13px | S |

### 2.5 検索・コマンドパレット

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-055 | P2 | 検索 | ランキング | 1 文字「オ」で 50 件以上、先頭が「レギオン」「レギ」「レギオン飛行艇」（rank_オ）。「オード」で始まる記事が 5 位。1 文字はバイグラム索引で部分一致するため意味を成さない | 1 文字の仮名クエリは title / alias の前方一致だけに限定し、本文一致を使わない（`searchPages` で `q.length < 2` の分岐）。または「2 文字以上で検索」を結果欄に表示 | S |
| R-056 | P2 | 検索 | ランキング | 「グラディエーター」で 22 件、2 位「タンクの基本」3 位「クラス一覧」は妥当だが 6 位「鍛冶」。本文一致（`searchBody`）は出現回数順で、タイトル一致との境界が無い | 本文一致の結果の前に「本文に一致」の小見出し（11px fg-subtle）を挟む。GitHub 検索の「Code」「Issues」の分け方 | S |
| R-057 | P2 | 検索 | 段組 | 結果が `LIST_COLUMNS`（2 列、2xl で 3 列）に段組みされ、1920 では 1 位 → 2 位が縦、11 位が隣列先頭。ランキングの読み順が崩れる（review2-search-w-light.png） | 検索結果は 1 列固定、`max-w-[48rem]`。50 件を 1 列で縦に読むのが検索の標準（Google / GitHub / MDN） | S |
| R-058 | P2 | 検索 | スニペット | 本文スニペットに表のセル区切り「｜」が生のまま出る（「項目｜内容｜日次リセット｜毎日 07:00 UTC…」）。`search-text` の生成で表を `|` 連結している | build-content の検索用本文で表セルを「、」区切りか改行にし、`makeContextSnippet` で `\s*\|\s*` を「 / 」に置換 | S |
| R-059 | P3 | 検索 | 見出し | 検索ページの h1「検索」と入力の placeholder「検索」が重なる。空状態（review2-search-blank-d-light.png）は入力欄だけで、何を検索できるか示さない | h1 を「記事を検索」、空状態に「タイトル・別名・本文を検索します。例: オードエネルギー、IL1400」を 13px fg-muted で 1 行 | S |
| R-060 | P3 | 検索 | 件数 | 「50 件以上」（SearchPage.tsx:60）は `limit` に達しただけで、実件数が分からない | `searchPages` を limit 無しで走らせ総件数を取り「123 件中 50 件を表示」 | S |
| R-061 | P3 | 検索 | 入力 | 検索ページの入力が `h-12`（48px）。ヘッダー 36px、帯 40px、索引絞り込み 36px、API キー 40px と 4 種類 | 入力高さを 36px（UI 内）と 40px（主入力: 帯・検索ページ・API キー）の 2 種に限定。検索ページは 40px | S |
| R-062 | P3 | パレット | 角丸 | ダイアログが `rounded-xl`（12px、CommandPalette.tsx:183）。ui-audit §3.4 は「パレット 8px」 | `rounded-lg`（8px） | S |
| R-063 | P3 | パレット | 空状態 | 初回（履歴なし）は「ページ」節の 3 行だけで、ダイアログの 7 割が空（review2-palette-empty-d-light.png） | 履歴が無いときは「よく読まれる記事」（R-025 の FEATURED_LINKS）を 5 行出す | S |
| R-064 | P3 | パレット（390） | 位置 | `pt-[10vh]` で帯の上に重なり、入力欄がキーボードに隠れない位置だが、下端が `max-h-[75vh]` でフッターヒントは `sm:flex` で非表示。モバイルで「Esc」Kbd ボタンだけが閉じる手段（背景タップは可） | モバイルでは `Esc` Kbd を「閉じる」テキストボタン（36px）にする | S |
| R-065 | P3 | パレット | 文言 | 「すべての結果」行の矢印アイコン。他では `↗` 文字を使っており、矢印の表現が 2 系統 | 「すべての結果を見る →」のテキストに統一（アイコン削除） | S |

### 2.6 チャットパネル

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-066 | P1 | チャット | 導入 | API キー未設定の初回表示が「例」見出し＋灰色の 3 行＋下部に「Gemini API キーを保存すると使えます」（review2-chat-nokey-fresh-d-light.png）。compact フォーム（ApiKeyForm.tsx:49-80）には Google AI Studio へのリンクが無く、キーの取り方が分からない | 空状態に 3 行の説明を入れる: 「Wiki の記事を根拠に Gemini が答えます。回答には出典が付きます。」「無料の Gemini API キーが必要です。[Google AI Studio で発行 ↗]」「キーはこのブラウザにだけ保存されます」。compact フォームにも `API_KEY_URL` リンクを 13px で付ける。例の 3 行は「質問の例」見出しにし、キー未設定時は非表示 | S |
| R-067 | P2 | チャット | 文言 | 見出し「例」（ChatPanelBody.tsx:92）が 1 字。何の例か分からない | 「質問の例」 | S |
| R-068 | P2 | チャット | 空回答 | 「Wiki に情報がありません」（rag.ts:33）がそのまま本文として表示され、次の行動が無い | 回答がこの文と一致したら、下に「検索で探す →」（`searchPath(question)`）と「索引」のリンクを 13px で添える | S |
| R-069 | P2 | チャット | 吹き出し | ユーザー発言は太字（MessageView.tsx:14）、回答は通常。長い会話では境目が分かりにくい。タイムスタンプ・コピー・再生成が無い | ユーザー発言を `bg-surface rounded-[6px] px-3 py-2` の面にする（右寄せはしない。Kagi Assistant の形）。回答には hover で「コピー」ghost ボタン（13px）を右上に | M |
| R-070 | P3 | チャット | 履歴 | 履歴の各行に「削除」ボタンが常時表示（ConversationList.tsx:59）。4 行で 4 つの「削除」が並び、行タイトルより目立つ | 削除は hover / focus-within で表示（`opacity-0 group-hover:opacity-100 focus-visible:opacity-100`）。モバイルは常時表示 | S |
| R-071 | P3 | チャット | 履歴 | 質問前の会話が「無題」（`c.title || '無題'`）で履歴に残る（seed で確認、`newConversation` 後に送信しない場合に発生し得る） | メッセージ 0 件の会話は `list()` から除外し、`newConversation` は最初の送信時に `create()` する（useChat.ts:158 の遅延作成に寄せる） | S |
| R-072 | P3 | チャット | リサイズ | `ResizeHandle` は hover するまで不可視（`hover:after:bg-fg-subtle`）。幅を変えられることに気付けない | 常時 `after:bg-line` の 1px 線を出し、hover で `fg-subtle`。`title="ドラッグで幅を変更"` | S |
| R-073 | P3 | チャット | 幅 | 既定幅 384px で回答 15px/1.8 の行長が約 22 字。本文（約 44 字）の半分で、箇条書きが 2 行に折れやすい | 既定幅を 420px（`PANEL_DEFAULT_WIDTH`）、文字を 14px/1.7 に | S |
| R-074 | P3 | チャット | ヘッダー | パネル見出し「チャット」14px/700 と「新しい会話」「履歴」ghost ボタン。「履歴」の押下状態 `aria-pressed` はあるが見た目は `bg-muted` のみで、履歴画面中に「チャットに戻る」操作が「履歴」を再度押す・会話を選ぶ・新しい会話の 3 択で分かりにくい | 履歴表示中はパネル見出しを「履歴」に変え、左に「← チャット」ghost ボタンを置く | S |
| R-075 | P3 | チャット（390） | シート | 全画面シートに戻る導線が右上の X だけ。iOS の sheet 慣習（上部のつまみ・左上「閉じる」）が無い | 左上に「閉じる」テキストボタン（36px）、X は残す。`env(safe-area-inset-top)` の余白 | S |
| R-076 | P3 | チャット | 文脈チェック | 「この記事を文脈に含める」チェックボックスが入力欄の上に常時。記事ページ以外では消えるため、入力欄の位置が上下に動く | チェックを入力欄の内側（Enter ヒントの左）に 13px で移す | S |

### 2.7 設定・About・404

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-077 | P2 | 設定 | 説明位置 | `Section` が `description` を子要素の下に置く（SettingsPage.tsx:40）。「モデル」の説明「チャットに使う Gemini のモデル名」が select と「既定: …」の下、3 行目に来る | 説明は見出しの直下（Linear Settings の形）。`<h2>` → `<p class="text-[13px] text-fg-subtle">` → control | S |
| R-078 | P3 | 設定 | 文言 | 陣営テーマの選択肢「既定（両方）」。何が両方か分からない | 「天族＋魔族（既定）」「天族（青）」「魔族（紫）」 | S |
| R-079 | P3 | 設定 | 文言 | 「このブラウザにだけ保存されます」が API キーと会話履歴で 2 回 | 2 節をまとめて「保存データ」節にし、説明を 1 回にする | S |
| R-080 | P3 | 設定（390） | ボタン | モデルの「保存」が全幅 48px、「既定に戻す」が中央寄せの ghost で 2 段に積まれる（review2-settings-m-dark-full.png） | モバイルでは「保存」「既定に戻す」を横並び（`flex-row`）、`既定に戻す` は右寄せ | S |
| R-081 | P3 | About | 文言 | 「チャットについて」節は Issue #12 の「AI チャット」改名の対象外（Issue はヘッダー・パネル・設定・aria-label のみ） | §3 参照。About の h2、ArticlePage の「チャットで質問する」、CommandPalette の QUICK_LINKS、MobileDrawer のボタン、ChatPanel の `aria-label` も「AI チャット」 | S |
| R-082 | P3 | 404 | 文言 | h1「このページは存在しません。」の句点。`useDocumentMeta('ページが見つかりません')` と文言が違う | h1 を「ページが見つかりません」に統一、説明「URL が間違っているか、記事が移動した可能性があります。」を 1 行、ボタンは「ホームへ」「検索」 | S |
| R-083 | P3 | 404 | 枠 | 404 は `mx-auto max-w-3xl` でサイドバー無し。Issue #12 は索引・検索・設定・About にシェルを付けるが 404 は対象外 | 404 も `WikiShell` に入れ、カテゴリから探せるようにする（§3） | S |

### 2.8 タイポグラフィ・色・一貫性

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-084 | P2 | 全体 | 文字サイズ | 記事ページで実測 11 段階: 9.6 / 11 / 12 / 12.8 / 13 / 14 / 15 / 16 / 17 / 20 / 32px（measure: fontSizes）。ui-audit §3.1 は 11 / 12 / 13 / 14 / 16 / 17 / 20 / 28 の 8 段階 | 9.6（evidence 内 source-ref）と 12.8（source-ref `0.8em`）を 12px 固定に、15（チャット本文・Composer）を 14 に、32 を 28 に。`em` 指定を `rem` に置換（index.css:256, 336, 405） | S |
| R-085 | P2 | 全体 | 角丸 | 記事ページで 6px ×18、4px ×6、1px ×1（measure: radii）。ui-audit §3.4 は「ボタン・入力 4px、ポップオーバー 6px、パレット 8px」。実際はヘッダー・サイドバー・Composer・設定が 6px、パレットが 12px | `rounded-md` → `rounded` に一括置換（R-031 の 9 か所）、パレット `rounded-xl` → `rounded-lg`、ConfirmDialog `rounded-md` は 6px のまま可 | S |
| R-086 | P3 | 全体 | ボタン高さ | `Button` sm 32 / md 36 に加え、設定で `className="h-10"`（40px）上書きが 5 か所、Composer の送信 32px、404 の primary 36px | `Size` に `lg: h-10` を追加し、`className` での高さ上書きを禁止 | S |
| R-087 | P3 | 全体 | 入力 | 入力枠の focus が `focus:border-accent`（金 1px）＋ `:focus-visible` の outline 2px（accent-strong）で二重（review2-search-d-light.png の検索欄: 金枠の外に金リング）。帯の検索ボタンは hover で `border-white`＋グロー | 入力は `focus:border-fg-subtle` にし、リングは `:focus-visible` だけに任せる（ui-audit §3.5「フォーカスは accent 2px リング」） | S |
| R-088 | P3 | 全体 | 数字 | 「235 記事」「2026-10-08」「10/8 13:01」「2026-10-05 閲覧」と日付書式が 3 種 | `Intl.DateTimeFormat('ja-JP', {year:'numeric', month:'2-digit', day:'2-digit'})` → `2026/10/08` に統一する `formatDate()` を `lib/format.ts` に作り、全箇所で使う | S |
| R-089 | P3 | 全体（dark） | バッジ | ダークの「要確認」`#fcd34d` on `#0a0e17` は 13.4:1 で問題ないが、枠 `rgb(245 158 11 / .3)` は 1.6:1 で枠として見えない（review2-category-d-dark.png） | ダークの `--warn-line` などバッジ枠を `color-mix(in srgb, var(--warn-fg) 45%, transparent)` に（3:1 以上） | S |
| R-090 | P3 | 全体 | リンク色 | 本文リンク青、UI 内リンク fg＋下線、索引・API キー・About の金、チャット引用番号の金、ホーム「すべての記事（索引）」の青。5 通り | 「本文内＝青＋下線」「UI 内（ナビ・一覧・ボタン風）＝fg」の 2 通りに限定。金はリンクに使わない（R-017） | S |
| R-091 | P3 | 全体 | 文言 | `aria-label="サイト内検索を開く"`（Header.tsx:83）、可視ラベルは「検索」。`title="チャット（Ctrl+J）"` と `aria-keyshortcuts` の二重。「回答の生成を停止」「回答が完了しました」など sr 文言は丁寧だが、可視文言は 1 語でバランスが悪い | 可視テキストがあるボタンの `aria-label` は外す（WCAG 2.5.3 のため可視名と一致させる）。ショートカットは `aria-keyshortcuts` だけ残し `title` は削除 | S |

### 2.9 モバイル・a11y・パフォーマンス

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-092 | P2 | 390 | タップ領域 | ヘッダーの 4 ボタンが 36×36（mobileHeaderBtns）。パンくず 20px、`[S01]` 23×14、記事行 26px、カテゴリ行 32px。44px を満たすのはホームのカテゴリ行（41px）だけ | モバイル（`max-sm`）でヘッダーボタン `size-11`（44px）、パンくず `py-2`、記事行は Issue #12 の 44px、`[S01]` は R-002 | S |
| R-093 | P2 | 390 | 目次 | モバイル目次は `details` で本文の上にだけあり、スクロール後に戻る手段が無い。「ページ上部へ」はデスクトップ目次（Toc.tsx:129）にしか無い | 記事末尾（関連記事の下）に「ページ上部へ ↑」（13px、44px 行）を全幅で置く。または `MobileToc` の summary を `sticky top-[--header-h]` にして常時アクセス可能にする | S |
| R-094 | P2 | 全体 | フォント | `@fontsource/noto-sans-jp` 400/700 で dist に woff2 が 496 個、記事表示で約 90 ファイル・約 900KB を要求（measure: resources）。`font-display: swap` のため実機初回は Yu Gothic → Noto の FOUT が全文で起きる（ローカル計測 CLS 0.03 はキャッシュ済み） | (a) `font-display: optional` に変更（初回は fallback で描画し CLS を 0 にする）。`index.css:80` の `Noto Sans JP Fallback` が `size-adjust: 98%` で用意済みなので実害は小さい。(b) 初期表示で確実に使う subset（latin、ひらがな・カタカナ・JIS 第 1 水準上位）を `<link rel="preload">` で 6 本だけ先読み | S |
| R-095 | P2 | チャット | 転送量 | `chunks-*.js` 3.1MB の JS モジュール（RAG 用チャンク）がチャット初回に読まれ、JS としてパースされる。`search-index.json` 807KB＋`search-text.json` 975KB も初回検索で | chunks を `.json` の `fetch`（gzip 後 ~700KB）に変え、JS パースを避ける。検索索引は `search-text` を 2,000 字→800 字に縮める（スニペット用途なら十分） | M |
| R-096 | P3 | 全体 | 読込表示 | `PageLoading` は 250ms 後にスケルトン。記事間遷移は 83ms（routeMs）なので出ないが、記事 JSON（最大 31KB）＋フォント初回では「白い本文→ドン」になる（review2-perf-80ms.png は本文が完全に白） | ヘッダー・サイドバーは即描画されているので可。本文側だけ `min-height: 60vh` を `RouteFade` に付け、フッターが一瞬上に来る跳ねを防ぐ | S |
| R-097 | P3 | 全体 | ランドマーク | `aside`（サイドバー）と `aside`（目次）はラベル付きで良いが、目次の `aria-label="ページ内の補助情報"`（WikiShell.tsx:48）が中身（目次）と合わない | `aria-label="目次"` は内側の `nav` にあるので、外側 `aside` は `aria-label` を外すか「右カラム」にしない。`aside` 自体を `div` にして `nav` だけ残す | S |
| R-098 | P3 | 全体 | 見出し順 | 索引ページで h1「索引」→ h2「あ行」の間に `role=tablist` と「見出しへ移動」nav があり、h2 の 20 群が 1 ページに並ぶ。SR で h2 ジャンプが 20 回 | 群見出しを h2 のままにし、`nav aria-label="見出しへ移動"` を `aria-controls` 付きのリンクにする（既存で可）。追加対応は不要だが、R-046 のタグビューでは h2 が 601 個になるため必須で直す | S |
| R-099 | P3 | 全体 | reduced-motion | `html { scroll-behavior: smooth }` は `prefers-reduced-motion: no-preference` のときだけ（index.css:177）で正しい。TOC クリックも `prefersReducedMotion()` を見る。問題なし。ただし `Toc.tsx:42` の `scrollIntoView({behavior:'smooth'})` と `html` の smooth が二重で、Chromium では `scrollIntoView` が優先される | `Toc.tsx` の `behavior` 指定を外し、CSS の `scroll-behavior` に一本化（reduced-motion の判定コードも削れる） | S |
| R-100 | P3 | モーション | 感触 | 全体の duration は仕様通り（120/200/320ms）。チャットパネル開 320ms は体感でやや遅く、閉 200ms との非対称が「重い」印象。MessageView のフェード 180ms は仕様外の値（motion-tokens に無い） | パネル開 240ms、閉 160ms。MessageView は `DURATION.base`（200ms）を使う | S |
| R-101 | P3 | モーション | 欠落 | サイドバーの記事行 hover に `transition-colors` はあるが、カテゴリ行ボタン（CategoryNav.tsx:38）には無い（index.css:165 の `:where(button)` 既定で 120ms は掛かる。実測 OK）。目次マーカーの `layoutId` は見出し間を滑るが、目次自体が `useKeepActiveVisible` で `scrollTop` を即時変更するためマーカーが一瞬消えて再出現する | `box.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })` にして目次のスクロールも 200ms で滑らせる | S |

### 2.10 文言（`app/src` の日本語文字列 grep から）

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| R-102 | P3 | 索引 | 文言 | 「件数の多いタグのみ」「すべて表示（601）」（IndexPage.tsx:146） | 「3 件以上のタグ」「すべてのタグ（601）」 | S |
| R-103 | P3 | チャット | 文言 | 「履歴はこのタブを閉じると消えます」「履歴が 5MB を超えています」（ChatPanelBody.tsx:56）が warn 色の帯で常時表示 | 前者は初回だけ 1 回表示して閉じられるようにする。後者は「履歴が 5MB を超えました。古い会話を削除してください」＋「履歴」へのリンク | S |
| R-104 | P3 | 記事 | 文言 | 「記事を読み込めませんでした。ページを再読み込みしてください。」はよいが、`role="alert"` のテキストのみで再試行ボタンが無い | 「再読み込み」secondary ボタンを添える（`location.reload()`） | S |
| R-105 | P3 | 設定 | 文言 | API キー削除後「API キーを削除しました。」が `text-ok`（緑）。削除は成功だが、緑で「削除」を知らせる色使いは逆 | fg-muted の通常文にする | S |
| R-106 | P3 | 全体 | 文言 | ConfidenceBadge の `title`「資料が 1 つの記述を含みます」（ConfidenceBadge.tsx:12）と CONFIDENCE_INFO の「資料が 1 つ」の 2 表記 | 1 つに統一し、バッジを `/about#confidence` へのリンクにする（title 依存をやめる） | S |
| R-107 | P3 | 検索 | 文言 | 空状態「「ぞんざいな文字列xyz」に一致する記事はありません。 索引」。末尾の「索引」リンクが文として浮く | 「一致する記事はありません。索引から探す →」の 1 文にし、リンクは文の一部に | S |
| R-108 | P3 | ホーム | 文言 | 「すべての記事（索引）」の括弧表記 | 「索引（235 記事）→」 | S |

## 3. Issue #12 への補足

Issue #12 の 4 項目は方向として正しい。実装時に以下まで広げないと、同じ指摘が第 3 回で出る。

1. **全幅（#12-1）**: `PAGE_CONTAINER` は 4d02ded 時点で既に `w-full px-4 sm:px-6`（layout.ts:2）。残っているのは設定 `mx-auto max-w-2xl`（SettingsPage.tsx:245）、About `max-w-3xl`（AboutPage.tsx:36）、404 `max-w-3xl`（NotFoundPage.tsx:10）の個別コンテナ。これら 3 ページも `WikiShell` に入れる（R-083）。表については「カラム幅いっぱい」を `table { width: 100% }` で実装するか決める（R-012）。本文 `80ch` は維持でよいが、1920 で本文 710px に対し表 783px・h2 線 944px と右端が 3 段階にずれるので、「表と h2 線は同じ幅」をルールに入れる。
2. **ホームのサイドバー（#12-2）**: サイドバー追加でホームの左 288px が埋まるが、本文側の薄さ（R-022）は変わらない。「代表記事」は `slice(0,3)` ではなく編集者指定（R-027）にし、モバイルでも説明 1 行を残す（R-028）。帯の h1 とヘッダーのロゴ文言の重複（R-026）も同時に解消する。
3. **AI チャット表記（#12-3）**: 対象に About の h2「チャットについて」、ArticlePage の「チャットで質問する」、CommandPalette `QUICK_LINKS`、MobileDrawer のボタン、ChatPanel `aria-label`、`document.title`／`useDocumentMeta` の文言を加える（R-081）。スパークルアイコンはヘッダーとパネル見出しだけに限定し、本文中のリンク「AI チャットで質問」にはアイコンを付けない。キー未設定時の導入文（R-066）を「AI チャット」の初回画面として一緒に作る。
4. **サイドバー行（#12-4）**: 行高 40px・15px・18rem は妥当。加えて (a) 現在カテゴリのラベル色（R-038）、(b) hover を背景のみにする際に左線は現在位置専用にする（R-039）、(c) 現在行を初回に `scrollIntoView({block:'center'})`（R-040）、(d) 「一覧（n）」行の文言（R-041）、(e) 下端余白（R-043）、(f) ドロワーのメインナビの色（R-037、コントラスト不合格）を同じ PR で直す。18rem にすると 1440 では本文が 784px → 752px になるので、`80ch`（710px）は維持できる。1280 では本文 592px になり、目次（13rem）を隠す閾値 `MIN_CONTENT=640`（shell-layout.ts:19）に掛かる。1280〜1365 で目次が消える副作用を確認すること。

## 4. 実装順

難易度の内訳: S 100 件、M 8 件、L 0 件。優先度: P1 7 件、P2 39 件、P3 62 件（計 108 件）。

### Phase A: バグと読めない箇所（P1 全部、半日）

| ファイル | 項目 |
|---|---|
| `app/src/index.css` | R-001（モバイル表）、R-014 の note 線色、R-084 の em→rem |
| `app/scripts/content/rehype-plugins.ts`, `index.css` | R-002, R-003（evidence の上付き化）M |
| `app/src/features/wiki/IndexPage.tsx` | R-046（タグビューのチップ壁）S |
| `app/src/components/Header.tsx` | R-037（ドロワー文字色）S |
| `app/src/features/chat/ChatPanelBody.tsx`, `ApiKeyForm.tsx` | R-066, R-067（導入文・キー発行リンク）S |
| `content/*.md`（reading） | R-047（その他 26 件）S |

### Phase B: 一貫性の一括置換（P2/P3 の S を機械的に、半日）

| ファイル | 項目 |
|---|---|
| `Header.tsx`, `MobileDrawer.tsx`, `SettingsPage.tsx`, `Composer.tsx`, `CommandPalette.tsx` | R-031, R-062, R-085（角丸） |
| `SearchPage.tsx`, `ApiKeyForm.tsx`, `AboutPage.tsx`, `MessageContent.tsx`, `HomePage.tsx` | R-017, R-090（リンク色） |
| `Header.tsx`（アイコン）、各入力 | R-032, R-033, R-061, R-087 |
| `lib/format.ts` 新設 → `HomePage.tsx`, `SourcesList.tsx`, `ConversationList.tsx`, `ArticlePage.tsx` | R-030, R-088（日付） |
| `button-class.ts` | R-086 |
| `index.html` | R-036（theme-color） |
| `index.css` | R-029（グロー削除）、R-035（dark ヘッダー）、R-013, R-089 |
| `components/ConfidenceBadge.tsx`, `ArticlePage.tsx` | R-005, R-106 |

### Phase C: 記事ページの読み心地（P2、1 日）

| ファイル | 項目 |
|---|---|
| `ArticlePage.tsx` | R-004（別名／リード文）M、R-006, R-007, R-018, R-019, R-020, R-021 |
| `ArticlePage.tsx` 新規 `PrevNext.tsx` | R-008 M |
| `Toc.tsx`, `useActiveHeading.ts` | R-009, R-010, R-011, R-099, R-101 |
| `index.css` | R-012（表幅）、R-014（コールアウト） |
| `rehype-plugins.ts` | R-015, R-016 |
| `CategoryNav.tsx`, `WikiShell.tsx` | R-038〜R-045（Issue #12 と同 PR） |

### Phase D: ホーム・索引・検索（P2、1.5 日）

| ファイル | 項目 |
|---|---|
| `HomePage.tsx`, `categories.ts`, `build-content` | R-022〜R-028 M（git 日付、今週の予定、代表記事） |
| `IndexPage.tsx`, `index-groups.ts`, `gojuon.ts` | R-048〜R-052 |
| `CategoryPage.tsx`, `ArticleList.tsx` | R-053, R-054 |
| `SearchPage.tsx`, `lib/search.ts`, `build-content`（search-text） | R-055〜R-060, R-107 |
| `CommandPalette.tsx` | R-063〜R-065 |

### Phase E: チャット・設定・モバイル・パフォーマンス（P2/P3、1 日）

| ファイル | 項目 |
|---|---|
| `MessageView.tsx`, `ConversationList.tsx`, `ResizeHandle.tsx`, `chat-panel-store.ts`, `useChat.ts` | R-068〜R-076, R-103 |
| `SettingsPage.tsx` | R-077〜R-080, R-105 |
| `AboutPage.tsx`, `NotFoundPage.tsx` | R-081〜R-083 |
| `Header.tsx`, `Breadcrumb.tsx`, `Toc.tsx` | R-092, R-093（モバイル） |
| `main.tsx`, `index.html`, `vite.config.ts`, `chunk-loader.ts` | R-094, R-095（フォント・chunks）M |
| `WikiShell.tsx`, `Layout.tsx` | R-096, R-097, R-045 |
| `motion-tokens.ts`, `MessageView.tsx`, `index.css` | R-100 |

検証: 各 Phase 末に `npm run lint && npm run typecheck && npm test && npm run build`、Playwright で 1440 / 1920 / 390 × light / dark を `research/shots/review2-after-*.png` に出し、本表の「現状」の計測値（evidenceLink 9.6px → 12px、radii の 6px 件数、fontSizes の段階数、drawerLink の color、tag チップ数）が変わったことを数値で確認する。
