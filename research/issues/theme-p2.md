方針: `research/ui-direction.md`（Issue #8）。採用は **B案 Navy Banner ＋ C案の帯の左右対比色（左: 天族シアン → 右: 魔族紫）を既定にした折衷案**。文言は変更しない。本文は無地・可読性ルール（`research/ui-audit.md` 3 章）維持。

実装項目（番号は ui-direction.md 7 章と対応）:

- [ ] 2-1 (S) duration／easing トークンと hover／focus の transition 統一（5.2 #4、#8） — ``index.css`、`button-class.ts``
- [ ] 2-2 (M) ルート遷移（#1）とスクロール復元の順序 — ``App.tsx` or `Layout.tsx`、`ScrollManager.tsx``
- [ ] 2-3 (M) サイドバー開閉（#2） — ``CategoryNav.tsx``
- [ ] 2-4 (M) 目次マーカーの `layoutId`（#3） — ``Toc.tsx``
- [ ] 2-5 (M) チャットパネルのスライドとリサイズ中の無効化（#5） — ``ChatPanel.tsx`、`ResizeHandle.tsx``
- [ ] 2-6 (M) モバイルドロワーのスライド（#11） — ``MobileDrawer.tsx``
- [ ] 2-7 (S) スケルトン（#7、250ms 遅延表示） — ``PageLoading.tsx`、`WikiShell.tsx` の fallback`
- [ ] 2-8 (S) ホームの段差表示（#10、初回のみ） — ``HomePage.tsx``
- [ ] 2-9 (S) モバイル目次の展開（#12） — ``Toc.tsx``
- [ ] 2-10 (S) reduced-motion の確認（Playwright で `reducedMotion: 'reduce'` のスクリーンショット比較） — ``app/e2e` or `src/test``

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build` 通過
- Playwright で home / article を 1440・390、light・dark で `research/shots/theme-p2-*.png` に保存し、モックアップ `research/shots/direction-b-*.png` と見比べて差異を Issue にコメント
- コミットは項目単位、push で自動デプロイ
