import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export interface Crumb {
  readonly label: string;
  readonly to?: string;
}

export function Breadcrumb({ items }: { readonly items: readonly Crumb[] }) {
  return (
    <nav aria-label="パンくずリスト" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-fg-subtle">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {item.to && !isLast ? (
                <Link to={item.to} className="rounded hover:text-fg">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`truncate ${isLast ? 'text-fg-muted' : ''}`}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
