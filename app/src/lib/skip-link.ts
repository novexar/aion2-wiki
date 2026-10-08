import type { MouseEvent } from 'react';

/** 本文カラム（#content）があればそこへフォーカスを移す。無いページは既定の #main へのジャンプに任せる */
export function skipToContent(event: MouseEvent<HTMLAnchorElement>): void {
  const target = document.getElementById('content');
  if (!target) return;
  event.preventDefault();
  target.focus();
  target.scrollIntoView({ block: 'start' });
}
