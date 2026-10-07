import { CONFIDENCE_INFO } from '../lib/confidence';
import type { Confidence } from '../lib/types';

interface ConfidenceBadgeProps {
  readonly confidence: Confidence;
  readonly size?: 'sm' | 'md';
}

const TITLES: Partial<Record<Confidence, string>> = {
  community: '資料が 1 つの記述を含みます',
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const info = CONFIDENCE_INFO[confidence];
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] whitespace-nowrap ${info.className}`}
      title={TITLES[confidence] ?? info.description}
    >
      <span className="sr-only">信頼度: </span>
      {info.label}
    </span>
  );
}
