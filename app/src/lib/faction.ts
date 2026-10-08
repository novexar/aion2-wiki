export type FactionTheme = 'default' | 'elyos' | 'asmodian';

export const FACTION_OPTIONS: readonly { value: FactionTheme; label: string }[] = [
  { value: 'default', label: '既定（両方）' },
  { value: 'elyos', label: '天族' },
  { value: 'asmodian', label: '魔族' },
];

export function isFactionTheme(value: string): value is FactionTheme {
  return value === 'default' || value === 'elyos' || value === 'asmodian';
}

/** <html data-faction> を更新する。既定は属性なし */
export function applyFaction(
  faction: FactionTheme,
  root: HTMLElement = document.documentElement,
): void {
  if (faction === 'default') delete root.dataset.faction;
  else root.dataset.faction = faction;
}
