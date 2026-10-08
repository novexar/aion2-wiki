オーナー要望（2026-10-08）: 記事の更新有無を確認して更新できる仕組み。GitHub Actions は使わずローカル PC で、手動実行（`/update-wiki`）を基本とし、トークン消費を抑える。

## 1. 検知スクリプト（LLM なし）`app/scripts/watch-sources.mjs`
- [ ] `npm run watch` で実行。前回状態 `research/watch/state.json`（git 管理）と比較し、レポート `research/watch/report-YYYY-MM-DD.md` を出力。変化ありなら終了コード 1、なしなら 0
- [ ] 信号の取得（本文は取らない。UA はブラウザ、取得間隔 1 秒、失敗はレポートに記録して続行）
  - 公式告知索引: `https://aion2builds.com/sources/` の告知リンク一覧（URL と題名の集合差）
  - Steam ニュース RSS: `https://store.steampowered.com/feeds/news/app/3393110/`（新規エントリ）
  - Global DB バージョン: `https://aion2.gaming.tools/ja` のバージョン文字列（現在 2.0.5.0）と sitemap の新規 URL（`activities/`, `maps/`, `quests/`, `items/` のカテゴリ別に集計）
  - 攻略サイト新着: redfreshet / aion2-times の WordPress RSS、aion2maps / aion2hub の sitemap lastmod
  - 記事の出典 URL（`content/**/*.md` の `sources[].url`）: HEAD リクエストの ETag / Last-Modified / Content-Length の変化。JS 描画ページ（plaync）は対象外とし「要目視」に分類
- [ ] 逆引き表: 出典 URL → 記事 id を生成し、変化した URL ごとに影響記事を列挙
- [ ] レポート構成: ① 公式告知の新規、② DB バージョン・新規 URL（新トピック候補）、③ 攻略サイトの新着、④ 変化した出典 URL と影響記事、⑤ 取得失敗。末尾に「推奨アクション」（news 記事の追加／影響記事の数値確認／新規記事の調査）
- [ ] テスト: 前回状態のフィクスチャと取得結果のモックで差分計算を検証

## 2. `/update-wiki` 手順書 `.claude/commands/update-wiki.md`
- [ ] 手順: `git pull` → `npm run watch` → 変化なしなら「更新なし（日付）」と報告して終了 → 変化ありなら作業ブランチ `update/YYYY-MM-DD` を作り、レポートの推奨アクション順に処理
- [ ] 処理ルール（`research/WATCH-RULES.md` に詳細）: 影響記事は変更ページだけを取得して数値・日付・状態の差分のみ修正（全面書き直し禁止）。公式告知は `news/` に 1 本追加。新トピックは `research/RESEARCH-RULES.md` に従い調査して新記事＋台帳に行追加（初週は community＋要確認）。`updated` と `sources[].date` を更新
- [ ] 検証: `npm run content`、`npm run eval:retrieval`（hit@5 が 90% を下回ったら報告）、`npm run lint && npm run typecheck && npm test`
- [ ] 提出: push → PR 作成（本文にレポートの要約と変更記事一覧）→ typescript-reviewer ではなく内容レビュー用の短いチェック（出典 URL が本文を裏付けるか抜き取り 3 件）を同じセッションで実施 → オーナーが取り込み
- [ ] トークン節約の明記: 読むのはレポートと影響記事のみ、ページは `research/cache/` に ETag 付きで保存して未変更は再取得しない、最終報告は 300 字以内
- [ ] 検知で `state.json` を更新するのは PR 取り込み後（`npm run watch -- --commit-state`）とし、未処理の変化が次回も出るようにする

## 3. 任意のリマインド（Windows タスクスケジューラ）
- [ ] `scripts/windows/register-watch-task.ps1`: 週 1 回（月曜 09:00）に `npm run watch` を実行し、変化があれば Windows 通知（BurntToast 不要、`msg` または PowerShell の通知 API）と `research/watch/` のレポート作成のみ。`StartWhenAvailable` を有効化（起動していなければ次回起動時に実行）。更新は行わない
- [ ] 解除用 `unregister-watch-task.ps1` と README への手順追記

## 4. ドキュメント
- [ ] `app/README.md` に「更新運用」節: `/update-wiki` の使い方、レポートの読み方、state の扱い、リマインド登録
- [ ] `research/WATCH-RULES.md`: 更新エージェントの判断基準（何を直し何を直さないか、community→verified の昇格条件、矛盾時の優先順）

## 完了条件
- 手元で `npm run watch` を 2 回実行し、1 回目でレポートが出て 2 回目（state 更新後）で「変化なし」になることを確認
- 全ゲート通過。PR で提出
