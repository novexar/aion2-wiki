import type { ReactNode } from 'react';

const TONE = {
  default: 'border-line bg-canvas text-fg-subtle',
  header: 'border-white/22 bg-white/6 text-header-muted',
} as const;

export function Kbd({
  children,
  tone = 'default',
}: {
  readonly children: ReactNode;
  readonly tone?: keyof typeof TONE;
}) {
  return (
    <kbd
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-sans text-[11px] font-medium ${TONE[tone]}`}
    >
      {children}
    </kbd>
  );
}
