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
      <h2 id="sources" className="mb-3 text-base font-semibold">
        出典
      </h2>
      <ol className="space-y-2 text-[13px]">
        {sources.map((s) => (
          <li key={s.id} id={`source-${s.id}`} className="flex gap-3 target:bg-accent-soft">
            <span className="w-9 shrink-0 font-mono text-xs leading-5 text-fg-subtle">{s.id}</span>
            <div className="min-w-0 flex-1">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg"
              >
                {s.title} ↗<span className="sr-only">（新しいタブで開く）</span>
              </a>
              <p className="text-fg-subtle">
                {KIND_LABEL[s.kind]} · {hostname(s.url)} · <time dateTime={s.date}>{s.date}</time>{' '}
                閲覧
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
