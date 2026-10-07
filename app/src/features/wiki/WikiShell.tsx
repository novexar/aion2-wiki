import type { ReactNode } from 'react';
import { CategoryNav } from '../../components/CategoryNav';

interface WikiShellProps {
  readonly children: ReactNode;
  readonly aside?: ReactNode;
}

/** 左サイドバー + 本文 + 右カラム（目次）の 3 カラムレイアウト */
export function WikiShell({ children, aside }: WikiShellProps) {
  return (
    <div className="mx-auto grid max-w-[90rem] grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
      <aside className="hidden border-r border-line lg:block" aria-label="サイドバー">
        <div className="scroll-thin sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] overflow-y-auto px-3 py-6">
          <CategoryNav />
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">{children}</div>
      <aside className="hidden xl:block" aria-label="ページ内の補助情報">
        <div className="scroll-thin sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] overflow-y-auto py-8 pr-5">
          {aside}
        </div>
      </aside>
    </div>
  );
}
