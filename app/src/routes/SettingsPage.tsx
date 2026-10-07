import { Check, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../components/Button';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { clearHistory } from '../features/chat/chat-history';
import { ApiKeyForm } from '../features/chat/ApiKeyForm';
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
import { THEME_OPTIONS, type ThemePreference } from '../lib/theme';

const THEME_ICONS: Record<ThemePreference, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

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
    <section className="grid grid-cols-1 gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr] md:gap-8">
      <div>
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-fg-subtle">{description}</p>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ThemeSetting() {
  const preference = useThemePreference();
  return (
    <div role="radiogroup" aria-label="テーマ" className="grid grid-cols-3 gap-2 sm:max-w-sm">
      {THEME_OPTIONS.map((opt) => {
        const Icon = THEME_ICONS[opt.value];
        const checked = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => saveThemePreference(opt.value)}
            className={`flex flex-col items-center gap-1.5 rounded-md border px-3 py-3 text-sm transition-colors ${
              checked
                ? 'border-accent bg-accent-soft font-medium text-fg'
                : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
            }`}
          >
            <Icon aria-hidden="true" className="size-4" />
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
  const [saved, setSaved] = useState(false);
  const inputId = useId();
  const listId = useId();

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    saveModel(draft);
    setDraft(draft.trim() || DEFAULT_MODEL);
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium">
        モデル名
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          list={listId}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
          spellCheck={false}
          autoComplete="off"
          className="h-10 w-full rounded-md border border-line bg-canvas px-3 font-mono text-sm hover:border-line-strong focus:border-accent focus:outline-none sm:max-w-sm"
        />
        <datalist id={listId}>
          {SUGGESTED_MODELS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <Button type="submit" className="h-10">
          {saved ? <Check aria-hidden="true" className="size-4" /> : null}
          {saved ? '保存しました' : '保存'}
        </Button>
        <Button
          variant="ghost"
          className="h-10"
          onClick={() => {
            saveModel(DEFAULT_MODEL);
            setDraft(DEFAULT_MODEL);
            setSaved(true);
          }}
        >
          既定に戻す
        </Button>
      </div>
      <p className="text-[13px] text-fg-subtle">
        既定は <code className="font-mono">{DEFAULT_MODEL}</code>（Gemini の最新 Flash
        系を指す別名）です。
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
        <ApiKeyForm />
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
  const [historyCleared, setHistoryCleared] = useState(false);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <h1 className="text-[1.75rem] font-bold tracking-tight">設定</h1>
      <p className="mt-2 text-fg-muted">設定はこのブラウザにのみ保存されます。</p>
      <div className="mt-4">
        <Section
          title="テーマ"
          description="システム設定に合わせるか、ライト／ダークを固定します。"
        >
          <ThemeSetting />
        </Section>
        <Section title="Gemini モデル" description="チャットで使うモデル。通常は変更不要です。">
          <ModelSetting />
        </Section>
        <Section
          title="API キー"
          description="チャット機能に使う Gemini API キー。localStorage に保存されます。"
        >
          <ApiKeySetting />
        </Section>
        <Section
          title="会話履歴"
          description="チャットの履歴はタブを閉じると消えます（sessionStorage）。"
        >
          <Button
            onClick={() => {
              clearHistory();
              setHistoryCleared(true);
            }}
          >
            会話履歴を消去
          </Button>
          {historyCleared && (
            <p role="status" className="mt-2 text-sm text-ok">
              会話履歴を消去しました。
            </p>
          )}
        </Section>
      </div>
    </div>
  );
}
