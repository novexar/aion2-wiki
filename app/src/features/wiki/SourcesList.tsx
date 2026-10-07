import { ExternalLink } from 'lucide-react';
import type { Source, SourceKind } from '../../lib/types';

const KIND_LABEL: Record<SourceKind, string> = {
  official: '公式',
  database: 'データベース',
  guide: '攻略サイト',
  community: 'コミュニティ',
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SourcesList({ sources }: { readonly sources: readonly Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="sources" className="mt-14 max-w-[72ch]">
      <h2 id="sources" className="mb-3 text-base font-semibold tracking-tight">
        出典
      </h2>
      <ol className="divide-y divide-line rounded-lg border border-line text-sm">
        {sources.map((s) => (
          <li
            key={s.id}
            id={`source-${s.id}`}
            className="flex gap-3 px-4 py-3 target:bg-accent-soft"
          >
            <span className="w-9 shrink-0 font-mono text-xs leading-6 text-fg-subtle">{s.id}</span>
            <div className="min-w-0 flex-1">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg"
              >
                <span className="break-words">{s.title}</span>
                <ExternalLink aria-hidden="true" className="mt-1 size-3 shrink-0 text-fg-subtle" />
                <span className="sr-only">（新しいタブで開く）</span>
              </a>
              <p className="mt-0.5 text-xs text-fg-subtle">
                {KIND_LABEL[s.kind]} · {hostname(s.url)} · 参照{' '}
                <time dateTime={s.date}>{s.date}</time>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
