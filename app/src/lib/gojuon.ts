import type { ArticleMeta } from './types';

export const GOJUON_ROWS = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'] as const;
export type GojuonRow = (typeof GOJUON_ROWS)[number];
/** 読みの無い英数字始まりの記事の群（漢字始まりは reading で五十音に入る） */
export const OTHER_GROUP = '英数字';

const ROW_CHARS: Record<GojuonRow, string> = {
  あ: 'あいうえおぁぃぅぇぉゔ',
  か: 'かきくけこがぎぐげごゕゖ',
  さ: 'さしすせそざじずぜぞ',
  た: 'たちつてとだぢづでどっ',
  な: 'なにぬねの',
  は: 'はひふへほばびぶべぼぱぴぷぺぽ',
  ま: 'まみむめも',
  や: 'やゆよゃゅょ',
  ら: 'らりるれろ',
  わ: 'わをんゎゐゑ',
};

/** カタカナ → ひらがな */
export function toHiragana(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export function gojuonRow(ch: string): GojuonRow | null {
  const hira = toHiragana(ch);
  for (const row of GOJUON_ROWS) {
    if (ROW_CHARS[row].includes(hira)) return row;
  }
  return null;
}

/** 五十音の見出し: reading → title の順で判定（別名は見ない）。どちらも仮名でなければ OTHER_GROUP */
export function kanaGroup(meta: Pick<ArticleMeta, 'title' | 'aliases' | 'reading'>): string {
  const candidates = [meta.reading, meta.title].filter((v): v is string => Boolean(v));
  for (const candidate of candidates) {
    const row = gojuonRow(Array.from(candidate.trim())[0] ?? '');
    if (row) return row;
  }
  return OTHER_GROUP;
}

const startsLatin = (text: string): boolean => /^[a-z]/i.test(text);
/** 4 文字以下の全大文字（略語）。A–Z のラベルには後回しにする */
const isAbbreviation = (text: string): boolean => text.length <= 4 && /^[A-Z0-9]+$/.test(text);

/**
 * A–Z の見出し: 英字始まりの title。title が英字始まりでなければ英字始まりの別名のうち
 * 略語でない最長のもの（略語しか無ければ最長の略語）。表示ラベルは先頭を大文字にする。
 * 候補が無ければ null（A–Z 索引に載せない）
 */
export function latinGroup(
  meta: Pick<ArticleMeta, 'title' | 'aliases'>,
): { letter: string; label: string; source: string } | null {
  const title = meta.title.normalize('NFKC').trim();
  const aliases = meta.aliases
    .map((a) => ({ source: a, norm: a.normalize('NFKC').trim() }))
    .filter((a) => startsLatin(a.norm))
    .sort(
      (a, b) =>
        Number(isAbbreviation(a.norm)) - Number(isAbbreviation(b.norm)) ||
        b.norm.length - a.norm.length ||
        a.norm.localeCompare(b.norm, 'en'),
    );
  const titleLatin = startsLatin(title);
  const picked = titleLatin ? title : aliases[0]?.norm;
  if (!picked) return null;
  // 表示用に整形しても、元の名前（比較用）は変えずに返す
  const source = titleLatin ? meta.title : (aliases[0]?.source ?? picked);
  const label = `${picked[0]?.toUpperCase() ?? ''}${picked.slice(1)}`;
  return { letter: label[0] ?? '', label, source };
}
