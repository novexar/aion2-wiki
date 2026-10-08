import type { Chunk } from './types';
import type { CategoryId } from './categories';

export type ChatRole = 'user' | 'model';

export interface ChatTurn {
  readonly role: ChatRole;
  readonly text: string;
}

export interface GeminiContent {
  readonly role: ChatRole;
  readonly parts: readonly { readonly text: string }[];
}

export interface RagRequest {
  readonly systemInstruction: string;
  readonly contents: GeminiContent[];
}

export interface ArticleRef {
  readonly id: string;
  readonly title: string;
  readonly category: CategoryId;
  readonly anchor: string;
}

/** マルチターンで保持する往復数 */
export const MAX_EXCHANGES = 6;
/** 取得するチャンク数 */
export const TOP_K = 8;

export const NO_INFO_MESSAGE = 'Wiki に情報がありません';

export const SYSTEM_PROMPT = [
  'あなたは「AION2 非公式Wiki」の相談役です。',
  '以下の「Wiki 抜粋」のみを根拠に、日本語で簡潔に回答してください。',
  `抜粋に根拠がない質問には推測で答えず、「${NO_INFO_MESSAGE}」と答えてください。`,
  '各主張の末尾に、根拠にした記事のタイトルを [記事タイトル] の形式で付けてください（抜粋の「記事:」に書かれたタイトルをそのまま使う）。',
  '数値はそのまま引用し、抜粋に書かれていない数値を作らないでください。',
  '韓国版のみの仕様は、そうと分かるように書いてください。',
  '箇条書きや短い段落を使い、5 行以内で答えてください。Markdown の見出しは使わないでください。',
].join('\n');

export function formatChunk(chunk: Chunk): string {
  const where = chunk.heading ? `${chunk.title} > ${chunk.heading}` : chunk.title;
  return `記事: ${chunk.title}\n位置: ${where}\n${chunk.text}`;
}

export function formatContext(chunks: readonly Chunk[]): string {
  if (chunks.length === 0) return '（該当する抜粋はありません）';
  return chunks.map((c, i) => `【抜粋${i + 1}】\n${formatChunk(c)}`).join('\n\n');
}

export function buildSystemInstruction(chunks: readonly Chunk[]): string {
  return `${SYSTEM_PROMPT}\n\n# Wiki 抜粋\n\n${formatContext(chunks)}`;
}

/** 直近 maxExchanges 往復だけ残す。先頭は必ず user から始める */
export function trimHistory(
  history: readonly ChatTurn[],
  maxExchanges = MAX_EXCHANGES,
): ChatTurn[] {
  const recent = history.filter((t) => t.text.trim()).slice(-maxExchanges * 2);
  const firstUser = recent.findIndex((t) => t.role === 'user');
  return firstUser === -1 ? [] : recent.slice(firstUser);
}

export function buildContents(history: readonly ChatTurn[], question: string): GeminiContent[] {
  return [...trimHistory(history), { role: 'user' as const, text: question }].map((t) => ({
    role: t.role,
    parts: [{ text: t.text }],
  }));
}

export function buildRagRequest(
  history: readonly ChatTurn[],
  question: string,
  chunks: readonly Chunk[],
): RagRequest {
  return {
    systemInstruction: buildSystemInstruction(chunks),
    contents: buildContents(history, question),
  };
}

/** 短い追い質問（「それの上限は？」等）は直前の質問と合わせて検索する */
export function retrievalQuery(
  history: readonly ChatTurn[],
  question: string,
  shortLength = 12,
): string {
  const q = question.trim();
  if (q.length >= shortLength) return q;
  const lastUser = [...history].reverse().find((t) => t.role === 'user');
  return lastUser ? `${lastUser.text} ${q}` : q;
}

/** 回答中の [記事タイトル] を抽出する */
export function extractCitations(answer: string): string[] {
  const found = new Set<string>();
  for (const match of answer.matchAll(/\[([^[\]\n]{1,80})\]/g)) {
    const title = match[1]?.trim();
    if (title) found.add(title);
  }
  return [...found];
}

/** 取得チャンクから参照記事を作る。回答で引用された記事があればそれを優先 */
export function pickReferences(chunks: readonly Chunk[], answer = ''): ArticleRef[] {
  const unique = new Map<string, ArticleRef>();
  for (const c of chunks) {
    if (!unique.has(c.articleId)) {
      unique.set(c.articleId, {
        id: c.articleId,
        title: c.title,
        category: c.category,
        anchor: c.anchor,
      });
    }
  }
  const all = [...unique.values()];
  const cited = new Set(extractCitations(answer));
  const citedRefs = all.filter((r) => cited.has(r.title));
  return citedRefs.length > 0 ? citedRefs : all;
}
