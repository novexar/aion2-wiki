import type { ReactNode } from 'react';
import { formatDate } from '../../lib/format';
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

export function SourcesList({
  sources,
  actions,
}: {
  readonly sources: readonly Source[];
  /** 出典見出しと同じ行の右端に置く操作（誤りの報告など） */
  readonly actions?: ReactNode;
}) {
  if (sources.length === 0)
    return actions ? <div className="mt-10 text-[13px]">{actions}</div> : null;
  return (
    <section aria-labelledby="sources" className="mt-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-line">
        <h2 id="sources" className="sec-title pb-[0.4em] text-xl leading-[1.4] font-bold">
          出典
        </h2>
        {actions && <div className="pb-2 text-[13px] text-fg-muted">{actions}</div>}
      </div>
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
                {KIND_LABEL[s.kind]} · {hostname(s.url)} ·{' '}
                <time dateTime={s.date}>{formatDate(s.date)}</time> 閲覧
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
