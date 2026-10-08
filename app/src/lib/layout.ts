/** ページ共通のコンテナ幅（ヘッダー・フッター・各ページで揃える） */
export const PAGE_CONTAINER = 'mx-auto w-full max-w-[88rem] px-4 sm:px-6';

/** 一覧の段組み: 1 列 → 2 列（lg）→ 3 列（2xl）。縦に読む順（閲覧順・五十音）を保つため CSS columns を使う */
export const LIST_COLUMNS = 'gap-x-8 lg:columns-2 2xl:columns-3';

/** LIST_COLUMNS の各行に付ける（行が段をまたいで割れないように） */
export const LIST_ITEM = 'break-inside-avoid';
