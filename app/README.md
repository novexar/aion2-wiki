# AION2 非公式Wiki（アプリ）

`../content/` の Markdown を唯一の情報源とする静的 Wiki です。GitHub Pages（`https://novexar.github.io/aion2-wiki/`）で公開します。
サーバー・データベースはありません。全文検索はブラウザ内、相談チャットは利用者自身の Gemini API キーでブラウザから直接呼び出します。

- 技術: Vite 7 / React 19 / TypeScript（strict）/ Tailwind CSS v4 / react-router v7 / MiniSearch / @google/genai / motion
- 仕様書: [SPEC.md](./SPEC.md)、記事スキーマ: [../content/SCHEMA.md](../content/SCHEMA.md)

## 開発

Node.js 22 以上（CI は 24）を使います。

```bash
cd app
npm install
npm run dev:samples   # content/_sample のサンプル記事を含めて開発サーバーを起動
npm run dev           # 本番と同じく _ 始まりのディレクトリを除外して起動
```

開発サーバーは `http://localhost:5173/aion2-wiki/` で開きます。

### npm スクリプト

| コマンド                                  | 内容                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run content`                         | `content/` → `src/generated/` を生成（`_` 始まりのディレクトリは除外）           |
| `npm run content:samples`                 | 上記に `content/_sample` などを含める（`INCLUDE_SAMPLES=1`）                     |
| `npm run dev` / `npm run dev:samples`     | コンテンツ生成 → 開発サーバー                                                    |
| `npm run build` / `npm run build:samples` | コンテンツ生成 → `vite build`（出力: `dist/`、`404.html`・`.nojekyll` 付き）     |
| `npm run preview`                         | ビルド結果の確認（`http://localhost:4173/aion2-wiki/`）                          |
| `npm run typecheck`                       | コンテンツ生成 → `tsc -b`                                                        |
| `npm run watch`                           | 出典・公式告知の更新を検知してレポートを出力（`-- --commit-state` で状態を記録） |
| `npm run lint`                            | ESLint + Prettier のチェック                                                     |
| `npm run format`                          | Prettier で整形                                                                  |
| `npm test` / `npm run coverage`           | Vitest（カバレッジ付き）                                                         |

### 環境変数

| 変数              | 既定値         | 用途                                 |
| ----------------- | -------------- | ------------------------------------ |
| `BASE_PATH`       | `/aion2-wiki/` | 公開パス。ルート直下に置く場合は `/` |
| `INCLUDE_SAMPLES` | なし           | `1` で `content/_*` を含める         |
| `CONTENT_DIR`     | `../content`   | 記事ディレクトリ（app からの相対）   |

API キーや `.env` は不要です。リポジトリにキーを置かないでください。

### ディレクトリ構成

```
app/
  scripts/build-content.ts     コンテンツビルドの入口
  scripts/content/             frontmatter 検証・Markdown 変換・wikilink・チャンク分割
  src/generated/               生成物（git 管理外）
  src/lib/                     tokenizer・検索・RAG・Gemini クライアント・storage など
  src/features/wiki|search|chat
  src/components/ src/routes/
```

生成物は次のとおりです。

- `nav.json`: カテゴリごとの記事 ID（閲覧順）と、一覧用の最小メタデータ（タイトル・カテゴリ・信頼度・更新日・order）。初期バンドルに含める
- `meta.json`: 全記事のメタデータ（概要・タグ・別名・読みを含む）。索引ページを開いた時に遅延読込
- `pages/<id>.json`: 記事ごとの HTML・目次・出典（記事を開いた時に遅延読込）。`pages.json` は全記事をまとめたもの
- `search-index.json`: 記事検索用 MiniSearch インデックス（題名・別名・タグ・概要・見出し。検索を開いた時に読込）
- `search-text.json`: 記事ごとの本文先頭 2,000 文字。検索の本文一致（部分一致）とスニペットに使う
- 旧 `chunks.json`（チャット専用索引）は廃止。チャットは `search-index.json` で記事を上位 5 件選び、その `chunk-text` だけ読む
- `chunk-text/<id>.json`: 記事ごとのチャンク（`{ heading, anchor, text }` の配列、約 600 文字ずつ）。回答候補の記事分だけ遅延読込

## 記事を追加する

1. `content/<category>/<slug>.md` を作ります。`<category>` は SCHEMA.md のディレクトリ名、`<slug>` は英小文字ケバブケースです。
2. 先頭に SCHEMA.md の frontmatter（`id`・`title`・`category`・`tags`・`summary`・`confidence`・`region`・`updated`・`sources` は必須）を書きます。
3. 本文は `##` 見出しから書きます。他の記事へは `[[slug]]`、`[[slug|表示名]]`、`[[slug#見出し]]` でリンクします。
4. 出典は本文中で `根拠：[S01]` のように参照すると、記事末尾の出典一覧へのリンクになります。
5. `npm run content` を実行して検証します。

frontmatter に不備があると、ビルドはファイル名と理由を表示して失敗します。

