方針: `research/ui-direction.md`（Issue #8）。採用は **B案 Navy Banner ＋ C案の帯の左右対比色（左: 天族シアン → 右: 魔族紫）を既定にした折衷案**。文言は変更しない。本文は無地・可読性ルール（`research/ui-audit.md` 3 章）維持。

実装項目（番号は ui-direction.md 7 章と対応）:

- [ ] 1-1 (S) 3.2 のトークンを `index.css` の `:root`／`[data-theme=dark]`／`@theme inline` に反映（link、aether、header-*、kr-fg を新設） — ``app/src/index.css``
- [ ] 1-2 (S) 本文リンク・出典番号を `link` に、Light のフォーカスリングを `accent-strong` に — ``index.css` `.prose-wiki a`、`:focus-visible``
- [ ] 1-3 (S) 「韓国版のみ」コールアウトの左線を `kr-fg` に — ``index.css` `.callout[data-kind='kr']``
- [ ] 1-4 (S) h2 とホームのセクション見出しの下罫線に 28px の金線 — ``index.css` `.prose-wiki h2`、`HomePage.tsx` `SECTION_TITLE``
- [ ] 1-5 (M) ヘッダーを濃紺に（文字・ナビ・検索・Kbd・アイコンの色を header-* に差替え、下端のグラデーション線） — ``Header.tsx`、`Logo.tsx`（菱形）、`Kbd.tsx``
- [ ] 1-6 (M) ホーム上部の帯（**光彩は左シアン→右紫の対比色を既定**。C 案の帯から色だけ移植し、中央寄せ・粒子・カード面は採用しない）（タイトル・説明・検索を帯の中へ、光彩と幾何モチーフは CSS クラス `.band`） — ``HomePage.tsx`、`index.css``
- [ ] 1-7 (S) フッターを `surface` 塗りに — ``Layout.tsx``
- [ ] 1-8 (S) モバイルドロワーの見出し部を濃紺に揃える — ``MobileDrawer.tsx``
- [ ] 1-9 (S) 既存スクリーンショットテスト／コンポーネントテストの色参照を更新 — ``components.test.tsx` ほか`

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build` 通過
- Playwright で home / article を 1440・390、light・dark で `research/shots/theme-p1-*.png` に保存し、モックアップ `research/shots/direction-b-*.png` と見比べて差異を Issue にコメント
- コミットは項目単位、push で自動デプロイ
