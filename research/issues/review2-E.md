辛口レビュー 2 回目（`research/ui-review-2.md`、スクリーンショット `research/shots/review2-*.png`）の Phase E: チャット・設定・モバイル・パフォーマンス。

各 ID の「改修内容」列をそのまま適用する（文言・値・レイアウト）。設計規則は `research/ui-audit.md` 3 章と `research/ui-direction.md` 3・5 章。スローガン・説明文・装飾の追加禁止。

## 対象（ファイル別）
: チャット・設定・モバイル・パフォーマンス（P2/P3、1 日）

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

## チェックリスト（26 件）
- [ ] R-068 (P2/S) チャット・空回答: 回答がこの文と一致したら、下に「検索で探す →」（`searchPath(question)`）と「索引」のリンクを 13px で添える
- [ ] R-069 (P2/M) チャット・吹き出し: ユーザー発言を `bg-surface rounded-[6px] px-3 py-2` の面にする（右寄せはしない。Kagi Assistant の形）。回答には hover で「コピー」ghost ボタン（13px）…
- [ ] R-070 (P3/S) チャット・履歴: 削除は hover / focus-within で表示（`opacity-0 group-hover:opacity-100 focus-visible:opacity-100`）。モバイルは常時表示
- [ ] R-071
- [ ] R-072 (P3/S) チャット・リサイズ: 常時 `after:bg-line` の 1px 線を出し、hover で `fg-subtle`。`title="ドラッグで幅を変更"`
- [ ] R-073 (P3/S) チャット・幅: 既定幅を 420px（`PANEL_DEFAULT_WIDTH`）、文字を 14px/1.7 に
- [ ] R-074 (P3/S) チャット・ヘッダー: 履歴表示中はパネル見出しを「履歴」に変え、左に「← チャット」ghost ボタンを置く
- [ ] R-075 (P3/S) チャット（390）・シート: 左上に「閉じる」テキストボタン（36px）、X は残す。`env(safe-area-inset-top)` の余白
- [ ] R-076 (P3/S) チャット・文脈チェック: チェックを入力欄の内側（Enter ヒントの左）に 13px で移す
- [ ] R-103 (P3/S) チャット・文言: 前者は初回だけ 1 回表示して閉じられるようにする。後者は「履歴が 5MB を超えました。古い会話を削除してください」＋「履歴」へのリンク
- [ ] R-077 (P2/S) 設定・説明位置: 説明は見出しの直下（Linear Settings の形）。`<h2>` → `<p class="text-[13px] text-fg-subtle">` → control
- [ ] R-078 (P3/S) 設定・文言: 「天族＋魔族（既定）」「天族（青）」「魔族（紫）」
- [ ] R-079 (P3/S) 設定・文言: 2 節をまとめて「保存データ」節にし、説明を 1 回にする
- [ ] R-080 (P3/S) 設定（390）・ボタン: モバイルでは「保存」「既定に戻す」を横並び（`flex-row`）、`既定に戻す` は右寄せ
- [ ] R-105 (P3/S) 設定・文言: fg-muted の通常文にする
- [ ] R-081 (P3/S) About・文言: §3 参照。About の h2、ArticlePage の「チャットで質問する」、CommandPalette の QUICK_LINKS、MobileDrawer のボタン、ChatPanel の `aria-lab…
- [ ] R-082 (P3/S) 404・文言: h1 を「ページが見つかりません」に統一、説明「URL が間違っているか、記事が移動した可能性があります。」を 1 行、ボタンは「ホームへ」「検索」
- [ ] R-083 (P3/S) 404・枠: 404 も `WikiShell` に入れ、カテゴリから探せるようにする（§3）
- [ ] R-092 (P2/S) 390・タップ領域: モバイル（`max-sm`）でヘッダーボタン `size-11`（44px）、パンくず `py-2`、記事行は Issue #12 の 44px、`[S01]` は R-002
- [ ] R-093 (P2/S) 390・目次: 記事末尾（関連記事の下）に「ページ上部へ ↑」（13px、44px 行）を全幅で置く。または `MobileToc` の summary を `sticky top-[--header-h]` にして常時アクセス可能にす…
- [ ] R-094 (P2/S) 全体・フォント: (a) `font-display: optional` に変更（初回は fallback で描画し CLS を 0 にする）。`index.css:80` の `Noto Sans JP Fallback` が `si…
- [ ] R-095 (P2/M) チャット・転送量: chunks を `.json` の `fetch`（gzip 後 ~700KB）に変え、JS パースを避ける。検索索引は `search-text` を 2,000 字→800 字に縮める（スニペット用途なら十分）
- [ ] R-096 (P3/S) 全体・読込表示: ヘッダー・サイドバーは即描画されているので可。本文側だけ `min-height: 60vh` を `RouteFade` に付け、フッターが一瞬上に来る跳ねを防ぐ
- [ ] R-097 (P3/S) 全体・ランドマーク: `aria-label="目次"` は内側の `nav` にあるので、外側 `aside` は `aria-label` を外すか「右カラム」にしない。`aside` 自体を `div` にして `nav` だけ残す
- [ ] R-045 (P3/S) サイドバー・フォーカス順: skip link の飛び先を記事カラム（`id="content"`、`tabIndex=-1`）にし、2 本目の skip「サイドバーを飛ばす」をサイドバー先頭に `sr-only focus:not-sr-only…
- [ ] R-100 (P3/S) モーション・感触: パネル開 240ms、閉 160ms。MessageView は `DURATION.base`（200ms）を使う

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build`
- 変更した画面を Playwright で 1440 / 390、light / dark で撮影し `research/shots/r2e-*.png` に保存、Read で確認
- チェックを更新し、未対応はコメントに理由を書く。Issue は閉じない
