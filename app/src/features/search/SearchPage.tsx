import { Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { articlePath } from '../../lib/paths';
import { SearchResultRow } from './SearchResultRow';
import { useSearch } from './useSearch';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const { status, results, query: shownQuery } = useSearch(query, { limit: 50 });
  const trimmed = shownQuery.trim();
  useDocumentMeta(query ? `「${query}」の検索結果` : '検索');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <h1 className="text-[1.75rem] font-bold tracking-tight">検索</h1>
      <form role="search" className="relative mt-5" onSubmit={(e) => e.preventDefault()}>
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
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
          }
          placeholder="記事・用語・英語名で検索"
          autoFocus
          autoComplete="off"
          className="h-12 w-full rounded-lg border border-line bg-canvas pr-4 pl-10 text-base placeholder:text-fg-subtle hover:border-line-strong focus:border-accent focus:outline-none"
        />
      </form>

      <div className="mt-6" aria-live="polite">
        {status === 'loading' && trimmed && (
          <p className="text-sm text-fg-subtle">検索インデックスを読み込み中…</p>
        )}
        {status === 'error' && (
          <p role="alert" className="text-sm text-danger">
            検索インデックスを読み込めませんでした。ページを再読み込みしてください。
          </p>
        )}
        {status === 'ready' && trimmed && (
          <p className="mb-3 text-sm text-fg-subtle">
            「{trimmed}」の検索結果: {results.length} 件
          </p>
        )}
        {status === 'ready' && trimmed && results.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-4 py-10 text-center text-sm text-fg-muted">
            一致する記事が見つかりませんでした。別の言い方や英語名でもお試しください。
            <br />
            <Link
              to="/index"
              className="mt-2 inline-block text-accent-strong underline underline-offset-4"
            >
              索引から探す
            </Link>
          </p>
        )}
        {results.length > 0 && trimmed && (
          <ul className="divide-y divide-line border-y border-line">
            {results.map((hit) => (
              <li key={hit.id}>
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
      </div>
    </div>
  );
}
