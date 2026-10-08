import { ChevronDown, Trash2, X } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '../components/Button';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { ApiKeyForm } from '../features/chat/ApiKeyForm';
import { HistorySetting } from '../features/chat/HistorySetting';
import { DEFAULT_MODEL, SUGGESTED_MODELS } from '../lib/gemini-config';
import {
  clearApiKey,
  maskApiKey,
  saveModel,
  saveThemePreference,
  useApiKey,
  useModel,
  useThemePreference,
} from '../lib/settings';
import { THEME_OPTIONS } from '../lib/theme';
import { useCloseSettings } from '../lib/use-close-settings';

const CUSTOM_MODEL = '__custom__';
const CONTROL_CLASS =
  'h-10 w-full rounded border border-line-input bg-canvas px-3 text-sm hover:border-fg-subtle focus:border-accent focus:outline-none sm:max-w-sm';

function Section({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-6">
      <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
      <div className="mt-3 min-w-0">{children}</div>
      {description && <p className="mt-2 text-[13px] text-fg-subtle">{description}</p>}
    </section>
  );
}

function ThemeSetting() {
  const preference = useThemePreference();
  return (
    <div
      role="radiogroup"
      aria-label="テーマ"
      className="inline-flex h-8 overflow-hidden rounded border border-line-input text-[13px]"
    >
      {THEME_OPTIONS.map((opt) => {
        const checked = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => saveThemePreference(opt.value)}
            className={`border-l border-line-input px-4 first:border-l-0 ${
              checked ? 'bg-muted font-medium text-fg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ModelSetting() {
  const model = useModel();
  const [draft, setDraft] = useState(model);
  const [custom, setCustom] = useState(!SUGGESTED_MODELS.includes(model));
  const [saved, setSaved] = useState(false);
  const selectId = useId();
  const inputId = useId();

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    saveModel(draft);
    setDraft(draft.trim() || DEFAULT_MODEL);
    setSaved(true);
  };

  const onSelect = (value: string): void => {
    setSaved(false);
    if (value === CUSTOM_MODEL) {
      setCustom(true);
      return;
    }
    setCustom(false);
    setDraft(value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label htmlFor={selectId} className="sr-only">
        モデル
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="w-full space-y-2 sm:max-w-sm">
          <div className="relative">
            <select
              id={selectId}
              value={custom ? CUSTOM_MODEL : draft}
              onChange={(e) => onSelect(e.target.value)}
              className={`${CONTROL_CLASS} appearance-none pr-9 font-mono sm:max-w-none`}
            >
              {SUGGESTED_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value={CUSTOM_MODEL}>その他（手入力）</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
            />
          </div>
          {custom && (
            <div>
              <label htmlFor={inputId} className="sr-only">
                モデル名
              </label>
              <input
                id={inputId}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setSaved(false);
                }}
                spellCheck={false}
                autoComplete="off"
                className={`${CONTROL_CLASS} font-mono`}
              />
            </div>
          )}
        </div>
        <Button type="submit" className="h-10">
          保存
        </Button>
        <Button
          variant="ghost"
          className="h-10"
          onClick={() => {
            saveModel(DEFAULT_MODEL);
            setDraft(DEFAULT_MODEL);
            setCustom(false);
            setSaved(true);
          }}
        >
          既定に戻す
        </Button>
      </div>
      <p className="text-[13px] text-fg-subtle">
        既定: <code className="font-mono">{DEFAULT_MODEL}</code>
      </p>
      <p role="status" className="text-[13px] text-fg-muted">
        {saved ? '保存しました' : ''}
      </p>
    </form>
  );
}

function ApiKeySetting() {
  const apiKey = useApiKey();
  const [cleared, setCleared] = useState(false);
  if (!apiKey) {
    return (
      <div className="space-y-3">
        {cleared && (
          <p role="status" className="text-sm text-ok">
            API キーを削除しました。
          </p>
        )}
        <ApiKeyForm primary={false} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm">
        保存済み: <span className="font-mono text-fg-muted">{maskApiKey(apiKey)}</span>
      </p>
      <Button
        variant="danger"
        onClick={() => {
          clearApiKey();
          setCleared(true);
        }}
      >
        <Trash2 aria-hidden="true" className="size-4" />
        キーを削除
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  useDocumentMeta('設定');
  const close = useCloseSettings();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !event.defaultPrevented) close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[1.75rem] font-bold">設定</h1>
        <button
          type="button"
          onClick={close}
          aria-label="閉じる"
          title="閉じる"
          className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-muted hover:text-fg"
        >
          <X aria-hidden="true" className="size-[18px]" />
        </button>
      </div>
      <div className="mt-4">
        <Section title="テーマ">
          <ThemeSetting />
        </Section>
        <Section title="モデル" description="チャットに使う Gemini のモデル名">
          <ModelSetting />
        </Section>
        <Section title="API キー" description="このブラウザにだけ保存されます">
          <ApiKeySetting />
        </Section>
        <Section title="会話履歴" description="このブラウザにだけ保存されます">
          <HistorySetting />
        </Section>
      </div>
    </div>
  );
}
