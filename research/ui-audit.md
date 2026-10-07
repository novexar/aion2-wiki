# AION2 非公式Wiki UI/UX 監査

- 対象: `app/`（commit 9d9c286、2026-10-08 ローカルビルド `npm run build` → `vite preview`）
- 確認環境: Playwright Chromium、1440×900（ライト／ダーク）、390×844（iPhone 相当、DPR 2）
- スクリーンショット: `research/shots/`（35 枚。ファイル名は本文で参照）
- 計測: WCAG コントラスト比は index.css のトークン値から算出、バンドルサイズは `vite build` 出力

## 1. 総評

1. 「調べて、確かめて、相談できる Wiki」の 3 語スローガン、金色の eyebrow、48px の見出し、説明文、検索、CTA 行というランディングページ構成がホーム先頭 500px を占め、記事へのリンクが初期表示に 1 本もない。情報サイトではなく製品 LP の型で、これが「AI が作った」印象の中心。
2. 装飾が多い。全行の「検証済み」バッジ（235 記事中 205 が検証済みなので情報量ゼロ）、`#タグ` チップ、アイコン付きの注記、角丸カードの関連記事、影付きの入力枠、金色の引用枠がすべて同じ強さで並び、本文より目立つ。
3. 文言が説明過剰で、UI 上に localStorage／sessionStorage／Gemini／RAG の仕組み説明が繰り返し現れる。ラベルは「Wiki に相談する」「保存して始める」「Wiki を調べています…」など動詞句で、Zenn・MDN・Wikipedia のような名詞 1 語のラベルになっていない。
4. 自動生成データの歪みが UI に露出している。全記事の更新日が同一のため「更新履歴」は五十音順先頭 8 本、「今日の日課」はタグ一致 16 本の先頭 6 本、索引「あ行」に `AION2とは` `FAQ：` `IL1000` が入る。
5. 記事タイトルが「〜（a・b・c）」形式（178／235 本、平均 22 文字、最長 51 文字）で、サイドバー・パンくず・パレット・関連記事のすべてで途中省略される。ヘッダーは透過（blur なし）で本文が透けるなど、仕上げの欠陥も残る。

## 2. 改修一覧

優先度: P1 必須／P2 推奨／P3 任意。難易度: S 文言・スタイル差替え、M コンポーネント修正、L 画面再設計。
「現状」の file:line は `app/src/` 基準。

