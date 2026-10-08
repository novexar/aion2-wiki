---
description: ソースの更新を検知し、影響する記事だけを直して PR にする（ローカル手動実行）
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

AION2 非公式Wiki の記事を更新します。作業は `app/` の `npm run watch` が出すレポートに基づいて進め、判断基準は `research/WATCH-RULES.md` に従います。GitHub Actions は使いません。

今日の日付を `YYYY-MM-DD` として使います。

## 手順

1. 最新化
   - `git checkout main && git pull --ff-only`
   - 未コミットの変更がある場合は、作業を止めてオーナーに報告します。

2. 検知
   - `cd app && npm install --silent && npm run watch`
   - 終了コードで分岐します。
     - 0: 変化なし。「更新なし（YYYY-MM-DD）」とだけ報告して終了します。ブランチも PR も作りません。
     - 1: 変化あり。手順 3 へ進みます。
     - 2: スクリプトの異常終了。エラーを報告して終了します。
   - レポートは `research/watch/report-YYYY-MM-DD.md` です。変化ありの場合に、このレポートと `research/WATCH-RULES.md` を読みます（変化なしの場合はどちらも読みません）。

3. 作業ブランチ
   - `git checkout -b update/YYYY-MM-DD`

4. 処理（レポートの「推奨アクション」の順）
   - 公式告知の新規（①）: `content/news/` に記事を 1 本追加します。その後、影響を受ける記事を列挙します。
   - 変化した出典 URL（④）: 影響記事ごとに、変化した URL のページだけを取得し、数値・日付・状態の差分だけを直します。全面的な書き直しはしません。本文に差が見つからなければ記事は変更しません。
   - 新トピック（②③）: `research/RESEARCH-RULES.md` に従って調査し、新規記事と `research/topic-inventory.md` の台帳行を追加します。初週は `confidence: community` とし、冒頭に `> **要確認**：` を置きます。
   - 変更した記事は `updated` と、取り直した `sources[].date` を更新します。
   - ページ取得は `research/cache/` に ETag 付きで保存し、未変更のページは再取得しません（`research/WATCH-RULES.md` の 7 章）。
   - 要目視の公式ページは、公式告知に関係する記事だけ確認します。
   - 読むのはレポートと影響記事だけです。それ以外の記事は開きません。

5. 検証（`app/` で実行。失敗したら直してから進みます）
   - `npm run content`
   - `npm run eval:retrieval` — hit@5 が 90% を下回った場合は、PR を出す前にオーナーへ報告し、下がった原因（追加・変更した記事）を示します。
   - `npm run lint && npm run typecheck && npm test`

6. 出典の抜き取り確認（同じセッションで実施）
   - 変更または追加した記事から出典を 3 件選び（新規記事を優先）、出典 URL のページを取得して、本文の該当する主張を裏付けているか確認します。
   - 裏付けがない場合は、本文を直すか主張を外します。結果（確認した URL と判定）を PR 本文に書きます。

7. 提出
   - 変更をコミットします（形式: `docs: YYYY-MM-DD の更新（<要点>）`）。`research/watch/state.json` はコミットしません。
   - `git push -u origin update/YYYY-MM-DD`
   - `gh pr create --base main --head update/YYYY-MM-DD --title "docs: YYYY-MM-DD の記事更新" --body "<本文>"`
   - PR 本文には次を書きます。
     - レポートの要約（5 区分の件数と、主な変化）
     - 変更・追加した記事の一覧（id と変更内容を 1 行ずつ）
     - 検証結果（`npm run content`、hit@5 の値、lint / typecheck / test）
     - 出典の抜き取り確認の結果
     - 要確認事項（取得できなかった URL、要目視のまま残したもの）
   - マージ・クローズはしません。

8. 最終報告（300 字以内）
   - PR 番号、変更記事数、新規記事数、hit@5、要確認事項だけを書きます。

## state.json について

`research/watch/state.json` は、オーナーが PR を取り込んだ後に更新します。この手順の中では更新しません。取り込み前に更新すると、未処理の変化が次回のレポートから消えます。

`npm run watch -- --commit-state` は再取得せず、直前の `npm run watch` が保存した `research/watch/last-run.json`（git 管理外）を `state.json` に反映します。このため、PR が取り込まれた直後に、同じ PC で実行します。間に別の `npm run watch` を実行すると、その回の結果が反映されます。`main` を取得してから次を実行し、`state.json` をコミットします。

```
git checkout main && git pull --ff-only
cd app && npm run watch -- --commit-state
```

## 守ること

- 本文を書き直さず、差分だけ直す。
- 公式 > DB > 攻略サイトの順で採用する（`research/WATCH-RULES.md` の 5 章）。
- `unverified`（噂・単一ユーザーの発言・韓国版のみの仕様）は掲載しない。
- `main` に直接 push しない。
