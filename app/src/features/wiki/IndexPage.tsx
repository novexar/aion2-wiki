import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { categoryLabel } from '../../lib/categories';
import { articlePath } from '../../lib/paths';
import { Breadcrumb } from './Breadcrumb';
import { nav } from './data';
import { groupArticles, INDEX_VIEWS, isIndexView, tagCounts, type IndexView } from './index-groups';

const MIN_TAG_COUNT = 3;

export default function IndexPage() {
  useDocumentMeta('索引', '全記事の索引（五十音・A–Z・カテゴリ・タグ）');
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
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = tags.filter((t) => showAllTags || t.count >= MIN_TAG_COUNT || t.tag === tag);
  const hiddenTagCount = tags.length - tags.filter((t) => t.count >= MIN_TAG_COUNT).length;
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
      <h1 className="text-[1.75rem] font-bold">索引</h1>
      <p className="mt-2 text-fg-muted">{nav.articles.length} 記事</p>

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
                view === v.value ? 'bg-canvas font-medium text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-64">
          <span className="sr-only">一覧を絞り込む</span>
          <input
            type="search"
            value={filter}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="タイトルで絞り込み"
            className="h-9 w-full rounded border border-line-input bg-canvas px-3 text-sm placeholder:text-fg-subtle hover:border-fg-subtle focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      {view === 'tag' && visibleTags.length > 0 && (
        <p className="mt-4 text-[13px] leading-relaxed text-fg-muted" aria-label="タグで絞り込み">
          {visibleTags.map(({ tag: t, count }, i) => {
            const selected = tag === t;
            return (
              <span key={t}>
                {i > 0 && '、'}
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update({ tag: selected ? null : t })}
                  className={`hover:underline ${selected ? 'font-bold text-fg underline' : 'text-fg'}`}
                >
                  {t}
                </button>
                <span className="text-fg-subtle tabular-nums">（{count}）</span>
              </span>
            );
          })}
          {hiddenTagCount > 0 && (
            <>
              {'　'}
              <button
                type="button"
                onClick={() => setShowAllTags((v) => !v)}
                className="text-fg underline"
              >
                {showAllTags ? '件数の多いタグのみ' : `すべて表示（${tags.length}）`}
              </button>
            </>
          )}
        </p>
      )}

      <div id="index-panel" role="tabpanel" aria-labelledby={`tab-${view}`} className="mt-8">
        {groups.length > 1 && (
          <nav aria-label="見出しへ移動" className="mb-6 flex flex-wrap gap-1">
            {groups.map((g) => (
              <a
                key={g.key}
                href={`#idx-${encodeURIComponent(g.key)}`}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-line px-1.5 text-xs text-fg-muted hover:border-line-strong hover:text-fg"
              >
                {g.label}
              </a>
            ))}
          </nav>
        )}

        {total === 0 ? (
          <p className="text-sm text-fg-muted">該当する記事はありません。</p>
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
                <ul className="grid grid-cols-1 gap-x-8 xl:grid-cols-2">
                  {g.entries.map(({ article: a, label }) => {
                    const names =
                      label === a.title
                        ? a.aliases
                        : [a.title, ...a.aliases.filter((x) => x !== label)];
                    return (
                      <li key={`${g.key}-${a.id}`}>
                        <Link
                          to={articlePath(a.category, a.id)}
                          className="group flex items-baseline gap-2 px-1 py-1.5 hover:bg-surface"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="text-sm text-fg group-hover:underline">{label}</span>
                            {names.length > 0 && (
                              <span className="text-xs text-fg-muted">
                                {' — '}
                                {names.join('、')}
                              </span>
                            )}
                            {a.confidence === 'community' && (
                              <span className="ml-2 text-xs text-warn">要確認</span>
                            )}
                          </span>
                          {view !== 'category' && (
                            <span className="w-24 shrink-0 text-right text-xs text-fg-subtle">
                              {categoryLabel(a.category)}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
