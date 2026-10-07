オーナーからの追加指摘（2026-10-08）: 「左右の余白が空きすぎている」「左メニューが閲覧順序ではなく あいうえお順」。Phase 3（#3）の担当エンジニアが本 Issue も実施する。

## A. 左右の余白（レイアウト幅）

現状: `features/wiki/WikiShell.tsx:12` が `max-w-[90rem]` の中で `16rem minmax(0,44rem) 14rem` を中央寄せしているため、1440px では本文 704px の両側に大きな空白が出る。索引・カテゴリ一覧ページも同じ 44rem に制限されている。

改修:
- [ ] グリッドを `lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_15rem]`、コンテナは `max-w-[88rem] px-6`（モバイル `px-4`）。中央カラムは残り幅をすべて使う
- [ ] 記事本文のテキスト部分だけ `max-w-[76ch]`（約 72〜80 字）。表・コードブロック・図はカラム幅いっぱいまで広げてよい（横スクロールはカラム内で）
- [ ] ホーム・索引・カテゴリ一覧・検索結果は本文幅制限なし（カラム幅＝内容幅）。一覧は 2 列（lg）／3 列（2xl）で密度を上げる
- [ ] 1920px でも右側の目次が本文から離れすぎないよう、目次カラムは `sticky` のまま本文カラムの直後に置く（中央寄せで浮かせない）
- [ ] 参考: MDN（サイドバー 18rem・本文可変・右目次）、Zenn 記事ページ。ランディング的な中央寄せ 1 カラムにしない

## B. 左メニューの並び順（閲覧順序）

現状: `scripts/content/build.ts:141-153` でカテゴリ内の記事を `reading`/`title` の五十音順で並べている。初心者が上から読む順になっていない。

改修:
- [ ] frontmatter に `order`（整数、カテゴリ内の閲覧順）を追加。値は `research/topic-inventory.md` の各カテゴリ表の `#` 列（台帳は初心者→応用の順で作られている）。PM が全 235 記事に一括付与する（content 側）
- [ ] `content/SCHEMA.md` に `order` を記載（必須。未設定は 999 として末尾、ビルド時に警告）
- [ ] `build.ts`: カテゴリ内の並びを `order` 昇順 → `reading` の順に変更。サイドバー（CategoryNav）、カテゴリ一覧ページ、ホームの代表記事、関連記事の既定順もこれに従う
- [ ] 五十音索引（/index）だけは従来どおり `reading` 順を維持
- [ ] サイドバーは「現在のカテゴリを展開し、他は折りたたみ」。カテゴリ自体の順も SCHEMA の並び（basics → leveling → systems → dungeons → pvp → economy → classes → news → tips → faq → guide ではなく、閲覧順 guide → basics → leveling → systems → dungeons → economy → classes → pvp → tips → faq → news）に変更し、`lib/categories.ts` の配列順で制御する
