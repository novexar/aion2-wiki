import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../../lib/storage';
import {
  fromStored,
  getChatRepository,
  migrateSessionHistory,
  resetChatRepository,
  toStored,
  toTurns,
  type ChatMessage,
} from './chat-history';
import {
  MemoryRepository,
  openIdbRepository,
  titleFrom,
  TITLE_LENGTH,
  type ChatRepository,
} from './chat-repository';

const ref = { id: 'kinah', title: 'ギーナ', category: 'economy' as const, anchor: '' };

beforeEach(() => {
  // テストごとに空の IndexedDB にする
  globalThis.indexedDB = new IDBFactory();
  resetChatRepository();
});

async function exercise(repo: ChatRepository): Promise<void> {
  const a = await repo.create(1000);
  const b = await repo.create(2000);
  expect(a.title).toBe('');

  const longQ = 'あ'.repeat(TITLE_LENGTH + 10);
  await repo.append(a.id, {
    id: 'm1',
    role: 'user',
    content: longQ,
    citations: [],
    createdAt: 3000,
  });
  const afterReply = await repo.append(a.id, {
    id: 'm2',
    role: 'model',
    content: '答え',
    citations: [ref],
    createdAt: 3001,
  });
  expect(afterReply?.title).toBe('あ'.repeat(TITLE_LENGTH));
  expect(afterReply?.updatedAt).toBe(3001);
  expect(await repo.append('missing', { id: 'x', role: 'user', content: 'q', citations: [] })).toBe(
    null,
  );

  // 更新日時の新しい順
  expect((await repo.list()).map((c) => c.id)).toEqual([a.id, b.id]);
  const msgs = await repo.messages(a.id);
  expect(msgs.map((m) => m.id)).toEqual(['m1', 'm2']);
  expect(msgs[1]?.citations).toEqual([ref]);

  await repo.renameTitle(a.id, '  新しい題  ');
  expect((await repo.list())[0]?.title).toBe('新しい題');

  const exported = await repo.exportAll();
  expect(exported.version).toBe(1);
  expect(exported.conversations[0]?.messages).toHaveLength(2);
  expect(await repo.estimateBytes()).toBeGreaterThan(0);

  await repo.delete(a.id);
  expect((await repo.list()).map((c) => c.id)).toEqual([b.id]);
  expect(await repo.messages(a.id)).toEqual([]);

  await repo.deleteAll();
  expect(await repo.list()).toEqual([]);
}

describe('chat repository', () => {
  it('supports CRUD on IndexedDB', async () => {
    const repo = await openIdbRepository();
    expect(repo.persistent).toBe(true);
    await exercise(repo);
  });

  it('keeps data across reopen', async () => {
    const first = await openIdbRepository();
    const conv = await first.create();
    await first.append(conv.id, { id: 'm1', role: 'user', content: '質問', citations: [] });
    const second = await openIdbRepository();
    expect((await second.list())[0]?.title).toBe('質問');
  });

  it('supports the same CRUD in memory', async () => {
    const repo = new MemoryRepository();
    expect(repo.persistent).toBe(false);
    await exercise(repo);
  });

  it('falls back to memory when IndexedDB is unavailable', async () => {
    // @ts-expect-error テストのため IndexedDB を消す
    delete globalThis.indexedDB;
    const repo = await getChatRepository();
    expect(repo.persistent).toBe(false);
  });

  it('migrates and removes the sessionStorage history', async () => {
    sessionStorage.setItem(
      STORAGE_KEYS.chat,
      JSON.stringify([
        { id: '1', role: 'user', text: '毎日やること', status: 'done' },
        { id: '2', role: 'model', text: '答え', status: 'done' },
        { id: '3', role: 'model', text: '途中', status: 'streaming' },
      ]),
    );
    const repo = new MemoryRepository();
    await migrateSessionHistory(repo);
    expect(sessionStorage.getItem(STORAGE_KEYS.chat)).toBeNull();
    const [conv] = await repo.list();
    expect(conv?.title).toBe('毎日やること');
    expect((await repo.messages(conv?.id ?? '')).map((m) => m.id)).toEqual(['1', '2']);

    sessionStorage.setItem(STORAGE_KEYS.chat, JSON.stringify([{ id: 1 }]));
    await migrateSessionHistory(repo);
    expect(await repo.list()).toHaveLength(1);
  });
});

describe('chat message conversion', () => {
  const msgs: ChatMessage[] = [
    { id: '1', role: 'user', text: 'Q', status: 'done' },
    { id: '2', role: 'model', text: 'A', status: 'done', refs: [ref] },
    { id: '3', role: 'user', text: 'Q2', status: 'done' },
    { id: '4', role: 'model', text: '', status: 'error', error: 'x' },
  ];

  it('round-trips through the stored shape', () => {
    const stored = { ...toStored(msgs[1] as ChatMessage), conversationId: 'c', createdAt: 1 };
    expect(fromStored(stored)).toEqual(msgs[1]);
    const err = { ...toStored(msgs[3] as ChatMessage), conversationId: 'c', createdAt: 1 };
    expect(fromStored(err)).toMatchObject({ status: 'error', error: 'x' });
  });

  it('converts completed messages to turns', () => {
    expect(toTurns(msgs)).toEqual([
      { role: 'user', text: 'Q' },
      { role: 'model', text: 'A' },
    ]);
  });

  it('builds titles from the first question', () => {
    expect(titleFrom('  毎日\n やること ')).toBe('毎日 やること');
  });
});
