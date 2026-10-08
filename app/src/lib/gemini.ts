import type { GeminiContent } from './rag';

export type ChatErrorKind =
  | 'invalid-key'
  | 'permission'
  | 'rate-limit'
  | 'model'
  | 'server'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface ChatError {
  readonly kind: ChatErrorKind;
  readonly message: string;
}

const MESSAGES: Record<ChatErrorKind, string> = {
  'invalid-key': 'API キーが無効です。Google AI Studio で発行したキーを設定し直してください。',
  permission:
    'この API キーではモデルを利用できません。キーの権限やプロジェクト設定を確認してください。',
  'rate-limit':
    'リクエストが多すぎます（レート制限）。1 分ほど待ってから、もう一度お試しください。',
  model: 'モデル名が見つかりません。設定画面でモデル名を確認してください。',
  server: 'Gemini 側で一時的なエラーが発生しました。少し待ってから再度お試しください。',
  network: 'ネットワークに接続できません。通信環境を確認してください。',
  aborted: '回答の生成を停止しました。',
  unknown: '回答を取得できませんでした。時間をおいて再度お試しください。',
};

function statusOf(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : '';
}

function kindFromStatus(status: number, message: string): ChatErrorKind | undefined {
  if (status === 400 && /api[ _-]?key/i.test(message)) return 'invalid-key';
  if (status === 401) return 'invalid-key';
  if (status === 403) return 'permission';
  if (status === 404) return 'model';
  if (status === 429) return 'rate-limit';
  if (status >= 500) return 'server';
  return undefined;
}

function kindFromMessage(error: unknown, message: string): ChatErrorKind {
  if (error instanceof DOMException && error.name === 'AbortError') return 'aborted';
  if (error instanceof Error && error.name === 'AbortError') return 'aborted';
  if (/api[ _-]?key not valid|API_KEY_INVALID/i.test(message)) return 'invalid-key';
  if (/RESOURCE_EXHAUSTED|quota|rate limit/i.test(message)) return 'rate-limit';
  if (/failed to fetch|networkerror|network request failed|load failed/i.test(message))
    return 'network';
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'network';
  return 'unknown';
}

/** SDK / fetch の例外をユーザー向けの文言に変換する */
export function toChatError(error: unknown): ChatError {
  const message = messageOf(error);
  const status = statusOf(error);
  const kind =
    (status !== undefined ? kindFromStatus(status, message) : undefined) ??
    kindFromMessage(error, message);
  return { kind, message: MESSAGES[kind] };
}

export interface StreamOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly systemInstruction: string;
  readonly contents: readonly GeminiContent[];
  readonly signal?: AbortSignal;
  /** これまでに受信した全文を渡す */
  readonly onText: (fullText: string) => void;
}

/** 応答の最大トークン数（5 行以内の回答に十分な量） */
export const MAX_OUTPUT_TOKENS = 512;

/** 思考を無効化して初動を速くする。非対応モデルで拒否された時は外して再試行する */
export const THINKING_CONFIG = { thinkingBudget: 0 } as const;

function rejectsThinking(error: unknown): boolean {
  return statusOf(error) === 400 && /thinking/i.test(messageOf(error));
}

/** Gemini にストリーミングで問い合わせる。SDK はこの関数の呼び出し時に初めて読み込む */
export async function streamGemini(options: StreamOptions): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: options.apiKey });
  const request = (withThinking: boolean) =>
    ai.models.generateContentStream({
      model: options.model,
      contents: options.contents.map((c) => ({
        role: c.role,
        parts: c.parts.map((p) => ({ text: p.text })),
      })),
      config: {
        systemInstruction: options.systemInstruction,
        temperature: 0.3,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        ...(withThinking ? { thinkingConfig: THINKING_CONFIG } : {}),
        abortSignal: options.signal,
      },
    });
  const stream = await request(true).catch((error: unknown) => {
    if (!rejectsThinking(error)) throw error;
    return request(false);
  });
  let full = '';
  for await (const chunk of stream) {
    if (options.signal?.aborted) break;
    const text = chunk.text ?? '';
    if (!text) continue;
    full += text;
    options.onText(full);
  }
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return full;
}
