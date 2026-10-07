import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SearchPaletteContext, type SearchPaletteApi } from './search-context';

const CommandPalette = lazy(() => import('./CommandPalette'));

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/** ⌘K / Ctrl+K（と「/」）でコマンドパレットを開くプロバイダー */
export function SearchProvider({ children }: { readonly children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((query = '') => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setInitialQuery(query);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // 開く前にフォーカスしていた要素へ戻す
    window.setTimeout(() => returnFocus.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isShortcut) {
        event.preventDefault();
        if (isOpen) close();
        else open();
        return;
      }
      if (event.key === '/' && !isOpen && !isTypingTarget(event.target)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, open, close]);

  const api = useMemo<SearchPaletteApi>(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <SearchPaletteContext.Provider value={api}>
      {children}
      {isOpen && (
        <Suspense fallback={null}>
          <CommandPalette initialQuery={initialQuery} onClose={close} />
        </Suspense>
      )}
    </SearchPaletteContext.Provider>
  );
}
