import { motion } from 'motion/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { DURATION } from '../../lib/motion-tokens';
import { articlePath, searchPath } from '../../lib/paths';
import { NO_ANSWER_TEXT, type ChatMessage } from './chat-history';
import { citedArticles } from './cited-articles';
import { MessageContent } from './MessageContent';

const GHOST_LINK = 'text-fg-muted underline underline-offset-4 hover:text-fg';

const COPY_LABEL = { idle: 'コピー', done: 'コピー済み', failed: 'コピー失敗' } as const;

/** 回答の本文をクリップボードへ（右上、hover / focus で表示。タッチ端末は常時） */
function CopyButton({ text }: { readonly text: string }) {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  // アンマウント時にタイマーを止める
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = (next: 'done' | 'failed'): void => {
    window.clearTimeout(timer.current);
    setCopied(next);
    timer.current = window.setTimeout(() => setCopied('idle'), 1500);
  };
  const copy = (): void => {
    navigator.clipboard.writeText(text).then(
      () => flash('done'),
      () => flash('failed'),
    );
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="absolute top-0 right-0 rounded px-2 py-1 text-[13px] text-fg-subtle opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-fg focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
    >
      {COPY_LABEL[copied]}
    </button>
  );
}

/** 1 件のメッセージ（質問は面、回答は Markdown + 出典） */
export const MessageView = memo(function MessageView({
  message,
  model,
  question,
}: {
  readonly message: ChatMessage;
  /** 生成中の表示に添えるモデル名 */
  readonly model?: string;
  /** この回答への質問（回答なしのときの検索リンクに使う） */
  readonly question?: string;
}) {
  const cited = useMemo(() => citedArticles(message.text), [message.text]);
  if (message.role === 'user') {
    return (
      <p className="rounded-[6px] bg-surface px-3 py-2 text-sm leading-[1.7] whitespace-pre-wrap text-fg">
        {message.text}
      </p>
    );
  }
  const canCopy =
    message.status === 'done' && message.text !== '' && message.text !== NO_ANSWER_TEXT;
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base }}
    >
      {canCopy && <CopyButton text={message.text} />}
      {message.text ? (
        <MessageContent text={message.text} />
      ) : message.status === 'streaming' ? (
        <p className="flex items-center gap-2 text-sm text-fg-subtle">
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle" />
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-fg-subtle [animation-delay:300ms]" />
          </span>
          {message.refs && message.refs.length > 0
            ? `回答を生成中${model ? `（${model}）` : ''}`
            : '検索中'}
        </p>
      ) : null}
      {message.text === NO_ANSWER_TEXT && question && (
        <p className="mt-2 flex gap-4 text-[13px]">
          <Link to={searchPath(question)} className={GHOST_LINK}>
            検索で探す →
          </Link>
          <Link to="/index" className={GHOST_LINK}>
            索引
          </Link>
        </p>
      )}
      {message.status === 'error' && message.error && (
        <p
          role="alert"
          className="mt-2 rounded border border-danger-line px-3 py-2 text-sm text-danger"
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
});
