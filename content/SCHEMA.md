# content/ スキーマ（Wiki記事の共通仕様）

このフォルダの Markdown が Wiki の唯一の情報源です。`app/` のビルドスクリプトが
このフォルダを読み、検索索引・チャットボット用のチャンク・ページを生成します。

## ディレクトリ

```
content/
  basics/      ゲーム概要・種族・クラス一覧・操作・用語
  leveling/    Lv1→45、覚醒、45到達後の流れ
  systems/     スキル/スティグマ/ディーヴァニオン/アルカナ/強化/継承/刻印/ルーン/特殊枠/製作
  dungeons/    遠征(探険/征服)、超越、オードエネルギー、悪夢、フェスタ、覚醒戦、使命、レイド、フィールドボス
  pvp/         アビス、要塞戦、PvPの基礎（グローバル版で開放済みのもののみ）
  economy/     ギーナ、取引所、メンバーシップ、課金、金策、サブキャラ
  classes/     クラス別ページ（8クラス）
  news/        グローバル版の公式告知・既知の問題・停止中コンテンツ・韓国版との差
  tips/        小技・UX・時短・初心者の落とし穴
  faq/         よくある質問
  guide/       初心者向けロードマップ（docs/ の初心者版と同期）
```

ファイル名は英小文字ケバブケース `slug.md`。1ファイル1トピック、本文は 100〜400 行程度。

## Frontmatter（必須）

```yaml
---
id: odyle-energy                 # ファイル名と同じ slug。英数字とハイフンのみ
title: オードエネルギー            # 日本語タイトル
reading: おーどえねるぎー          # タイトルの読み（ひらがな、長音は ー、空白なし）
category: dungeons               # 上のディレクトリ名と一致
tags: [遠征, 報酬, 資源]          # 日本語タグ 2〜6個
summary: ダンジョン報酬の受取に使う資源。3時間に15回復、上限560（会員840）。   # 1〜2文
confidence: verified             # official | verified | community
region: global                   # 常に global。韓国版のみの仕様は本文で明示
updated: 2026-10-08              # 調査日
aliases: [Odyle Energy, オード気力]   # 英語名・別表記（検索用）。任意
related: [expeditions-overview, kinah]  # 関連記事の id。任意
sources:
  - id: S01
    title: Aion 2 Maps：Expeditions and Odyle Energy
    url: https://aion2maps.com/guides/expeditions-and-odyle/
    date: 2026-10-04
    kind: guide                  # official | database | guide | community
  - id: S02
    title: NC：Launch FAQ
    url: https://lounge.plaync.com/feed/82939
    date: 2026-10-06
    kind: official
---
```

### title と reading の規約

- `title` は 18 文字以内。括弧（）・コロン：:・中黒・による列挙を含めない。補足は `summary` と `aliases` に移す。
- `title` は全記事で一意にする。衝突する場合は片方に修飾語を付ける（例: 「FAQ ダンジョン」と「ダンジョンの種類」）。
- `reading` は必須。タイトルの読みをひらがなで書く（長音は ー、空白なし）。英数字で始まるタイトルは `reading` も同じ英数字で始めてよい。索引では A–Z 扱い。
- 索引の五十音・A–Z 分類は `title` と `reading` のみで判定し、`aliases` は使わない。

### confidence の基準

| 値 | 意味 | 掲載 |
| --- | --- | --- |
| official | NCSOFT 公式（plaync 告知・公式ガイドブック・プレスリリース）で確認 | 可 |
| verified | 公式ではないが、独立した2つ以上の資料（DB＋攻略サイト等）で一致 | 可 |
| community | 信頼できる1資料のみ、または実プレイ報告ベース。本文冒頭で「要確認」と明記 | 可（注意表示） |
| unverified | 単一ユーザーの発言、噂、推測、韓国版の未実装仕様 | **掲載しない** |

記事全体の confidence は、記事内で最も弱い主要主張に合わせる。
段落単位で根拠が異なる場合は、段落末尾に `根拠：[S01]` を付ける。

## 本文の書き方

- 対象読者は「AION2 を始めて数日の人」。専門用語は初出で一言説明。
- 最初の段落で「これは何か」「なぜ重要か」を2〜3文で書く。
- 見出しは `##` から。`#` は使わない（タイトルは frontmatter）。
- 数値（必要IL、費用、回復量、上限）は表にする。
- 手順は番号付きリスト。1項目1アクション。
- 「ゲーム内の表示が優先」と断る箇所は `> **注意**：` の引用ブロックで書く。
- 韓国版/台湾版の仕様は、グローバル版に未実装なら `> **韓国版のみ**：` で区別。
- 英語の用語を併記（例：遠征（Expedition））。検索で英語名でも見つかるように。
- 他の記事へのリンクは `[[slug]]` 形式（ビルド時に内部リンクへ変換）。
- 出典の URL は本文に書かず、frontmatter の sources と `根拠：[S01]` で参照。
- 個人キャラの状況（Lotus 等）は書かない。汎用の記事にする。
