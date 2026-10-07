import type { Confidence } from './types';

export const CONFIDENCE_INFO: Record<
  Confidence,
  { label: string; description: string; className: string; dot: string }
> = {
  official: {
    label: '公式',
    description: '公式情報で確認',
    className: 'text-ok border-ok-line',
    dot: 'bg-ok',
  },
  verified: {
    label: '検証済み',
    description: '2 つ以上の資料で一致',
    className: 'text-info border-info-line',
    dot: 'bg-info',
  },
  community: {
    label: '要確認',
    description: '資料が 1 つ',
    className: 'text-warn border-warn-line',
    dot: 'bg-warn',
  },
};
