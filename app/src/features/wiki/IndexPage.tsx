import { Filter, X } from 'lucide-react';
import { useMemo, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { CONFIDENCE_INFO } from '../../lib/confidence';
import { categoryLabel } from '../../lib/categories';
import { articlePath } from '../../lib/paths';
import { Breadcrumb } from './Breadcrumb';
import { nav } from './data';
import { groupArticles, INDEX_VIEWS, isIndexView, tagCounts, type IndexView } from './index-groups';

export default function IndexPage() {
  useDocumentMeta('索引', '記事を五十音・A–Z・カテゴリ・タグで一覧できます。');
  const [params, setParams] = useSearchParams();
  const rawView = params.get('view');
  const view: IndexView = isIndexView(rawView) ? rawView : 'kana';
  const tag = params.get('tag');
  const filter = params.get('q') ?? '';

  const update = (patch: Record<string, string | null>): void => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const groups = useMemo(
    () => groupArticles(nav.articles, view, { filter, tag }),
    [view, filter, tag],
  );
  const tags = useMemo(() => tagCounts(nav.articles), []);
  const total = groups.reduce((n, g) => n + g.entries.length, 0);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = INDEX_VIEWS[(index + delta + INDEX_VIEWS.length) % INDEX_VIEWS.length];
    if (!next) return;
    update({ view: next.value, tag: null });
    document.getElementById(`tab-${next.value}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Breadcrumb items={[{ label: 'ホーム', to: '/' }, { label: '索引' }]} />
      <h1 className="text-[1.75rem] font-bold tracking-tight">索引</h1>
      <p className="mt-2 text-fg-muted">
        全 {nav.articles.length} 記事。別名（英語名・別表記）でも引けます。
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="索引の種類"
          className="inline-flex rounded-lg border border-line bg-surface p-0.5"
        >
          {INDEX_VIEWS.map((v, i) => (
            <button
              key={v.value}
              id={`tab-${v.value}`}
              type="button"
              role="tab"
              aria-selected={view === v.value}
              aria-controls="index-panel"
              tabIndex={view === v.value ? 0 : -1}
              onClick={() => update({ view: v.value, tag: null })}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                view === v.value
                  ? 'bg-canvas font-medium text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-64">
          <span className="sr-only">一覧を絞り込む</span>
          <Filter
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-subtle"
          />
          <input
            type="search"
            value={filter}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="絞り込み"
            className="h-9 w-full rounded-md border border-line bg-canvas pr-3 pl-8 text-sm placeholder:text-fg-subtle hover:border-line-strong focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      {view === 'tag' && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="タグで絞り込み">
          {tags.map(({ tag: t, count }) => {
            const selected = tag === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ tag: selected ? null : t })}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                  selected
                    ? 'border-accent bg-accent-soft font-medium text-fg'
                    : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                }`}
              >
                #{t}
                <span className="text-fg-subtle tabular-nums">{count}</span>
                {selected && <X aria-hidden="true" className="size-3" />}
              </button>
            );
          })}
        </div>
      )}

      <div id="index-panel" role="tabpanel" aria-labelledby={`tab-${view}`} className="mt-8">
        {groups.length > 1 && (
          <nav aria-label="見出しへ移動" className="mb-6 flex flex-wrap gap-1">
            {groups.map((g) => (
              <a
                key={g.key}
                href={`#idx-${encodeURIComponent(g.key)}`}
                className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-line px-1.5 text-xs text-fg-muted hover:border-line-strong hover:text-fg"
              >
                {g.label}
              </a>
            ))}
          </nav>
        )}

        {total === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-10 text-center text-sm text-fg-muted">
            {nav.articles.length === 0
              ? '記事は準備中です。'
              : view === 'latin'
                ? '英語名のある記事が見つかりません。'
                : '条件に一致する記事がありません。'}
          </p>
        ) : (
          <div className="space-y-10">
            {groups.map((g) => (
              <section key={g.key} id={`idx-${g.key}`} aria-labelledby={`idx-h-${g.key}`}>
                <h2
                  id={`idx-h-${g.key}`}
                  className="mb-2 border-b border-line pb-2 text-sm font-semibold text-fg"
                >
                  {g.label}
                  <span className="ml-2 font-normal text-fg-subtle tabular-nums">
                    {g.entries.length}
                  </span>
                </h2>
                <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  {g.entries.map(({ article: a, label }) => (
                    <li key={`${g.key}-${a.id}`}>
                      <Link
                        to={articlePath(a.category, a.id)}
                        className="group flex items-baseline gap-2 rounded px-1 py-1.5 hover:bg-surface"
                      >
                        <span
                          aria-hidden="true"
                          className={`size-1.5 shrink-0 translate-y-[-2px] rounded-full ${CONFIDENCE_INFO[a.confidence].dot}`}
                        />
                        <span className="min-w-0">
                          <span className="text-sm text-fg group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
                            {label}
                          </span>
                          {label !== a.title && (
                            <span className="ml-2 text-xs text-fg-muted">{a.title}</span>
                          )}
                          {label === a.title && a.aliases.length > 0 && (
                            <span className="ml-2 text-xs text-fg-subtle">
                              {a.aliases.join(' / ')}
                            </span>
                          )}
                          {view !== 'category' && (
                            <span className="ml-2 text-xs text-fg-subtle">
                              · {categoryLabel(a.category)}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
