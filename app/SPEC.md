# AION2 非公式Wiki — アプリ仕様書（実装者向け）

## 目的

`content/` 配下の Markdown（スキーマは `content/SCHEMA.md`）を唯一の情報源として、
GitHub Pages（`https://novexar.github.io/AION2/`）で動く静的 Wiki を作る。
- 全文検索（日本語対応）と索引
- Gemini API を使った「相談チャットボット」（ユーザー自身の API キーをブラウザに保存、サーバー無し）
- 世の中にある一流のドキュメントサイト（Linear Docs / Stripe Docs / Vercel Docs / Raycast）水準の UI/UX

## 技術スタック（固定）

- Vite 7 + React 19 + TypeScript（strict）
- Tailwind CSS v4（`@tailwindcss/vite`）。daisyUI は使わない。shadcn/ui 風の自前コンポーネント可（Radix primitives は可）
- ルーティング: `react-router` v7（BrowserRouter）。GH Pages 用に `404.html` を `index.html` のコピーとして出力し、`base: '/AION2/'`
- 検索: `minisearch`。日本語は **文字 bigram** のカスタム tokenizer（CJK は2文字 n-gram、英数字は小文字の単語）。`aliases`・`title`・`tags` に高いブースト
- Markdown: ビルド時に `unified` + `remark-parse` + `remark-gfm` + `remark-rehype` + `rehype-slug` + `rehype-autolink-headings` + `rehype-stringify` で HTML 化。`[[slug]]` を内部リンクに変換する独自 remark プラグイン
- Frontmatter: `gray-matter` + `zod` で検証（必須項目欠落や未知の category はビルド失敗）
- チャット: `@google/genai`（新しい統合 SDK。`@google/generative-ai` は非推奨なので使わない）。npm で最新版と対応モデル名を確認する。デフォルトモデルは設定画面で変更可能、初期値は Gemini の最新 flash 系
- アニメーション: `motion`（framer-motion の後継）を控えめに
- アイコン: `lucide-react`
- テスト: `vitest` + `@testing-library/react`。ビルドスクリプト（tokenizer、frontmatter 検証、wikilink 変換、チャンク分割、RAG のプロンプト組立）は必ずユニットテスト
- Lint: eslint（typescript-eslint, react-hooks）+ prettier

## リポジトリ構成

```
AION2/
  content/            Markdown（情報源）
  app/                Vite アプリ（この仕様書のある場所）
    scripts/build-content.ts   content/ → app/src/generated/{pages.json, search-index.json, chunk-text/*.json, nav.json}
    src/
      generated/      生成物（git 管理外。CI でビルド）
      components/     UI
      features/search, features/chat, features/wiki
      lib/            tokenizer, rag, gemini client, storage
      routes/
  .github/workflows/deploy.yml   push to main → pnpm/npm ci → build-content → vite build → deploy-pages
```

`content/` の読み込みパスは `../content`（app から相対）。`npm run build` は `build-content` → `vite build` を順に行う。

## 画面

1. **ホーム `/`**: ヒーロー（検索ボックス大）、カテゴリーグリッド、「今日の日課」クイックリンク、更新履歴（updated 降順）
2. **記事 `/wiki/:category/:slug`**: 左サイドバー（カテゴリ別ナビ、現在位置ハイライト）、本文、右に目次（スクロール連動）、上部パンくず、冒頭に confidence バッジ（official=緑 / verified=青 / community=琥珀「要確認」）と更新日、末尾に出典一覧（S01… と外部リンク、`rel="noopener noreferrer"`）、関連記事カード
3. **索引 `/index`**: 五十音・A–Z・カテゴリ・タグで絞り込める一覧。aliases も表示
4. **検索**: ヘッダーの検索ボックスと `⌘K / Ctrl+K` のコマンドパレット。入力即時に結果（タイトル・カテゴリ・一致箇所のハイライト・confidence）。キーボード操作（↑↓ Enter Esc）。検索結果ページ `/search?q=`
   - 本文一致: `search-text.json` は各記事の本文先頭 2000 文字を保持し、初回の検索／チャット利用時に遅延取得する。本文一致（サイト検索・チャットの候補選定）の唯一の元データ
5. **チャット `/chat`**: 
   - 初回は API キー設定を促す（`localStorage` に保存、「このキーはあなたのブラウザにしか保存されません」「Google AI Studio で無料発行」の案内、キー削除ボタン）
   - RAG: 質問 → MiniSearch で上位 8 チャンク取得 → システムプロンプト（「以下の Wiki 抜粋のみを根拠に日本語で回答。根拠がなければ『Wiki に情報がありません』と答える。各主張の末尾に [記事タイトル] を付ける」）→ `generateContentStream` でストリーミング表示
   - 回答末尾に参照記事チップ（クリックで記事へ）
   - 会話履歴は `sessionStorage`。マルチターン対応（直近 6 往復）
   - エラー（キー無効、レート制限、ネットワーク）はユーザー向け文言で表示
6. **設定**: テーマ（system/light/dark）、Gemini モデル名、API キー
7. **About `/about`**: 非公式であること、情報の信頼度の説明、出典方針、ソースへのリンク、GitHub リポジトリ

## デザイン指針（最重要）

- 「AI が作った感じ」を避ける: 紫グラデーション、意味のないガラス効果、絵文字見出し、全部が角丸カード、は禁止
- 参考: Linear Docs、Stripe Docs、Vercel Docs、Raycast、Arc。密度の高い情報設計、余白のリズム、明確な階層
- 配色: ニュートラルなベース（zinc/stone 系）＋ AION らしい **単一のアクセント**（深い金 `#C9A227` 系 or ティール）。ダークモードを一級市民として設計（`prefers-color-scheme` + 手動トグル、`data-theme`）
- タイポグラフィ: 本文は `Inter` + `Noto Sans JP`（Google Fonts）。見出しは tracking-tight。本文の日本語行間 1.8、最大幅 72ch。表は横スクロール可
- コンポーネントの状態（hover/focus-visible/active/disabled）を全部定義。フォーカスリングは必ず見える
- モバイル: 320px から崩れない。サイドバーはドロワー。目次は折りたたみ
- `prefers-reduced-motion` を尊重
- Lighthouse: Performance/A11y/Best Practices/SEO すべて 90 以上を目標。初期 JS は code-splitting（記事ページ、チャットは遅延読込。`@google/genai` はチャット画面でのみ読込）
- OGP/meta: タイトル・description を記事ごとに設定（`react-helmet-async` or 手動 `document.title`）

## 品質ゲート

- `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` がすべて通る
- `content/` に frontmatter 不備があればビルドが失敗し、ファイル名と理由を表示
- 生成物 `src/generated/` は `.gitignore`
- README（`app/README.md`）に開発手順・コンテンツ追加手順・デプロイ手順

## GitHub Pages

- `.github/workflows/deploy.yml`: `actions/checkout` → `actions/setup-node@v4`(node 24, cache npm) → `npm ci` (working-directory: app) → `npm run build` → `actions/upload-pages-artifact`(path: app/dist) → `actions/deploy-pages`。`permissions: pages: write, id-token: write`
- `vite.config.ts` の `base` は `process.env.BASE_PATH ?? '/AION2/'`
- `dist/.nojekyll` を出力

## やらないこと

- サーバー・DB・認証。すべて静的
- API キーをリポジトリに置くこと。`.env` も不要
- コンテンツの執筆（別エージェントが `content/` に書く）。実装者は `content/_sample/` にスキーマ準拠のサンプル記事を 3 本だけ置いて動作確認する（本番ビルド時は `_` 始まりディレクトリを除外）
