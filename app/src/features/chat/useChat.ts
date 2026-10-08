import { useCallback, useEffect, useRef, useState } from 'react';
import { streamGemini, toChatError } from '../../lib/gemini';
import { buildRagRequest, pickReferences, retrievalQuery, TOP_K } from '../../lib/rag';
import { searchChunks } from '../../lib/search';
import type { ChunkRef } from '../../lib/types';
import {
  fromStored,
  getChatRepository,
  HISTORY_EVENT,
  newId,
  toStored,
  toTurns,
  type ChatMessage,
} from './chat-history';
import { WARN_BYTES, type ChatRepository, type Conversation } from './chat-repository';
import { loadChunkStore, prependArticleChunks, resolveChunks } from './chunk-loader';

export interface UseChatOptions {
  readonly apiKey: string | null;
  readonly model: string;
  /** 指定があれば、その記事のチャンクを検索結果の先頭に加える */
  readonly contextArticleId?: string | null;
}

export interface UseChatResult {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
  readonly send: (question: string) => Promise<void>;
  readonly stop: () => void;
  readonly conversations: readonly Conversation[];
  readonly activeId: string | null;
  /** null は保存先を開いている途中 */
  readonly persistent: boolean | null;
  readonly overQuota: boolean;
  readonly newConversation: () => void;
  readonly selectConversation: (id: string) => Promise<void>;
  readonly deleteConversation: (id: string) => Promise<void>;
  readonly deleteAll: () => Promise<void>;
}

function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError');
}

async function retrieve(
  question: string,
  history: ReturnType<typeof toTurns>,
  contextArticleId: string | null | undefined,
  signal: AbortSignal,
) {
  const store = await loadChunkStore();
  if (signal.aborted) throw abortError();
  const found: ChunkRef[] = searchChunks(
    store.index,
    store.byId,
    retrievalQuery(history, question),
    TOP_K,
  );
  const refs = contextArticleId ? prependArticleChunks(store.byId, contextArticleId, found) : found;
  const chunks = await resolveChunks(refs);
  if (signal.aborted) throw abortError();
  return chunks;
}

export function useChat({ apiKey, model, contextArticleId }: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [repo, setRepo] = useState<ChatRepository | null>(null);
  const [overQuota, setOverQuota] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async (target: ChatRepository) => {
    const [list, bytes] = await Promise.all([target.list(), target.estimateBytes()]);
    setConversations(list);
    setOverQuota(bytes > WARN_BYTES);
    return list;
  }, []);

  // 初回: 保存先を開き、最後に更新した会話を表示する
  useEffect(() => {
    let active = true;
    void (async () => {
      const opened = await getChatRepository();
      const list = await refresh(opened);
      const latest = list[0];
      const stored = latest ? await opened.messages(latest.id) : [];
      if (!active) return;
      setRepo(opened);
      if (latest) {
        setActiveId(latest.id);
        setMessages(stored.map(fromStored));
      }
    })().catch((error: unknown) => console.error('会話履歴を読み込めませんでした', error));
    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  // 設定ページで削除されたら一覧を読み直し、消えた会話は閉じる
  useEffect(() => {
    if (!repo) return undefined;
    const onChange = (): void => {
      void refresh(repo).then((list) => {
        if (activeId && !list.some((c) => c.id === activeId)) {
          controllerRef.current?.abort();
          setActiveId(null);
          setMessages([]);
        }
      });
    };
    window.addEventListener(HISTORY_EVENT, onChange);
    return () => window.removeEventListener(HISTORY_EVENT, onChange);
  }, [repo, refresh, activeId]);

  const save = useCallback(
    async (conversationId: string, message: ChatMessage) => {
      try {
        const target = repo ?? (await getChatRepository());
        await target.append(conversationId, toStored(message));
        await refresh(target);
      } catch (error: unknown) {
        console.error('会話履歴を保存できませんでした', error);
      }
    },
    [repo, refresh],
  );

  const patch = useCallback((id: string, update: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...update } : m)));
  }, []);

  const send = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || !apiKey || controllerRef.current !== null) return;

      const controller = new AbortController();
      controllerRef.current = controller;
      const history = toTurns(messages);
      const userMsg: ChatMessage = { id: newId(), role: 'user', text: question, status: 'done' };
      let reply: ChatMessage = { id: newId(), role: 'model', text: '', status: 'streaming' };
      const update = (next: Partial<ChatMessage>): void => {
        reply = { ...reply, ...next };
        patch(reply.id, next);
      };
      setMessages((prev) => [...prev, userMsg, reply]);
      setIsStreaming(true);

      let conversationId = activeId;
      try {
        if (!conversationId) {
          // 保存先を開いている途中でも送れるようにここで待つ
          conversationId = (await (repo ?? (await getChatRepository())).create()).id;
          setActiveId(conversationId);
        }
        await save(conversationId, userMsg);
        const chunks = await retrieve(question, history, contextArticleId, controller.signal);
        if (chunks.length === 0) {
          // 根拠になる抜粋がなければ API を呼ばずに返す
          update({ text: 'この Wiki に該当する記事がありません。', status: 'done', refs: [] });
          return;
        }
        const request = buildRagRequest(history, question, chunks);
        const full = await streamGemini({
          apiKey,
          model,
          systemInstruction: request.systemInstruction,
          contents: request.contents,
          signal: controller.signal,
          onText: (text) => patch(reply.id, { text }),
        });
        update({ text: full, status: 'done', refs: pickReferences(chunks, full) });
      } catch (error: unknown) {
        const chatError = toChatError(error);
        const partial = chatError.kind === 'aborted' && reply.text;
        update(partial ? { status: 'done' } : { status: 'error', error: chatError.message });
      } finally {
        controllerRef.current = null;
        setIsStreaming(false);
        if (conversationId) await save(conversationId, reply);
      }
    },
    [apiKey, model, messages, patch, repo, activeId, save, contextArticleId],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const newConversation = useCallback(() => {
    controllerRef.current?.abort();
    setActiveId(null);
    setMessages([]);
  }, []);

  const selectConversation = useCallback(
    async (id: string) => {
      if (!repo) return;
      controllerRef.current?.abort();
      const stored = await repo.messages(id);
      setActiveId(id);
      setMessages(stored.map(fromStored));
    },
    [repo],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!repo) return;
      if (id === activeId) newConversation();
      await repo.delete(id);
      await refresh(repo);
    },
    [repo, activeId, newConversation, refresh],
  );

  const deleteAll = useCallback(async () => {
    if (!repo) return;
    newConversation();
    await repo.deleteAll();
    await refresh(repo);
  }, [repo, newConversation, refresh]);

  return {
    messages,
    isStreaming,
    send,
    stop,
    conversations,
    activeId,
    persistent: repo ? repo.persistent : null,
    overQuota,
    newConversation,
    selectConversation,
    deleteConversation,
    deleteAll,
  };
}