| ID | 優先度 | 画面 | 分類 | 現状 | 改修内容 | 難易度 |
|---|---|---|---|---|---|---|
| U-001 | P1 | ホーム | 文言 | HomePage.tsx:26 h1「調べて、確かめて、相談できる Wiki」 | h1 を削除。先頭は「AION2 非公式Wiki」を 20px／600 の 1 行（スクリーンリーダー向けに h1 のまま）にし、スローガンは置かない | S |
| U-002 | P1 | ホーム | 文言 | HomePage.tsx:21 eyebrow「AION2 グローバル版 · 非公式」（アクセント色） | 削除。非公式表記はフッターと「このサイトについて」にある | S |
| U-003 | P1 | ホーム | 文言 | HomePage.tsx:29-30「システム・ダンジョン・経済・クラスの情報を、出典と信頼度つきでまとめています。分からないことは Wiki の記事だけを根拠に答えるチャットにも聞けます。」 | 「AION2（グローバル版）の攻略情報。235 記事、最終更新 2026-10-08。」（件数・日付はビルド時の値） | S |
| U-004 | P2 | ホーム | 文言 | HomePage.tsx:39 placeholder「記事・用語・英語名で検索（例: ギーナ / Kinah）」 | 「検索」 | S |
| U-005 | P2 | ホーム | 文言 | HomePage.tsx:46-57 CTA 行「チャットで相談する」「索引から探す →」「235 記事」 | 行ごと削除（ヘッダーのナビと重複）。件数は U-003 の説明文へ | S |
| U-006 | P2 | ホーム | 文言 | HomePage.tsx:63「カテゴリー」 | 「カテゴリ」（IndexPage の切替ラベルと統一） | S |
| U-007 | P1 | ホーム | IA | HomePage.tsx:86-114「今日の日課」「毎日の確認に使う記事へのショートカット」。data.ts:533-537 がタグ正規表現で 16 本抽出し先頭 6 本（五十音順）を表示 | 見出し「日課・週課」、説明文削除。自動抽出をやめ、編集者が選ぶ固定 6 本（例: 日課・週課チェックリスト、リセット時刻、使命、シューゴフェスタ、次元侵攻、デイリーダンジョン）を categories.ts に `DAILY_LINKS` として定義 | M |
| U-008 | P1 | ホーム | IA | HomePage.tsx:116-127「更新履歴」「最近調査・更新された記事」。全 235 記事が updated=2026-10-08 のため build.ts:144 の降順ソートが五十音順になり「1週目ガイド」「30分・60分…」「8クラス一覧」が並ぶ | 見出し「最近の更新」、説明文削除。build.ts で `git log -1 --format=%cI -- content/<path>` の日時を `updated` の代わりに使い、同日なら時刻で並べる。日付が全件同一なら節ごと非表示 | M |
| U-009 | P3 | ホーム | 文言 | HomePage.tsx:92,123「記事は準備中です。」 | 「記事はまだありません。」 | S |
| U-010 | P1 | ホーム／カテゴリ | 文言 | categories.ts:50-60 説明「始めたばかりの人向けのロードマップ」「8クラスの個別ページ」「時短・UX・初心者の落とし穴」など語形が不揃い | 名詞の羅列に統一: guide「最初の 1 週間・Lv45 まで・日課」／basics「操作・用語・アカウント・キャラクター」／leveling「Lv1〜45・覚醒・IL 上げ」／systems「スキル・スティグマ・強化・製作」／dungeons「遠征・超越・悪夢・レイド・フィールドボス」／pvp「アビス・要塞戦・アリーナ」／economy「ギーナ・取引所・メンバーシップ」／classes「8 クラスの個別記事」／news「公式告知・既知の問題・韓国版との差」／tips「時短・設定・落とし穴」／faq「よくある質問」 | S |
| U-011 | P2 | ヘッダー | 文言 | Header.tsx:15「About」。フッター Layout.tsx:136 は「このサイトについて」、パレット CommandPalette.tsx:27 も日本語 | 「このサイトについて」に統一 | S |
| U-012 | P2 | ヘッダー | 文言 | Header.tsx:64 検索ボタン「検索…」 | 「検索」 | S |
| U-013 | P2 | フッター | 文言 | Layout.tsx:131-132「AION2 非公式Wiki — NCSOFT とは無関係のファンサイトです。ゲーム内の表示を優先してください。」 | 「非公式のファンサイトです。NC（NCSOFT）とは関係ありません。」 | S |
| U-014 | P1 | 記事 | 文言 | ArticlePage.tsx:109-121 要確認ノート「この記事は要確認の情報を含みます。1 つの資料や実プレイ報告に基づくため、ゲーム内の表示を優先してください。」（AlertTriangle 付き）。本文側に必ず `> **要確認**：` があるため二重表示（shots/article-community-desktop.png） | ノートを削除。バッジ「要確認」の `title` に「資料が 1 つの記述を含みます」を残す | S |
| U-015 | P2 | 記事 | 文言 | ArticlePage.tsx:88「別名: A / B / C」 | ラベル削除、h1 直下に 13px fg-subtle で「A、B、C」 | S |
| U-016 | P2 | 記事 | 視覚 | ArticlePage.tsx:92-95 CalendarDays アイコン +「更新 2026-10-08」 | アイコン削除、「2026-10-08 更新」 | S |
| U-017 | P1 | 記事 | 視覚 | ArticlePage.tsx:96-106 `#タグ` の枠付きチップをヘッダーに横並び | ヘッダーから外し、出典の上に「タグ: 基本情報、グローバル版、リリース」をテキストリンク（読点区切り）で 1 行。`#` は付けない | S |
| U-018 | P2 | 記事 | 文言 | ArticlePage.tsx:140「この話題をチャットで相談」、:143「誤りを報告（GitHub）」 | 「チャットで質問する」「誤りを報告」（外部リンクは ↗ を付ける） | S |
| U-019 | P2 | 記事 | IA | ArticlePage.tsx:128-135 の「関連記事」と本文の `## 関連記事` が同一ページに 2 回出る（shots/article-overview-mobile.png、見出し一覧で H2 重複） | build.ts で本文末尾の `## 関連記事` 節を除去し frontmatter `related` に統合。アプリ側は 1 箇所のみ描画 | M |
| U-020 | P2 | 検索 | 文言 | SearchPage.tsx:55-64 dashed 枠「一致する記事が見つかりませんでした。別の言い方や英語名でもお試しください。」 | 枠なしで「「{q}」に一致する記事はありません。」+ リンク「索引」 | S |
| U-021 | P2 | 検索 | 文言 | SearchPage.tsx:50-52「「オード」の検索結果: 50 件」。useSearch の limit 50 で頭打ちのため件数が常に 50 | 「{n} 件」のみ。上限に達した場合は「50 件以上」、または limit を撤廃して「さらに表示」 | S |
| U-022 | P3 | 検索 | 文言 | SearchPage.tsx:33 placeholder「記事・用語・英語名で検索」 | 「検索」 | S |
| U-023 | P3 | 検索 | 文言 | SearchPage.tsx:42「検索インデックスを読み込み中…」 | 「読み込み中」 | S |
| U-024 | P2 | パレット | 文言 | CommandPalette.tsx:25-27「索引を開く」「Wiki に相談する（チャット）」「このサイトについて」 | 「索引」「チャット」「このサイトについて」 | S |
| U-025 | P2 | パレット | 文言 | CommandPalette.tsx:138 見出し「最近の更新とショートカット」 | 「最近開いた記事」「ページ」の 2 節に分割（U-076 と連動） | S |
| U-026 | P3 | パレット | 文言 | CommandPalette.tsx:72「「{q}」の検索結果をすべて表示」 | 「すべての結果」 | S |
| U-027 | P3 | パレット | 文言 | CommandPalette.tsx:184 placeholder「記事・用語・英語名で検索」 | 「検索」 | S |
| U-028 | P1 | チャット | 文言 | ChatPage.tsx:195,211 h1「Wiki に相談する」 | 「チャット」（ヘッダーのナビ名と一致） | S |
| U-029 | P1 | チャット | 文言 | ChatPage.tsx:197-198「質問に関係する Wiki の記事を探し、その内容だけを根拠に Google の Gemini が日本語で回答します。 利用には、ご自身の Gemini API キーが必要です。」 | 「この Wiki の記事を根拠に Gemini が回答します。Gemini API キーが必要です。」 | S |
| U-030 | P1 | チャット | 文言 | ChatPage.tsx:201 ボタン「保存して始める」 | 「保存」 | S |
| U-031 | P1 | チャット | 文言 | ChatPage.tsx:36 送信者ラベル「Wiki アシスタント」 | ラベル削除（U-124 で発言者は配置で区別） | S |
| U-032 | P2 | チャット | 文言 | ChatPage.tsx:46「Wiki を調べています…」 | 「検索中」 | S |
| U-033 | P2 | チャット | 文言 | ChatPage.tsx:70「参照記事:」 | 「出典」 | S |
| U-034 | P1 | チャット | 文言 | ChatPage.tsx:140 placeholder「AION2 について質問する（Enter で送信、Shift+Enter で改行）」 | 「質問を入力」。送信操作はコンポーザー下に Kbd で「Enter 送信 / Shift+Enter 改行」（sm 以上のみ） | S |
| U-035 | P2 | チャット | 文言 | ChatPage.tsx:144「回答は Wiki の記事のみを根拠にします」 | 削除（導入文と「このサイトについて」にある） | S |
| U-036 | P2 | チャット | 文言 | ChatPage.tsx:14-18 例文「始めたばかりで毎日やることは？」「ギーナの効率的な稼ぎ方は？」「ダンジョン報酬の受け取りに必要なものは？」、:231「質問の例:」 | 名詞形「毎日やること」「ギーナの稼ぎ方」「報酬キューブを開けるのに必要なもの」、見出し「例」 | S |
| U-037 | P2 | チャット | IA | ChatPage.tsx:209-223 画面上部に「モデル: gemini-flash-latest · 変更」 | 削除。モデル名は設定ページのみ | S |
| U-038 | P3 | チャット | 文言 | ChatPage.tsx:221「新しい会話」（動作は履歴消去） | 「履歴を消す」 | S |
| U-039 | P3 | チャット | 文言 | useChat.ts:79「Wiki に情報がありません。索引や検索で別の言い方もお試しください。」 | 「この Wiki に該当する記事がありません。」 | S |
| U-040 | P2 | チャット | meta | ChatPage.tsx:170 description「Wiki の記事だけを根拠に答える相談チャット（Gemini API・ご自身のキーを使用）。」 | 「AION2 非公式Wiki の記事を根拠に答えるチャット。Gemini API キーが必要。」 | S |
| U-041 | P1 | API キー | 文言 | ApiKeyForm.tsx:355-359 ShieldCheck +「このキーはあなたのブラウザ（localStorage）にしか保存されません。サーバーには送信されず、Google の API に直接使われます。」 | アイコン削除。「キーはこのブラウザにだけ保存され、Google API の呼び出しにのみ使われます。」 | S |
| U-042 | P2 | API キー | 文言 | ApiKeyForm.tsx:360-372「キーは Google AI Studio で無料発行できます（Google アカウントでログイン →「Create API key」）。」 | 「キーの発行: Google AI Studio ↗」 | S |
| U-043 | P3 | API キー | 文言 | ApiKeyForm.tsx:291「API キーの形式が正しくないようです。コピーし直してください。」、:296「ブラウザに保存できませんでした。プライベートモードやストレージ設定を確認してください。」 | 「API キーの形式が正しくありません。」「このブラウザには保存できません（プライベートモードなど）。」 | S |
| U-044 | P2 | 設定 | 文言 | SettingsPage.tsx:177「設定はこのブラウザにのみ保存されます。」 | 削除 | S |
| U-045 | P2 | 設定 | 文言 | SettingsPage.tsx:181「システム設定に合わせるか、ライト／ダークを固定します。」、:185「チャットで使うモデル。通常は変更不要です。」、:190「チャット機能に使う Gemini API キー。localStorage に保存されます。」、:196「チャットの履歴はタブを閉じると消えます（sessionStorage）。」 | 順に: 削除／「チャットに使う Gemini のモデル名」／「このブラウザにだけ保存されます」／「タブを閉じると消えます」。localStorage・sessionStorage という語は UI に出さない | S |
| U-046 | P3 | 設定 | 文言 | SettingsPage.tsx:93 ラベル「モデル名」と節名「Gemini モデル」、:308 ラベル「Gemini API キー」と節名「API キー」が重複 | 節名「モデル」「API キー」、入力ラベルは sr-only | S |
| U-047 | P3 | 設定 | 文言 | SettingsPage.tsx:129-132「既定は gemini-flash-latest（Gemini の最新 Flash 系を指す別名）です。」 | 「既定: gemini-flash-latest」 | S |
| U-048 | P3 | 設定 | 相互作用 | SettingsPage.tsx:113-116 保存後にボタン内が Check +「保存しました」に変わる | ボタンは「保存」固定、横に role=status「保存しました」 | S |
| U-049 | P3 | About | 文言 | AboutPage.tsx:171-176「〜を始めたばかりの人向けに情報を整理するファンサイトです。**NCSOFT および公式とは一切関係ありません。**」 | 「AION2（グローバル版）の非公式ファンサイトです。NC（NCSOFT）とは関係ありません。ゲーム内の表示や公式告知と異なる場合はそちらが正しいものとします。」strong を外す | S |
| U-050 | P3 | About | 文言 | AboutPage.tsx:216-222「相談チャットについて」+ 4 文 | 見出し「チャットについて」。本文「質問に関係する記事を検索し、その抜粋だけを根拠に Gemini が回答します。API キーはブラウザにだけ保存されます。回答は誤ることがあります。」 | S |
| U-051 | P3 | About | 文言 | AboutPage.tsx:224「ソースと誤りの報告」 | 「ソースコードと誤りの報告」 | S |
| U-052 | P3 | 404 | 文言 | NotFoundPage.tsx:247-258 中央寄せ py-24、「記事が移動または削除された可能性があります。」「ホームへ」「記事を検索」 | 他ページと同じ左寄せ・上揃え。「このページは存在しません。」「ホーム」「検索」 | S |
| U-053 | P2 | meta | 文言 | index.html:7-9 description「…出典付きでまとめ、Wiki の内容に基づいて答える相談チャットも使えます。」、index.html:17-18 と useDocumentMeta.ts:475-476「出典付きの攻略情報と、Wiki に基づく相談チャット。」 | 3 箇所とも「AION2（グローバル版）の非公式Wiki。システム・ダンジョン・経済・クラスの攻略情報を出典付きで掲載。」 | S |
| U-054 | P2 | 索引 | 文言 | IndexPage.tsx:50-52「全 235 記事。別名（英語名・別表記）でも引けます。」 | 「235 記事」 | S |
| U-055 | P3 | 索引 | meta | IndexPage.tsx:13「記事を五十音・A–Z・カテゴリ・タグで一覧できます。」 | 「全記事の索引（五十音・A–Z・カテゴリ・タグ）」 | S |
| U-056 | P3 | 索引 | 文言 | IndexPage.tsx:83-93 Filter アイコン + placeholder「絞り込み」 | アイコン削除、「タイトルで絞り込み」 | S |
| U-057 | P3 | 索引 | 文言 | IndexPage.tsx:137-144 dashed 枠「英語名のある記事が見つかりません。」「条件に一致する記事がありません。」 | 枠なし「該当する記事はありません。」で統一 | S |
| U-058 | P3 | カテゴリ | 文言 | CategoryPage.tsx:348 dashed 枠「このカテゴリの記事は準備中です。」 | 枠なし「記事はまだありません。」 | S |
| U-059 | P2 | 共通 | 文言 | confidence.ts:9,15,21 description「NCSOFT の公式情報で確認済み」「独立した 2 つ以上の資料で一致」「1 つの資料または実プレイ報告に基づく情報」 | 「公式情報で確認」「2 つ以上の資料で一致」「資料が 1 つ」 | S |
| U-060 | P3 | ヘッダー | 文言 | ThemeToggle.tsx:465 aria-label「テーマ: ライト（クリックでダークに切り替え）」 | 「テーマを切り替える（現在: ライト）」 | S |
| U-061 | P3 | 記事 | 文言 | SourcesList.tsx:403-406「攻略サイト · redfreshet.com · 参照 2026-10-06」 | 「攻略サイト · redfreshet.com · 2026-10-06 閲覧」 | S |
| U-062 | P1 | ホーム | IA | HomePage.tsx:20-59 ヒーロー（py-20、h1 48px、検索、CTA）で 1440×900 の初期表示に記事リンクが 0 本、390px では 2 画面分 | ヒーロー撤廃。サイト名 1 行 + 検索ボックス（高さ 40px、幅 42rem）+ 直下にカテゴリ一覧。4 章のワイヤー参照 | L |
| U-063 | P1 | ホーム | 視覚 | HomePage.tsx:65-82 11 カテゴリを 3 列 gap-px グリッドにし 12 セル目が灰色の空セル（shots/home-desktop.png 右下、home-dark.png） | 表形式 1 列（カテゴリ名｜件数｜説明｜代表記事 3 本）。lg 以上で 2 列。空セルを作らない | M |
| U-064 | P2 | ホーム | IA | HomePage.tsx:85-129 下段 2 カラム（日課 2fr／更新 3fr） | 「最近の更新」を日付｜タイトル｜カテゴリ の 3 列表 10 行（1 カラム）、「日課・週課」は固定 6 本の 1 行リスト | M |
| U-065 | P2 | ホーム／カテゴリ | 視覚 | ArticleList.tsx:252-287 ArticleRows が全行に「検証済み」バッジ + 要約 2 行目。205／235 が検証済みで情報量がない | 更新一覧では要約を出さない。バッジは `community`（要確認）と `official`（公式）のときだけテキスト表示、既定値の検証済みは一覧に出さない | M |
| U-066 | P1 | 全画面 | IA | content タイトル 235 本中 178 本が「〜（a・b・c）」、平均 22 文字、最長 51 文字（例「そよ風商会（会員専用商店・魂の結晶500ギーナ・オード10万）」）。サイドバー（CategoryNav.tsx:216 truncate）・パンくず・パレット・関連記事で全て省略される | タイトル規約を SCHEMA.md に追加: 18 文字以内、括弧・コロン禁止、補足は `summary` と `aliases` へ。build.ts で 24 文字超を警告。既存記事は一括改題（例「そよ風商会」「レベル上げ 1〜45」） | L |
| U-067 | P2 | サイドバー | 視覚 | CategoryNav.tsx:216 `truncate` で 1 行省略、幅 15rem（WikiShell.tsx:493） | `line-clamp-2`、幅 16rem、行間 1.4 | S |
| U-068 | P2 | サイドバー | 相互作用 | CategoryNav.tsx:175-202 開閉 chevron（28px）とカテゴリリンクが別要素でクリック先が分かれる | 行全体を開閉ボタンにし、カテゴリ一覧へのリンクは開いた先頭に「一覧（35）」行として置く | M |
| U-069 | P2 | 索引 | IA | IndexPage.tsx:56-80 セグメント、:124-134 行ジャンプチップ、:158-190 2 列 + 別名インラインで密度が高いが読めない（shots/index-top-desktop.png） | Wikipedia 索引型: 1 列、タイトルは通常ウェイト、別名は同行末尾に「— 別名1、別名2」12px、カテゴリは右端固定幅 6rem。2 列は xl 以上のみ | M |
| U-070 | P2 | 索引 | IA | gojuon.ts:36-46 読み候補に aliases を含めるため「AION2とは」「FAQ：PvP・社交」「IL1000」「PvEプレイヤーの…」が「あ行」に入る | 五十音は title（または `reading`）のみで判定し、英数字始まりは「A–Z」へ | S |
| U-071 | P2 | 索引 | IA | IndexPage.tsx:97-120 タグ 601 種をチップで全展開（shots/index-tag-desktop.png） | 件数 3 以上のみ表示 + 「すべて表示」。チップではなくテキストリンクを読点区切りで並べる | M |
| U-072 | P3 | 索引 | a11y | IndexPage.tsx:165-168 色だけの信頼度ドット（aria-hidden、箇条書きの点に見える） | ドット削除。要確認のみ末尾に「要確認」テキスト | S |
| U-073 | P2 | 検索 | 視覚 | SearchResultRow.tsx:101 FileText アイコン、:109 全行バッジ、:112-116 別名を全件表示 | アイコン削除。バッジは要確認／公式のみ。別名はクエリに一致したものだけ | M |
| U-074 | P2 | 検索 | IA | SearchResultRow.tsx:120 スニペットが summary のみで本文の一致箇所が出ない | search index の storeFields に本文テキスト（先頭 2,000 文字）を含め、一致位置の前後 80 文字を表示 | M |
| U-075 | P3 | 検索 | IA | SearchPage.tsx:11 limit 50 で打ち切り | 「さらに表示」で 50 件ずつ追加 | S |
| U-076 | P2 | パレット | IA | CommandPalette.tsx:41-58 空状態の「最近の更新」5 件（実際は五十音順先頭） | 直近に開いた記事（localStorage に最大 5 件）に置換。初回は「ページ」節のみ | M |
| U-077 | P1 | ヘッダー | 視覚 | Header.tsx:30 `bg-canvas/95 supports-[backdrop-filter]:bg-canvas/90` に backdrop-blur がなく、スクロール中に本文が透ける（shots/mobile-table.png 上部、chat-conv-desktop.png） | `bg-canvas`（不透明）。blur は使わない | S |
| U-078 | P1 | ホーム | 視覚 | HomePage.tsx:24 h1 48px／700／letter-spacing -1.2px | サイト最大見出しは 28px。日本語見出しから `tracking-tight` を外し letter-spacing 0 | S |
| U-079 | P2 | 全体 | 視覚 | index.css:72-74 `--font-sans: 'Inter', 'Noto Sans JP'` で英数字だけ Inter になり字形・太さが混在（h1「AION2とは」） | Noto Sans JP を先頭にし Inter を外す。index.html:21-26 の読込は Noto Sans JP 400／700 のみ | S |
| U-080 | P2 | 記事 | 視覚 | index.css:190,198,205 見出し font-weight 650（Noto Sans JP に 650 はなく合成） | 700 | S |
| U-081 | P2 | 記事 | 視覚 | WikiShell.tsx:493 中央カラム約 1,000px に本文 72ch（709px）、本文右に 300px の空白ができてから目次（shots/article-scrolled-desktop.png） | grid を `16rem minmax(0,44rem) 14rem` + `justify-content: center`、本文幅 = カラム幅 | S |
| U-082 | P2 | 記事 | 視覚 | ArticleList.tsx:213-239 関連記事が 2 列カードグリッド（gap-px、奇数で灰色セル残り: shots/clip-related.png、矢印アイコン） | 1 列の箇条書きリンク「タイトル · カテゴリ」。カード・矢印削除 | S |
| U-083 | P2 | 記事 | 視覚 | SourcesList.tsx:384 出典を角丸枠付きリスト | 枠なし `ol`、13px、番号は S01 のまま、外部リンク ↗ のみ | S |
| U-084 | P1 | 記事 | 視覚 | index.css:233-241 blockquote が一種類（金の左線 + 枠 + bg-surface）で、本文の `> **注意**：`（162 箇所）`> **要確認**：`（73）`> **韓国版のみ**：`（71）`> **補足**：` が同じ見た目（shots/clip-callout.png, clip-callout-2.png） | scripts/content/markdown.ts に rehype プラグインを追加し、先頭の `**ラベル**：` で `<aside class="callout" data-kind="note／caution／kr／info">` に変換。見た目は左 2px 線 + ラベル太字のみ、背景・右枠・角丸なし。色: 注意／要確認 = warn、韓国版のみ = info、補足 = line-strong | M |
| U-085 | P2 | 記事 | 視覚 | wikilink.ts:110 / index.css:216-221「根拠：[S01] [S04] [S05]」が各節末に独立段落（長文記事で 10 回超、shots/article-long-desktop.png） | ビルド時に `根拠：` 始まりの段落へ `class="evidence"` を付け、12px・fg-subtle・margin-top 0.25em で前段落の付記として表示。ラベルは「出典:」 | S |
| U-086 | P3 | 記事 | 視覚 | index.css:253-257 `.table-wrap` 角丸 6px + 枠 | 角丸 0、上下罫線のみ。th 背景は維持 | S |
| U-087 | P2 | 記事 | 視覚 | Toc.tsx:465 モバイル目次が `details` の角丸カード（bg-surface、List アイコン、shots/mobile-toc-open.png） | 枠・背景なし。「目次」+ ChevronDown のみ、下線 1px | S |
| U-088 | P3 | 記事 | 視覚 | Toc.tsx:452-455「目次」に List アイコン | 削除 | S |
| U-089 | P2 | 共通 | 視覚 | ConfidenceBadge.tsx:344-355 アイコン + 塗り + 枠のピル | アイコン・塗りなし。1px 枠 + 色文字、角丸 4px、高さ 20px、11px | S |
| U-090 | P2 | ホーム | 視覚 | HomePage.tsx:101-108 日課番号を枠付き正方形、hover で矢印表示 | 通常の `ol` 番号、hover は下線のみ | S |
| U-091 | P2 | チャット | 視覚 | ChatPage.tsx:127 コンポーザー rounded-xl + shadow-sm、:235-241 例文が角丸ボタン縦 3 個 | 1px 枠、角丸 6px、影なし。例文はテキストリンク 1 行（読点区切り） | S |
| U-092 | P2 | チャット | 視覚 | MessageContent.tsx:229-239 文中の `[記事タイトル]` を枠付きチップにしてインライン表示（shots/chat-conv-desktop.png） | 文中は上付き番号リンク `[1]`、末尾「出典」に番号付きで記事名。未解決の `[…]` は非表示 | M |
| U-093 | P3 | チャット | 視覚 | ChatPage.tsx:72-80 参照記事チップに BookOpen アイコン | 削除（U-092 で番号リストに） | S |
| U-094 | P2 | 設定 | 視覚 | SettingsPage.tsx:50-72 テーマ選択がアイコン付きの大タイル 3 枚 | 高さ 32px のセグメント（システム／ライト／ダーク）、アイコンなし | S |
| U-095 | P3 | 設定 | 視覚 | SettingsPage.tsx:35 見出し 14rem + 本体の 2 カラム | 1 カラム、見出し 15px、説明は入力の下 13px | S |
| U-096 | P3 | 全体 | 視覚 | button-class.ts:384 primary（黒塗り）が設定ページに 2 つ（モデル保存・キー保存） | 1 画面 1 primary。それ以外は secondary | S |
| U-097 | P2 | 全体 | a11y | index.css:10 `--line #e4e4e7` と白の比 1.27:1。入力欄・secondary ボタン境界に使用し WCAG 1.4.11（3:1）未満 | `--line-input: #8c8c96`（light、3.4:1）／`#71717a`（dark）を追加し input／textarea／secondary ボタンに適用。区切り線は従来通り | S |
| U-098 | P3 | ヘッダー | 視覚 | Logo.tsx:367-373 黒角丸四角 + 金の A | マーク削除。文字ロゴ「AION2 非公式Wiki」（600／400）のみ | S |
| U-099 | P3 | 全体 | 視覚 | index.css:33,61 `--shadow` を HomePage.tsx:35 検索ボックス（shadow-sm）・コンポーザーに使用 | 影はコマンドパレットとドロワーのみ | S |
| U-100 | P2 | 記事 | 可読性 | ArticlePage.tsx:108 summary を本文前に表示し、本文冒頭段落と内容が重複（shots/article-overview-mobile.png） | summary は meta description と一覧のみに使い、記事ページには表示しない | S |
| U-101 | P2 | 記事 | 可読性 | scripts/content/markdown.ts:68 rehype-slug が「：」等を落とし `#結論迷ったらこの順番` のような id | slug 化で全角記号を `-` に置換（`結論-迷ったらこの順番`）。既存アンカーは変わるが外部参照はない | S |
| U-102 | P3 | 記事 | 可読性 | index.css:176 本文 .975rem（15.6px）、UI は 13／14／15／16px が混在 | 本文 16px／1.8、UI 本文 14px／1.5、補助 13px、キャプション 12px の 4 段に整理 | S |
| U-103 | P2 | 記事 | モバイル | index.css:273-283 th nowrap + td min-width 6em で 390px の 3 列表が窮屈、4 列以上は横スクロール（shots/mobile-table.png） | th の `white-space: normal`、td min-width 5em。横スクロール時は `.table-wrap` 右端に 24px のフェード | S |
| U-104 | P3 | 記事 | 可読性 | ArticlePage.tsx:137-145 末尾リンク 2 本が 13px fg-subtle で見つからない | 出典直後に 14px 通常リンク「誤りを報告 ↗」「チャットで質問する」 | S |
| U-105 | P2 | モバイル | ナビ | Header.tsx:93-107 ドロワーに「ホーム・索引・チャット・About・設定」+ 現在カテゴリ展開で 35 行（shots/drawer-mobile.png） | 「設定」はヘッダー歯車と重複のため削除。カテゴリは全て閉じた状態で開き、現在カテゴリのみ展開 | S |
| U-106 | P3 | 全体 | ナビ | ScrollManager.tsx:131 戻る操作でもトップへスクロール | `useNavigationType() === 'POP'` のときはスクロールしない | S |
| U-107 | P3 | パレット | 相互作用 | CommandPalette.tsx:190-196 閉じるボタンが素のテキスト「Esc」 | Kbd スタイル（他のヒントと同じ） | S |
| U-108 | P3 | 記事 | ナビ | content 由来の外部リンクに `target`／`rel`／外部表示がない | rehype で `a[href^=http]` に `target=_blank rel=noopener noreferrer class=external` を付け、`::after` に ↗ | S |
| U-109 | P3 | モバイル | タップ | IndexPage.tsx:129 行ジャンプ h-7（28px）、CategoryNav chevron 28px、TOC リンク 26px | 最小 32px、間隔 4px | S |
| U-110 | P3 | チャット | モバイル | ChatPage.tsx:253 sticky bottom コンポーザーに safe-area 余白なし | `padding-bottom: max(1rem, env(safe-area-inset-bottom))` | S |
| U-111 | P2 | 記事 | a11y | Toc.tsx 目次と MobileToc が同時に DOM にあり `nav[aria-label=目次]` が 2 つ（CSS で片方非表示） | `matchMedia('(min-width: 80rem)')` で片方のみ描画 | S |
| U-112 | P2 | 検索 | a11y | SearchPage.tsx:40 `aria-live=polite` が結果リスト全体を包み、入力ごとに全件読み上げ | 件数の `<p>` のみに付ける | S |
| U-113 | P3 | ヘッダー | a11y | ThemeToggle.tsx:456-470 3 状態巡回で現在値が見えない | ヘッダーからは削除し設定ページのみ。残すなら light／dark の 2 状態 | S |
| U-114 | P2 | 性能 | フォント | index.html:21-26 Google Fonts CSS がレンダーブロック、Inter 4 + Noto 3 ウェイト、JP テキストが FOUT | Noto Sans JP 400／700 のみを self-host（`@fontsource/noto-sans-jp`、`font-display: swap`、`size-adjust` 付きフォールバック）。Inter は読み込まない | S |
| U-115 | P2 | 性能 | 検索 | ビルド出力 `search-index-*.js` 2,982kB（gz 694kB）を JS モジュールとして初回検索時に読込・解析 | JSON を `fetch` して `MiniSearch.loadJSON`。storeFields から本文を外し、目標 gz 300kB 以下 | M |
| U-116 | P2 | 性能 | チャット | `chunks-*.js` 6,147kB（gz 1,475kB）をチャット初回に全読込 | chunks.json は id・記事 id・位置のみにし、本文は `pages/<id>.json` から取得。必要チャンクだけ遅延読込 | M |
| U-117 | P3 | 性能 | 初期 JS | `index-*.js` 357kB（gz 107kB）に nav.json（235 件の summary・aliases・tags）同梱 | nav.json から summary を外し一覧ページで遅延取得。tags は索引ページのみ | S |
| U-118 | P3 | 性能 | レイアウト | PageLoading.tsx:429 スケルトンが max-w-3xl 中央で、記事画面（サイドバーあり）と幅が違いレイアウトシフト | 記事ルートでは WikiShell 内にスケルトンを描画 | S |
| U-119 | P1 | チャット | 導線 | ChatPage.tsx:192-205 キー未設定時は専用画面（枠付きカードのフォーム、shots/chat-desktop.png） | 通常のチャット画面を出し、コンポーザー位置に「Gemini API キーを保存すると使えます」+ 入力 1 行 + 「保存」。保存後そのまま質問できる | M |
| U-120 | P2 | チャット | 視覚 | ChatPage.tsx:49-67 エラーが赤塗り枠 + アイコン | 塗りなし、danger 文字色 + 1px 枠。文言は gemini.ts:19-28 のままで可 | S |
| U-121 | P2 | チャット | 視覚 | ChatPage.tsx:21-28 ユーザー発言が右寄せ吹き出し（bg-muted rounded-lg） | 左寄せ・太字・吹き出しなし。回答は通常ウェイト。発言者ラベルは不要 | S |

