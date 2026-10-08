import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, type MouseEvent } from 'react';
import { DURATION, EASE } from '../../lib/motion-tokens';
import type { Heading } from '../../lib/types';
import { useShellColumns } from '../../lib/shell-layout';
import { REDUCED_MOTION_QUERY } from '../../lib/useMediaQuery';

/** 目次を出す最小の見出し数 */
const MIN_TOC_HEADINGS = 2;

interface TocProps {
  readonly headings: readonly Heading[];
  readonly activeId: string | null;
}

/** h3 ID → 直前の h2 ID */
function parentMap(headings: readonly Heading[]): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  let h2: string | null = null;
  for (const h of headings) {
    if (h.depth === 2) h2 = h.id;
    else if (h2) map.set(h.id, h2);
  }
  return map;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** 見出しへスクロールし（reduced motion では即時）、URL の #hash を更新する */
function scrollToHeading(event: MouseEvent<HTMLAnchorElement>, id: string): void {
  if (!isPlainClick(event)) return;
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  window.history.replaceState(window.history.state, '', `#${encodeURIComponent(id)}`);
}

function scrollToTop(event: MouseEvent<HTMLAnchorElement>): void {
  if (!isPlainClick(event)) return;
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', pathname + search);
}

function itemClass(isActive: boolean, isParent: boolean): string {
  if (isActive) return 'font-bold text-fg';
  if (isParent) return 'text-fg';
  return 'text-fg-muted hover:text-fg';
}

/** 現在位置の金線。layoutId で見出し間を滑らせる（200ms ease-out、reduced motion では即時） */
function TocMarker() {
  return (
    <motion.span
      layoutId="toc-marker"
      aria-hidden="true"
      data-toc-marker=""
      className="absolute inset-y-0 -left-px w-0.5 bg-accent"
      transition={{ duration: DURATION.base, ease: EASE.out }}
    />
  );
}

function TocList({ headings, activeId }: TocProps) {
  const parentId = activeId ? parentMap(headings).get(activeId) : undefined;
  return (
    <ul className="border-l border-line text-[13px]">
      {headings.map((h) => {
        const isActive = h.id === activeId;
        return (
          <li key={h.id} className="relative">
            {isActive && <TocMarker />}
            <a
              href={`#${encodeURIComponent(h.id)}`}
              onClick={(e) => scrollToHeading(e, h.id)}
              aria-current={isActive ? 'location' : undefined}
              data-toc-id={h.id}
              className={`-ml-px block border-l-2 border-transparent py-1 pr-1 leading-snug ${h.depth === 3 ? 'pl-6' : 'pl-3'} ${itemClass(isActive, h.id === parentId)}`}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** 現在の行が目次の表示範囲から外れたら、目次だけをスクロールして見せる */
function useKeepActiveVisible(activeId: string | null) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    if (!box || !activeId) return;
    const item = box.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!item) return;
    const top = item.offsetTop;
    if (top < box.scrollTop || top + item.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }, [activeId]);
  return ref;
}

/** 右カラムの目次（lg 以上）。sticky で本文の右に常時表示し、現在の見出しを強調する */
export function Toc({ headings, activeId }: TocProps) {
  const wide = useShellColumns().toc;
  const ref = useKeepActiveVisible(activeId);
  if (headings.length < MIN_TOC_HEADINGS || !wide) return null;
  return (
    <nav
      aria-label="目次"
      className="sticky top-[calc(var(--header-h)+1rem)] flex max-h-[calc(100dvh-var(--header-h)-2rem)] flex-col"
    >
      <p className="mb-2 text-xs font-bold text-fg">目次</p>
      {/* relative: 子の offsetTop をこの箱基準にする */}
      <motion.div ref={ref} layoutScroll className="scroll-thin relative min-h-0 overflow-y-auto">
        <TocList headings={headings} activeId={activeId} />
      </motion.div>
      <a
        href="#main"
        onClick={scrollToTop}
        className="mt-3 text-xs text-fg-muted hover:text-fg hover:underline"
      >
        ページ上部へ
      </a>
    </nav>
  );
}

/** 折りたたみ式の目次（lg 未満）。Toc とはどちらか一方だけが描画される */
export function MobileToc({ headings, activeId }: TocProps) {
  const wide = useShellColumns().toc;
  if (headings.length < MIN_TOC_HEADINGS || wide) return null;
  return (
    <details className="toc-details group mb-8 border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2.5 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
        <span>目次</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-fg-subtle transition-transform duration-200 ease-std group-open:rotate-180"
        />
      </summary>
      <nav aria-label="目次" className="pb-3">
        <TocList headings={headings} activeId={activeId} />
      </nav>
    </details>
  );
}
