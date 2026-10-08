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
    const status: unknown = Reflect.get(error, 'status');
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

/** SDK を先読みする（初回送信時の読み込み待ちを減らす） */
export function preloadGemini(): Promise<unknown> {
  return import('@google/genai');
}

/** 応答の最大トークン数（5 行以内の回答に十分な量。思考が最小のとき） */
export const MAX_OUTPUT_TOKENS = 512;

/** Gemini 2.x 向け: 思考を無効化する */
export const THINKING_CONFIG = { thinkingBudget: 0 } as const;

/** 思考設定の候補。モデルが拒否したら次の候補へ進む */
export type ThinkingMode =
  | { readonly kind: 'level'; readonly level: 'MINIMAL' | 'LOW' }
  | { readonly kind: 'budget-zero' }
  | { readonly kind: 'default' };

const MINIMAL: ThinkingMode = { kind: 'level', level: 'MINIMAL' };
const LOW: ThinkingMode = { kind: 'level', level: 'LOW' };
const BUDGET_ZERO: ThinkingMode = { kind: 'budget-zero' };
const DEFAULT_THINKING: ThinkingMode = { kind: 'default' };

/** モデル名から、試す順番の思考設定を返す（Gemini 3 は thinkingLevel、2.x は thinkingBudget: 0） */
export function thinkingCandidates(model: string): readonly ThinkingMode[] {
  if (/gemini-3/i.test(model)) return [MINIMAL, LOW, DEFAULT_THINKING];
  if (/gemini-2/i.test(model)) return [BUDGET_ZERO, DEFAULT_THINKING];
  return [MINIMAL, LOW, BUDGET_ZERO, DEFAULT_THINKING];
}

/** 思考トークンも上限に数えられる。思考が軽いほど小さくて済む */
export function maxOutputTokensFor(mode: ThinkingMode): number {
  if (mode.kind === 'budget-zero') return MAX_OUTPUT_TOKENS;
  if (mode.kind === 'level') return mode.level === 'MINIMAL' ? MAX_OUTPUT_TOKENS : 1024;
  return FALLBACK_MAX_OUTPUT_TOKENS;
}

function thinkingConfigFor(mode: ThinkingMode): Record<string, unknown> {
  if (mode.kind === 'level') return { thinkingConfig: { thinkingLevel: mode.level } };
  if (mode.kind === 'budget-zero') return { thinkingConfig: THINKING_CONFIG };
  return {};
}

/** 最初に通った思考設定をモデルごとに覚え、次回から失敗する往復を省く */
const workingThinking = new Map<string, ThinkingMode>();

/** 思考を無効にできないモデルは思考トークンが出力上限を食うため、上限を広げる */
export const FALLBACK_MAX_OUTPUT_TOKENS = 2048;

export const TRUNCATED_NOTE = '\n\n（回答が長いため、途中で打ち切られました）';

function rejectsThinking(error: unknown): boolean {
  return statusOf(error) === 400 && /thinking/i.test(messageOf(error));
}

/** Gemini にストリーミングで問い合わせる。SDK はこの関数の呼び出し時に初めて読み込む */
export async function streamGemini(options: StreamOptions): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: options.apiKey });
  const request = (mode: ThinkingMode) =>
    ai.models.generateContentStream({
      model: options.model,
      contents: options.contents.map((c) => ({
        role: c.role,
        parts: c.parts.map((p) => ({ text: p.text })),
      })),
      config: {
        systemInstruction: options.systemInstruction,
        temperature: 0.3,
        maxOutputTokens: maxOutputTokensFor(mode),
        ...thinkingConfigFor(mode),
        abortSignal: options.signal,
      },
    });

  const candidates = thinkingCandidates(options.model);
  const remembered = workingThinking.get(options.model);
  const start = remembered
    ? Math.max(
        0,
        candidates.findIndex((m) => sameMode(m, remembered)),
      )
    : 0;
  let stream: Awaited<ReturnType<typeof request>> | null = null;
  for (const mode of candidates.slice(start)) {
    try {
      stream = await request(mode);
      workingThinking.set(options.model, mode);
      break;
    } catch (error: unknown) {
      if (!rejectsThinking(error)) throw error;
    }
  }
  if (!stream) throw new Error('Gemini がすべての思考設定を拒否しました');
  let full = '';
  let truncated = false;
  for await (const chunk of stream) {
    if (options.signal?.aborted) break;
    if (chunk.candidates?.[0]?.finishReason === 'MAX_TOKENS') truncated = true;
    const text = chunk.text ?? '';
    if (!text) continue;
    full += text;
    options.onText(full);
  }
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return truncated ? full + TRUNCATED_NOTE : full;
}

function sameMode(a: ThinkingMode, b: ThinkingMode): boolean {
  return a.kind === b.kind && (a.kind !== 'level' || (b.kind === 'level' && a.level === b.level));
}

/** テスト用: 覚えた思考設定を消す */
export function resetThinkingRejections(): void {
  workingThinking.clear();
}
