export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-fg text-canvas border-transparent hover:bg-fg/85 active:bg-fg/75 disabled:bg-fg/40',
  secondary:
    'bg-canvas text-fg border-line-input hover:bg-muted active:bg-line disabled:text-fg-subtle',
  ghost:
    'bg-transparent text-fg-muted border-transparent hover:bg-muted hover:text-fg active:bg-line disabled:text-fg-subtle',
  danger:
    'bg-canvas text-danger border-danger-line hover:bg-danger-bg active:bg-danger-bg disabled:opacity-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
};

export function buttonClass(variant: Variant = 'secondary', size: Size = 'md'): string {
  return `inline-flex items-center justify-center rounded border font-medium whitespace-nowrap transition-[color,background-color,border-color,scale] active:scale-[.98] disabled:active:scale-100 motion-reduce:active:scale-100 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]}`;
}
