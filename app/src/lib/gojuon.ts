import type { ArticleMeta } from './types';

export const GOJUON_ROWS = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'] as const;
export type GojuonRow = (typeof GOJUON_ROWS)[number];
export const OTHER_GROUP = 'その他';

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

/** 五十音の見出し: reading → title → かな始まりの alias の順で判定。漢字のみなら「その他」 */
export function kanaGroup(meta: Pick<ArticleMeta, 'title' | 'aliases' | 'reading'>): string {
  const candidates = [meta.reading, meta.title, ...meta.aliases].filter((v): v is string =>
    Boolean(v),
  );
  for (const candidate of candidates) {
    const row = gojuonRow(Array.from(candidate.trim())[0] ?? '');
    if (row) return row;
  }
  return OTHER_GROUP;
}

/** A–Z の見出し: 英字始まりの title / alias。なければ null（A–Z 索引に載せない） */
export function latinGroup(
  meta: Pick<ArticleMeta, 'title' | 'aliases'>,
): { letter: string; label: string } | null {
  for (const candidate of [meta.title, ...meta.aliases]) {
    const first = candidate.normalize('NFKC').trim()[0];
    if (first && /[a-z]/i.test(first)) return { letter: first.toUpperCase(), label: candidate };
  }
  return null;
}
