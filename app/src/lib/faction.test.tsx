import { act, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeSync } from '../components/ThemeSync';
import { applyFaction, isFactionTheme } from './faction';
import { getFactionTheme, saveFactionTheme, useFactionTheme } from './settings';
import { STORAGE_KEYS } from './storage';

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.faction;
});

describe('faction theme', () => {
  it('validates values', () => {
    expect(isFactionTheme('elyos')).toBe(true);
    expect(isFactionTheme('neon')).toBe(false);
  });

  it('persists and falls back to default', () => {
    expect(getFactionTheme()).toBe('default');
    saveFactionTheme('asmodian');
    expect(getFactionTheme()).toBe('asmodian');
    saveFactionTheme('default');
    expect(localStorage.getItem(STORAGE_KEYS.faction)).toBeNull();
    localStorage.setItem(STORAGE_KEYS.faction, 'neon');
    expect(getFactionTheme()).toBe('default');
  });

  it('applies data-faction', () => {
    applyFaction('elyos');
    expect(document.documentElement.dataset.faction).toBe('elyos');
    applyFaction('default');
    expect(document.documentElement.dataset.faction).toBeUndefined();
  });

  it('ThemeSync reflects the stored setting', () => {
    render(<ThemeSync />);
    expect(document.documentElement.dataset.faction).toBeUndefined();
    act(() => saveFactionTheme('asmodian'));
    expect(document.documentElement.dataset.faction).toBe('asmodian');
    const hook = renderHook(() => useFactionTheme());
    expect(hook.result.current).toBe('asmodian');
  });
});
