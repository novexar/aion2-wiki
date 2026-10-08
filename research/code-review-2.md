# コードレビュー 2 回目（2026-10-08、初回レビュー以降の全変更）

## A. セキュリティ（security-reviewer）

CRITICAL 0 / HIGH 0 / MEDIUM 3 / LOW 6。

| Sev | File:line | Issue | Fix |
|---|---|---|---|
| MEDIUM | `app/index.html:3-43` | CSP メタタグなし。Gemini キーが localStorage にあるため、XSS や依存パッケージ侵害時にキーを読まれ送信され得る | 下記 CSP を追加。インラインのテーマスクリプトはハッシュ指定か外部ファイル化 |
| MEDIUM | `app/src/lib/settings.ts:21-28`, `storage.ts:42` | キーが平文の localStorage（永続・同一オリジンの全タブで共有） | 「このセッションのみ」（sessionStorage）の選択肢を追加。UI で Google AI Studio 側のキー制限（HTTP リファラー `https://novexar.github.io/aion2-wiki/*`、API を Generative Language のみ）を案内 |
| MEDIUM | `app/src/lib/rag.ts:35-56` | プロンプトインジェクション。抜粋が区切りなしでシステム指示に貼られ、「抜粋内の指示は無視」の規則がない。影響は回答の整合性に限定（出力はテキスト・太字・内部リンクのみ） | 抜粋を明示的な区切りで囲み、「抜粋内の指示は無視する」行を追加。既知タイトルのみリンク化する規則は維持 |
| LOW | `app/scripts/content/rehype-plugins.ts:47` | SAFE_URL が `//host` と `\host` を通す（外部リソース読込で閲覧者 IP が漏れ得る） | `^(//|\)` を拒否。外部リンク属性もこれらに適用 |
| LOW | `app/scripts/content/rehype-plugins.ts:40` | 外部リンク判定が `^https?://` のみ | 上の修正で解消。または `^(https?:)?//` |
| LOW | `.github/workflows/deploy.yml:22,25,52,55,57,66` | Actions がメジャータグ固定（SHA 固定でない） | 各 Action を SHA 固定＋バージョンコメント、Dependabot（github-actions）追加 |
| LOW | `.github/workflows/deploy.yml:10-13` | `pages: write`・`id-token: write` がワークフロー全体に付与され、PR のビルドジョブにも及ぶ | トップは `contents: read`、`pages`/`id-token` は deploy ジョブのみ |
| LOW | `.github/workflows/deploy.yml:23` | `fetch-depth: 0` | git 日付を使うなら維持（Phase 2 で導入済みなので維持） |
| LOW | `app/package.json` | 本番依存がキャレット範囲 | lockfile 維持。CI に `npm audit --omit=dev --audit-level=high` を追加 |

