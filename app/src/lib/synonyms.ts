/**
 * 同義語展開。ビルド時に記事の別名 → 題名の逆引き辞書（synonyms.json）を作り、
 * 質問に別名が含まれていたら、その記事の題名を検索語に加える。
 */
import { contentWords } from './query-normalize';
import { MANUAL_SYNONYMS, type ManualSynonym } from './synonyms-manual';
import { isCjkChar, normalizeText } from './tokenizer';

/** 正規化済みの別名 → その別名を持つ記事の題名（少数） */
export type SynonymDict = Readonly<Record<string, readonly string[]>>;

export interface SynonymSource {
  readonly title: string;
  readonly aliases: readonly string[];
}

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 10;
/** 1 つの別名が多くの記事に付いているときは一般語なので展開しない */
const MAX_TITLES_PER_ALIAS = 3;

/** 汎用語で無関係な記事へ展開してしまう別名（正規化済み） */
const STOP_ALIASES: ReadonlySet<string> = new Set(['il', 'スキル', 'オード', 'コロ', 'キュー']);
const KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/u;
const MIN_KANA_ALIAS_LENGTH = 3;
const MAX_LATIN_STOP_LENGTH = 2;

function isGenericAlias(alias: string): boolean {
  if (STOP_ALIASES.has(alias)) return true;
  const length = Array.from(alias).length;
  if (KANA_ONLY.test(alias)) return length < MIN_KANA_ALIAS_LENGTH;
  return isLatin(alias) && length <= MAX_LATIN_STOP_LENGTH;
}

function usableAlias(alias: string, title: string): boolean {
  const length = Array.from(alias).length;
  if (length < MIN_ALIAS_LENGTH || length > MAX_ALIAS_LENGTH) return false;
  if (isGenericAlias(alias)) return false;
  if (/^[\d\s.]+$/u.test(alias)) return false;
  return alias !== normalizeText(title);
}

/** 記事の別名から逆引き辞書を作る（ビルド時） */
export function buildSynonymDict(sources: readonly SynonymSource[]): SynonymDict {
  const byAlias = new Map<string, Set<string>>();
  for (const { title, aliases } of sources) {
    for (const raw of aliases) {
      const alias = normalizeText(raw).trim();
      if (!usableAlias(alias, title)) continue;
      byAlias.set(alias, (byAlias.get(alias) ?? new Set()).add(title));
    }
  }
  const entries = [...byAlias]
    .filter(([, titles]) => titles.size <= MAX_TITLES_PER_ALIAS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([alias, titles]) => [alias, [...titles]] as const);
  return Object.fromEntries(entries);
}

function isLatin(term: string): boolean {
  return !Array.from(term).some(isCjkChar);
}

/** 質問が語 key を含むか。英数字は単語単位（"od" が "god" に当たらない）、日本語は部分一致 */
function mentions(normalizedQuery: string, words: ReadonlySet<string>, key: string): boolean {
  return isLatin(key) ? words.has(key) : normalizedQuery.includes(key);
}

/**
 * 質問に出る語から追加の検索語を返す（元の質問語と重複するものは除く）。
 * 自動辞書（別名 → 題名）と手動辞書の両方を使う。
 */
export function expandTerms(
  query: string,
  dict: SynonymDict = {},
  manual: readonly ManualSynonym[] = MANUAL_SYNONYMS,
): string[] {
  const normalized = normalizeText(query);
  const words = new Set(contentWords(query));
  const added = new Set<string>();
  for (const [alias, titles] of Object.entries(dict)) {
    if (mentions(normalized, words, alias)) titles.forEach((t) => added.add(normalizeText(t)));
  }
  for (const { keys, terms } of manual) {
    if (keys.some((k) => mentions(normalized, words, normalizeText(k)))) {
      terms.forEach((t) => added.add(normalizeText(t)));
    }
  }
  return [...added].filter((t) => !words.has(t));
}