## 3. デザインシステムの指示

参考: ホーム = Wikipedia-ja メインページ／MDN トップ、記事 = MDN／Stripe Docs、索引 = Wikipedia 索引／Zenn トピック一覧、検索 = GitHub 検索結果、チャット = Kagi Assistant、設定 = Linear Settings、About = Zenn について。

### 3.1 タイポグラフィ

- フォント: `'Noto Sans JP', system-ui, sans-serif`。Inter は外す。ウェイト 400／700 のみ。等幅は現状維持。
- 日本語には負の letter-spacing を使わない（0）。`tracking-tight` を見出しから外す。
- `font-feature-settings: 'palt' 0` は維持。

| 用途 | サイズ | 行間 | ウェイト |
|---|---|---|---|
| ページ見出し h1（記事・索引・設定） | 28px（モバイル 24px） | 1.35 | 700 |
| h2 | 20px | 1.45 | 700、下罫線 1px |
| h3 | 17px | 1.5 | 700 |
| 本文（記事） | 16px | 1.8 | 400 |
| UI 本文（一覧・設定・チャット） | 14px | 1.5 | 400 |
| 補助（別名・メタ・出典） | 13px | 1.5 | 400 |
| キャプション・バッジ・Kbd | 12px／11px | 1.4 | 400 |

