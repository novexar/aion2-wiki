import { Sparkles, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useMatch } from 'react-router';
import { Button } from '../../components/Button';
import { useApiKey, useModel } from '../../lib/settings';
import { articleById } from '../wiki/data';
import { ApiKeyForm } from './ApiKeyForm';
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

function PanelHeader({ view, onNew, onToggleHistory }: PanelHeaderProps) {
  return (
    <div className="flex h-(--header-h) shrink-0 items-center gap-1 border-b border-line pr-2 pl-4">
      <h2 className="mr-auto inline-flex items-center gap-1.5 text-sm font-bold text-fg">
        <Sparkles aria-hidden="true" className="size-4" />
        AI チャット
      </h2>
      <Button size="sm" variant="ghost" onClick={onNew}>
        新しい会話
      </Button>
      <Button size="sm" variant="ghost" onClick={onToggleHistory} aria-pressed={view === 'history'}>
        履歴
      </Button>
      <button
        type="button"
        onClick={() => setChatPanelOpen(false)}
        className="inline-flex size-8 items-center justify-center rounded text-fg-muted hover:bg-muted hover:text-fg"
        aria-label="閉じる"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

function Notices({ chat }: { readonly chat: UseChatResult }) {
  if (chat.persistent !== false && !chat.overQuota) return null;
  return (
    <p role="status" className="shrink-0 border-b border-line px-4 py-2 text-xs text-warn">
      {chat.persistent === false ? '履歴はこのタブを閉じると消えます' : '履歴が 5MB を超えています'}
    </p>
  );
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

  useEffect(() => {
    const box = boxRef.current;
    if (box && nearBottom.current) box.scrollTop = box.scrollHeight;
  }, [chat.messages]);

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
        {chat.messages.length === 0 && (
          <div className="text-sm text-fg-muted">
            <h3 className="text-fg">例</h3>
            <ul className="mt-2 space-y-1">
              {SUGGESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => void chat.send(q)}
                    disabled={!canSend}
                    className="text-left underline underline-offset-4 hover:text-fg disabled:no-underline disabled:opacity-50"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {chat.messages.map((m) => (
          <MessageView key={m.id} message={m} />
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
  const checkboxId = useId();
  const chat = useChat({
    apiKey,
    model,
    contextArticleId: articleId && includeArticle ? articleId : null,
  });

  // 初めて開いたときは読み込み後にフォーカスする（2 回目以降は ChatPanel が行う）
  useEffect(() => focusChatInput(), []);

  const showChat = (): void => {
    setView('chat');
    window.setTimeout(focusChatInput, 0);
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
      <Notices chat={chat} />
      {view === 'history' ? (
        <ConversationList
          conversations={chat.conversations}
          activeId={chat.activeId}
          onSelect={(id) => {
            void chat.selectConversation(id);
            showChat();
          }}
          onDelete={(id) => void chat.deleteConversation(id)}
          onDeleteAll={() => void chat.deleteAll()}
        />
      ) : (
        <>
          <MessageLog chat={chat} canSend={Boolean(apiKey)} />
          <div className="shrink-0 border-t border-line px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {articleId && (
              <div className="mb-2 flex items-center gap-2 px-1 text-[13px] text-fg-muted">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={includeArticle}
                  onChange={(e) => setIncludeArticle(e.target.checked)}
                  className="size-4 accent-(--fg)"
                />
                <label htmlFor={checkboxId}>この記事を文脈に含める</label>
              </div>
            )}
            {apiKey ? (
              <Composer
                disabled={false}
                isStreaming={chat.isStreaming}
                onSend={(q) => void chat.send(q)}
                onStop={chat.stop}
              />
            ) : (
              <ApiKeyForm compact />
            )}
          </div>
        </>
      )}
    </>
  );
}
