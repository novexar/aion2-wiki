import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import {
  PANEL_DEFAULT_WIDTH,
  PANEL_MAX_WIDTH,
  PANEL_MIN_WIDTH,
  commitChatPanelWidth,
  setChatPanelWidth,
} from './chat-panel-store';

const KEY_STEP = 16;

interface ResizeHandleProps {
  readonly width: number;
  /** ドラッグの開始・終了を通知する（パネル側で transition を止める） */
  readonly onResizingChange?: (resizing: boolean) => void;
}

/** パネル左端のつまみ。ドラッグか ←/→ キーで幅を変える（Home で既定幅） */
export function ResizeHandle({ width, onResizingChange }: ResizeHandleProps) {
  const dragging = useRef(false);
  const frame = useRef(0);
  const pending = useRef<number | null>(null);
  const notify = useRef(onResizingChange);
  useEffect(() => {
    notify.current = onResizingChange;
  }, [onResizingChange]);

  const flush = useCallback((): void => {
    frame.current = 0;
    if (pending.current === null) return;
    setChatPanelWidth(pending.current, false);
    pending.current = null;
  }, []);
  /** ドラッグを終える（pointerup / cancel / capture 喪失 / unmount のどれでも 1 回だけ） */
  const finish = useCallback((): void => {
    if (!dragging.current) return;
    dragging.current = false;
    cancelAnimationFrame(frame.current);
    flush();
    commitChatPanelWidth();
    notify.current?.(false);
    document.body.style.userSelect = '';
  }, [flush]);
  useEffect(() => finish, [finish]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragging.current = true;
    onResizingChange?.(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.userSelect = 'none';
  };
  // 移動ごとの再描画をフレームに 1 回へまとめる
  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!dragging.current) return;
    pending.current = window.innerWidth - event.clientX;
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (dragging.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finish();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const delta = { ArrowLeft: KEY_STEP, ArrowRight: -KEY_STEP }[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      setChatPanelWidth(width + delta);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setChatPanelWidth(PANEL_DEFAULT_WIDTH);
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="AI チャットの幅"
      aria-valuemin={PANEL_MIN_WIDTH}
      aria-valuemax={PANEL_MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      title="ドラッグで幅を変更"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={finish}
      onKeyDown={onKeyDown}
      className="absolute inset-y-0 -left-1 z-10 w-2 cursor-col-resize touch-none after:absolute after:inset-y-0 after:left-1 after:w-px after:bg-line hover:after:bg-fg-subtle focus-visible:outline-none focus-visible:after:w-0.5 focus-visible:after:bg-accent"
    />
  );
}