- 記事本文の最大幅 44rem（約 40 字）。段落間 1em、見出し前 2em。
- サイト名はヘッダーでのみ 15px／600。ホームに 48px の見出しは置かない。

### 3.2 スペーシング

4px 基準: 4／8／12／16／24／32／48。ページ上余白 32px（現在ホーム 80px）、節間 48px（モバイル 32px）、一覧の行 padding 8px 上下、表セル 8px 12px。

### 3.3 カラートークン

| トークン | Light | Dark | 用途 |
|---|---|---|---|
| canvas | #ffffff | #09090b | 背景 |
| surface | #fafafa | #0f0f12 | th 背景、選択行 |
| muted | #f4f4f5 | #18181b | hover、Kbd |
| line | #e4e4e7 | #27272a | 区切り線（非テキスト境界には使わない） |
| line-input（新設） | #8c8c96 | #71717a | input／textarea／secondary ボタンの枠（3.4:1） |
| fg | #18181b | #fafafa | 本文（17.7:1） |
| fg-muted | #52525b | #a1a1aa | 補助（7.7:1） |
| fg-subtle | #6b6b74 | #8c8c96 | メタ（5.3:1、12px 以上で使用） |
| accent | #c9a227 | #d4af37 | フォーカスリング、現在位置の左線、`mark` 下線のみ |
| accent-strong | #7f640f | #e2c15a | リンク文字（5.6:1） |
| ok／info／warn／danger（文字） | #166534／#1e40af／#92400e／#b91c1c | #86efac／#93c5fd／#fcd34d／#fca5a5 | バッジ文字、コールアウト左線 |

