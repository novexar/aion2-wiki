/**
 * 日本語対応トークナイザー。
 * - CJK（ひらがな・カタカナ・漢字・ハングル）の連続部分は 2 文字 n-gram（bigram）。1 文字だけならその 1 文字。
 * - 英数字は小文字化した単語。
 * - 入力は NFKC 正規化（全角英数→半角、半角カナ→全角）。
 */
const CJK_CLASS =
  '\\u3005\\u3041-\\u3096\\u30a1-\\u30fa\\u30fc\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uac00-\\ud7af';
const CJK_CHAR = new RegExp(`[${CJK_CLASS}]`, 'u');
const SEGMENT = new RegExp(`([${CJK_CLASS}]+)|([\\p{L}\\p{N}]+)`, 'gu');

export function normalizeText(text: string): string {
  return text.normalize('NFKC').toLowerCase();
}

export function isCjkChar(ch: string): boolean {
  return CJK_CHAR.test(ch);
}

function bigrams(run: string): string[] {
  const chars = Array.from(run);
  if (chars.length === 1) return chars;
  const out: string[] = [];
  for (let i = 0; i < chars.length - 1; i += 1) {
    out.push(`${chars[i]}${chars[i + 1]}`);
  }
  return out;
}

/** index=true: 1 文字クエリ（剣 など）が当たるよう CJK の unigram も加える */
export function tokenize(text: string, index = false): string[] {
  const normalized = normalizeText(text);
  const tokens: string[] = [];
  for (const match of normalized.matchAll(SEGMENT)) {
    const [, cjk, word] = match;
    if (cjk) {
      tokens.push(...bigrams(cjk));
      if (index && Array.from(cjk).length > 1) tokens.push(...Array.from(cjk));
    } else if (word) tokens.push(word);
  }
  return tokens;
}

/** インデックス用（unigram + bigram）。MiniSearch は第 2 引数に fieldName を渡すので別関数にする */
export function tokenizeForIndex(text: string): string[] {
  return tokenize(text, true);
}

/** 検索語用: トークン化 + 重複排除 */
export function tokenizeQuery(text: string): string[] {
  return Array.from(new Set(tokenize(text)));
}
