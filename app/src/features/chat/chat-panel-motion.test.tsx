import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CHAT_PANEL_ID, setChatPanelOpen } from './chat-panel-store';
import { ChatPanel } from './ChatPanel';

vi.mock('./ChatPanelBody', () => ({ default: () => <p>body</p> }));

const panel = () => document.getElementById(CHAT_PANEL_ID) as HTMLElement;

describe('ChatPanel のスライド', () => {
  afterEach(() => vi.useRealTimers());

  it('閉じるスライドの間は表示を保ち、transitionend で hidden にする', () => {
    render(<ChatPanel />);
    expect(panel()).not.toBeVisible();
    act(() => setChatPanelOpen(true));
    expect(panel()).toBeVisible();
    expect(panel()).toHaveAttribute('data-open');
    act(() => setChatPanelOpen(false));
    expect(panel()).not.toHaveAttribute('data-open');
    expect(panel()).not.toHaveAttribute('hidden');
    fireEvent.transitionEnd(panel());
    expect(panel()).toHaveAttribute('hidden');
  });

  it('transitionend が来なくても一定時間で hidden にする', () => {
    vi.useFakeTimers();
    render(<ChatPanel />);
    act(() => setChatPanelOpen(true));
    act(() => setChatPanelOpen(false));
    expect(panel()).not.toHaveAttribute('hidden');
    act(() => vi.advanceTimersByTime(300));
    expect(panel()).toHaveAttribute('hidden');
  });

  it('リサイズ中は data-resizing を付けて transition を止める', () => {
    render(<ChatPanel />);
    act(() => setChatPanelOpen(true));
    const handle = screen.getByRole('separator', { name: 'チャットの幅' });
    handle.setPointerCapture = () => undefined;
    handle.hasPointerCapture = () => false;
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1 });
    expect(panel()).toHaveAttribute('data-resizing');
    fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(panel()).not.toHaveAttribute('data-resizing');
  });
});
