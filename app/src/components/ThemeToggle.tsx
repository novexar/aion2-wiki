import { Monitor, Moon, Sun } from 'lucide-react';
import { saveThemePreference, useThemePreference } from '../lib/settings';
import type { ThemePreference } from '../lib/theme';

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};
const LABEL: Record<ThemePreference, string> = {
  system: 'システム',
  light: 'ライト',
  dark: 'ダーク',
};
const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

/** クリックで システム → ライト → ダーク を切り替える */
export function ThemeToggle() {
  const preference = useThemePreference();
  const Icon = ICON[preference];
  const next = NEXT[preference];
  return (
    <button
      type="button"
      onClick={() => saveThemePreference(next)}
      className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-muted hover:text-fg active:bg-line"
      aria-label={`テーマ: ${LABEL[preference]}（クリックで${LABEL[next]}に切り替え）`}
      title={`テーマ: ${LABEL[preference]}`}
    >
      <Icon aria-hidden="true" className="size-[18px]" />
    </button>
  );
}
