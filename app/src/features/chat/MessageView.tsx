import { motion } from 'motion/react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { articlePath } from '../../lib/paths';
import type { ChatMessage } from './chat-history';
import { citedArticles } from './cited-articles';
import { MessageContent } from './MessageContent';

/** 1 件のメッセージ（質問は太字、回答は Markdown + 出典） */
export function MessageView({ message }: { readonly message: ChatMessage }) {
  const cited = useMemo(() => citedArticles(message.text), [message.text]);
  if (message.role === 'user') {
    return (
      <p className="text-sm leading-relaxed font-bold whitespace-pre-wrap text-fg">
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
