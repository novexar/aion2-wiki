import type { ReactNode } from 'react';
import { CategoryNav } from '../../components/CategoryNav';
import { PAGE_CONTAINER } from '../../lib/layout';

interface WikiShellProps {
  readonly children: ReactNode;
  readonly aside?: ReactNode;
  /** true なら右カラム（目次）を作らず、本文を右端まで広げる（カテゴリ一覧など目次の無いページ） */
  readonly wide?: boolean;
}

/** 左サイドバー + 本文（残り幅すべて）+ 右カラム（目次、lg 以上）の 3 カラムレイアウト */
export function WikiShell({ children, aside, wide = false }: WikiShellProps) {
  return (
    <div
      className={`${PAGE_CONTAINER} grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_13rem] lg:gap-x-8 xl:grid-cols-[16rem_minmax(0,1fr)_15rem] xl:gap-x-10`}
    >
      <aside className="hidden border-r border-line lg:block" aria-label="サイドバー">
        <div className="scroll-thin sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] overflow-y-auto py-6 pr-3">
          <CategoryNav />
        </div>
      </aside>
      <div className={`min-w-0 py-8 ${wide ? 'lg:col-span-2' : ''}`}>{children}</div>
      {!wide && (
        // sticky は目次（nav）自身に付ける。aside は行の高さいっぱいに伸びるので末尾まで追従する
        <aside className="hidden py-8 lg:block" aria-label="ページ内の補助情報">
          {aside}
        </aside>
      )}
    </div>
  );
}
