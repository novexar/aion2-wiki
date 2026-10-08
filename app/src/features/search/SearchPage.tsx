import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { articlePath } from '../../lib/paths';
import type { PageHit } from '../../lib/search';
import { SearchResultRow } from './SearchResultRow';
import { WikiShell } from '../wiki/WikiShell';
import { useSearch } from './useSearch';

const PAGE_SIZE = 50;

function ResultList({
  hits,
  query,
}: {
  readonly hits: readonly PageHit[];
  readonly query: string;
}) {
  return (
    <ul className="border-t border-line">
      {hits.map((hit) => (
        <li key={hit.id} className="border-b border-line">
          <Link to={articlePath(hit.category, hit.id)} className="block px-1 py-4 hover:bg-surface">
            <SearchResultRow hit={hit} query={query} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function countLabel(shown: number, total: number): string {
  return total > shown ? `${total} 件中 ${shown} 件を表示` : `${total} 件`;
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const query = params.get('q') ?? '';
  const { status, results, total, query: shownQuery } = useSearch(query, { limit });
  const trimmed = shownQuery.trim();
  useDocumentMeta(query ? `「${query}」の検索結果` : '記事を検索');
  const indexHits = results.filter((h) => !h.bodyOnly);
  const bodyHits = results.filter((h) => h.bodyOnly);

  return (
    <WikiShell wide>
      <h1 className="text-2xl font-bold sm:text-[1.75rem]">記事を検索</h1>
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
          className="h-10 w-full rounded border border-line-input bg-canvas pr-4 pl-10 text-base placeholder:text-fg-subtle hover:border-fg-subtle focus:border-fg-subtle focus:outline-none"
        />
      </form>

      {!query.trim() && (
        <p className="mt-3 text-[13px] text-fg-muted">
          タイトル・別名・本文を検索します。例: オードエネルギー、IL1400
        </p>
      )}

      <div className="mt-6 max-w-[48rem]">
        {status === 'loading' && trimmed && <p className="text-sm text-fg-subtle">読み込み中</p>}
        {status === 'error' && (
          <p role="alert" className="text-sm text-danger">
            検索インデックスを読み込めませんでした。ページを再読み込みしてください。
          </p>
        )}
        <p aria-live="polite" className="mb-3 text-sm text-fg-subtle">
          {status === 'ready' && trimmed && results.length > 0
            ? countLabel(results.length, total)
            : ''}
        </p>
        {status === 'ready' && trimmed && results.length === 0 && (
          <p className="text-sm text-fg-muted">
            一致する記事はありません。
            <Link to="/index" className="text-link underline underline-offset-4">
              索引から探す →
            </Link>
          </p>
        )}
        {trimmed && indexHits.length > 0 && <ResultList hits={indexHits} query={trimmed} />}
        {trimmed && bodyHits.length > 0 && (
          <section aria-labelledby="body-hits-title" className={indexHits.length > 0 ? 'mt-6' : ''}>
            <h2 id="body-hits-title" className="mb-1 px-1 text-[11px] text-fg-subtle">
              本文に一致
            </h2>
            <ResultList hits={bodyHits} query={trimmed} />
          </section>
        )}
        {total > results.length && trimmed && (
          <button
            type="button"
            onClick={() => setLimit(limit + PAGE_SIZE)}
            className="mt-4 h-9 rounded border border-line-input px-4 text-sm text-fg hover:bg-muted"
          >
            さらに表示
          </button>
        )}
      </div>
    </WikiShell>
  );
}
