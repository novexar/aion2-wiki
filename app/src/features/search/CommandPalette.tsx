import { ArrowDown, ArrowRight, ArrowUp, CornerDownLeft, Loader2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { Kbd } from '../../components/Kbd';
import { categoryLabel } from '../../lib/categories';
import { articlePath, searchPath } from '../../lib/paths';
import { nav } from '../wiki/data';
import { SearchResultRow } from './SearchResultRow';
import { useSearch } from './useSearch';

interface CommandPaletteProps {
  readonly initialQuery: string;
  readonly onClose: () => void;
}

interface PaletteItem {
  readonly key: string;
  readonly to: string;
  readonly render: () => React.ReactNode;
}

const QUICK_LINKS = [
  { to: '/index', label: '索引を開く' },
  { to: '/chat', label: 'Wiki に相談する（チャット）' },
  { to: '/about', label: 'このサイトについて' },
];

export default function CommandPalette({ initialQuery, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const listId = useId();
  const { status, results } = useSearch(query, { limit: 8 });
  const trimmed = query.trim();

  const items = useMemo<PaletteItem[]>(() => {
    if (!trimmed) {
      const recent = nav.articles.slice(0, 5).map((a) => ({
        key: `recent-${a.id}`,
        to: articlePath(a.category, a.id),
        render: () => (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{a.title}</span>
            <span className="shrink-0 text-xs text-fg-subtle">{categoryLabel(a.category)}</span>
          </span>
        ),
      }));
      const quick = QUICK_LINKS.map((l) => ({
        key: `quick-${l.to}`,
        to: l.to,
        render: () => <span>{l.label}</span>,
      }));
      return [...recent, ...quick];
    }
    const hits = results.map((hit) => ({
      key: hit.id,
      to: articlePath(hit.category, hit.id),
      render: () => <SearchResultRow hit={hit} query={trimmed} compact />,
    }));
    return [
      ...hits,
      {
        key: 'all-results',
        to: searchPath(trimmed),
        render: () => (
          <span className="flex items-center gap-2 text-fg-muted">
            <ArrowRight aria-hidden="true" className="size-4" />「{trimmed}」の検索結果をすべて表示
          </span>
        ),
      },
    ];
  }, [trimmed, results]);

  useEffect(() => {
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    return () => {
      document.body.style.overflow = previous;
      root?.removeAttribute('inert');
    };
  }, []);

  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const go = (to: string): void => {
    onClose();
    navigate(to);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((activeIndex + 1) % Math.max(items.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((activeIndex - 1 + items.length) % Math.max(items.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) go(item.to);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  const trapTab = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (event.key !== 'Tab') return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('input, button');
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const optionId = (i: number): string => `${listId}-opt-${i}`;
  const sectionLabel = trimmed ? '検索結果' : '最近の更新とショートカット';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[10vh] sm:px-4"
      role="presentation"
    >
      <motion.div
        className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60"
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12 }}
      />
      <motion.div
        ref={dialogRef}
        onKeyDown={trapTab}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内検索"
        className="relative flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-canvas shadow-pop"
        initial={{ opacity: 0, y: -6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          {status === 'loading' && trimmed ? (
            <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin text-fg-subtle" />
          ) : (
            <Search aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={items.length > 0 ? optionId(activeIndex) : undefined}
            aria-label="記事を検索"
            placeholder="記事・用語・英語名で検索"
            className="h-13 min-w-0 flex-1 bg-transparent text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded px-1.5 py-0.5 text-xs text-fg-subtle hover:bg-muted hover:text-fg"
          >
            Esc
          </button>
        </div>

        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2">
          <div className="px-2 pt-1 pb-1.5 text-[11px] font-medium tracking-wide text-fg-subtle">
            {sectionLabel}
          </div>
          {status === 'error' && (
            <p className="px-2 py-6 text-center text-sm text-danger">
              検索インデックスを読み込めませんでした。
            </p>
          )}
          {trimmed && status === 'ready' && results.length === 0 && (
            <p className="px-2 pt-4 pb-2 text-center text-sm text-fg-muted">
              「{trimmed}」に一致する記事は見つかりませんでした。
            </p>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={sectionLabel}
            className="space-y-0.5"
          >
            {items.map((item, i) => (
              <li
                key={item.key}
                id={optionId(i)}
                data-index={i}
                role="option"
                aria-selected={i === activeIndex}
                onMouseMove={() => i !== activeIndex && setActive(i)}
                onClick={() => go(item.to)}
                className={`cursor-pointer rounded-md px-2.5 py-2 text-sm ${
                  i === activeIndex ? 'bg-muted text-fg' : 'text-fg-muted'
                }`}
              >
                {item.render()}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-4 border-t border-line bg-surface px-4 py-2 text-[11px] text-fg-subtle sm:flex">
          <span className="flex items-center gap-1">
            <Kbd>
              <ArrowUp aria-hidden="true" className="size-3" />
            </Kbd>
            <Kbd>
              <ArrowDown aria-hidden="true" className="size-3" />
            </Kbd>
            移動
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeft aria-hidden="true" className="size-3" />
            </Kbd>
            開く
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd>閉じる
          </span>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
