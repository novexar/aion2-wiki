辛口レビュー 2 回目（`research/ui-review-2.md`、スクリーンショット `research/shots/review2-*.png`）の Phase A: バグと読めない箇所（P1）。

各 ID の「改修内容」列をそのまま適用する（文言・値・レイアウト）。設計規則は `research/ui-audit.md` 3 章と `research/ui-direction.md` 3・5 章。スローガン・説明文・装飾の追加禁止。

## 対象（ファイル別）
: バグと読めない箇所（P1 全部、半日）

| ファイル | 項目 |
|---|---|
| `app/src/index.css` | R-001（モバイル表）、R-014 の note 線色、R-084 の em→rem |
| `app/scripts/content/rehype-plugins.ts`, `index.css` | R-002, R-003（evidence の上付き化）M |
| `app/src/features/wiki/IndexPage.tsx` | R-046（タグビューのチップ壁）S |
| `app/src/components/Header.tsx` | R-037（ドロワー文字色）S |
| `app/src/features/chat/ChatPanelBody.tsx`, `ApiKeyForm.tsx` | R-066, R-067（導入文・キー発行リンク）S |
| `content/*.md`（reading） | R-047（その他 26 件）S |

## チェックリスト（10 件）
- [ ] R-001 (P1/S) 記事（390）・表: `td, th { overflow-wrap: normal; word-break: keep-all }`。`table { min-width: max(100%, 列数×9rem) }` 相当を `.table…
- [ ] R-014 (P2/S) 記事・コールアウト: コールアウトを 15px/1.7、`padding: .5em 0 .5em 1em`、`margin: 1.4em 0` にして本文より半歩引く。ラベルは `display:block; font-size: 13px…
- [ ] R-084 (P2/S) 全体・文字サイズ: 9.6（evidence 内 source-ref）と 12.8（source-ref `0.8em`）を 12px 固定に、15（チャット本文・Composer）を 14 に、32 を 28 に。`em` 指定を `r…
- [ ] R-002 (P1/M) 記事・出典: evidence 行を廃止し、段落末尾にインライン上付き `[1][3]` を付ける（MDN / Wikipedia 方式）。`a.source-ref` は `font-size: 0.75rem`（12px）、`pa…
- [ ] R-003 (P1/S) 記事・出典: rehype-plugins.ts:81 のラベルを「根拠:」に統一するか、content 側の「根拠：」をすべて段末 evidence に変換する。表記は 1 つにする（推奨: R-002 の上付き化で両方消す）
- [ ] R-046 (P1/S) 索引（タグ）・バグ: タグビューではジャンプ nav を描画しない（`view !== 'tag' && groups.length > 1`）。タグ未選択時は群を作らず「タグを選んでください」とタグ一覧だけ出す。タグ一覧は件数降順ではなく五…
- [ ] R-037 (P1/S) ドロワー（390）・コントラスト: ドロワー専用クラス `text-fg hover:bg-muted` を使う。`navClass` に `tone` 引数を足す
- [ ] R-066 (P1/S) チャット・導入: 空状態に 3 行の説明を入れる: 「Wiki の記事を根拠に Gemini が答えます。回答には出典が付きます。」「無料の Gemini API キーが必要です。[Google AI Studio で発行 ↗]」「キーは…
- [ ] R-067 (P2/S) チャット・文言: 「質問の例」
- [ ] R-047 (P2/S) 索引（五十音）・読み: content 側で `reading` を仮名始まりに直す: FAQ→「えふえーきゅー」、IL→「あいえる」、Lv→「れべる」、Twitch→「ついっち」、PvP→「ぴーぶいぴー」、NC→「えぬしー」、Steam→「す…

## Issue #12 への補足（レビュー 3 章、本 Phase で実施）
Issue #12 の 4 項目は方向として正しい。実装時に以下まで広げないと、同じ指摘が第 3 回で出る。

1. **全幅（#12-1）**: `PAGE_CONTAINER` は 4d02ded 時点で既に `w-full px-4 sm:px-6`（layout.ts:2）。残っているのは設定 `mx-auto max-w-2xl`（SettingsPage.tsx:245）、About `max-w-3xl`（AboutPage.tsx:36）、404 `max-w-3xl`（NotFoundPage.tsx:10）の個別コンテナ。これら 3 ページも `WikiShell` に入れる（R-083）。表については「カラム幅いっぱい」を `table { width: 100% }` で実装するか決める（R-012）。本文 `80ch` は維持でよいが、1920 で本文 710px に対し表 783px・h2 線 944px と右端が 3 段階にずれるので、「表と h2 線は同じ幅」をルールに入れる。
2. **ホームのサイドバー（#12-2）**: サイドバー追加でホームの左 288px が埋まるが、本文側の薄さ（R-022）は変わらない。「代表記事」は `slice(0,3)` ではなく編集者指定（R-027）にし、モバイルでも説明 1 行を残す（R-028）。帯の h1 とヘッダーのロゴ文言の重複（R-026）も同時に解消する。
3. **AI チャット表記（#12-3）**: 対象に About の h2「チャットについて」、ArticlePage の「チャットで質問する」、CommandPalette `QUICK_LINKS`、MobileDrawer のボタン、ChatPanel `aria-label`、`document.title`／`useDocumentMeta` の文言を加える（R-081）。スパークルアイコンはヘッダーとパネル見出しだけに限定し、本文中のリンク「AI チャットで質問」にはアイコンを付けない。キー未設定時の導入文（R-066）を「AI チャット」の初回画面として一緒に作る。
4. **サイドバー行（#12-4）**: 行高 40px・15px・18rem は妥当。加えて (a) 現在カテゴリのラベル色（R-038）、(b) hover を背景のみにする際に左線は現在位置専用にする（R-039）、(c) 現在行を初回に `scrollIntoView({block:'center'})`（R-040）、(d) 「一覧（n）」行の文言（R-041）、(e) 下端余白（R-043）、(f) ドロワーのメインナビの色（R-037、コントラスト不合格）を同じ PR で直す。18rem にすると 1440 では本文が 784px → 752px になるので、`80ch`（710px）は維持できる。1280 では本文 592px になり、目次（13rem）を隠す閾値 `MIN_CONTENT=640`（shell-layout.ts:19）に掛かる。1280〜1365 で目次が消える副作用を確認すること。

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build`
- 変更した画面を Playwright で 1440 / 390、light / dark で撮影し `research/shots/r2a-*.png` に保存、Read で確認
- チェックを更新し、未対応はコメントに理由を書く。Issue は閉じない