```
[content] コンテンツの検証に失敗しました（1 件）:
content/dungeons/odyle-energy.md
  - tags: tags は 2〜6 個にしてください
  - sources[0].url: sources[].url は http(s) の URL にしてください
```

未作成の記事への `[[リンク]]` や、存在しない `related` は警告になります。ビルドは失敗しません。

- 任意項目 `reading`（ひらがな）を書くと、索引の五十音順に使われます。漢字だけのタイトルで `reading` がなければ「その他」に入ります。
- `_` で始まるディレクトリ（`content/_sample` など）とファイルは本番ビルドから除外されます。

## 更新運用

記事の更新有無はローカル PC で確認します（GitHub Actions は使いません）。検知は LLM を使わない `npm run watch`、記事の更新は Claude Code の `/update-wiki` で行います。判断基準は [../research/WATCH-RULES.md](../research/WATCH-RULES.md) です。

### /update-wiki の使い方

リポジトリのルートで Claude Code を開き、`/update-wiki` を実行します（手順書: [../.claude/commands/update-wiki.md](../.claude/commands/update-wiki.md)）。

1. `git pull` → `npm run watch`。変化がなければ「更新なし」と報告して終了します。
2. 変化があれば `update/YYYY-MM-DD` ブランチを作り、レポートの「推奨アクション」の順に、影響する記事の差分だけを直します。
3. `npm run content`、`npm run eval:retrieval`（hit@5 が 90% 未満なら報告）、lint / typecheck / test を通します。
4. 出典の抜き取り確認（3 件）をして PR を作ります。取り込みはオーナーが行います。

### レポートの読み方

`npm run watch` は `research/watch/report-YYYY-MM-DD.md` を出力します。終了コードは、変化ありが 1、なしが 0、スクリプトの異常が 2 です。

| 区分                          | 内容                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ① 公式告知の新規              | aion2builds の告知索引と Steam ニュースの新規。`content/news/` に追加する候補                                                             |
| ② DB バージョン・新規 URL     | aion2.gaming.tools のバージョンと、sitemap の新規 URL（activities / maps / quests / items）。新トピック候補                               |
| ③ 攻略サイトの新着            | redfreshet・aion2-times の RSS、aion2maps・aion2hub の sitemap 更新                                                                       |
| ④ 変化した出典 URL と影響記事 | 記事の `sources[].url` の HEAD（ETag / Last-Modified / Content-Length）の変化と、その URL を出典にする記事。plaync 系は取得せず「要目視」 |
| ⑤ 取得失敗                    | 取得できなかった信号。失敗しても他の信号は続行し、前回の状態を保持します                                                                  |

末尾の「推奨アクション」が処理の順番です。取得は、ブラウザ UA・同一ホスト 1 秒間隔・1 件 15 秒でタイムアウトで行います。Cloudflare 配下のサイトが Node の fetch を拒否するため、`curl` があれば `curl` で取得します。全体で 2〜3 分かかります。

### state.json の扱い

`research/watch/state.json`（git 管理）は「処理済みの時点」です。`npm run watch` は読むだけで、更新しません。このため、未処理の変化は次回も報告されます。

PR をオーナーが取り込んだ後に、`main` を取得して `npm run watch -- --commit-state` を実行し、`state.json` をコミットします。最初の実行（`state.json` なし）は、現在の一覧すべてを新規として報告します。

### リマインド（任意、Windows）

週 1 回（月曜 09:00）に `npm run watch` を実行し、変化があれば Windows 通知を出すタスクを登録できます。通知とレポートの作成だけで、記事の更新はしません。PC が起動していなかった場合は、次に使えるときに実行します（`StartWhenAvailable`）。

```powershell
# 登録（リポジトリのルートで）
powershell -ExecutionPolicy Bypass -File scripts\windows\register-watch-task.ps1
# 解除
powershell -ExecutionPolicy Bypass -File scripts\windows\unregister-watch-task.ps1
```

実行ログは `research/watch/last-run.log`（git 管理外）に残ります。

## デプロイ

`main` に push すると `.github/workflows/deploy.yml` が動きます。

1. `npm ci`
2. lint、typecheck、test
3. `npm run build`
4. `app/dist` を GitHub Pages にデプロイ

初回だけ、GitHub のリポジトリ設定で **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にしてください。

SPA のため、`dist/404.html` に `index.html` のコピーを出力しています。`/aion2-wiki/wiki/...` に直接アクセスしても表示されます。

## Gemini API キーの取得（チャット機能）

チャットは、質問に関係する Wiki のチャンクを MiniSearch で上位 8 件取得し、その抜粋だけを根拠に Gemini が回答します。

1. [Google AI Studio](https://aistudio.google.com/apikey) に Google アカウントでログインします。
2. 「Create API key」でキーを発行します。無料枠があります。
3. サイトの「チャット」または「設定」画面にキーを貼り付けて保存します。

- キーはブラウザの `localStorage` にのみ保存されます。設定画面から削除できます。
- 会話履歴は `sessionStorage` に保存されます。タブを閉じると消えます。
- 既定のモデルは `gemini-flash-latest`（最新の Flash 系を指す別名）です。設定画面で変更できます。
