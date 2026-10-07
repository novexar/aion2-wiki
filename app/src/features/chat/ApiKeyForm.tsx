import { Eye, EyeOff, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { API_KEY_URL } from '../../lib/gemini-config';
import { saveApiKey } from '../../lib/settings';

interface ApiKeyFormProps {
  readonly onSaved?: () => void;
  readonly submitLabel?: string;
}

/** Gemini API キーの入力フォーム（チャット初回・設定画面で共用） */
export function ApiKeyForm({ onSaved, submitLabel = '保存' }: ApiKeyFormProps) {
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
      setError('API キーの形式が正しくないようです。コピーし直してください。');
      return;
    }
    if (!saveApiKey(key)) {
      setError(
        'ブラウザに保存できませんでした。プライベートモードやストレージ設定を確認してください。',
      );
      return;
    }
    setValue('');
    setError(null);
    onSaved?.();
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-fg">
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
            className="h-10 w-full rounded-md border border-line bg-canvas pr-10 pl-9 font-mono text-sm placeholder:text-fg-subtle hover:border-line-strong focus:border-accent focus:outline-none aria-[invalid=true]:border-danger"
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
        <Button type="submit" variant="primary" className="h-10">
          {submitLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div id={helpId} className="space-y-1.5 text-[13px] leading-relaxed text-fg-muted">
        <p className="flex gap-1.5">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ok" />
          このキーはあなたのブラウザ（localStorage）にしか保存されません。サーバーには送信されず、Google
          の API に直接使われます。
        </p>
        <p>
          キーは{' '}
          <a
            href={API_KEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-accent-strong underline underline-offset-4"
          >
            Google AI Studio
            <ExternalLink aria-hidden="true" className="size-3" />
          </a>{' '}
          で無料発行できます（Google アカウントでログイン →「Create API key」）。
        </p>
      </div>
    </form>
  );
}
