import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { streamGemini, toChatError } from '../../lib/gemini';
import { buildRagRequest, pickReferences, selectContext } from '../../lib/rag';
import {
  fromStored,
  getChatRepository,
  HISTORY_EVENT,
  newId,
  NO_ANSWER_TEXT,
  toStored,
  toTurns,
  type ChatMessage,
} from './chat-history';
import { WARN_BYTES, type ChatRepository, type Conversation } from './chat-repository';
import { startChatTimer } from './chat-timing';
import { retrieveChunks } from './chunk-loader';

export interface UseChatOptions {
  readonly apiKey: string | null;
  readonly model: string;
  /** 指定があれば、その記事のチャンクを検索結果の先頭に加える */
  readonly contextArticleId?: string | null;
}

export interface UseChatResult {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
  readonly model: string;
  readonly send: (question: string) => Promise<void>;
  readonly stop: () => void;
  readonly conversations: readonly Conversation[];
  readonly activeId: string | null;
  /** null は保存先を開いている途中 */
  readonly persistent: boolean | null;
  readonly overQuota: boolean;
  /** 履歴の読み込み・削除に失敗した時の表示文言 */
  readonly historyError: string | null;
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
  const chunks = await retrieveChunks({ history, question, contextArticleId, signal });
  if (signal.aborted) throw abortError();
  // 導入チャンクを含め、同一記事 2 件まで・TOP_K 件・3,600 字に絞る
  return selectContext(chunks);
}

export function useChat({ apiKey, model, contextArticleId }: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [repo, setRepo] = useState<ChatRepository | null>(null);
  const [overQuota, setOverQuota] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  /** 利用者が送信・新規作成・選択をしたら、初回の履歴読み込み結果は反映しない */
  const touchedRef = useRef(false);
  /** selectConversation の最新リクエスト番号（古い結果を捨てる） */
  const selectSeq = useRef(0);

  // 保存量の計測は全メッセージを読むため、開いた時と削除時だけ行う
  const refresh = useCallback(async (target: ChatRepository, measure = false) => {
    const [list, bytes] = await Promise.all([
      target.list(),
      measure ? target.estimateBytes() : Promise.resolve(null),
    ]);
    setConversations(list);
    if (bytes !== null) setOverQuota(bytes > WARN_BYTES);
    return list;
  }, []);

  // 初回: 保存先を開き、最後に更新した会話を表示する
  useEffect(() => {
    let active = true;
    void (async () => {
      const opened = await getChatRepository();
      const list = await refresh(opened, true);
      const latest = list[0];
      const stored = latest ? await opened.messages(latest.id) : [];
      if (!active) return;
      setRepo(opened);
      if (latest && !touchedRef.current) {
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
      refresh(repo, true)
        .then((list) => {
          if (activeId && !list.some((c) => c.id === activeId)) {
            controllerRef.current?.abort();
            setActiveId(null);
            setMessages([]);
          }
        })
        .catch((error: unknown) => console.error('会話履歴を読み直せませんでした', error));
    };
    window.addEventListener(HISTORY_EVENT, onChange);
    return () => window.removeEventListener(HISTORY_EVENT, onChange);
  }, [repo, refresh, activeId]);

  const save = useCallback(
    async (conversationId: string, message: ChatMessage, createdAt: number) => {
      try {
        const target = repo ?? (await getChatRepository());
        await target.append(conversationId, toStored(message, createdAt));
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

      const timer = startChatTimer();
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

      const sentAt = Date.now();
      let conversationId = activeId;
      let userSaved: Promise<void> = Promise.resolve();
      let usedChunks: Parameters<typeof pickReferences>[0] = [];
      touchedRef.current = true;
      try {
        if (!conversationId) {
          // 保存先を開いている途中でも送れるようにここで待つ
          conversationId = (await (repo ?? (await getChatRepository())).create()).id;
          setActiveId(conversationId);
        }
        // 保存の完了を待たずに検索を始める（最後の保存の前に待つ）
        userSaved = save(conversationId, userMsg, sentAt);
        const chunks = await retrieve(question, history, contextArticleId, controller.signal);
        timer.retrieved();
        if (chunks.length === 0) {
          // 根拠になる抜粋がなければ API を呼ばずに返す
          update({ text: NO_ANSWER_TEXT, status: 'done', refs: [] });
          return;
        }
        // 回答を待たず、根拠にする記事を先に見せる
        usedChunks = chunks;
        update({ refs: pickReferences(chunks) });
        const request = buildRagRequest(history, question, chunks);
        const full = await streamGemini({
          apiKey,
          model,
          systemInstruction: request.systemInstruction,
          contents: request.contents,
          signal: controller.signal,
          onText: (text) => {
            timer.firstToken();
            update({ text });
          },
        });
        timer.done();
        update({ text: full, status: 'done', refs: pickReferences(chunks, full) });
      } catch (error: unknown) {
        const chatError = toChatError(error);
        if (chatError.kind === 'aborted' && reply.text) {
          // 停止: ここまでの回答を残し、参照も付ける
          update({ status: 'done', refs: pickReferences(usedChunks, reply.text) });
        } else {
          update({ status: 'error', error: chatError.message });
        }
      } finally {
        controllerRef.current = null;
        setIsStreaming(false);
        // 同じミリ秒でも質問 → 回答の順に並ぶようにする
        await userSaved;
        if (conversationId) await save(conversationId, reply, Math.max(Date.now(), sentAt + 1));
      }
    },
    [apiKey, model, messages, patch, repo, activeId, save, contextArticleId],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const newConversation = useCallback(() => {
    touchedRef.current = true;
    selectSeq.current += 1;
    controllerRef.current?.abort();
    setActiveId(null);
    setMessages([]);
  }, []);

  const selectConversation = useCallback(
    async (id: string) => {
      if (!repo) return;
      touchedRef.current = true;
      const seq = ++selectSeq.current;
      controllerRef.current?.abort();
      try {
        const stored = await repo.messages(id);
        if (seq !== selectSeq.current) return;
        setHistoryError(null);
        setActiveId(id);
        setMessages(stored.map(fromStored));
      } catch (error: unknown) {
        console.error('会話を読み込めませんでした', error);
        if (seq === selectSeq.current) setHistoryError('会話を読み込めませんでした。');
      }
    },
    [repo],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!repo) return;
      if (id === activeId) newConversation();
      try {
        await repo.delete(id);
        await refresh(repo, true);
      } catch (error: unknown) {
        console.error('会話を削除できませんでした', error);
        setHistoryError('会話を削除できませんでした。');
      }
    },
    [repo, activeId, newConversation, refresh],
  );

  const deleteAll = useCallback(async () => {
    if (!repo) return;
    newConversation();
    try {
      await repo.deleteAll();
      await refresh(repo, true);
    } catch (error: unknown) {
      console.error('会話履歴を削除できませんでした', error);
      setHistoryError('会話履歴を削除できませんでした。');
    }
  }, [repo, newConversation, refresh]);

  // 質問を送る前の空の会話（タイトル無し）は履歴に出さない
  const visibleConversations = useMemo(
    () => conversations.filter((c) => c.title !== ''),
    [conversations],
  );

  return {
    messages,
    isStreaming,
    model,
    send,
    stop,
    conversations: visibleConversations,
    activeId,
    persistent: repo ? repo.persistent : null,
    overQuota,
    historyError,
    newConversation,
    selectConversation,
    deleteConversation,
    deleteAll,
  };
}
