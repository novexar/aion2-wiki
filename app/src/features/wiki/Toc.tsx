import { ChevronDown } from 'lucide-react';
import type { Heading } from '../../lib/types';

interface TocProps {
  readonly headings: readonly Heading[];
  readonly activeId: string | null;
}

function TocList({ headings, activeId }: TocProps) {
  return (
    <ul className="space-y-0.5 border-l border-line text-[13px]">
      {headings.map((h) => {
        const isActive = h.id === activeId;
        return (
          <li key={h.id}>
            <a
              href={`#${encodeURIComponent(h.id)}`}
              aria-current={isActive ? 'location' : undefined}
              className={`-ml-px flex min-h-8 items-center border-l-2 py-1 leading-snug transition-colors ${h.depth === 3 ? 'pl-6' : 'pl-3'} ${
                isActive
                  ? 'border-accent font-medium text-fg'
                  : 'border-transparent text-fg-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** 右カラムの目次（デスクトップ） */
export function Toc({ headings, activeId }: TocProps) {
  if (headings.length === 0) return null;
  return (
    <nav aria-label="目次">
      <p className="mb-3 text-xs font-semibold text-fg">目次</p>
      <TocList headings={headings} activeId={activeId} />
    </nav>
  );
}

/** 折りたたみ式の目次（xl 未満） */
export function MobileToc({ headings, activeId }: TocProps) {
  if (headings.length === 0) return null;
  return (
    <details className="group mb-8 border-b border-line xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2.5 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
        <span>目次</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-fg-subtle transition-transform group-open:rotate-180"
        />
      </summary>
      <nav aria-label="目次" className="pb-3">
        <TocList headings={headings} activeId={activeId} />
      </nav>
    </details>
  );
}
