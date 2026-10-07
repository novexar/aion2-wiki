/** ビルド時とブラウザで共有する MiniSearch オプション（両者が一致しないと loadJSON が壊れる） */
import type { Options, SearchOptions } from 'minisearch';
import { isCjkChar, tokenize, tokenizeForIndex } from './tokenizer';

/** tokenize で正規化済みなので processTerm はそのまま返す */
const identity = (term: string): string => term;

export function isLatinTerm(term: string): boolean {
  return !Array.from(term).some(isCjkChar);
}

export const baseSearchOptions: SearchOptions = {
  prefix: (term) => isLatinTerm(term) && term.length >= 2,
  fuzzy: (term) => (isLatinTerm(term) && term.length >= 5 ? 0.2 : false),
};

export const PAGE_FIELDS = ['title', 'aliases', 'tags', 'summary', 'headings', 'body'];
export const PAGE_STORE_FIELDS = ['id', 'title', 'category', 'summary', 'confidence', 'aliases'];

export const pageIndexOptions: Options = {
  idField: 'id',
  fields: PAGE_FIELDS,
  storeFields: PAGE_STORE_FIELDS,
  tokenize: tokenizeForIndex,
  processTerm: identity,
  searchOptions: {
    tokenize,
    ...baseSearchOptions,
    boost: { title: 4, aliases: 4, tags: 2.5, summary: 1.5, headings: 1.2, body: 1 },
  },
};

export const CHUNK_FIELDS = ['title', 'heading', 'text'];

export const chunkIndexOptions: Options = {
  idField: 'id',
  fields: CHUNK_FIELDS,
  storeFields: [],
  tokenize: tokenizeForIndex,
  processTerm: identity,
  searchOptions: {
    tokenize,
    ...baseSearchOptions,
    boost: { title: 2, heading: 1.5, text: 1 },
  },
};
