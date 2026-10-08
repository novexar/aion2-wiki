import { describe, expect, it, vi } from 'vitest';
import type { ChatRepository } from './chat-repository';
import { ReopeningRepository } from './reopening-repository';

function fake(list: () => Promise<never[]>): ChatRepository {
  return { persistent: true, list } as unknown as ChatRepository;
}

const invalidState = () => Object.assign(new Error('closed'), { name: 'InvalidStateError' });

describe('ReopeningRepository', () => {
  it('閉じた接続で InvalidStateError になったら開き直して 1 回だけ再試行する', async () => {
    const closed = fake(() => Promise.reject(invalidState()));
    const fresh = fake(() => Promise.resolve([]));
    const reopen = vi.fn().mockResolvedValue(fresh);
    const repo = new ReopeningRepository(closed, reopen);
    await expect(repo.list()).resolves.toEqual([]);
    expect(reopen).toHaveBeenCalledTimes(1);
    await repo.list();
    expect(reopen).toHaveBeenCalledTimes(1);
  });

  it('接続喪失の通知があれば次の操作の前に開き直す', async () => {
    const old = vi.fn(() => Promise.resolve([]));
    const fresh = vi.fn(() => Promise.resolve([]));
    const reopen = vi.fn().mockResolvedValue(fake(fresh));
    const repo = new ReopeningRepository(fake(old), reopen);
    repo.markLost();
    await repo.list();
    expect(old).not.toHaveBeenCalled();
    expect(fresh).toHaveBeenCalledTimes(1);
  });

  it('同時の操作が重なっても開き直しは 1 回だけ', async () => {
    let release: (repo: ChatRepository) => void = () => undefined;
    const reopen = vi.fn(
      () =>
        new Promise<ChatRepository>((resolve) => {
          release = resolve;
        }),
    );
    const fresh = vi.fn(() => Promise.resolve([]));
    const repo = new ReopeningRepository(
      fake(() => Promise.resolve([])),
      reopen,
    );
    repo.markLost();
    const both = Promise.all([repo.list(), repo.list()]);
    release(fake(fresh));
    await both;
    expect(reopen).toHaveBeenCalledTimes(1);
    expect(fresh).toHaveBeenCalledTimes(2);
  });

  it('開き直し済みの接続に切り替わっていれば古い接続の失敗で再度開き直さない', async () => {
    let failOld: () => void = () => undefined;
    const old = fake(
      () =>
        new Promise<never[]>((_, reject) => {
          failOld = () => reject(invalidState());
        }),
    );
    const fresh = fake(() => Promise.resolve([]));
    const reopen = vi.fn().mockResolvedValue(fresh);
    const repo = new ReopeningRepository(old, reopen);
    const pending = repo.list();
    repo.markLost();
    await repo.list();
    expect(reopen).toHaveBeenCalledTimes(1);
    failOld();
    await expect(pending).resolves.toEqual([]);
    expect(reopen).toHaveBeenCalledTimes(1);
  });

  it('それ以外のエラーはそのまま投げる', async () => {
    const reopen = vi.fn();
    const repo = new ReopeningRepository(
      fake(() => Promise.reject(new Error('boom'))),
      reopen,
    );
    await expect(repo.list()).rejects.toThrow('boom');
    expect(reopen).not.toHaveBeenCalled();
  });
});
