import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface MobileDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
}

/** モバイル用の左ドロワー。Esc・背景クリックで閉じ、フォーカスを内側に閉じ込める */
export function MobileDrawer({ open, onClose, title, children }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('button, a')?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="scroll-thin absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col overflow-y-auto border-r border-line bg-canvas"
      >
        <div className="sticky top-0 flex h-14 items-center justify-between border-b border-line bg-canvas px-4">
          <span className="text-sm font-semibold">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-muted hover:text-fg"
            aria-label="メニューを閉じる"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
