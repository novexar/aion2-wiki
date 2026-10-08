import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { CategoryNav } from '../../components/CategoryNav';
import { RouteFade } from '../../components/RouteFade';
import { PAGE_CONTAINER } from '../../lib/layout';
import { routeFadeScope } from '../../lib/route-motion';
import { useShellColumns, type ShellColumns } from '../../lib/shell-layout';

interface WikiShellProps {
  readonly children: ReactNode;
  readonly aside?: ReactNode;
  /** true なら右カラム（目次）を作らず、本文を右端まで広げる（カテゴリ一覧など目次の無いページ） */
  readonly wide?: boolean;
}

/** パネルが閉じているときはビューポート基準（lg/xl）、開いているときは残り幅から決めた列構成 */
function gridClass(columns: ShellColumns, wide: boolean): string {
  if (!columns.squeezed) {
    return 'grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)_13rem] lg:gap-x-8 xl:grid-cols-[18rem_minmax(0,1fr)_15rem] xl:gap-x-10';
  }
  if (!columns.sidebar) return 'grid-cols-1';
  return columns.toc && !wide
    ? 'grid-cols-[18rem_minmax(0,1fr)_13rem] gap-x-8'
    : 'grid-cols-[18rem_minmax(0,1fr)] gap-x-8';
}

/** 左サイドバー + 本文（残り幅すべて）+ 右カラム（目次）の 3 カラムレイアウト */
export function WikiShell({ children, aside, wide = false }: WikiShellProps) {
  const columns = useShellColumns();
  const { pathname } = useLocation();
  const showSidebar = columns.squeezed ? columns.sidebar : true;
  const showAside = !wide && (columns.squeezed ? columns.toc : true);
  const spanTwo = wide && !columns.squeezed;
  const mainClass = `min-w-0 py-8 ${spanTwo ? 'lg:col-span-2' : ''}`;
  return (
    <div className={`${PAGE_CONTAINER} grid ${gridClass(columns, wide)}`}>
      {showSidebar && (
        <aside
          className={`border-r border-line ${columns.squeezed ? 'block' : 'hidden lg:block'}`}
          aria-label="サイドバー"
        >
          <div className="scroll-thin sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] overflow-y-auto pt-4 pr-2 pb-16">
            <CategoryNav />
            <p className="mt-2 border-t border-line px-3 pt-3 text-sm">
              <Link to="/index" className="text-fg-muted hover:text-fg hover:underline">
                索引へ
              </Link>
            </p>
          </div>
        </aside>
      )}
      {routeFadeScope(pathname) === 'home' ? (
        <div className={mainClass}>{children}</div>
      ) : (
        <RouteFade className={mainClass}>{children}</RouteFade>
      )}
      {showAside && (
        // sticky は目次（nav）自身に付ける。aside は行の高さいっぱいに伸びるので末尾まで追従する
        <aside
          className={`py-8 ${columns.squeezed ? 'block' : 'hidden lg:block'}`}
          aria-label="ページ内の補助情報"
        >
          {aside}
        </aside>
      )}
    </div>
  );
}
