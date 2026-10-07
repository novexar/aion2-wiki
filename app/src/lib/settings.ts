import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_MODEL } from './gemini-config';
import { readString, removeKey, STORAGE_EVENT, STORAGE_KEYS, writeString } from './storage';
import { isThemePreference, type ThemePreference } from './theme';

function subscribe(callback: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function useLocalString(key: string): string | null {
  const getSnapshot = useCallback(() => readString('local', key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function getApiKey(): string | null {
  const key = readString('local', STORAGE_KEYS.apiKey);
  return key && key.trim() ? key : null;
}

export function saveApiKey(value: string): boolean {
  return writeString('local', STORAGE_KEYS.apiKey, value.trim());
}

export function clearApiKey(): void {
  removeKey('local', STORAGE_KEYS.apiKey);
}

export function useApiKey(): string | null {
  const value = useLocalString(STORAGE_KEYS.apiKey);
  return value && value.trim() ? value : null;
}

export function getModel(): string {
  const model = readString('local', STORAGE_KEYS.model);
  return model && model.trim() ? model.trim() : DEFAULT_MODEL;
}

export function saveModel(value: string): void {
  const trimmed = value.trim();
  if (!trimmed || trimmed === DEFAULT_MODEL) removeKey('local', STORAGE_KEYS.model);
  else writeString('local', STORAGE_KEYS.model, trimmed);
}

export function useModel(): string {
  const value = useLocalString(STORAGE_KEYS.model);
  return value && value.trim() ? value.trim() : DEFAULT_MODEL;
}

export function getThemePreference(): ThemePreference {
  const value = readString('local', STORAGE_KEYS.theme);
  return value && isThemePreference(value) ? value : 'system';
}

export function saveThemePreference(value: ThemePreference): void {
  if (value === 'system') removeKey('local', STORAGE_KEYS.theme);
  else writeString('local', STORAGE_KEYS.theme, value);
}

export function useThemePreference(): ThemePreference {
  const value = useLocalString(STORAGE_KEYS.theme);
  return value && isThemePreference(value) ? value : 'system';
}

/** API キーを画面表示用に伏せ字にする */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
