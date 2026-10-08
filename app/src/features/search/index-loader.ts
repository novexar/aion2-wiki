import MiniSearch from 'minisearch';
import indexUrl from '../../generated/search-index.json?url';
import textUrl from '../../generated/search-text.json?url';
import synonymsUrl from '../../generated/synonyms.json?url';
import { pageIndexOptions } from '../../lib/search-options';
import type { SynonymDict } from '../../lib/synonyms';

let pageIndexPromise: Promise<MiniSearch> | null = null;
let pageTextsPromise: Promise<ReadonlyMap<string, string>> | null = null;

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/** 記事検索インデックスを初回のみ fetch して読み込む（検索 UI を開いた時点で取得） */
export function loadPageIndex(): Promise<MiniSearch> {
  pageIndexPromise ??= fetchText(indexUrl)
    .then((json) => MiniSearch.loadJSON(json, pageIndexOptions))
    .catch((error: unknown) => {
      pageIndexPromise = null;
      throw error;
    });
  return pageIndexPromise;
}

let synonymsPromise: Promise<SynonymDict> | null = null;

/** 別名 → 題名の逆引き辞書（チャットの質問展開用）。失敗時は空の辞書を返す */
export function loadSynonyms(): Promise<SynonymDict> {
  synonymsPromise ??= fetchText(synonymsUrl)
    .then((json) => JSON.parse(json) as SynonymDict)
    .catch((error: unknown) => {
      console.error('同義語辞書の読み込みに失敗しました', error);
      synonymsPromise = null;
      return {};
    });
  return synonymsPromise;
}

/** 記事 ID → 本文の Map。形式が違えば例外にし、値が文字列でないものは捨てる */
export function parsePageTexts(value: unknown): Map<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('search-text.json の形式が正しくありません');
  }
  return new Map(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

/** 記事 ID → 本文先頭 800 文字（スニペット用）。失敗時は空の Map を返す */
export function loadPageTexts(): Promise<ReadonlyMap<string, string>> {
  pageTextsPromise ??= fetchText(textUrl)
    .then((json) => parsePageTexts(JSON.parse(json) as unknown))
    .catch((error: unknown) => {
      console.error('検索用本文の読み込みに失敗しました', error);
      pageTextsPromise = null;
      return new Map<string, string>();
    });
  return pageTextsPromise;
}
