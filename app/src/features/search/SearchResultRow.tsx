import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { Highlighted } from '../../components/Highlighted';
import { categoryLabel } from '../../lib/categories';
import { highlight, makeContextSnippet, makeSnippet } from '../../lib/highlight';
import type { PageHit } from '../../lib/search';

interface SearchResultRowProps {
  readonly hit: PageHit;
  readonly query: string;
  readonly compact?: boolean;
}

/** クエリに一致した別名だけを返す */
function matchedAliases(aliases: string, query: string): string {
  return aliases
    .split(' / ')
    .filter((alias) => highlight(alias, query).some((s) => s.hit))
    .join('、');
}

/** 検索結果 1 件の表示（パレットと検索ページで共用） */
export function SearchResultRow({ hit, query, compact = false }: SearchResultRowProps) {
  const aliases = matchedAliases(hit.aliases, query);
  const snippet =
    (hit.text ? makeContextSnippet(hit.text, query, 80) : null) ??
    makeSnippet(hit.summary, query, compact ? 80 : 160);
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-fg">
          <Highlighted segments={highlight(hit.title, query)} />
        </span>
        <span className="shrink-0 text-xs text-fg-subtle">{categoryLabel(hit.category)}</span>
        <span className="ml-auto">
          <ConfidenceBadge confidence={hit.confidence} size="sm" hideVerified />
        </span>
      </div>
      {aliases && (
        <div className="mt-0.5 truncate text-xs text-fg-subtle">
          <Highlighted segments={highlight(aliases, query)} />
        </div>
      )}
      <p
        className={`mt-1 text-[13px] leading-relaxed text-fg-muted ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}
      >
        <Highlighted segments={snippet} />
      </p>
    </div>
  );
}
