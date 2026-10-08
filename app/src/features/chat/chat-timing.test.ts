import { describe, expect, it, vi } from 'vitest';
import { startChatTimer } from './chat-timing';

describe('startChatTimer', () => {
  it('logs search / first token / total once when enabled', () => {
    const clock = [0, 120, 900, 2100];
    const now = vi.fn(() => clock.shift() ?? 0);
    const log = vi.fn();
    const timer = startChatTimer(true, now, log);
    timer.retrieved();
    timer.firstToken();
    timer.firstToken();
    timer.done();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[chat] 検索 120ms / 初動 900ms / 合計 2100ms');
  });

  it('measures and logs nothing when disabled (production)', () => {
    const now = vi.fn(() => 0);
    const log = vi.fn();
    const timer = startChatTimer(false, now, log);
    timer.retrieved();
    timer.firstToken();
    timer.done();
    expect(now).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
