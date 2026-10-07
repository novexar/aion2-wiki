import { FileText } from 'lucide-react';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { Highlighted } from '../../components/Highlighted';
import { categoryLabel } from '../../lib/categories';
import { highlight, makeSnippet } from '../../lib/highlight';
import type { PageHit } from '../../lib/search';

interface SearchResultRowProps {
  readonly hit: PageHit;
  readonly query: string;
  readonly compact?: boolean;
}

/** 検索結果 1 件の表示（パレットと検索ページで共用） */
export function SearchResultRow({ hit, query, compact = false }: SearchResultRowProps) {
  return (
    <div className="flex min-w-0 gap-3">
      <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-fg">
            <Highlighted segments={highlight(hit.title, query)} />
          </span>
          <span className="shrink-0 text-xs text-fg-subtle">{categoryLabel(hit.category)}</span>
          <span className="ml-auto">
            <ConfidenceBadge confidence={hit.confidence} size="sm" />
          </span>
        </div>
        {hit.aliases && (
          <div className="mt-0.5 truncate text-xs text-fg-subtle">
            <Highlighted segments={highlight(hit.aliases, query)} />
          </div>
        )}
        <p
          className={`mt-1 text-[13px] leading-relaxed text-fg-muted ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}
        >
          <Highlighted segments={makeSnippet(hit.summary, query, compact ? 80 : 160)} />
        </p>
      </div>
    </div>
  );
}
