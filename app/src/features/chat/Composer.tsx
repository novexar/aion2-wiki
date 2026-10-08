import { ArrowUp, Square } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '../../components/Button';
import { Kbd } from '../../components/Kbd';
import { CHAT_INPUT_ID } from './chat-panel-store';

interface ComposerProps {
  readonly disabled: boolean;
  readonly isStreaming: boolean;
  readonly onSend: (q: string) => void;
  readonly onStop: () => void;
}

/** 入力欄。Enter で送信、Shift+Enter で改行、送信中は停止ボタン */
export function Composer({ disabled, isStreaming, onSend, onStop }: ComposerProps) {
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
      <label htmlFor={CHAT_INPUT_ID} className="sr-only">
        質問を入力
      </label>
      <textarea
        id={CHAT_INPUT_ID}
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
