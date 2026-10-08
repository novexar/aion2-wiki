import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prefetchChat, resetPrefetchForTest } from './chat-prefetch';

beforeEach(() => resetPrefetchForTest());

describe('prefetchChat', () => {
  it('runs every loader once, only when the scheduler fires', () => {
    const a = vi.fn(() => Promise.resolve());
    const b = vi.fn(() => Promise.resolve());
    let fire: () => void = () => undefined;
    const schedule = vi.fn((cb: () => void) => {
      fire = cb;
    });
    prefetchChat([a, b], schedule);
    prefetchChat([a, b], schedule);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(a).not.toHaveBeenCalled();
    fire();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('ignores loader failures', () => {
    const fail = vi.fn(() => Promise.reject(new Error('offline')));
    prefetchChat([fail], (cb) => cb());
    expect(fail).toHaveBeenCalled();
  });
});