- 背景付きの ok-bg／info-bg／warn-bg／danger-bg は使わない（バッジ・コールアウトとも塗りなし）。
- accent をテキスト（eyebrow）や見出しには使わない。

### 3.4 角丸・枠・影

- 角丸: ボタン・入力 4px、ポップオーバー・ドロワー 6px、パレット 8px。表・コールアウト・一覧・画像は 0。`rounded-lg`／`rounded-xl` は使わない。
- 枠: 区切り 1px line。入力・secondary ボタン 1px line-input。
- 影: コマンドパレットとドロワーのみ `0 8px 24px rgb(0 0 0 / .08)`。

### 3.5 コンポーネント

- ボタン: primary（fg 塗り・1 画面 1 つ）、secondary（枠）、ghost（枠なし）。高さ 32px／36px、アイコンは機能的なもの（閉じる・外部）だけ。
- バッジ: テキスト + 1px 枠、塗り・アイコンなし。一覧では「要確認」「公式」のみ表示、「検証済み」は既定値として非表示（記事ヘッダーでは 3 種とも表示）。
- コールアウト: 左 2px 線 + 太字ラベル「注意」「要確認」「韓国版のみ」「補足」。背景・右枠・アイコンなし。
- 表: 上下罫線 + 行区切り、th は surface 背景、数値は tabular-nums、横スクロールはフェードで示す。
- リンク: 本文は accent-strong + 下線（色 45%）、UI 内は fg + hover 下線。外部は ↗。
- 入力: 高さ 36px、枠 line-input、フォーカスは accent 2px リング。placeholder は 1 語。
- カードを使わない: 一覧・関連記事・カテゴリ・例文・テーマ選択は区切り線のリスト、表、セグメントで表す。カードは画像サムネイルを伴う等質アイテムにのみ許可（現在そのような画面はない）。
- アイコン: 検索・メニュー・閉じる・chevron・外部リンクのみ。装飾目的（FileText、CalendarDays、BookOpen、ShieldCheck、List、MessageSquare、AlertTriangle）は削除。
- 空状態: dashed 枠なし、1 文 + リンク 1 本。
- アニメーション: パレット 120ms フェードのみ。本文・チャットの motion は不要。

