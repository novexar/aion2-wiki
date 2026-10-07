import type { Confidence } from './types';

export const CONFIDENCE_INFO: Record<
  Confidence,
  { label: string; description: string; className: string; dot: string }
> = {
  official: {
    label: '公式',
    description: 'NCSOFT の公式情報で確認済み',
    className: 'text-ok bg-ok-bg border-ok-line',
    dot: 'bg-ok',
  },
  verified: {
    label: '検証済み',
    description: '独立した 2 つ以上の資料で一致',
    className: 'text-info bg-info-bg border-info-line',
    dot: 'bg-info',
  },
  community: {
    label: '要確認',
    description: '1 つの資料または実プレイ報告に基づく情報',
    className: 'text-warn bg-warn-bg border-warn-line',
    dot: 'bg-warn',
  },
};
