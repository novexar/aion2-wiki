import { AlertTriangle, BadgeCheck, ShieldCheck } from 'lucide-react';
import { CONFIDENCE_INFO } from '../lib/confidence';
import type { Confidence } from '../lib/types';

const ICONS = { official: ShieldCheck, verified: BadgeCheck, community: AlertTriangle } as const;

interface ConfidenceBadgeProps {
  readonly confidence: Confidence;
  readonly size?: 'sm' | 'md';
}

export function ConfidenceBadge({ confidence, size = 'md' }: ConfidenceBadgeProps) {
  const info = CONFIDENCE_INFO[confidence];
  const Icon = ICONS[confidence];
  const sizing = size === 'sm' ? 'h-5 px-1.5 text-[11px] gap-1' : 'h-6 px-2 text-xs gap-1.5';
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border font-medium whitespace-nowrap ${sizing} ${info.className}`}
      title={info.description}
    >
      <Icon aria-hidden="true" className={size === 'sm' ? 'size-3' : 'size-3.5'} />
      <span>
        <span className="sr-only">信頼度: </span>
        {info.label}
      </span>
    </span>
  );
}
