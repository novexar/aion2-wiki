import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { articlePath, categoryPath } from '../lib/paths';
import type { NavCategory } from '../lib/types';
import { nav } from '../features/wiki/data';

interface CategoryNavProps {
  readonly onNavigate?: () => void;
}

function CategorySection({
  category,
  isCurrent,
  onNavigate,
}: {
  readonly category: NavCategory;
  readonly isCurrent: boolean;
  readonly onNavigate?: () => void;
}) {
  // ユーザーが開閉するまでは現在のカテゴリだけを開く
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? isCurrent;
  const { slug } = useParams();
  const listId = `nav-${category.id}`;
  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setToggled(!open)}
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${category.label}を${open ? '閉じる' : '開く'}`}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded text-fg-subtle hover:bg-muted hover:text-fg"
        >
          <ChevronRight
            aria-hidden="true"
            className={`size-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </button>
        <NavLink
          to={categoryPath(category.id)}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-w-0 flex-1 items-center justify-between rounded-md px-1.5 py-1 text-[13px] font-medium ${
              isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
            }`
          }
        >
          <span className="truncate">{category.label}</span>
          <span className="text-[11px] font-normal text-fg-subtle tabular-nums">
            {category.articles.length}
          </span>
        </NavLink>
      </div>
      {open && (
        <ul id={listId} className="mt-0.5 mb-2 ml-3.5 border-l border-line pl-2">
          {category.articles.length === 0 && (
            <li className="px-2 py-1 text-xs text-fg-subtle">準備中</li>
          )}
          {category.articles.map((a) => (
            <li key={a.id}>
              <NavLink
                to={articlePath(category.id, a.id)}
                onClick={onNavigate}
                aria-current={slug === a.id ? 'page' : undefined}
                className={({ isActive }) =>
                  `-ml-[9px] block truncate border-l-2 py-1 pr-2 pl-3 text-[13px] leading-snug transition-colors ${
                    isActive
                      ? 'border-accent font-medium text-fg'
                      : 'border-transparent text-fg-muted hover:border-line-strong hover:text-fg'
                  }`
                }
              >
                {a.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** カテゴリ別ナビゲーション（サイドバー・モバイルドロワーで共用） */
export function CategoryNav({ onNavigate }: CategoryNavProps) {
  const { category } = useParams();
  return (
    <nav aria-label="カテゴリ">
      <ul className="space-y-0.5">
        {nav.categories.map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            isCurrent={c.id === category}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}
