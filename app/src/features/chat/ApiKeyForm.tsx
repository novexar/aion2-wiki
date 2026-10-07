import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { API_KEY_URL } from '../../lib/gemini-config';
import { saveApiKey } from '../../lib/settings';

interface ApiKeyFormProps {
  readonly onSaved?: () => void;
  readonly submitLabel?: string;
  /** 1 画面 1 primary のため、設定画面などでは false にする */
  readonly primary?: boolean;
  /** チャットのコンポーザー位置に置く 1 行版（説明文・アイコンなし） */
  readonly compact?: boolean;
}

/** Gemini API キーの入力フォーム（チャット初回・設定画面で共用） */
export function ApiKeyForm({
  onSaved,
  submitLabel = '保存',
  primary = true,
  compact = false,
}: ApiKeyFormProps) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const helpId = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const key = value.trim();
    if (!key) {
      setError('API キーを入力してください。');
      return;
    }
    if (/\s/.test(key) || key.length < 20) {
      setError('API キーの形式が正しくありません。');
      return;
    }
    if (!saveApiKey(key)) {
      setError('このブラウザには保存できません（プライベートモードなど）。');
      return;
    }
    setValue('');
    setError(null);
    onSaved?.();
  };

  if (compact) {
    return (
      <form onSubmit={onSubmit} noValidate className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm text-fg-muted">
          Gemini API キーを保存すると使えます
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="AIza…"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error !== null}
            className="h-10 min-w-0 flex-1 rounded border border-line-input bg-canvas px-3 font-mono text-sm placeholder:text-fg-subtle hover:border-fg-subtle focus:border-accent focus:outline-none aria-[invalid=true]:border-danger"
          />
          <Button type="submit" variant="primary" className="h-10">
            {submitLabel}
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor={inputId} className="sr-only">
        Gemini API キー
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <KeyRound
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle"
          />
          <input
            id={inputId}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="AIza…"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error !== null}
            aria-describedby={helpId}
            className="h-10 w-full rounded border border-line-input bg-canvas pr-10 pl-9 font-mono text-sm placeholder:text-fg-subtle hover:border-fg-subtle focus:border-accent focus:outline-none aria-[invalid=true]:border-danger"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded text-fg-subtle hover:bg-muted hover:text-fg"
            aria-label={visible ? 'キーを隠す' : 'キーを表示'}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        <Button type="submit" variant={primary ? 'primary' : 'secondary'} className="h-10">
          {submitLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div id={helpId} className="space-y-1.5 text-[13px] leading-relaxed text-fg-muted">
        <p>キーはこのブラウザにだけ保存され、Google API の呼び出しにのみ使われます。</p>
        <p>
          キーの発行:{' '}
          <a
            href={API_KEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-strong underline underline-offset-4"
          >
            Google AI Studio ↗
          </a>
        </p>
      </div>
    </form>
  );
}
