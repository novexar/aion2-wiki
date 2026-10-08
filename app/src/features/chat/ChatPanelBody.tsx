import { API_KEY_URL } from '../../lib/gemini-config';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMatch } from 'react-router';
import { Button } from '../../components/Button';
import { readString, STORAGE_KEYS, writeString } from '../../lib/storage';
import { useApiKey, useModel } from '../../lib/settings';
import { articleById } from '../wiki/data';
import { ApiKeyForm } from './ApiKeyForm';
import { prefetchChat } from './chat-prefetch';
import { focusChatInput, setChatPanelOpen } from './chat-panel-store';
import { Composer } from './Composer';
import { ConversationList } from './ConversationList';
import { MessageView } from './MessageView';
import { useChat, type UseChatResult } from './useChat';

const SUGGESTIONS = ['毎日やること', 'ギーナの稼ぎ方', '報酬キューブを開けるのに必要なもの'];

type View = 'chat' | 'history';

/** 記事ページを開いていればその記事 ID */
function useCurrentArticleId(): string | null {
  const slug = useMatch('/wiki/:category/:slug')?.params.slug;
  return slug && articleById.has(slug) ? slug : null;
}

interface PanelHeaderProps {
  readonly view: View;
  readonly onNew: () => void;
  readonly onToggleHistory: () => void;
}

const HEADER_CLASS =
  'flex min-h-(--header-h) shrink-0 items-center gap-1 border-b border-line pt-[env(safe-area-inset-top)] pr-2 pl-2';

function PanelHeader({ view, onNew, onToggleHistory }: PanelHeaderProps) {
  const closeButton = (
    <button
      type="button"
      onClick={() => setChatPanelOpen(false)}
      className="inline-flex size-8 items-center justify-center rounded text-fg-muted hover:bg-muted hover:text-fg"
      aria-label="パネルを閉じる"
    >
      <X aria-hidden="true" className="size-4" />
    </button>
  );
  if (view === 'history') {
    return (
      <div className={HEADER_CLASS}>
        <Button size="sm" variant="ghost" onClick={onToggleHistory}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          チャット
        </Button>
        <h2 className="mr-auto text-sm font-bold text-fg">履歴</h2>
        <Button size="sm" variant="ghost" onClick={onNew}>
          新しい会話
        </Button>
        {closeButton}
      </div>
    );
  }
  return (
    <div className={HEADER_CLASS}>
      <Button
        size="md"
        variant="ghost"
        className="h-9 lg:hidden"
        onClick={() => setChatPanelOpen(false)}
      >
        閉じる
      </Button>
      <h2 className="mr-auto inline-flex items-center gap-1.5 pl-2 text-sm font-bold text-fg lg:pl-2">
        <Sparkles aria-hidden="true" className="size-4 max-lg:hidden" />
        AI チャット
      </h2>
      <Button size="sm" variant="ghost" onClick={onNew}>
        新しい会話
      </Button>
      <Button size="sm" variant="ghost" onClick={onToggleHistory}>
        履歴
      </Button>
      {closeButton}
    </div>
  );
}

interface NoticesProps {
  readonly chat: UseChatResult;
  readonly onOpenHistory: () => void;
}

/** 初回だけ出す「履歴はタブを閉じると消えます」（閉じられる）を管理する */
function useMemoryNotice(show: boolean): [boolean, () => void] {
  const [seen] = useState(() => readString('local', STORAGE_KEYS.chatMemoryNoticeSeen) === '1');
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (show && !seen) writeString('local', STORAGE_KEYS.chatMemoryNoticeSeen, '1');
  }, [show, seen]);
  return [show && !seen && !dismissed, () => setDismissed(true)];
}

const NOTICE_CLASS =
  'flex shrink-0 items-center gap-2 border-b border-line px-4 py-2 text-xs text-warn';

function Notices({ chat, onOpenHistory }: NoticesProps) {
  const [showMemory, dismissMemory] = useMemoryNotice(chat.persistent === false);
  if (chat.historyError) {
    return (
      <p role="status" className={NOTICE_CLASS}>
        {chat.historyError}
      </p>
    );
  }
  if (showMemory) {
    return (
      <p role="status" className={NOTICE_CLASS}>
        <span className="mr-auto">履歴はこのタブを閉じると消えます</span>
        <button type="button" onClick={dismissMemory} className="underline underline-offset-4">
          閉じる
        </button>
      </p>
    );
  }
  if (chat.overQuota) {
    return (
      <p role="status" className={NOTICE_CLASS}>
        <span>履歴が 5MB を超えました。古い会話を削除してください</span>
        <button type="button" onClick={onOpenHistory} className="underline underline-offset-4">
          履歴
        </button>
      </p>
    );
  }
  return null;
}

