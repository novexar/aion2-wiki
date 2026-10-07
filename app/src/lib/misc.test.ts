import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { categoryLabel, getCategory, isCategoryId } from './categories';
import { DEFAULT_MODEL } from './gemini-config';
import { gojuonRow, kanaGroup, latinGroup, OTHER_GROUP, toHiragana } from './gojuon';
import { articlePath, categoryPath, normalizeBase, searchPath, toRouterPath } from './paths';
import { isMacPlatform, modKeyLabel } from './platform';
import {
  clearApiKey,
  getApiKey,
  getModel,
  getThemePreference,
  maskApiKey,
  saveApiKey,
  saveModel,
  saveThemePreference,
  useApiKey,
  useModel,
  useThemePreference,
} from './settings';
import { readJson, readString, removeKey, STORAGE_KEYS, writeJson, writeString } from './storage';
import { applyTheme, isThemePreference, resolveTheme } from './theme';

describe('categories', () => {
  it('looks up categories', () => {
    expect(isCategoryId('dungeons')).toBe(true);
    expect(isCategoryId('raids')).toBe(false);
    expect(getCategory('pvp')?.label).toBe('PvP');
    expect(categoryLabel('unknown')).toBe('unknown');
  });
});

describe('gojuon', () => {
  it('maps kana to rows', () => {
    expect(toHiragana('オード')).toBe('おーど');
    expect(gojuonRow('ギ')).toBe('か');
    expect(gojuonRow('ゃ')).toBe('や');
    expect(gojuonRow('漢')).toBeNull();
  });

  it('groups by reading then title, ignoring aliases', () => {
    expect(kanaGroup({ title: '遠征', aliases: [], reading: 'えんせい' })).toBe('あ');
    expect(kanaGroup({ title: 'ギーナ', aliases: [] })).toBe('か');
    expect(kanaGroup({ title: '遠征', aliases: ['Expedition', 'ダンジョン'] })).toBe(OTHER_GROUP);
    expect(kanaGroup({ title: 'AION2とは', aliases: ['あいおん'] })).toBe(OTHER_GROUP);
    expect(kanaGroup({ title: '遠征', aliases: [] })).toBe(OTHER_GROUP);
  });

  it('finds latin labels for the A–Z index', () => {
    expect(latinGroup({ title: 'ギーナ', aliases: ['Kinah'] })).toEqual({
      letter: 'K',
      label: 'Kinah',
    });
    expect(latinGroup({ title: 'PvP の基礎', aliases: [] })).toEqual({
      letter: 'P',
      label: 'PvP の基礎',
    });
    expect(latinGroup({ title: 'ギーナ', aliases: [] })).toBeNull();
  });
});

describe('paths', () => {
  it('builds app paths', () => {
    expect(articlePath('economy', 'kinah')).toBe('/wiki/economy/kinah');
    expect(articlePath('economy', 'kinah', '入手')).toBe(
      `/wiki/economy/kinah#${encodeURIComponent('入手')}`,
    );
    expect(categoryPath('pvp')).toBe('/wiki/pvp');
    expect(searchPath('a b')).toBe('/search?q=a%20b');
    expect(normalizeBase('AION2')).toBe('/AION2/');
  });

  it('converts in-site hrefs to router paths', () => {
    const origin = 'https://novexar.github.io';
    expect(toRouterPath('/AION2/wiki/economy/kinah#x', '/AION2/', origin)).toBe(
      '/wiki/economy/kinah#x',
    );
    expect(toRouterPath('https://example.com/AION2/x', '/AION2/', origin)).toBeNull();
    expect(toRouterPath('/other/x', '/AION2/', origin)).toBeNull();
    expect(toRouterPath('http://[bad', '/AION2/', origin)).toBeNull();
  });
});

describe('platform', () => {
  it('detects mac', () => {
    const spy = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    expect(isMacPlatform()).toBe(true);
    expect(modKeyLabel()).toBe('⌘');
    spy.mockReturnValue('Win32');
    expect(modKeyLabel()).toBe('Ctrl');
    spy.mockRestore();
  });
});

describe('storage', () => {
  it('reads and writes strings and JSON with guards', () => {
    expect(writeString('local', 'k', 'v')).toBe(true);
    expect(readString('local', 'k')).toBe('v');
    removeKey('local', 'k');
    expect(readString('local', 'k')).toBeNull();

    writeJson('session', 'j', { a: 1 });
    const isA = (v: unknown): v is { a: number } => typeof v === 'object' && v !== null && 'a' in v;
    expect(readJson('session', 'j', isA)).toEqual({ a: 1 });
    expect(readJson('session', 'j', (v): v is string => typeof v === 'string')).toBeNull();
    writeString('session', 'bad', '{oops');
    expect(readJson('session', 'bad', isA)).toBeNull();
    expect(readJson('session', 'none', isA)).toBeNull();
  });

  it('survives storage exceptions', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(writeString('local', 'k', 'v')).toBe(false);
    spy.mockRestore();
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readString('local', 'k')).toBeNull();
    get.mockRestore();
  });
});

describe('settings', () => {
  it('stores and clears the API key', () => {
    expect(getApiKey()).toBeNull();
    saveApiKey('  AIzaTEST1234567890abcdef  ');
    expect(getApiKey()).toBe('AIzaTEST1234567890abcdef');
    expect(localStorage.getItem(STORAGE_KEYS.apiKey)).toBe('AIzaTEST1234567890abcdef');
    clearApiKey();
    expect(getApiKey()).toBeNull();
  });

  it('defaults and resets the model', () => {
    expect(getModel()).toBe(DEFAULT_MODEL);
    saveModel('gemini-custom');
    expect(getModel()).toBe('gemini-custom');
    saveModel('  ');
    expect(getModel()).toBe(DEFAULT_MODEL);
  });

  it('stores the theme preference', () => {
    expect(getThemePreference()).toBe('system');
    saveThemePreference('dark');
    expect(getThemePreference()).toBe('dark');
    saveThemePreference('system');
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBeNull();
    localStorage.setItem(STORAGE_KEYS.theme, 'neon');
    expect(getThemePreference()).toBe('system');
  });

  it('notifies hooks when values change', () => {
    const key = renderHook(() => useApiKey());
    const model = renderHook(() => useModel());
    const theme = renderHook(() => useThemePreference());
    expect(key.result.current).toBeNull();
    act(() => {
      saveApiKey('AIzaABCDEFGHIJKLMNOPQRST');
      saveModel('m2');
      saveThemePreference('light');
    });
    expect(key.result.current).toBe('AIzaABCDEFGHIJKLMNOPQRST');
    expect(model.result.current).toBe('m2');
    expect(theme.result.current).toBe('light');
  });

  it('masks keys', () => {
    expect(maskApiKey('AIzaABCDEFGH1234')).toBe('AIza••••1234');
    expect(maskApiKey('short')).toBe('••••');
  });
});

describe('theme', () => {
  it('resolves preferences', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('x')).toBe(false);
  });

  it('applies data-theme to the root element', () => {
    const root = document.createElement('html');
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    expect(applyTheme('system', root)).toBe('dark');
    expect(root.dataset.theme).toBe('dark');
    expect(applyTheme('light', root)).toBe('light');
    expect(root.style.colorScheme).toBe('light');
  });
});
