方針: `research/ui-direction.md`（Issue #8）。採用は **B案 Navy Banner ＋ C案の帯の左右対比色（左: 天族シアン → 右: 魔族紫）を既定にした折衷案**。文言は変更しない。本文は無地・可読性ルール（`research/ui-audit.md` 3 章）維持。

実装項目（番号は ui-direction.md 7 章と対応）:

- [ ] 3-1 (S) Dark ヘッダーの 92% 透過＋ blur（スクロール時に本文が薄く透ける演出。Light では不透明のまま） — ``Header.tsx``
- [ ] 3-2 (M) 帯の左右対比色（C 案のシアン→紫）を設定で選べる「陣営テーマ」にするか判断。やる場合は `data-faction` 属性で帯の光彩色だけ切替 — ``SettingsPage.tsx`、`index.css``

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build` 通過
- Playwright で home / article を 1440・390、light・dark で `research/shots/theme-p3-*.png` に保存し、モックアップ `research/shots/direction-b-*.png` と見比べて差異を Issue にコメント
- コミットは項目単位、push で自動デプロイ
