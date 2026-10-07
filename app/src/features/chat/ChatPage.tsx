import { ArrowUp, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/Button';
import { Kbd } from '../../components/Kbd';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { articlePath } from '../../lib/paths';
import { useApiKey, useModel } from '../../lib/settings';
import { ApiKeyForm } from './ApiKeyForm';
import type { ChatMessage } from './chat-history';
import { citedArticles } from './cited-articles';
import { MessageContent } from './MessageContent';
import { useChat } from './useChat';

const SUGGESTIONS = ['毎日やること', 'ギーナの稼ぎ方', '報酬キューブを開けるのに必要なもの'];

function MessageView({ message }: { readonly message: ChatMessage }) {
  const cited = useMemo(() => citedArticles(message.text), [message.text]);
  if (message.role === 'user') {
    return (
      <p className="text-[15px] leading-relaxed font-bold whitespace-pre-wrap text-fg">
        {message.text}
      </p>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {message.text ? (
        <MessageContent text={message.text} />
      ) : message.status === 'streaming' ? (
        <p className="flex items-center gap-2 text-sm text-fg-subtle">
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle" />
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle [animation-delay:300ms]" />
          </span>
          検索中
        </p>
      ) : null}
      {message.status === 'error' && message.error && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-danger-line px-3 py-2 text-sm text-danger"
        >
          <span>
            {message.error}
            {/API キー|モデル名/.test(message.error) && (
              <>
                {' '}
                <Link to="/settings" className="underline underline-offset-4">
                  設定を開く
                </Link>
              </>
            )}
          </span>
        </p>
      )}
      {cited.length > 0 ? (
        <div className="mt-3 text-xs text-fg-subtle">
          <span>出典</span>
          <ol className="mt-1 space-y-0.5">
            {cited.map((a, i) => (
              <li key={a.id}>
                <span className="tabular-nums">[{i + 1}]</span>{' '}
                <Link
                  to={articlePath(
                    a.category,
                    a.id,
                    message.refs?.find((r) => r.id === a.id)?.anchor || undefined,
                  )}
                  className="text-fg-muted underline underline-offset-4 hover:text-fg"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        message.refs &&
        message.refs.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-fg-subtle">出典</span>
            {message.refs.map((ref) => (
              <Link
                key={ref.id}
                to={articlePath(ref.category, ref.id, ref.anchor || undefined)}
                className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg"
              >
                {ref.title}
              </Link>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}

function Composer({
  disabled,
  isStreaming,
  onSend,
  onStop,
}: {
  readonly disabled: boolean;
  readonly isStreaming: boolean;
  readonly onSend: (q: string) => void;
  readonly onStop: () => void;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = (): void => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue('');
  };
  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    submit();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line-input bg-canvas p-2 focus-within:border-fg-subtle"
    >
      <label htmlFor="chat-input" className="sr-only">
        質問を入力
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        disabled={disabled}
        placeholder="質問を入力"
        className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed placeholder:text-fg-subtle focus:outline-none disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <span className="hidden items-center gap-1 text-[11px] text-fg-subtle sm:flex">
          <Kbd>Enter</Kbd> 送信 / <Kbd>Shift+Enter</Kbd> 改行
        </span>
        {isStreaming ? (
          <Button size="sm" onClick={onStop} aria-label="回答の生成を停止">
            <Square aria-hidden="true" className="size-3.5 fill-current" />
            停止
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={disabled || !value.trim()}
            aria-label="送信"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
            送信
          </Button>
        )}
      </div>
    </form>
  );
}

export default function ChatPage() {
  useDocumentMeta(
    'チャット',
    'AION2 非公式Wiki の記事を根拠に答えるチャット。Gemini API キーが必要。',
  );
  const apiKey = useApiKey();
  const model = useModel();
  const { messages, isStreaming, send, stop, clear } = useChat({ apiKey, model });
  const endRef = useRef<HTMLDivElement>(null);

  const nearBottomRef = useRef(true);

  useEffect(() => {
    const onScroll = (): void => {
      const el = document.documentElement;
      nearBottomRef.current = el.scrollHeight - (window.scrollY + window.innerHeight) < 160;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (nearBottomRef.current) endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] max-w-3xl flex-col px-4 sm:px-8">
      <div className="flex items-center justify-between gap-3 border-b border-line py-4">
        <h1 className="text-lg font-semibold">チャット</h1>
        <Button size="sm" variant="ghost" onClick={clear} disabled={messages.length === 0}>
          履歴を消す
        </Button>
      </div>

      <p role="status" className="sr-only">
        {!isStreaming && messages.length > 0 ? '回答が完了しました' : ''}
      </p>
      <div role="log" aria-live="off" aria-label="会話" className="flex-1 space-y-8 py-6">
        {messages.length === 0 && (
          <div className="py-8 text-sm text-fg-muted">
            <h2 className="text-fg">例</h2>
            <p className="mt-2">
              {SUGGESTIONS.map((q, i) => (
                <span key={q}>
                  {i > 0 && '、'}
                  <button
                    type="button"
                    onClick={() => void send(q)}
                    disabled={!apiKey}
                    className="underline underline-offset-4 hover:text-fg disabled:no-underline disabled:opacity-50"
                  >
                    {q}
                  </button>
                </span>
              ))}
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 bg-canvas pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {apiKey ? (
          <Composer
            disabled={false}
            isStreaming={isStreaming}
            onSend={(q) => void send(q)}
            onStop={stop}
          />
        ) : (
          <ApiKeyForm compact />
        )}
      </div>
    </div>
  );
}
