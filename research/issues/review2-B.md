辛口レビュー 2 回目（`research/ui-review-2.md`、スクリーンショット `research/shots/review2-*.png`）の Phase B: 一貫性の一括置換。

各 ID の「改修内容」列をそのまま適用する（文言・値・レイアウト）。設計規則は `research/ui-audit.md` 3 章と `research/ui-direction.md` 3・5 章。スローガン・説明文・装飾の追加禁止。

## 対象（ファイル別）
: 一貫性の一括置換（P2/P3 の S を機械的に、半日）

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

## チェックリスト（19 件）
- [ ] R-031 (P2/S) ヘッダー・角丸: ヘッダー内はすべて `rounded`（4px）に統一。`rounded-md` は Header.tsx:27, 57, 96, 109, 121、MobileDrawer.tsx:76、SettingsPage.ts…
- [ ] R-062 (P3/S) パレット・角丸: `rounded-lg`（8px）
- [ ] R-085 (P2/S) 全体・角丸: `rounded-md` → `rounded` に一括置換（R-031 の 9 か所）、パレット `rounded-xl` → `rounded-lg`、ConfirmDialog `rounded-md` は 6px…
- [ ] R-017 (P2/S) 記事・リンク: 4 か所を `text-link` に置換。引用番号は `a.source-ref` と同じ青
- [ ] R-090 (P3/S) 全体・リンク色: 「本文内＝青＋下線」「UI 内（ナビ・一覧・ボタン風）＝fg」の 2 通りに限定。金はリンクに使わない（R-017）
- [ ] R-032 (P3/S) ヘッダー・アイコン: ヘッダー内アイコンは 18px に統一（`size-[18px]`）。サイドバー・パンくずの chevron は 14px のまま
- [ ] R-033 (P3/S) ヘッダー・検索ボタン: `w-64 xl:w-80`。Kbd は 1 つにまとめ `Ctrl K`（`<kbd>Ctrl</kbd>+<kbd>K</kbd>` の `+` を 11px fg-subtle で挟む）
- [ ] R-061 (P3/S) 検索・入力: 入力高さを 36px（UI 内）と 40px（主入力: 帯・検索ページ・API キー）の 2 種に限定。検索ページは 40px
- [ ] R-087 (P3/S) 全体・入力: 入力は `focus:border-fg-subtle` にし、リングは `:focus-visible` だけに任せる（ui-audit §3.5「フォーカスは accent 2px リング」）
- [ ] R-030 (P3/S) 帯・文言: R-024 が入るまで「235 記事」だけにする。日付を出すなら `2026/10/08` 表記に統一（RecentUpdates、SourcesList、ConversationList の `10/8 13:01` …
- [ ] R-088 (P3/S) 全体・数字: `Intl.DateTimeFormat('ja-JP', {year:'numeric', month:'2-digit', day:'2-digit'})` → `2026/10/08` に統一する `formatD…
- [ ] R-086 (P3/S) 全体・ボタン高さ: `Size` に `lg: h-10` を追加し、`className` での高さ上書きを禁止
- [ ] R-036 (P2/S) ヘッダー（iOS）・theme-color: light `#0f1f3c`、dark `#060a14` に変更（ヘッダー色に合わせる）
- [ ] R-029 (P3/S) 帯・装飾: グローを削除し、`hover:border-white` だけにする。`.logo-mark` の `box-shadow: 0 0 8px rgb(112 210 255 / .5)`（:635）も同様に外す
- [ ] R-035 (P2/S) ヘッダー（dark）・区切り: dark の `--header-bg` を `#0c1428`（帯より一段明るい紺）にするか、`.hdr-line::after` の不透明度を dark で 0.9 に上げる。ヘッダー下に 1px の `--line…
- [ ] R-013 (P3/S) 記事・表: `th` を 14px のまま `font-weight: 600; color: fg-muted` だけで差を付ける
- [ ] R-089 (P3/S) 全体（dark）・バッジ: ダークの `--warn-line` などバッジ枠を `color-mix(in srgb, var(--warn-fg) 45%, transparent)` に（3:1 以上）
- [ ] R-005 (P2/S) 記事・メタ: 日付が全記事同一の間はメタ行から日付を落とし、「検証済み」は記事ヘッダーでも非表示にして「公式」「要確認」だけ出す（`hideVerified` を渡す）。日付は `sources[].date` の最大値を「出典確認日…
- [ ] R-106 (P3/S) 全体・文言: 1 つに統一し、バッジを `/about#confidence` へのリンクにする（title 依存をやめる）

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build`
- 変更した画面を Playwright で 1440 / 390、light / dark で撮影し `research/shots/r2b-*.png` に保存、Read で確認
- チェックを更新し、未対応はコメントに理由を書く。Issue は閉じない
