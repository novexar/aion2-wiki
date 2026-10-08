辛口レビュー 2 回目（`research/ui-review-2.md`、スクリーンショット `research/shots/review2-*.png`）の Phase D: ホーム・索引・検索。

各 ID の「改修内容」列をそのまま適用する（文言・値・レイアウト）。設計規則は `research/ui-audit.md` 3 章と `research/ui-direction.md` 3・5 章。スローガン・説明文・装飾の追加禁止。

## 対象（ファイル別）
: ホーム・索引・検索（P2、1.5 日）

| ファイル | 項目 |
|---|---|
| `HomePage.tsx`, `categories.ts`, `build-content` | R-022〜R-028 M（git 日付、今週の予定、代表記事） |
| `IndexPage.tsx`, `index-groups.ts`, `gojuon.ts` | R-048〜R-052 |
| `CategoryPage.tsx`, `ArticleList.tsx` | R-053, R-054 |
| `SearchPage.tsx`, `lib/search.ts`, `build-content`（search-text） | R-055〜R-060, R-107 |
| `CommandPalette.tsx` | R-063〜R-065 |

## チェックリスト（24 件）
- [ ] R-022 (P1/M) ホーム・情報量: 下記 R-023〜R-026 の節を追加し、1440 で最低 1.5 画面分にする。順序: 帯 → カテゴリ → 今週の予定／シーズン → 最近の更新 → よく読まれている → 日課・週課 → 索引
- [ ] R-023 (P2/M) ホーム・節: `content/` のニュース記事 frontmatter に `event: { starts, ends }` を持たせ、HomePage に「今週の予定」節（日付 tabular-nums 13px ＋ タイトル…
- [ ] R-024 (P2/M) ホーム・節: content の `updated` を実際の編集日にする（git log から生成: `git log -1 --format=%cs -- content/x.md`）。build-content で `updat…
- [ ] R-025 (P3/S) ホーム・節: 編集者が選ぶ「まず読む 6 本」（`FEATURED_LINKS`）を `categories.ts` の `DAILY_LINKS` と同じ形で追加し、「はじめての人へ」節として 2 列で出す
- [ ] R-026 (P2/S) ホーム・重複: 帯の h1 を「AION2 グローバル版 攻略 Wiki」のように役割説明に変えるか、h1 を `sr-only` にして帯は説明文＋検索だけにする。帯の検索を残すならヘッダーの検索ボタンはホームでは非表示（`useMa…
- [ ] R-027 (P2/S) ホーム・カテゴリ行: `categories.ts` に `lead: readonly string[]` を追加して編集者が選ぶ（例 クラス = クラス一覧・おすすめクラス・クラスの役割分類）。未指定時のみ先頭 3 本
- [ ] R-028 (P2/S) ホーム（390）・情報量: モバイルでも説明 1 行（13px fg-muted、`line-clamp-1`）を出す。代表記事は省略してよい
- [ ] R-048 (P3/S) 索引（五十音）・群名: `OTHER_GROUP = '英数字'`（gojuon.ts:5）
- [ ] R-049 (P2/S) 索引・行: 別名は 2 件まで＋「他 n」。または A–Z ビューでだけ英語別名を出し、五十音ビューは「タイトル ｜ カテゴリ」の 1 行にする。行高 32px に固定
- [ ] R-050 (P3/S) 索引（A–Z）・表記: 表示ラベルは先頭を大文字化（`label[0].toUpperCase()`）。候補は「英字始まりで最長」を採り、略語（4 文字以下の全大文字）は後回し
- [ ] R-051 (P3/S) 索引・絞り込み: 「絞り込み」に短縮（ui-audit §3.5「placeholder は 1 語」）
- [ ] R-052 (P3/S) 索引・タブ: 設定の ThemeSetting と同じ見た目に統一（4px、line-input、選択は `bg-muted font-medium`）
- [ ] R-053 (P2/S) カテゴリ・情報量: 各行に `summary` を 13px fg-muted `line-clamp-1` で添える（MDN の landing と同じ）。1 列（`columns` なし）で 48px 行にする
- [ ] R-054 (P3/S) カテゴリ・見出し: 「35 記事 · 操作・用語・アカウント・キャラクター」の 1 行 13px
- [ ] R-055 (P2/S) 検索・ランキング: 1 文字の仮名クエリは title / alias の前方一致だけに限定し、本文一致を使わない（`searchPages` で `q.length < 2` の分岐）。または「2 文字以上で検索」を結果欄に表示
- [ ] R-056 (P2/S) 検索・ランキング: 本文一致の結果の前に「本文に一致」の小見出し（11px fg-subtle）を挟む。GitHub 検索の「Code」「Issues」の分け方
- [ ] R-057 (P2/S) 検索・段組: 検索結果は 1 列固定、`max-w-[48rem]`。50 件を 1 列で縦に読むのが検索の標準（Google / GitHub / MDN）
- [ ] R-058
- [ ] R-059 (P3/S) 検索・見出し: h1 を「記事を検索」、空状態に「タイトル・別名・本文を検索します。例: オードエネルギー、IL1400」を 13px fg-muted で 1 行
- [ ] R-060 (P3/S) 検索・件数: `searchPages` を limit 無しで走らせ総件数を取り「123 件中 50 件を表示」
- [ ] R-107 (P3/S) 検索・文言: 「一致する記事はありません。索引から探す →」の 1 文にし、リンクは文の一部に
- [ ] R-063 (P3/S) パレット・空状態: 履歴が無いときは「よく読まれる記事」（R-025 の FEATURED_LINKS）を 5 行出す
- [ ] R-064 (P3/S) パレット（390）・位置: モバイルでは `Esc` Kbd を「閉じる」テキストボタン（36px）にする
- [ ] R-065 (P3/S) パレット・文言: 「すべての結果を見る →」のテキストに統一（アイコン削除）

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build`
- 変更した画面を Playwright で 1440 / 390、light / dark で撮影し `research/shots/r2d-*.png` に保存、Read で確認
- チェックを更新し、未対応はコメントに理由を書く。Issue は閉じない