/** 会話の一覧（内側でスクロール。末尾付近にいるときだけ新しい発言に追従する） */
function MessageLog({
  chat,
  canSend,
}: {
  readonly chat: UseChatResult;
  readonly canSend: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);

  // トークンごとのレイアウト強制を避けるため、フレームにまとめて 1 回だけ行う
  const frameRef = useRef(0);
  useEffect(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const box = boxRef.current;
      if (box && nearBottom.current) box.scrollTop = box.scrollHeight;
    });
  }, [chat.messages]);
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return (
    <div
      ref={boxRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        nearBottom.current = el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
      }}
      className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4"
    >
      <p role="status" className="sr-only">
        {!chat.isStreaming && chat.messages.length > 0 ? '回答が完了しました' : ''}
      </p>
      <div role="log" aria-live="off" aria-label="会話" className="space-y-6 py-4">
        {chat.messages.length === 0 &&
          (canSend ? (
            <div className="text-sm text-fg-muted">
              <h3 className="text-fg">質問の例</h3>
              <ul className="mt-2 space-y-1">
                {SUGGESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => void chat.send(q)}
                      className="text-left underline underline-offset-4 hover:text-fg"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm leading-relaxed text-fg-muted">
              <p className="text-fg">
                Wiki の記事を根拠に Gemini が答えます。回答には出典が付きます。
              </p>
              <p>
                無料の Gemini API キーが必要です。
                <a
                  href={API_KEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline underline-offset-4"
                >
                  Google AI Studio で発行 ↗
                </a>
              </p>
              <p>キーはこのブラウザにだけ保存されます。</p>
            </div>
          ))}
        {chat.messages.map((m, i) => (
          <MessageView
            key={m.id}
            message={m}
            model={chat.model}
            question={
              chat.messages[i - 1]?.role === 'user' ? chat.messages[i - 1]?.text : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

/** パネルの中身（遅延読み込み）。タイトル行 / メッセージ一覧 / 入力欄 */
export default function ChatPanelBody() {
  const apiKey = useApiKey();
  const model = useModel();
  const articleId = useCurrentArticleId();
  const [includeArticle, setIncludeArticle] = useState(true);
  const [view, setView] = useState<View>('chat');
  const chat = useChat({
    apiKey,
    model,
    contextArticleId: articleId && includeArticle ? articleId : null,
  });

  // 初めて開いたときは読み込み後にフォーカスする（2 回目以降は ChatPanel が行う）
  useEffect(() => focusChatInput(), []);
  // API キーがあれば SDK と検索データをアイドル時に先読みする
  useEffect(() => {
    if (apiKey) prefetchChat();
  }, [apiKey]);

  const focusTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(focusTimer.current), []);
  const showChat = (): void => {
    setView('chat');
    window.clearTimeout(focusTimer.current);
    focusTimer.current = window.setTimeout(focusChatInput, 0);
  };

  return (
    <>
      <PanelHeader
        view={view}
        onNew={() => {
          chat.newConversation();
          showChat();
        }}
        onToggleHistory={() => (view === 'history' ? showChat() : setView('history'))}
      />
      <Notices chat={chat} onOpenHistory={() => setView('history')} />
      {view === 'history' ? (
        <ConversationList
          conversations={chat.conversations}
          activeId={chat.activeId}
          onSelect={(id) => {
            // 読み込みが終わってから会話表示へ切り替える
            void chat.selectConversation(id).then(showChat);
          }}
          onDelete={(id) => void chat.deleteConversation(id)}
          onDeleteAll={() => void chat.deleteAll()}
        />
      ) : (
        <>
          <MessageLog chat={chat} canSend={Boolean(apiKey)} />
          <div className="shrink-0 border-t border-line px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {apiKey ? (
              <Composer
                context={
                  articleId ? { checked: includeArticle, onChange: setIncludeArticle } : undefined
                }
                disabled={false}
                isStreaming={chat.isStreaming}
                onSend={(q) => void chat.send(q)}
                onStop={chat.stop}
              />
            ) : (
              <ApiKeyForm compact />
            )}
            {apiKey && (
              <p className="mt-1.5 text-[13px] leading-snug text-fg-subtle">
                AI の回答には誤りが含まれることがあります。重要な数値は記事本文で確認してください。
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
