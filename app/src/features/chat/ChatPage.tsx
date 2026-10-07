import { AlertCircle, ArrowUp, BookOpen, RotateCcw, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/Button';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { articlePath } from '../../lib/paths';
import { useApiKey, useModel } from '../../lib/settings';
import { ApiKeyForm } from './ApiKeyForm';
import type { ChatMessage } from './chat-history';
import { MessageContent } from './MessageContent';
import { useChat } from './useChat';

const SUGGESTIONS = [
  '始めたばかりで毎日やることは？',
  'ギーナの効率的な稼ぎ方は？',
  'ダンジョン報酬の受け取りに必要なものは？',
];

function MessageView({ message }: { readonly message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg bg-muted px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-fg">
          {message.text}
        </p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mb-1.5 text-xs font-medium text-fg-subtle">Wiki アシスタント</div>
      {message.text ? (
        <MessageContent text={message.text} />
      ) : message.status === 'streaming' ? (
        <p className="flex items-center gap-2 text-sm text-fg-subtle">
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle" />
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle [animation-delay:300ms]" />
          </span>
          Wiki を調べています…
        </p>
      ) : null}
      {message.status === 'error' && message.error && (
        <p
          role="alert"
          className="mt-2 flex gap-2 rounded-md border border-danger-line bg-danger-bg px-3 py-2 text-sm text-danger"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
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
      {message.refs && message.refs.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-fg-subtle">参照記事:</span>
          {message.refs.map((ref) => (
            <Link
              key={ref.id}
              to={articlePath(ref.category, ref.id, ref.anchor || undefined)}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-fg-muted transition-colors hover:border-accent hover:text-fg"
            >
              <BookOpen aria-hidden="true" className="size-3" />
              {ref.title}
            </Link>
          ))}
        </div>
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
      className="rounded-xl border border-line bg-canvas p-2 shadow-sm focus-within:border-line-strong"
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
        placeholder="AION2 について質問する（Enter で送信、Shift+Enter で改行）"
        className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed placeholder:text-fg-subtle focus:outline-none disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <span className="text-[11px] text-fg-subtle">回答は Wiki の記事のみを根拠にします</span>
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
    'Wiki の記事だけを根拠に答える相談チャット（Gemini API・ご自身のキーを使用）。',
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

  if (!apiKey) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <h1 className="text-[1.75rem] font-bold tracking-tight">Wiki に相談する</h1>
        <p className="mt-3 leading-relaxed text-fg-muted">
          質問に関係する Wiki の記事を探し、その内容だけを根拠に Google の Gemini
          が日本語で回答します。 利用には、ご自身の Gemini API キーが必要です。
        </p>
        <div className="mt-8 rounded-lg border border-line p-5">
          <ApiKeyForm submitLabel="保存して始める" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] max-w-3xl flex-col px-4 sm:px-8">
      <div className="flex items-center justify-between gap-3 border-b border-line py-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight">Wiki に相談する</h1>
          <p className="truncate text-xs text-fg-subtle">
            モデル: <span className="font-mono">{model}</span> ·{' '}
            <Link to="/settings" className="underline underline-offset-2 hover:text-fg">
              変更
            </Link>
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={clear} disabled={messages.length === 0}>
          <RotateCcw aria-hidden="true" className="size-3.5" />
          新しい会話
        </Button>
      </div>

      <p role="status" className="sr-only">
        {!isStreaming && messages.length > 0 ? '回答が完了しました' : ''}
      </p>
      <div role="log" aria-live="off" aria-label="会話" className="flex-1 space-y-8 py-6">
        {messages.length === 0 && (
          <div className="py-8">
            <p className="text-fg-muted">質問の例:</p>
            <ul className="mt-3 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => void send(s)}
                    className="w-full rounded-md border border-line px-3.5 py-2.5 text-left text-sm text-fg-muted transition-colors hover:border-line-strong hover:bg-surface hover:text-fg"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 bg-canvas pt-2 pb-4">
        <Composer
          disabled={false}
          isStreaming={isStreaming}
          onSend={(q) => void send(q)}
          onStop={stop}
        />
      </div>
    </div>
  );
}
