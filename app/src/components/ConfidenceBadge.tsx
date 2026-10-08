import { Link } from 'react-router';
import { CONFIDENCE_INFO } from '../lib/confidence';
import type { Confidence } from '../lib/types';

interface ConfidenceBadgeProps {
  readonly confidence: Confidence;
  readonly size?: 'sm' | 'md';
  /** 一覧用: 既定値の「検証済み」は表示しない */
  readonly hideVerified?: boolean;
  /** `/about#confidence` へのリンクにする（リンク内・About 内では使わない） */
  readonly linked?: boolean;
}

export function ConfidenceBadge({
  confidence,
  hideVerified = false,
  linked = false,
}: ConfidenceBadgeProps) {
  if (hideVerified && confidence === 'verified') return null;
  const info = CONFIDENCE_INFO[confidence];
  const className = `inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] whitespace-nowrap ${info.className}`;
  const content = (
    <>
      <span className="sr-only">信頼度: </span>
      {info.label}
    </>
  );
  if (linked) {
    return (
      <Link to="/about#confidence" className={`${className} hover:bg-muted`}>
        {content}
      </Link>
    );
  }
  return <span className={className}>{content}</span>;
}
