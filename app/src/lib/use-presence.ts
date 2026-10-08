import { useEffect, useState } from 'react';

export interface Presence {
  /** DOM に表示しておくか（開いている間と、閉じるアニメーションの間） */
  readonly visible: boolean;
  /** 閉じるアニメーションが終わったときに呼ぶ（transitionend） */
  readonly done: () => void;
}

/**
 * 閉じるアニメーションの間だけ表示を保つ。transitionend が来ない環境
 * （reduced motion で transition が実質 0、非表示タブなど）でも fallbackMs 後には閉じる
 */
export function usePresence(open: boolean, fallbackMs: number): Presence {
  const [visible, setVisible] = useState(open);
  if (open && !visible) setVisible(true);
  useEffect(() => {
    if (open || !visible) return undefined;
    const timer = window.setTimeout(() => setVisible(false), fallbackMs);
    return () => window.clearTimeout(timer);
  }, [open, visible, fallbackMs]);
  return {
    visible,
    done: () => {
      if (!open) setVisible(false);
    },
  };
}
