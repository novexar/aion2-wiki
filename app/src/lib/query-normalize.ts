/**
 * チャット質問の前処理。「について教えて」「どうすれば」など質問の言い回しを除き、
 * 内容語（金策・ルーン・装着 …）だけを検索語にする。I/O を持たない純関数。
 */
import { isCjkChar, normalizeText } from './tokenizer';

/**
 * 質問の言い回し。長い語を先に並べる（正規表現は先頭から一致するため）。
 * 複数文字のものだけ。助詞 1 文字は SEPARATOR で語を分けるときに扱う。
 */
const FILLER_PHRASES = [
  '教えてください',
  '教えてほしい',
  '知りたいです',
  'について',
  'に関して',
  'ありますか',
  'あるのか',
  'でしょうか',
  'ですか',
  'ますか',
  'ください',
  '教えて',
  '知りたい',
  'どうやって',
  'どうなる',
  'どうすれば',
  'どうする',
  'すれば',
  'どう',
  'どれ',
  'どこ',
  'いつ',
  'いくつ',
  'いくら',
  'どの',
  '何個',
  '何回',
  '何時',
  '何',
  '誰',
  '方法',
  'やり方',
  'とは',
  'できる',
  'できます',
  'のは',
  'って',
  'まで',
  'から',
  'ような',
  'くらい',
  'ぐらい',
  'たら',
  'ほしい',
  'いい',
  'する',
  'して',
  'した',
  'なる',
  'ある',
  'ない',
  'です',
  'ます',
];

const FILLER_PATTERN = new RegExp(FILLER_PHRASES.join('|'), 'gu');

/** 語を分ける区切り（助詞 1 文字・空白・句読点・記号） */
const SEPARATOR = /[のはがをにでともへ\s、。,.?？!！・「」『』()（）[\]【】★☆※~〜:：;；/／\-－+＋]+/u;

const KANA_ONLY = /^[ぁ-ゖァ-ヺー]$/u;

/** 1 文字のかな（の・は・ん …）は語にならない。1 文字の漢字・英数字は残す（会・剣・IL など） */
function isContentWord(word: string): boolean {
  if (word === '') return false;
  const chars = Array.from(word);
  if (chars.length > 1) return true;
  return !KANA_ONLY.test(word) && (isCjkChar(word) || /[\p{L}\p{N}]/u.test(word));
}

/**
 * 質問から内容語を取り出す（重複なし・出現順）。
 * 内容語が 1 つも残らないときは、言い回しを除く前の語を返す。
 */
export function contentWords(query: string): string[] {
  const normalized = normalizeText(query);
  const split = (text: string): string[] => text.split(SEPARATOR).filter(isContentWord);
  const stripped = split(normalized.replace(FILLER_PATTERN, ' '));
  const words = stripped.length > 0 ? stripped : split(normalized);
  return [...new Set(words)];
}

/** 内容語を空白で連結した検索文字列 */
export function normalizeQuery(query: string): string {
  return contentWords(query).join(' ');
}
