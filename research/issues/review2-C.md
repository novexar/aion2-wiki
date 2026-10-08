辛口レビュー 2 回目（`research/ui-review-2.md`、スクリーンショット `research/shots/review2-*.png`）の Phase C: 記事ページの読み心地。

各 ID の「改修内容」列をそのまま適用する（文言・値・レイアウト）。設計規則は `research/ui-audit.md` 3 章と `research/ui-direction.md` 3・5 章。スローガン・説明文・装飾の追加禁止。

## 対象（ファイル別）
: 記事ページの読み心地（P2、1 日）

| ファイル | 項目 |
|---|---|
| `ArticlePage.tsx` | R-004（別名／リード文）M、R-006, R-007, R-018, R-019, R-020, R-021 |
| `ArticlePage.tsx` 新規 `PrevNext.tsx` | R-008 M |
| `Toc.tsx`, `useActiveHeading.ts` | R-009, R-010, R-011, R-099, R-101 |
| `index.css` | R-012（表幅）、R-014（コールアウト） |
| `rehype-plugins.ts` | R-015, R-016 |
| `CategoryNav.tsx`, `WikiShell.tsx` | R-038〜R-045（Issue #12 と同 PR） |

## チェックリスト（25 件）
- [ ] R-004 (P2/M) 記事・タイトル行: 別名行の先頭に「別名: 」ラベルを付け、検索用キーワード（例「スキルポイントを増やす消耗品」）は content 側で `aliases` から `tags`／`keywords` に分離。表示は 2 件までにして「他 …
- [ ] R-006 (P2/S) 記事・見出し: 本文と同じ `prose-wiki h2` 相当にする（20px/700、下罫線＋金線）か、意図的に小さくするなら 17px/700（h3 相当）に揃えて目次にも載せる
- [ ] R-007 (P2/S) 記事・余白: 記事カラムの下余白を `pb-16`（64px）、記事末尾に `前の記事／次の記事` ナビ（R-008）を置いてからフッター
- [ ] R-018 (P3/S) 記事・パンくず: 最後の項目（現在ページ）を省き「ホーム › システム」だけにする。MDN / Stripe はこの形
- [ ] R-019 (P3/S) 記事・見出し: `text-[1.75rem]`（28px）に戻し、`leading-[1.35]`
- [ ] R-020 (P3/S) 記事・タグ: 各タグを `text-link` にするか、索引タグビューと同じ `#タグ` 表記で 12px 枠付きチップ（index の群見出しと揃える）
- [ ] R-021 (P3/S) 記事・操作: 出典の h2 と同じ行の右端に 13px fg-muted で寄せる（Zenn の「記事の編集をリクエスト」位置）
- [ ] R-008 (P2/M) 記事・ナビ: ArticlePage 末尾に `nav aria-label="前後の記事"` を追加。同カテゴリ内で `order` の前後を 2 列（左「← 前: タイトル」右「次: タイトル →」）、13px ラベル＋15px …
- [ ] R-009 (P2/S) 記事・目次: `useActiveHeading` で activeId が null のときは先頭見出しを active 扱いにする（`headingIds[0]`）。目次は常にどこか 1 行が強調されている状態にする
- [ ] R-010 (P2/S) 記事・目次: `hover:bg-muted` を追加し、行全体を `block` のまま `-mx-2 px-2 rounded-[4px]` で面にする
- [ ] R-011 (P3/S) 記事・目次: 13px/700 に統一（ui-audit §3.1「補助 13px」）
- [ ] R-099 (P3/S) 全体・reduced-motion: `Toc.tsx` の `behavior` 指定を外し、CSS の `scroll-behavior` に一本化（reduced-motion の判定コードも削れる）
- [ ] R-101 (P3/S) モーション・欠落: `box.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })` にして目次のスクロールも 200ms で滑らせる
- [ ] R-012 (P2/S) 記事・表: `.prose-wiki table { width: 100% }`（列数が少ない表は `td:last-child { width: auto }` で余白を最終列へ）。または表幅を `max-width: 80ch…
- [ ] R-014 (P2/S) 記事・コールアウト: コールアウトを 15px/1.7、`padding: .5em 0 .5em 1em`、`margin: 1.4em 0` にして本文より半歩引く。ラベルは `display:block; font-size: 13px…
- [ ] R-015 (P3/S) 記事・コールアウト: rehype で `aside` → `div role="note"`（WAI-ARIA の note ロール）に変更し、`aria-label` に種類名を付ける
- [ ] R-016 (P3/S) 記事・表: `aria-label` を直前の見出しテキスト（`${heading} の表`）にする。無ければ `表 ${n}`
- [ ] R-038 (P2/S) サイドバー・現在位置: 現在カテゴリ（`isCurrent`）は `text-fg font-semibold`。Issue #12 の「カテゴリ行 15px semibold」は全行に掛かるので、現在カテゴリは加えて `text-fg`、他は…
- [ ] R-039 (P2/S) サイドバー・hover: Issue #12 の「hover は背景のみ」に加えて `hover:bg-muted` を行全体（`-ml-[9px]` 込み）に掛け、左線は現在位置だけに使う
- [ ] R-040 (P2/S) サイドバー・スクロール: `CategoryNav` マウント時と `slug` 変更時に `a[aria-current=page]` を `scrollIntoView({ block: 'center', behavior: 'instan…
- [ ] R-041 (P3/S) サイドバー・行: 「システムの記事一覧」のようにカテゴリ名を含めるか、件数を落として「すべて見る」。Stripe は「Overview」
- [ ] R-042 (P3/S) サイドバー・空: 「記事はまだありません」
- [ ] R-043 (P2/S) サイドバー・下端: 内側に `pb-16` を追加。末尾に 1px の `border-t` と「索引へ」リンクを置くと終端が分かる
- [ ] R-044 (P3/S) ドロワー・幅: `w-[min(18rem,80vw)]`（288px）
- [ ] R-045 (P3/S) サイドバー・フォーカス順: skip link の飛び先を記事カラム（`id="content"`、`tabIndex=-1`）にし、2 本目の skip「サイドバーを飛ばす」をサイドバー先頭に `sr-only focus:not-sr-only…

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build`
- 変更した画面を Playwright で 1440 / 390、light / dark で撮影し `research/shots/r2c-*.png` に保存、Read で確認
- チェックを更新し、未対応はコメントに理由を書く。Issue は閉じない
