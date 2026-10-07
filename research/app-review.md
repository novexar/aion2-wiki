# Wiki アプリ コードレビュー（2026-10-08、typescript-reviewer）

tsc / eslint / vitest は未実行。行番号は目安。

| Sev | file:line (under app/) | Issue | Fix |
|---|---|---|---|
| HIGH | src/features/wiki/ArticlePage.tsx:48 | decodeURIComponent(hash) throws URIError on a malformed hash inside an effect, which can crash the route | try/catch and fall back to the raw hash |
| HIGH | src/features/search/CommandPalette.tsx:107 | Enter selects an item during IME composition, so confirming a kanji conversion navigates away | skip keys when nativeEvent.isComposing |
| HIGH | src/lib/tokenizer.ts:20 + search-options.ts | 1-char CJK query (剣, 盾) becomes a unigram absent from the bigram index → 0 hits; chat then says "no info" | add unigram indexing or prefix match on bigrams for 1-char CJK queries |
| MED | src/lib/gemini.ts:103 + features/chat/useChat.ts:103 | On abort the stream loop returns normally; message marked done with empty text | throw AbortError after the loop if signal.aborted |
| MED | useChat.ts:52 | Double-submit guard uses closure isStreaming; two quick sends overwrite controllerRef | guard with controllerRef.current !== null |
| MED | useChat.ts:67 | loadChunkStore ignores the abort signal | check signal.aborted after the await |
| MED | useChat.ts:39 | saveHistory runs on every streamed token | persist when streaming ends or debounce |
| MED | features/chat/ChatPage.tsx:214,177 | aria-live per token is noisy; scrollIntoView per token | announce on completion; auto-scroll only near bottom |
| MED | CommandPalette.tsx:114,160 | Tab fully blocked; aria-expanded hard-coded; no inert on background | manage focus; derive aria-expanded |
| MED | scripts/content/build.ts:236 | Missing content dir is only a warning → CI could deploy an empty site | fail the build |
| MED | build.ts:248 + src/features/wiki/data.ts:28 | Duplicate titles/aliases not validated | error on duplicates |
| MED | scripts/content/wikilink.ts:5,44 | [[slug#hash]] not validated against headings nor URL-encoded | resolve, warn, encode |
| MED | .github/workflows/deploy.yml:3 | No pull_request build gate; actions pinned by tag | add PR build job; pin SHAs |
| LOW | scripts/content/frontmatter.ts:94 | gray-matter ---js frontmatter uses eval at build time | disable js engines |
| LOW | frontmatter.ts:55 | reading not validated as hiragana | regex |
| LOW | scripts/content/chunker.ts:~71 | slice by UTF-16 unit can split surrogate pairs | Array.from |
| LOW | src/lib/tokenizer.ts:10 | Missing ゝゞ; kana not folded | fold kana |
| LOW | src/lib/search.ts:33 | OR-fallback ratio counts matched index terms | count distinct query tokens |
| LOW | src/lib/settings.ts:25 + index.html | API key plaintext localStorage (BYOK design), no CSP | CSP connect-src generativelanguage.googleapis.com |
| LOW | features/wiki/ArticleBody.tsx:18 等 | unsafe casts | instanceof guards |
| LOW | scripts/content/rehype-plugins.ts:31 | URL allowlist accepts protocol-relative //host | reject ^// |
| LOW | MobileDrawer.tsx:16 + CommandPalette.tsx:209 | body.overflow save/restore can leave body locked | shared scroll-lock counter |
| LOW | vite.config.ts:35 | genai split OK; future static import would bloat entry | no-restricted-imports rule |

Verified OK: chat markdown via React nodes (no HTML injection); article HTML drops raw HTML and unsafe URL schemes; storage wrapped in try/catch; effect cleanups correct; chunk anchors match rehype-slug IDs; frontmatter zod validation solid.
