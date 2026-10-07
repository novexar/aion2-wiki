import type { ReactNode } from 'react';
import { CategoryNav } from '../../components/CategoryNav';
import { PAGE_CONTAINER } from '../../lib/layout';

interface WikiShellProps {
  readonly children: ReactNode;
  readonly aside?: ReactNode;
}

/** 左サイドバー + 本文（残り幅すべて）+ 右カラム（目次）の 3 カラムレイアウト */
export function WikiShell({ children, aside }: WikiShellProps) {
  return (
    <div
      className={`${PAGE_CONTAINER} grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[16rem_minmax(0,1fr)_15rem]`}
    >
      <aside className="hidden border-r border-line lg:block" aria-label="サイドバー">
        <div className="scroll-thin sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] overflow-y-auto py-6 pr-3">
          <CategoryNav />
        </div>
      </aside>
      <div className="min-w-0 py-8">{children}</div>
      <aside className="hidden xl:block" aria-label="ページ内の補助情報">
        <div className="scroll-thin sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] overflow-y-auto py-8">
          {aside}
        </div>
      </aside>
    </div>
  );
}
