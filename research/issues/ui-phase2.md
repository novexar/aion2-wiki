UI/UX 監査（`research/ui-audit.md`、スクリーンショットは `research/shots/`）の フェーズ 2: コンポーネント修正（M）。

担当モデル: Sonnet 5.5（general-purpose、単独実行）。親 Issue: UI/UX 改修 Epic。

## ルール
- 各 ID の「改修内容」列の文言・値をそのまま適用する。独自のスローガンや説明文を足さない
- 完了した ID はこの Issue のチェックを付ける（`gh issue edit` で本文更新）
- 完了後に `npm run lint && npm run typecheck && npm test && npm run build` を通し、コミットして push（main → 自動デプロイ）
- Phase 内のファイル単位でコミットを分ける

## 対象（ファイル別）
- `scripts/content/markdown.ts`, `rehype-plugins.ts`, `wikilink.ts`, `build.ts`: U-084（コールアウト）、U-085（evidence クラス）、U-101、U-108、U-019、U-008（git 日時）
- `routes/HomePage.tsx`, `features/wiki/ArticleList.tsx`, `lib/categories.ts`: U-007、U-063、U-064、U-065
- `features/wiki/IndexPage.tsx`, `index-groups.ts`: U-069、U-071
- `features/search/SearchResultRow.tsx`, `lib/search.ts`, `scripts/content/*`（index 生成）: U-073、U-074、U-115
- `features/search/CommandPalette.tsx`: U-025、U-076
- `components/CategoryNav.tsx`: U-068
- `features/chat/ChatPage.tsx`, `MessageContent.tsx`, `lib/rag.ts`: U-092、U-119
- `features/wiki/Toc.tsx`: U-111
- `index.html`, フォント self-host: U-114

## チェックリスト
- [ ] U-084 (P1/M) 記事・視覚: scripts/content/markdown.ts に rehype プラグインを追加し、先頭の `**ラベル**：` で `<aside class="callout" da…
- [ ] U-085 (P2/S) 記事・視覚: ビルド時に `根拠：` 始まりの段落へ `class="evidence"` を付け、12px・fg-subtle・margin-top 0.25em で前段落の付記として表示。ラ…
- [ ] U-101 (P2/S) 記事・可読性: slug 化で全角記号を `-` に置換（`結論-迷ったらこの順番`）。既存アンカーは変わるが外部参照はない
- [ ] U-108 (P3/S) 記事・ナビ: rehype で `a[href^=http]` に `target=_blank rel=noopener noreferrer class=external` を付け、`::a…
- [ ] U-019 (P2/M) 記事・IA: build.ts で本文末尾の `## 関連記事` 節を除去し frontmatter `related` に統合。アプリ側は 1 箇所のみ描画
- [ ] U-008 (P1/M) ホーム・IA: 見出し「最近の更新」、説明文削除。build.ts で `git log -1 --format=%cI -- content/<path>` の日時を `updated` の代わ…
- [ ] U-007 (P1/M) ホーム・IA: 見出し「日課・週課」、説明文削除。自動抽出をやめ、編集者が選ぶ固定 6 本（例: 日課・週課チェックリスト、リセット時刻、使命、シューゴフェスタ、次元侵攻、デイリーダンジョン）を …
- [ ] U-063 (P1/M) ホーム・視覚: 表形式 1 列（カテゴリ名｜件数｜説明｜代表記事 3 本）。lg 以上で 2 列。空セルを作らない
- [ ] U-064 (P2/M) ホーム・IA: 「最近の更新」を日付｜タイトル｜カテゴリ の 3 列表 10 行（1 カラム）、「日課・週課」は固定 6 本の 1 行リスト
- [ ] U-065 (P2/M) ホーム／カテゴリ・視覚: 更新一覧では要約を出さない。バッジは `community`（要確認）と `official`（公式）のときだけテキスト表示、既定値の検証済みは一覧に出さない
- [ ] U-069 (P2/M) 索引・IA: Wikipedia 索引型: 1 列、タイトルは通常ウェイト、別名は同行末尾に「— 別名1、別名2」12px、カテゴリは右端固定幅 6rem。2 列は xl 以上のみ
- [ ] U-071 (P2/M) 索引・IA: 件数 3 以上のみ表示 + 「すべて表示」。チップではなくテキストリンクを読点区切りで並べる
- [ ] U-073 (P2/M) 検索・視覚: アイコン削除。バッジは要確認／公式のみ。別名はクエリに一致したものだけ
- [ ] U-074 (P2/M) 検索・IA: search index の storeFields に本文テキスト（先頭 2,000 文字）を含め、一致位置の前後 80 文字を表示
- [ ] U-115 (P2/M) 性能・検索: JSON を `fetch` して `MiniSearch.loadJSON`。storeFields から本文を外し、目標 gz 300kB 以下
- [ ] U-025 (P2/S) パレット・文言: 「最近開いた記事」「ページ」の 2 節に分割（U-076 と連動）
- [ ] U-076 (P2/M) パレット・IA: 直近に開いた記事（localStorage に最大 5 件）に置換。初回は「ページ」節のみ
- [ ] U-068 (P2/M) サイドバー・相互作用: 行全体を開閉ボタンにし、カテゴリ一覧へのリンクは開いた先頭に「一覧（35）」行として置く
- [ ] U-092 (P2/M) チャット・視覚: 文中は上付き番号リンク `[1]`、末尾「出典」に番号付きで記事名。未解決の `[…]` は非表示
- [ ] U-119 (P1/M) チャット・導線: 通常のチャット画面を出し、コンポーザー位置に「Gemini API キーを保存すると使えます」+ 入力 1 行 + 「保存」。保存後そのまま質問できる
- [ ] U-111 (P2/S) 記事・a11y: `matchMedia('(min-width: 80rem)')` で片方のみ描画
- [ ] U-114 (P2/S) 性能・フォント: Noto Sans JP 400／700 のみを self-host（`@fontsource/noto-sans-jp`、`font-display: swap`、`size-a…