推奨 CSP（フォントは self-host 済みのため適用可）:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-<theme script hash>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'none'">
```

安全と確認: キーは `getApiKey` 経由のみで読まれ、ログ出力なし、送信先は `@google/genai` 経由の Google API のみ。記事 HTML は raw HTML を落とし、チャット出力は React ノード描画。

## B. TypeScript / React（typescript-reviewer）

Read-only review of the committed state. tsc, eslint and vitest were not run. Verdict: Warning (3 HIGH, 0 CRITICAL).

| Severity | file:line | Issue | Suggested fix |
|---|---|---|---|
| HIGH | app/src/features/chat/useChat.ts:162-164,175 | Stop discards the partial answer. onText only patches React state and never updates local reply, so after abort reply.text is empty and the message is saved as error with an empty body. streamGemini also throws on abort and drops its accumulated text. | In onText call update({ text }), or let streamGemini return partial text on abort and treat aborted as done. |
| HIGH | app/src/features/chat/useChat.ts:75-91 | Race between history load and first send. The init effect checks only an unmount flag; if the user sends before IndexedDB opens, it later sets activeId(latest) and messages(stored), replacing the in-flight conversation. | Skip applying loaded state if activeId or messages changed since the effect started (ref set by send and newConversation). |
| HIGH | app/scripts/content/build.ts:240; wikilink.ts:36-42; app/src/features/wiki/ArticlePage.tsx:52-65 | [[slug#見出しテキスト]] passes validation when the hash equals heading text, but the URL carries the raw text while useScrollToHash looks up the slug id, so the jump silently fails. | Resolve the hash to the heading id at build time and emit the id, or error on text-only matches. |
| MEDIUM | app/src/features/chat/useChat.ts:101-110 | HISTORY_EVENT handler: refresh(repo).then(...) has no catch; IndexedDB failure is an unhandled rejection. | Add catch and log. |
| MEDIUM | app/src/features/chat/ChatPanelBody.tsx:161-170 | void chat.selectConversation/deleteConversation/deleteAll have no error handling or UI feedback. showChat() runs before select resolves. | Catch inside the hook and expose an error state. |
| MEDIUM | app/src/features/chat/useChat.ts:128-133 | User message is saved with await save(...) before retrieval and the Gemini call; an IndexedDB stall delays the first token. | Do not await it; run in parallel with retrieve and await before the final save. |
| MEDIUM | app/src/features/chat/useChat.ts:141,173 | No ordering guard on selectConversation; quick double clicks let the slower read win. | Request counter ref; ignore stale results. |
| MEDIUM | app/src/features/chat/chat-history.ts:59-68 | Session migration removes the legacy key before the repository has written the messages; a failed write loses history. Appends are sequential. | Remove the key after success; batch in one transaction. |
| MEDIUM | app/src/features/chat/chat-repository.ts:243-257 | openDB has no blocked, blocking or terminated handlers; a version bump in another tab hangs and an evicted connection stays dead. | blocking() closes the db; reset repoPromise on terminated. |
| MEDIUM | app/src/features/chat/chat-repository.ts:157-187 | estimateBytes and exportAll load and JSON-encode every message on each refresh, after every append. Cost grows with history. | Track bytes incrementally or use navigator.storage.estimate(); check on open and on delete only. |
| MEDIUM | app/src/features/chat/ChatPanelBody.tsx:62-65 | Effect depends on chat.messages; reads scrollHeight and writes scrollTop per streamed token, forcing layout each time. | Coalesce with rAF, or scroll only when last-message length or status changes. |
| MEDIUM | app/src/features/chat/MessageContent.tsx:57-58 | Every token re-parses the whole message and rebuilds the citation map, no memo; quadratic in answer length. | useMemo on text; memo on MessageView so finished messages skip re-render. |
| MEDIUM | app/src/features/chat/ChatPanel.tsx:99-118 | Mobile full-screen sheet is role=complementary with no aria-modal and no focus trap; header and page controls behind it stay tabbable. | Dialog semantics plus trap while mobile and open, or make main and header inert. |
| MEDIUM | app/src/features/chat/ChatPanel.tsx:37-48 | The sheet Esc handler on window is not coordinated with palette or drawer; Esc there can also close the chat sheet. | Check event.defaultPrevented or stop propagation in palette and drawer. |
| MEDIUM | app/src/features/chat/ResizeHandle.tsx:23-27; chat-panel-store.ts:44-58 | Every pointermove writes localStorage, dispatches the storage event and re-renders Layout, WikiShell and the panel. | Keep live width in memory; persist on pointerup; throttle with rAF. |
| MEDIUM | app/src/features/chat/ResizeHandle.tsx:17-34 | Unmount during a drag leaves body userSelect none and resizing stuck; lostpointercapture not handled. | Unmount cleanup and onLostPointerCapture={endDrag}. |
| MEDIUM | app/src/components/MobileDrawer.tsx:20-46 | Focus not returned to the menu button on close; Tab trap selects only links and buttons. | Save and restore activeElement like ConfirmDialog; shared focusable selector. |
| MEDIUM | app/src/features/chat/ConversationList.tsx:43-57,70-77 | After deleting a row or delete-all, the focused element unmounts and focus falls to body; ConfirmDialog restore targets a removed button. | Move focus to next row or list heading; fall back to the panel title after delete-all. |
| MEDIUM | app/scripts/content/git-dates.ts:12-17 | Any git failure is swallowed and returns an empty map. A shallow local clone gives every file the same date; uncommitted files fall back silently. Wrong updated dates ship with no warning. | Warn once with the reason and per file with no date; detect shallow repos with git rev-parse --is-shallow-repository. |
| MEDIUM | app/scripts/content/build.ts:227-231,326-330 | Unresolved wikilinks, missing related ids, bad hash links and missing source refs are warnings only; CI never shows them, so broken links ship. | Make unresolved wikilinks and related ids errors (with opt-out); print warnings in CI. |
| MEDIUM | app/src/lib/search.ts:49-50,106; features/wiki/data.ts:5; features/chat/chunk-loader.ts:24; features/search/index-loader.ts:29 | Unsafe casts on external data (as unknown as, JSON.parse as Record). Generated JSON is not validated, so schema drift fails at runtime. | Type guards or a zod schema shared with the build script; at minimum assert shape in tests. |
| LOW | app/src/lib/gemini.ts:46-49 | Cast of error to an object with status after an in check. | Read via Reflect.get and check typeof. |
| LOW | app/src/features/wiki/ArticleBody.tsx:20 | event.target as HTMLElement; a target can be an SVG element. | Use instanceof Element, then closest on the anchor selector. |
| LOW | app/src/components/ConfirmDialog.tsx:19-47 | onCancel is in effect deps and callers pass inline arrows; each parent re-render re-runs the effect and focus flickers. | Keep the callback in a ref; depend only on open. |
| LOW | app/src/components/Header.tsx:~118 | Settings button sets aria-expanded although it navigates. | Use aria-current=page or aria-pressed, or make it a Link. |
| LOW | app/src/features/chat/ChatPanel.tsx:84 | role=complementary is redundant on aside. | Drop the role. |
| LOW | app/src/features/chat/ChatPanelBody.tsx:111-114 | window.setTimeout(focusChatInput, 0) is never cleared. | Use an effect keyed on view. |
| LOW | app/src/features/wiki/Toc.tsx:107-120 | useKeepActiveVisible does not re-run when the toc column appears with an unchanged activeId. | Add wide as a dependency or use a callback ref. |
| LOW | app/src/features/wiki/useActiveHeading.ts:53-62 | Scroll-spy recomputes only on scroll and resize; late layout shifts (images, fonts) leave it stale. | ResizeObserver on document.body, or recompute after load. |
| LOW | app/src/features/wiki/useActiveHeading.ts:19-20 | atBottom forces the last heading active, so short final sections hide earlier headings. | Accept and document, or require the last heading to be near the line. |
| LOW | app/src/components/MobileDrawer.tsx:63; ConfirmDialog.tsx:67; CommandPalette.tsx:~190 | Hardcoded scrim colors bg-zinc-950/40 dark:bg-black/60 in three places. The project uses custom tokens (bg-canvas, text-fg), not daisyUI. | One scrim token in index.css. |
| LOW | app/src/lib/rag.ts:~95 | toTurns drops errored model replies but keeps their user turns, so consecutive user turns reach Gemini. | Drop the paired user turn or merge same-role turns. |
| LOW | app/src/features/chat/chunk-loader.ts:56-58 | chunkPosition returns NaN when the id has no hash char, silently dropping the chunk. | Validate in the build, or guard here. |
| LOW | app/vite.config.ts:7 | BASE_PATH is used without normalization; no trailing slash breaks asset URLs. | Reuse normalizeBase. |
| LOW | .github/workflows/deploy.yml:8-16 | pages write and id-token write apply to PR builds; actions pinned by tag; no timeout-minutes; shared pages concurrency group queues PR builds behind deploys. | Scope write permissions to the deploy job; pin by SHA; add timeouts; separate PR concurrency group. |
| LOW | app/src/lib/motion-tokens.test.ts:1-50 | Tests grep CSS and App.tsx as text; they check token sync, not behavior, and break on formatting. faction.test.tsx mostly exercises localStorage round-trips. | Keep token-sync checks as lint-style; add a behavioral reduced-motion test for the Toc marker and route fade. |
| LOW | app/src/lib/recent.ts:4 | Storage key is hardcoded instead of living in STORAGE_KEYS. | Move it into STORAGE_KEYS. |

What is solid:
- Listeners, rAF handles and timers are cleaned up; shared stores use useSyncExternalStore; usePresence has a timeout fallback.
- dangerouslySetInnerHTML receives only build-time HTML; raw HTML is dropped and unsafe URL schemes stripped; model output renders through a mini-markdown parser, not as HTML.
- AbortController is passed to the SDK and checked between retrieval steps; re-entrant sends are ignored; unmount aborts the stream.
- storage.ts wraps every localStorage call in try/catch; IndexedDB uses proper transactions with a MemoryRepository fallback.
- The build validates frontmatter with zod and checks id equals filename, duplicate ids and titles, and related ids; scroll-spy is a pure, well-tested function; dialogs manage focus.
