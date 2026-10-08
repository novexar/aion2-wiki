import { useEffect } from 'react';
import { applyFaction } from '../lib/faction';
import { useFactionTheme, useThemePreference } from '../lib/settings';
import { applyTheme } from '../lib/theme';

/** テーマ設定とシステムのダークモード変更を <html data-theme> に反映する */
export function ThemeSync() {
  const preference = useThemePreference();
  const faction = useFactionTheme();

  useEffect(() => {
    applyFaction(faction);
  }, [faction]);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== 'system') return undefined;
    let media: MediaQueryList;
    try {
      media = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return undefined;
    }
    const onChange = (): void => {
      applyTheme('system');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  return null;
}
