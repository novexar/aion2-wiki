import { useEffect, useRef, useState } from 'react';
import { formatDateTime } from '../../lib/format';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { Conversation } from './chat-repository';

interface ConversationListProps {
  readonly conversations: readonly Conversation[];
  readonly activeId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onDeleteAll: () => void;
}

/** 「履歴」: 更新日時の新しい順。行クリックで切替、各行に削除 */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onDeleteAll,
}: ConversationListProps) {
  const [confirming, setConfirming] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  /** 削除した行の位置（削除後に隣の行へフォーカスを移す）。-1 は「すべて削除」 */
  const pendingFocus = useRef<number | null>(null);

  // 削除で押したボタンが消えるので、フォーカスを残った行（なければ空表示）へ移す
  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    pendingFocus.current = null;
    const rows = listRef.current?.querySelectorAll<HTMLElement>('li > button:first-child');
    const next =
      rows && rows.length > 0 ? rows[Math.min(Math.max(index, 0), rows.length - 1)] : null;
    (next ?? emptyRef.current)?.focus();
  }, [conversations]);

  if (conversations.length === 0) {
    return (
      <p
        ref={emptyRef}
        tabIndex={-1}
        className="px-4 py-6 text-sm text-fg-muted focus:outline-none"
      >
        履歴はありません。
      </p>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul ref={listRef} aria-label="履歴" className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {conversations.map((c, index) => {
          const title = c.title || '無題';
          const current = c.id === activeId;
          return (
            <li
              key={c.id}
              className={`group flex items-center border-b border-line ${current ? 'bg-surface' : ''}`}
            >
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={current ? 'true' : undefined}
                className="min-w-0 flex-1 px-4 py-2 text-left hover:bg-muted"
              >
                <span className="block truncate text-sm text-fg">{title}</span>
                <time
                  dateTime={new Date(c.updatedAt).toISOString()}
                  className="block text-xs text-fg-subtle tabular-nums"
                >
                  {formatDateTime(c.updatedAt)}
                </time>
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="mr-2 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                onClick={() => {
                  pendingFocus.current = index;
                  onDelete(c.id);
                }}
                aria-label={`「${title}」を削除`}
              >
                削除
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-line px-4 py-3">
        <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
          すべて削除
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="会話履歴をすべて削除しますか"
        confirmLabel="削除"
        onConfirm={() => {
          setConfirming(false);
          pendingFocus.current = -1;
          onDeleteAll();
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