## 4. ホームと索引のワイヤー

### 4.1 ホーム（デスクトップ 1440）

```
+------------------------------------------------------------------------------+
| AION2 非公式Wiki   索引  チャット  このサイトについて        [検索   Ctrl K] ⚙ |
+------------------------------------------------------------------------------+
|                                                                              |
|  AION2 非公式Wiki                                                            |
|  AION2（グローバル版）の攻略情報。235 記事、最終更新 2026-10-08。             |
|  [ 検索                                                        ]            |
|                                                                              |
|  カテゴリ                                                                    |
|  ------------------------------------------------------------------------   |
|  初心者ガイド   7   最初の 1 週間・Lv45 まで・日課    最初の1週間の進め方 · 1週目ガイド · 日課チェックリスト |
|  基本         35   操作・用語・アカウント            AION2とは · 8クラス一覧 · 基本操作      |
|  レベリング    23   Lv1〜45・覚醒・IL 上げ            レベル上げ1〜45 · 覚醒 · IL1000 への最短 |
|  システム      43   …                                                         |
|  （11 行。lg 以上は 2 列に分割し 6 行 + 5 行）                                |
|                                                                              |
|  日課・週課   日課・週課チェックリスト · リセット時刻 · 使命 · シューゴフェスタ · 次元侵攻 · デイリーダンジョン |
|                                                                              |
|  最近の更新                                                                  |
|  ------------------------------------------------------------------------   |
|  2026-10-08  そよ風商会                              経済      要確認        |
|  2026-10-08  レベル上げ 1〜45                        レベリング              |
|  2026-10-07  …（10 行）                                                      |
|  すべての記事（索引）                                                        |
|                                                                              |
+------------------------------------------------------------------------------+
| 非公式のファンサイトです。NC（NCSOFT）とは関係ありません。   このサイトについて  GitHub |
+------------------------------------------------------------------------------+
```

