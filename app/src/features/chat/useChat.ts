import { useCallback, useEffect, useRef, useState } from 'react';
import { streamGemini, toChatError } from '../../lib/gemini';
import { buildRagRequest, pickReferences, retrievalQuery, TOP_K } from '../../lib/rag';
import { searchChunks } from '../../lib/search';
import {
  clearHistory,
  loadHistory,
  newId,
  saveHistory,
  toTurns,
  type ChatMessage,
} from './chat-history';
import { loadChunkStore, resolveChunks } from './chunk-loader';

export interface UseChatOptions {
  readonly apiKey: string | null;
  readonly model: string;
}

export interface UseChatResult {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
  readonly send: (question: string) => Promise<void>;
  readonly stop: () => void;
  readonly clear: () => void;
}

export function useChat({ apiKey, model }: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  // ストリーミング中はトークンごとに保存しない
  useEffect(() => {
    if (!isStreaming) saveHistory(messages);
  }, [messages, isStreaming]);

  useEffect(() => () => controllerRef.current?.abort(), []);

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
      const replyId = newId();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: replyId, role: 'model', text: '', status: 'streaming' },
      ]);
      setIsStreaming(true);

      try {
        const store = await loadChunkStore();
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        const refs = searchChunks(
          store.index,
          store.byId,
          retrievalQuery(history, question),
          TOP_K,
        );
        const chunks = await resolveChunks(refs);
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (chunks.length === 0) {
          // 根拠になる抜粋がなければ API を呼ばずに返す
          patch(replyId, {
            text: 'この Wiki に該当する記事がありません。',
            status: 'done',
            refs: [],
          });
          return;
        }
        const request = buildRagRequest(history, question, chunks);
        const full = await streamGemini({
          apiKey,
          model,
          systemInstruction: request.systemInstruction,
          contents: request.contents,
          signal: controller.signal,
          onText: (text) => patch(replyId, { text }),
        });
        patch(replyId, { text: full, status: 'done', refs: pickReferences(chunks, full) });
      } catch (error: unknown) {
        const chatError = toChatError(error);
        if (chatError.kind === 'aborted') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === replyId
                ? {
                    ...m,
                    status: m.text ? 'done' : 'error',
                    error: m.text ? undefined : chatError.message,
                  }
                : m,
            ),
          );
        } else {
          patch(replyId, { status: 'error', error: chatError.message });
        }
      } finally {
        controllerRef.current = null;
        setIsStreaming(false);
      }
    },
    [apiKey, model, messages, patch],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    setMessages([]);
    clearHistory();
  }, []);

  return { messages, isStreaming, send, stop, clear };
}
