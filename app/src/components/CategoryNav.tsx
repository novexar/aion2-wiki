import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { articlePath, categoryPath } from '../lib/paths';
import type { NavCategory } from '../lib/types';
import { nav } from '../features/wiki/data';

interface CategoryNavProps {
  readonly onNavigate?: () => void;
}

/** 行の共通クラス: 高さ 40px（モバイル 44px）、15px、左右 12px、行全体がクリック領域 */
const ROW = 'flex min-h-11 w-full items-center px-3 py-1.5 text-[15px] leading-snug lg:min-h-10';

/** 記事行。現在地は左 3px のアクセント線＋surface 背景、hover は背景のみ。長い題名は 2 行まで折り返す */
function linkClass({ isActive }: { readonly isActive: boolean }): string {
  return `${ROW} border-l-[3px] pl-[33px] ${
    isActive
      ? 'border-accent bg-surface font-medium text-fg'
      : 'border-transparent text-fg-muted hover:bg-muted hover:text-fg'
  }`;
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
  // 閉じるアニメーションの間だけ一覧を残す。アニメーションはユーザーの開閉時のみ（初回表示・遷移では即時）
  const [rendered, setRendered] = useState(open);
  if (open && !rendered) setRendered(true);
  const animated = toggled !== null;
  const show = open || (rendered && animated);
  const { slug } = useParams();
  const listId = `nav-${category.id}`;
  return (
    <li>
      <button
        type="button"
        onClick={() => setToggled(!open)}
        aria-expanded={open}
        aria-controls={listId}
        className={`${ROW} gap-2 text-left font-semibold text-fg hover:bg-muted`}
      >
        <ChevronRight
          aria-hidden="true"
          className={`size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-std ${open ? 'rotate-90' : ''}`}
        />
        <span className="min-w-0 flex-1">{category.label}</span>
        <span className="text-[13px] font-normal text-fg-subtle tabular-nums">
          {category.articles.length}
        </span>
      </button>
      {show && (
        <div
          className={`nav-collapse ${animated ? 'nav-collapse-anim' : ''}`}
          data-open={open || undefined}
          inert={!open}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && !open) setRendered(false);
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <ul id={listId} className="mb-2">
              <li>
                <NavLink
                  to={categoryPath(category.id)}
                  end
                  onClick={onNavigate}
                  className={linkClass}
                >
                  一覧（{category.articles.length}）
                </NavLink>
              </li>
              {category.articles.length === 0 && (
                <li className="py-2 pl-10 text-[13px] text-fg-subtle">準備中</li>
              )}
              {category.articles.map((a) => (
                <li key={a.id}>
                  <NavLink
                    to={articlePath(category.id, a.id)}
                    onClick={onNavigate}
                    aria-current={slug === a.id ? 'page' : undefined}
                    className={linkClass}
                  >
                    {a.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

/** カテゴリ別ナビゲーション（サイドバー・モバイルドロワーで共用） */
export function CategoryNav({ onNavigate }: CategoryNavProps) {
  const { category } = useParams();
  return (
    <nav aria-label="カテゴリ">
      <ul>
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