### 4.2 ホーム（モバイル 390）

```
+------------------------------+
| ≡  AION2 非公式Wiki     🔍 ⚙ |
+------------------------------+
| AION2 非公式Wiki             |
| 235 記事 · 2026-10-08 更新   |
| [ 検索                     ] |
|                              |
| カテゴリ                     |
| 初心者ガイド            7  › |
| 基本                   35  › |
| レベリング             23  › |
| …（11 行、説明なし）         |
|                              |
| 日課・週課                   |
| 日課・週課チェックリスト     |
| リセット時刻                 |
| …（6 行）                    |
|                              |
| 最近の更新                   |
| そよ風商会          経済     |
| 10-08                        |
| …（10 行）                   |
| すべての記事（索引）         |
+------------------------------+
```

### 4.3 索引（デスクトップ）

```
+------------------------------------------------------------------------------+
| ホーム › 索引                                                                |
| 索引                                                                         |
| 235 記事                                                                     |
| [五十音] [A–Z] [カテゴリ] [タグ]        [ タイトルで絞り込み              ]  |
| あ か さ た な は ま や ら わ 他                                             |
|                                                                              |
| あ行  32                                                                     |
| ------------------------------------------------------------------------    |
| アーティファクト占領戦  — Artifact Siege、占領戦                 PvP          |
| アサシン               — Assassin、殺星                          クラス       |
| アビス                 — Abyss、Reshanta                          PvP          |
| …                                                                            |
| か行  39                                                                     |
| …                                                                            |
+------------------------------------------------------------------------------+
```

