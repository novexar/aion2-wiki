コードレビュー 2 回目（`research/code-review-2.md`: A セキュリティ、B TypeScript/React）の修正。件数: HIGH 3 / MEDIUM 21 / LOW 21。

## 順序
1. 高速化 PR（#19）を main に取り込んだ後、その上で修正する（チャット系ファイルが重なるため）
2. HIGH → MEDIUM → LOW。各行の「Fix」列をそのまま適用
3. CSP は `index.html` のインラインスクリプトをハッシュ指定または外部化してから有効化し、Playwright でチャット送信・テーマ切替・検索が動くことを確認

## チェックリスト
- [ ] CR-01 [HIGH] (B) `app/src/features/chat/useChat.ts:162-164,175` — Stop discards the partial answer. onText only patches React state and never updates local reply, so after abort reply.te…
- [ ] CR-02 [HIGH] (B) `app/src/features/chat/useChat.ts:75-91` — Race between history load and first send. The init effect checks only an unmount flag; if the user sends before IndexedD…
- [ ] CR-03 [HIGH] (B) `app/scripts/content/build.ts:240; wikilink.ts:36-42; app/src/features/wiki/ArticlePage.tsx:52-65` — [[slug#見出しテキスト]] passes validation when the hash equals heading text, but the URL carries the raw text while useScrollTo…
- [ ] CR-04 [MEDIUM] (A) `app/index.html:3-43` — CSP メタタグなし。Gemini キーが localStorage にあるため、XSS や依存パッケージ侵害時にキーを読まれ送信され得る
- [ ] CR-05 [MEDIUM] (A) `app/src/lib/settings.ts:21-28, storage.ts:42` — キーが平文の localStorage（永続・同一オリジンの全タブで共有）
- [ ] CR-06 [MEDIUM] (A) `app/src/lib/rag.ts:35-56` — プロンプトインジェクション。抜粋が区切りなしでシステム指示に貼られ、「抜粋内の指示は無視」の規則がない。影響は回答の整合性に限定（出力はテキスト・太字・内部リンクのみ）
- [ ] CR-07 [MEDIUM] (B) `app/src/features/chat/useChat.ts:101-110` — HISTORY_EVENT handler: refresh(repo).then(...) has no catch; IndexedDB failure is an unhandled rejection.
- [ ] CR-08 [MEDIUM] (B) `app/src/features/chat/ChatPanelBody.tsx:161-170` — void chat.selectConversation/deleteConversation/deleteAll have no error handling or UI feedback. showChat() runs before …
- [ ] CR-09 [MEDIUM] (B) `app/src/features/chat/useChat.ts:128-133` — User message is saved with await save(...) before retrieval and the Gemini call; an IndexedDB stall delays the first tok…
- [ ] CR-10 [MEDIUM] (B) `app/src/features/chat/useChat.ts:141,173` — No ordering guard on selectConversation; quick double clicks let the slower read win.
- [ ] CR-11 [MEDIUM] (B) `app/src/features/chat/chat-history.ts:59-68` — Session migration removes the legacy key before the repository has written the messages; a failed write loses history. A…
- [ ] CR-12 [MEDIUM] (B) `app/src/features/chat/chat-repository.ts:243-257` — openDB has no blocked, blocking or terminated handlers; a version bump in another tab hangs and an evicted connection st…
- [ ] CR-13 [MEDIUM] (B) `app/src/features/chat/chat-repository.ts:157-187` — estimateBytes and exportAll load and JSON-encode every message on each refresh, after every append. Cost grows with hist…
- [ ] CR-14 [MEDIUM] (B) `app/src/features/chat/ChatPanelBody.tsx:62-65` — Effect depends on chat.messages; reads scrollHeight and writes scrollTop per streamed token, forcing layout each time.
- [ ] CR-15 [MEDIUM] (B) `app/src/features/chat/MessageContent.tsx:57-58` — Every token re-parses the whole message and rebuilds the citation map, no memo; quadratic in answer length.
- [ ] CR-16 [MEDIUM] (B) `app/src/features/chat/ChatPanel.tsx:99-118` — Mobile full-screen sheet is role=complementary with no aria-modal and no focus trap; header and page controls behind it …
- [ ] CR-17 [MEDIUM] (B) `app/src/features/chat/ChatPanel.tsx:37-48` — The sheet Esc handler on window is not coordinated with palette or drawer; Esc there can also close the chat sheet.
- [ ] CR-18 [MEDIUM] (B) `app/src/features/chat/ResizeHandle.tsx:23-27; chat-panel-store.ts:44-58` — Every pointermove writes localStorage, dispatches the storage event and re-renders Layout, WikiShell and the panel.
- [ ] CR-19 [MEDIUM] (B) `app/src/features/chat/ResizeHandle.tsx:17-34` — Unmount during a drag leaves body userSelect none and resizing stuck; lostpointercapture not handled.
- [ ] CR-20 [MEDIUM] (B) `app/src/components/MobileDrawer.tsx:20-46` — Focus not returned to the menu button on close; Tab trap selects only links and buttons.
- [ ] CR-21 [MEDIUM] (B) `app/src/features/chat/ConversationList.tsx:43-57,70-77` — After deleting a row or delete-all, the focused element unmounts and focus falls to body; ConfirmDialog restore targets …
- [ ] CR-22 [MEDIUM] (B) `app/scripts/content/git-dates.ts:12-17` — Any git failure is swallowed and returns an empty map. A shallow local clone gives every file the same date; uncommitted…
- [ ] CR-23 [MEDIUM] (B) `app/scripts/content/build.ts:227-231,326-330` — Unresolved wikilinks, missing related ids, bad hash links and missing source refs are warnings only; CI never shows them…
- [ ] CR-24 [MEDIUM] (B) `app/src/lib/search.ts:49-50,106; features/wiki/data.ts:5; features/chat/chunk-loader.ts:24; features/search/index-loader.ts:29` — Unsafe casts on external data (as unknown as, JSON.parse as Record). Generated JSON is not validated, so schema drift fa…
- [ ] CR-25 [LOW] (A) `app/scripts/content/rehype-plugins.ts:40` — 外部リンク判定が `^https?://` のみ
- [ ] CR-26 [LOW] (A) `.github/workflows/deploy.yml:22,25,52,55,57,66` — Actions がメジャータグ固定（SHA 固定でない）
- [ ] CR-27 [LOW] (A) `.github/workflows/deploy.yml:10-13` — `pages: write`・`id-token: write` がワークフロー全体に付与され、PR のビルドジョブにも及ぶ
- [ ] CR-28 [LOW] (A) `.github/workflows/deploy.yml:23` — `fetch-depth: 0`
- [ ] CR-29 [LOW] (A) `app/package.json` — 本番依存がキャレット範囲
- [ ] CR-30 [LOW] (B) `app/src/lib/gemini.ts:46-49` — Cast of error to an object with status after an in check.
- [ ] CR-31 [LOW] (B) `app/src/features/wiki/ArticleBody.tsx:20` — event.target as HTMLElement; a target can be an SVG element.
- [ ] CR-32 [LOW] (B) `app/src/components/ConfirmDialog.tsx:19-47` — onCancel is in effect deps and callers pass inline arrows; each parent re-render re-runs the effect and focus flickers.
- [ ] CR-33 [LOW] (B) `app/src/components/Header.tsx:~118` — Settings button sets aria-expanded although it navigates.
- [ ] CR-34 [LOW] (B) `app/src/features/chat/ChatPanel.tsx:84` — role=complementary is redundant on aside.
- [ ] CR-35 [LOW] (B) `app/src/features/chat/ChatPanelBody.tsx:111-114` — window.setTimeout(focusChatInput, 0) is never cleared.
- [ ] CR-36 [LOW] (B) `app/src/features/wiki/Toc.tsx:107-120` — useKeepActiveVisible does not re-run when the toc column appears with an unchanged activeId.
- [ ] CR-37 [LOW] (B) `app/src/features/wiki/useActiveHeading.ts:53-62` — Scroll-spy recomputes only on scroll and resize; late layout shifts (images, fonts) leave it stale.
- [ ] CR-38 [LOW] (B) `app/src/features/wiki/useActiveHeading.ts:19-20` — atBottom forces the last heading active, so short final sections hide earlier headings.
- [ ] CR-39 [LOW] (B) `app/src/components/MobileDrawer.tsx:63; ConfirmDialog.tsx:67; CommandPalette.tsx:~190` — Hardcoded scrim colors bg-zinc-950/40 dark:bg-black/60 in three places. The project uses custom tokens (bg-canvas, text-…
- [ ] CR-40 [LOW] (B) `app/src/lib/rag.ts:~95` — toTurns drops errored model replies but keeps their user turns, so consecutive user turns reach Gemini.
- [ ] CR-41 [LOW] (B) `app/src/features/chat/chunk-loader.ts:56-58` — chunkPosition returns NaN when the id has no hash char, silently dropping the chunk.
- [ ] CR-42 [LOW] (B) `app/vite.config.ts:7` — BASE_PATH is used without normalization; no trailing slash breaks asset URLs.
- [ ] CR-43 [LOW] (B) `.github/workflows/deploy.yml:8-16` — pages write and id-token write apply to PR builds; actions pinned by tag; no timeout-minutes; shared pages concurrency g…
- [ ] CR-44 [LOW] (B) `app/src/lib/motion-tokens.test.ts:1-50` — Tests grep CSS and App.tsx as text; they check token sync, not behavior, and break on formatting. faction.test.tsx mostl…
- [ ] CR-45 [LOW] (B) `app/src/lib/recent.ts:4` — Storage key is hardcoded instead of living in STORAGE_KEYS.

## 完了条件
- `npm run lint && npm run typecheck && npm test && npm run build`。HIGH 3 件には回帰テストを追加（停止時の途中回答保持、履歴読込と送信の競合、見出しリンクの id 解決）
- 修正は PR で提出し、typescript-reviewer の再レビュー後に PM が取り込む
