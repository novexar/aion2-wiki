/**
 * Gemini のモデル設定。`gemini-flash-latest` は Google が最新の Flash 系モデルを指すエイリアス
 * （@google/genai の README の例と同じ）。設定画面から任意のモデル名に変更できる。
 */
export const DEFAULT_MODEL = 'gemini-flash-latest';

export const SUGGESTED_MODELS: readonly string[] = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
];

/** 設定画面の候補に添える注記 */
export const MODEL_NOTES: Readonly<Record<string, string>> = {
  'gemini-flash-lite-latest': '高速',
};

export const API_KEY_URL = 'https://aistudio.google.com/apikey';

/** 公開 URL。Google AI Studio でキーの利用元(HTTP リファラー)を制限するときの値 */
export const REFERRER_HINT = 'https://novexar.github.io/aion2-wiki/*';
