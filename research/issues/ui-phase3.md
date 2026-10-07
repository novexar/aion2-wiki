UI/UX 監査（`research/ui-audit.md`、スクリーンショットは `research/shots/`）の フェーズ 3: 画面再設計（L）。

担当モデル: Opus 5.5（general-purpose、単独実行）。親 Issue: UI/UX 改修 Epic。

## ルール
- 各 ID の「改修内容」列の文言・値をそのまま適用する。独自のスローガンや説明文を足さない
- 完了した ID はこの Issue のチェックを付ける（`gh issue edit` で本文更新）
- 完了後に `npm run lint && npm run typecheck && npm test && npm run build` を通し、コミットして push（main → 自動デプロイ）
- Phase 内のファイル単位でコミットを分ける

## 対象（ファイル別）
- `routes/HomePage.tsx` 全面: U-062（4.1／4.2 ワイヤー）
- `content/SCHEMA.md`, `scripts/content/frontmatter.ts`, 全記事の `title`: U-066（改題は content 担当エージェントへ。改題後に nav・index・related の再ビルド）
- `scripts/content/chunker.ts`, `features/chat/chunk-loader.ts`: U-116
- `features/wiki/data.ts`, `scripts/content/build.ts`: U-117

## チェックリスト
- [ ] U-062 (P1/L) ホーム・IA: ヒーロー撤廃。サイト名 1 行 + 検索ボックス（高さ 40px、幅 42rem）+ 直下にカテゴリ一覧。4 章のワイヤー参照
- [ ] U-066 (P1/L) 全画面・IA: タイトル規約を SCHEMA.md に追加: 18 文字以内、括弧・コロン禁止、補足は `summary` と `aliases` へ。build.ts で 24 文字超を警告。既…
- [ ] U-116 (P2/M) 性能・チャット: chunks.json は id・記事 id・位置のみにし、本文は `pages/<id>.json` から取得。必要チャンクだけ遅延読込
- [ ] U-117 (P3/S) 性能・初期 JS: nav.json から summary を外し一覧ページで遅延取得。tags は索引ページのみ
