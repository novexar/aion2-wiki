import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toc } from './Toc';
import { ACTIVE_LINE_RATIO, pickActiveHeading, useActiveHeading } from './useActiveHeading';

describe('pickActiveHeading', () => {
  const vh = 1000; // 30% の線は 300px

  it('returns the last heading at or above the upper 30% line', () => {
    const positions = [
      { id: 'a', top: -400 },
      { id: 'b', top: 250 },
      { id: 'c', top: 600 },
    ];
    expect(pickActiveHeading(positions, vh)).toBe('b');
    expect(ACTIVE_LINE_RATIO).toBe(0.3);
  });

  it('keeps a heading above the viewport current while the next one is below the line', () => {
    expect(
      pickActiveHeading(
        [
          { id: 'a', top: -900 },
          { id: 'b', top: 700 },
        ],
        vh,
      ),
    ).toBe('a');
  });

  it('returns null before the first heading reaches the line', () => {
    expect(pickActiveHeading([{ id: 'a', top: 500 }], vh)).toBeNull();
  });

  it('picks the last heading at the bottom of the page', () => {
    expect(
      pickActiveHeading(
        [
          { id: 'a', top: 100 },
          { id: 'b', top: 800 },
        ],
        vh,
        true,
      ),
    ).toBe('b');
  });
});

describe('useActiveHeading', () => {
  const tops: Record<string, number> = {};
  const frames: FrameRequestCallback[] = [];
  const flush = (): void => {
    for (const cb of frames.splice(0)) cb(0);
  };

  beforeEach(() => {
    document.body.innerHTML = '<h2 id="a"></h2><h2 id="b"></h2><h3 id="c"></h3>';
    for (const id of ['a', 'b', 'c']) {
      const el = document.getElementById(id);
      if (el) el.getBoundingClientRect = () => ({ top: tops[id] ?? 0 }) as DOMRect;
    }
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('follows the heading in view as the page scrolls', () => {
    Object.assign(tops, { a: 100, b: 800, c: 1200 });
    const { result } = renderHook(() => useActiveHeading(['a', 'b', 'c']));
    act(flush);
    expect(result.current).toBe('a');

    Object.assign(tops, { a: -500, b: 200, c: 600 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      flush();
    });
    expect(result.current).toBe('b');

    Object.assign(tops, { a: -900, b: -200, c: 250 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      flush();
    });
    expect(result.current).toBe('c');
  });
});

describe('Toc scroll-spy rendering', () => {
  const headings = [
    { id: 'a', text: 'A', depth: 2 as const },
    { id: 'b', text: 'B', depth: 3 as const },
    { id: 'c', text: 'C', depth: 2 as const },
  ];

  it('marks the active row bold with the accent bar and lightly emphasizes its parent h2', () => {
    render(<Toc headings={headings} activeId="b" />);
    expect(screen.getByText('B')).toHaveClass('border-accent', 'font-bold', 'pl-6');
    expect(screen.getByText('B')).toHaveAttribute('aria-current', 'location');
    expect(screen.getByText('A')).toHaveClass('text-fg');
    expect(screen.getByText('A')).not.toHaveClass('border-accent');
    expect(screen.getByText('C')).toHaveClass('text-fg-muted');
  });

  it('scrolls to the heading and updates the hash on click', () => {
    document.body.insertAdjacentHTML('beforeend', '<h2 id="c"></h2>');
    const target = document.getElementById('c');
    const scrollIntoView = vi.fn();
    if (target) target.scrollIntoView = scrollIntoView;
    render(<Toc headings={headings} activeId={null} />);
    fireEvent.click(screen.getByText('C'));
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
    expect(window.location.hash).toBe('#c');
  });

  it('offers a plain link back to the top', () => {
    render(<Toc headings={headings} activeId={null} />);
    expect(screen.getByText('ページ上部へ')).toHaveAttribute('href', '#main');
  });
});