- 1 列、タイトル通常ウェイト、別名は同行 13px fg-subtle、カテゴリ右端固定幅。xl 以上で 2 列。
- カテゴリ表示は見出しをカテゴリ名にし、各行は「タイトル — 別名」。タグ表示は件数 3 以上のみ、読点区切りのテキストリンク。
- モバイルは同じ構造を 1 列、別名を 2 行目に折り返し。

### 4.4 記事（デスクトップ、参考）

```
| サイドバー 16rem | ホーム › 基本 › AION2とは                     | 目次 14rem |
|  初心者ガイド 7  | AION2とは                                     | 基本情報   |
|  基本 35 ▾      | AION 2、アイオン2、Aion 2 Global              | 世界観     |
|   一覧（35）    | 検証済み · 2026-10-08 更新                     | …          |
|   AION2とは     |                                               |            |
|   8クラス一覧   | 本文 44rem …                                   |            |
|   …             |  出典: S01 S04 S05  ← 12px の付記            |            |
|                 | ▌注意 覚醒のレベルは…  ← 左線のみのコールアウト |            |
|                 | 出典（枠なし ol）                               |            |
|                 | 関連記事（箇条書き）                            |            |
|                 | タグ: 基本情報、グローバル版                    |            |
|                 | 誤りを報告 ↗ · チャットで質問する              |            |
```

## 5. 実装順

### フェーズ 1: 文言とスタイル差替え（S のみ、1 日）

目的: 「AI 製」に見える要素の除去。ロジック変更なし。

- `routes/HomePage.tsx`: U-001〜U-006、U-009、U-078、U-090、U-099
- `components/Header.tsx`, `Layout.tsx`, `Logo.tsx`, `ThemeToggle.tsx`: U-011、U-012、U-013、U-060、U-077、U-098、U-105、U-113
- `lib/categories.ts`, `lib/confidence.ts`, `index.html`, `components/useDocumentMeta.ts`: U-010、U-053、U-059
- `features/wiki/ArticlePage.tsx`, `ArticleList.tsx`, `SourcesList.tsx`, `Toc.tsx`, `Breadcrumb.tsx`: U-014〜U-018、U-061、U-067、U-082、U-083、U-087、U-088、U-100、U-104
- `components/ConfidenceBadge.tsx`: U-089
- `features/search/*`: U-020〜U-027、U-075、U-107、U-112
- `features/chat/ChatPage.tsx`, `ApiKeyForm.tsx`, `useChat.ts`, `MessageContent.tsx`（文言のみ）: U-028〜U-043、U-091、U-093、U-110、U-120、U-121
- `routes/SettingsPage.tsx`, `AboutPage.tsx`, `NotFoundPage.tsx`: U-044〜U-052、U-094〜U-096
- `index.css`: U-079、U-080、U-081、U-085（CSS 側）、U-086、U-097、U-102、U-103
- `features/wiki/IndexPage.tsx`（文言・ドット）: U-054〜U-057、U-072、U-109
- `lib/gojuon.ts`: U-070
- `components/ScrollManager.tsx`, `PageLoading.tsx`: U-106、U-118

難易度構成: S 95 件（M・L なし）。モデルは小型で可（文言表と行番号を渡せば機械的に適用できる）。

### フェーズ 2: コンポーネント修正（M 中心、2〜3 日）

目的: 情報設計の歪みを直し、装飾を構造に置き換える。

- `scripts/content/markdown.ts`, `rehype-plugins.ts`, `wikilink.ts`, `build.ts`: U-084（コールアウト）、U-085（evidence クラス）、U-101、U-108、U-019、U-008（git 日時）
- `routes/HomePage.tsx`, `features/wiki/ArticleList.tsx`, `lib/categories.ts`: U-007、U-063、U-064、U-065
- `features/wiki/IndexPage.tsx`, `index-groups.ts`: U-069、U-071
- `features/search/SearchResultRow.tsx`, `lib/search.ts`, `scripts/content/*`（index 生成）: U-073、U-074、U-115
- `features/search/CommandPalette.tsx`: U-025、U-076
- `components/CategoryNav.tsx`: U-068
- `features/chat/ChatPage.tsx`, `MessageContent.tsx`, `lib/rag.ts`: U-092、U-119
- `features/wiki/Toc.tsx`: U-111
- `index.html`, フォント self-host: U-114

難易度構成: M 16 件、S 6 件。中型モデル（既存テストの更新を伴う）。

### フェーズ 3: 画面再設計と content 側（L、3〜5 日）

- `routes/HomePage.tsx` 全面: U-062（4.1／4.2 ワイヤー）
- `content/SCHEMA.md`, `scripts/content/frontmatter.ts`, 全記事の `title`: U-066（改題は content 担当エージェントへ。改題後に nav・index・related の再ビルド）
- `scripts/content/chunker.ts`, `features/chat/chunk-loader.ts`: U-116
- `features/wiki/data.ts`, `scripts/content/build.ts`: U-117

難易度構成: L 2 件、M 1 件、S 1 件。大型モデル + 設計レビュー（ホームは 4 章のワイヤーに従う）。

合計 121 件: P1 21（S 14／M 5／L 2）、P2 60（S 48／M 12）、P3 40（S 40）。

### 検証

各フェーズ後に `npm run lint && npm run typecheck && npm test && npm run build`、`research/shots/` と同条件で再撮影（1440／390、light／dark、ホーム・記事・索引・検索・チャット・設定）して比較する。
