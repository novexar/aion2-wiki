# Phase 1 調査・執筆ルール（全調査エージェント共通）

## 担当範囲
- `research/topic-inventory.md` の指定された行（# 番号）を担当する。1行＝1記事。
- 出力先: `content/<category>/<slug>.md`。slug・category は台帳の値を使う（slug を変える必要がある場合は最終報告に明記）。
- スキーマ: `content/SCHEMA.md` に厳密に従う（frontmatter 必須項目、confidence、sources、`根拠：[S01]`）。

## 情報源と検証
- `docs/` は個人ガイドであり **正ではない**。コピー禁止。すべて自分で取得した Web 資料で裏付ける。
- 台帳の参照元 URL を起点に、必ずページ本文を取得して確認する。検索スニペットは根拠にしない。
- 取得方法: WebFetch が 403 / JS 描画で失敗する場合（aion2maps.com, aion2.gaming.tools, plaync 等）は
  `curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36" <url>` を使い、
  scratchpad に保存して `sed`/`grep` で本文を読む。`research/source-registry.md` に各サイトの取得方法がある。
- 優先順位: NC 公式 > Global DB (aion2.gaming.tools, ver 2.0.5.0) > 確立した攻略サイト（aion2maps, redfreshet, aion2-times, aion2hub, wikirealm, aion2builds, vi.ki, aion2.run, gamerch, mein-mmo, asellog）> その他。
- 数値（必要IL、費用、回復量、上限、確率）は DB で裏取りし、攻略サイトと食い違う場合は DB を優先しつつ本文で差異を明記。
- 韓国版限定・未実装の仕様は `> **韓国版のみ**：` で明示するか、記事から外す。グローバル版（2026-09-30 アーリー / 10-05 正式、Lv上限45、8クラス、2.0.5.0）が基準。
- 単一ユーザーの発言、噂、推測、ティア表の「最強」断定は書かない。書けない主張は最終報告の「除外した主張」に列挙する。
- confidence は記事内で最も弱い主要主張に合わせる。community の記事は冒頭に `> **要確認**：` を置く。

## 文体
- 読者は「AION2 を始めて数日の人」。専門用語は初出で一言説明し、英語名を併記。
- 冒頭 2〜3 文で「これは何か／なぜ重要か」。見出しは `##` から。数値は表。手順は番号リスト。
- 他記事は `[[slug]]` でリンク（台帳の slug を使う）。
- 1記事 80〜300 行。薄い行は 60 行でも可だが、根拠が 1 つもない記事は作らない。

## 禁止
- 他エージェントの担当行・ディレクトリへの書き込み。`docs/` の編集。`git commit`。
- 個人キャラ（Lotus）への言及。

## 最終報告（簡潔に）
1. 書いたファイル一覧（slug ＋ 1 行要約 ＋ confidence）
2. 書けなかった行とその理由
3. 除外した主張（未確認・噂）
4. 資料間の矛盾と採用した解決
