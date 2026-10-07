# AION2 非公式 Wiki（グローバル版・日本語）

AION2 グローバル版（2026-10-05 正式開始）を始めたばかりの人向けの非公式 Wiki です。
公開サイト: **https://novexar.github.io/aion2-wiki/**

- `content/` — 記事（Markdown、1 ファイル 1 トピック、出典と信頼度付き）。スキーマは `content/SCHEMA.md`
- `app/` — Vite + React 19 + Tailwind v4 の静的サイト。日本語全文検索、索引、Gemini API（自分のキー）による相談チャット。開発手順は `app/README.md`
- `research/` — 網羅対象の台帳、情報源の評価、調査ルール、監査報告

## 情報の信頼度

| 表示 | 意味 |
| --- | --- |
| official | NCSOFT 公式告知・ガイドで確認 |
| verified | 独立した 2 つ以上の資料で一致 |
| community | 1 資料のみ。記事冒頭に「要確認」 |

噂・単一ユーザーの発言・韓国版限定の仕様は掲載しないか、明示しています。

## 記事を追加・修正する

1. `content/<category>/<slug>.md` を `content/SCHEMA.md` に従って作成
2. `cd app && npm ci && npm run content` で検証（frontmatter・リンク切れ）
3. `main` に push すると GitHub Actions が自動でビルド・デプロイ

本サイトは非公式のファンサイトで、NCSOFT とは関係ありません。
