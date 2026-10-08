import { useState } from 'react';
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

const DATE_FORMAT = new Intl.DateTimeFormat('ja-JP', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** 「履歴」: 更新日時の新しい順。行クリックで切替、各行に削除 */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onDeleteAll,
}: ConversationListProps) {
  const [confirming, setConfirming] = useState(false);

  if (conversations.length === 0) {
    return <p className="px-4 py-6 text-sm text-fg-muted">履歴はありません。</p>;
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul aria-label="履歴" className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {conversations.map((c) => {
          const title = c.title || '無題';
          const current = c.id === activeId;
          return (
            <li
              key={c.id}
              className={`flex items-center border-b border-line ${current ? 'bg-surface' : ''}`}
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
                  {DATE_FORMAT.format(c.updatedAt)}
                </time>
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="mr-2"
                onClick={() => onDelete(c.id)}
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
          onDeleteAll();
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
