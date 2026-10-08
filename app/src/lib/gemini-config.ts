/**
 * Gemini のモデル設定。既定は思考が最小で最も速い flash-lite。設定画面から任意のモデル名に変更できる。
 * `gemini-flash-latest` は最新の Flash 系を指すエイリアス（思考を無効にできない場合がある）。
 */
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

export const SUGGESTED_MODELS: readonly string[] = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

/** 設定画面の候補に添える注記 */
export const MODEL_NOTES: Readonly<Record<string, string>> = {
  'gemini-3.5-flash-lite': '高速',
  'gemini-3.8-flash': '高精度',
};

export const API_KEY_URL = 'https://aistudio.google.com/apikey';

/** 公開 URL。Google AI Studio でキーの利用元(HTTP リファラー)を制限するときの値 */
export const REFERRER_HINT = 'https://novexar.github.io/aion2-wiki/*';
