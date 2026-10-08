# コードレビュー 3（PR #40 / Issue #37 Phase E 事後所見の対応）

- 日付: 2026-10-08
- レビュー: typescript-reviewer（読み取り専用）、PM が差分を再確認
- 結果: CRITICAL / HIGH なし。MEDIUM 1・LOW 5 → MEDIUM と LOW 3 件を取り込み前に修正（87b0740）

## 所見と対応

| # | 重大度 | 箇所 | 内容 | 対応 |
|---|---|---|---|---|
| 1 | MEDIUM | `features/chat/MessageView.tsx` | 非 HTTPS では `navigator.clipboard` が無く `writeText` が同期的に投げるため失敗表示が出ない | `Promise.resolve().then(...)` 経由で捕捉、`aria-live="polite"` 追加 |
| 2 | LOW | `features/chat/reopening-repository.ts` | 開き直し中の `markLost()` が `stale = false` で上書きされる | await の前にフラグを下ろす |
| 3 | LOW | 同上 | 古い接続の失敗が、別操作の開き直し後にもう一度 reopen を起こす | 使った接続を記憶し `inner` が替わっていれば再開き直ししない。テスト追加 |
| 4 | LOW | `vite.config.ts` | JSDoc が 2 連続で先頭のものが宙に浮く | 統合 |
| 5 | LOW | 同上 MessageView | ラベル変化が読み上げられない | #1 で対応 |
| 6 | LOW | `lib/motion-tokens.test.ts` | CSS 文字列の厳密一致で空白変更に弱い | 受容 |

## 計測（PE-1 / PE-2）

| 項目 | 変更前 | 変更後 |
|---|---|---|
| search-text.json（raw） | 487,466 B | 991,989 B |
| search-text.json（gzip） | 157,359 B | 315,621 B |
| 検索評価 hit@5 | 95%（38/40） | 95%（38/40） |
| フォント preload | 400 の 4 本 | 400/700 の 8 本・146,292 B |
