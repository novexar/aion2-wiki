import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { LIST_COLUMNS, PAGE_CONTAINER } from '../../lib/layout';
import { articlePath } from '../../lib/paths';
import { SearchResultRow } from './SearchResultRow';
import { useSearch } from './useSearch';

const PAGE_SIZE = 50;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const query = params.get('q') ?? '';
  const { status, results, query: shownQuery } = useSearch(query, { limit });
  const trimmed = shownQuery.trim();
  useDocumentMeta(query ? `「${query}」の検索結果` : '検索');

  return (
    <div className={`${PAGE_CONTAINER} py-8`}>
      <h1 className="text-2xl font-bold sm:text-[1.75rem]">検索</h1>
      <form
        role="search"
        className="relative mt-5 max-w-[42rem]"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="search-page-input" className="sr-only">
          記事を検索
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-fg-subtle"
        />
        <input
          id="search-page-input"
          type="search"
          value={query}
          onChange={(e) => {
            setLimit(PAGE_SIZE);
            setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
          }}
          placeholder="検索"
          autoFocus
          autoComplete="off"
          className="h-12 w-full rounded border border-line-input bg-canvas pr-4 pl-10 text-base placeholder:text-fg-subtle hover:border-fg-subtle focus:border-accent focus:outline-none"
        />
      </form>

      <div className="mt-6">
        {status === 'loading' && trimmed && <p className="text-sm text-fg-subtle">読み込み中</p>}
        {status === 'error' && (
          <p role="alert" className="text-sm text-danger">
            検索インデックスを読み込めませんでした。ページを再読み込みしてください。
          </p>
        )}
        <p aria-live="polite" className="mb-3 text-sm text-fg-subtle">
          {status === 'ready' && trimmed && results.length > 0
            ? results.length >= limit
              ? `${limit} 件以上`
              : `${results.length} 件`
            : ''}
        </p>
        {status === 'ready' && trimmed && results.length === 0 && (
          <p className="text-sm text-fg-muted">
            「{trimmed}」に一致する記事はありません。{' '}
            <Link to="/index" className="text-accent-strong underline underline-offset-4">
              索引
            </Link>
          </p>
        )}
        {results.length > 0 && trimmed && (
          <ul className={`border-t border-line ${LIST_COLUMNS}`}>
            {results.map((hit) => (
              <li key={hit.id} className="border-b border-line">
                <Link
                  to={articlePath(hit.category, hit.id)}
                  className="block px-1 py-4 hover:bg-surface"
                >
                  <SearchResultRow hit={hit} query={trimmed} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {results.length >= limit && trimmed && (
          <button
            type="button"
            onClick={() => setLimit(limit + PAGE_SIZE)}
            className="mt-4 h-9 rounded border border-line-input px-4 text-sm text-fg hover:bg-muted"
          >
            さらに表示
          </button>
        )}
      </div>
    </div>
  );
}
