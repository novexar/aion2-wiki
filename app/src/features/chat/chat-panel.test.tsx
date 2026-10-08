import 'fake-indexeddb/auto';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IDBFactory } from 'fake-indexeddb';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shellColumns } from '../../lib/shell-layout';
import { STORAGE_KEYS } from '../../lib/storage';
import type { ArticleChunks } from '../../lib/retrieval';
import type { Chunk } from '../../lib/types';
import { mockWikiData } from '../../test/fixtures';
import { getChatRepository, resetChatRepository } from './chat-history';
import {
  clampWidth,
  getChatPanelState,
  PANEL_DEFAULT_WIDTH,
  PANEL_MAX_WIDTH,
  PANEL_MIN_WIDTH,
  resetChatPanelStore,
  setChatPanelOpen,
  setChatPanelWidth,
  toggleChatPanel,
} from './chat-panel-store';
import { prependArticleChunks } from './chunk-loader';

vi.mock('../wiki/data', () => mockWikiData());
vi.mock('../search/CommandPalette', () => ({ default: () => null }));

const OWN: ArticleChunks = {
  articleId: 'kinah',
  title: 'kinah',
  category: 'economy',
  chunks: [
    { heading: '', anchor: '', text: '本文:kinah#0' },
    { heading: '稼ぎ方', anchor: 'earn', text: '本文:kinah#1' },
    { heading: '', anchor: '', text: '本文:kinah#2' },
  ],
};
const EXPEDITION: Chunk = {
  id: 'expedition#0',
  articleId: 'expedition',
  category: 'economy',
  title: 'expedition',
  heading: '',
  anchor: '',
  text: '本文:expedition#0',
};

const streamGemini = vi.fn();
/** 記事検索で見つかったことにするチャンク */
let found: Chunk[] = [];

vi.mock('../../lib/gemini', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/gemini')>()),
  streamGemini: (options: unknown) => streamGemini(options),
}));
vi.mock('./chunk-loader', async (importOriginal) => {
  const original = await importOriginal<typeof import('./chunk-loader')>();
  return {
    ...original,
    retrieveChunks: async (options: { contextArticleId?: string | null }) =>
      original.prependArticleChunks(options.contextArticleId ? OWN : undefined, found),
  };
});

const { Layout } = await import('../../components/Layout');
const { SearchProvider } = await import('../search/SearchProvider');
const { ChatRedirect } = await import('./ChatRedirect');
const { useChat } = await import('./useChat');

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetChatRepository();
  streamGemini.mockReset();
  found = [];
});

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SearchProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>ホーム本文</p>} />
            <Route path="chat" element={<ChatRedirect />} />
            <Route path="wiki/:category/:slug" element={<p>記事本文</p>} />
          </Route>
        </Routes>
      </SearchProvider>
    </MemoryRouter>,
  );
}

describe('chat panel store', () => {
  it('persists open state and clamped width in localStorage', () => {
    expect(getChatPanelState()).toEqual({ open: false, width: PANEL_DEFAULT_WIDTH });
    toggleChatPanel();
    expect(localStorage.getItem(STORAGE_KEYS.chatPanelOpen)).toBe('1');
    setChatPanelWidth(10_000);
    expect(getChatPanelState().width).toBe(PANEL_MAX_WIDTH);
    expect(localStorage.getItem(STORAGE_KEYS.chatPanelWidth)).toBe(String(PANEL_MAX_WIDTH));
    setChatPanelWidth(100);
    expect(getChatPanelState().width).toBe(PANEL_MIN_WIDTH);

    // 再訪: localStorage から復元
    resetChatPanelStore();
    expect(getChatPanelState()).toEqual({ open: true, width: PANEL_MIN_WIDTH });
    expect(clampWidth(Number.NaN)).toBe(PANEL_DEFAULT_WIDTH);
  });

  it('restores a saved width on first read and starts closed by default', () => {
    localStorage.setItem(STORAGE_KEYS.chatPanelWidth, '500');
    resetChatPanelStore();
    expect(getChatPanelState()).toEqual({ open: false, width: 500 });
  });
});

describe('shellColumns', () => {
  it('keeps the viewport layout when the panel is closed', () => {
    expect(shellColumns(1024, 0)).toEqual({ sidebar: true, toc: true, squeezed: false });
    expect(shellColumns(800, 384)).toEqual({ sidebar: false, toc: false, squeezed: false });
  });

  it('hides the TOC, then the sidebar, when the content would drop below 40rem', () => {
    expect(shellColumns(1920, 384)).toMatchObject({ sidebar: true, toc: true });
    expect(shellColumns(1440, 384)).toMatchObject({ sidebar: true, toc: false });
    expect(shellColumns(1024, 384)).toMatchObject({ sidebar: false, toc: false });
  });
});

describe('ChatPanel', () => {
  it('toggles from the header with aria-expanded and moves focus in and out', async () => {
    renderApp();
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: 'AI チャット' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'chat-panel');
    expect(screen.queryByRole('complementary', { name: 'AI チャット' })).toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('complementary', { name: 'AI チャット' })).toBeVisible();
    // API キー未設定ならキー入力欄にフォーカス
    await waitFor(() => expect(document.activeElement?.tagName).toBe('INPUT'), { timeout: 4000 });
    expect(document.activeElement).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('toggles with Ctrl+J and focuses the textarea when a key is saved', async () => {
    localStorage.setItem(STORAGE_KEYS.apiKey, 'AIzaSyTEST_1234567890abcdef');
    renderApp();
    fireEvent.keyDown(window, { key: 'j', ctrlKey: true });
    expect(getChatPanelState().open).toBe(true);
    await waitFor(() => expect(screen.getByLabelText('質問を入力')).toHaveFocus());
    fireEvent.keyDown(window, { key: 'J', ctrlKey: true });
    expect(getChatPanelState().open).toBe(false);
    fireEvent.keyDown(window, { key: 'j', ctrlKey: true, shiftKey: true });
    expect(getChatPanelState().open).toBe(false);
  });

  it('shrinks the page by the panel width and resizes from the handle', async () => {
    setChatPanelOpen(true);
    const { container } = renderApp();
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.paddingRight).toBe(`${PANEL_DEFAULT_WIDTH}px`);
    const handle = screen.getByRole('separator', { name: 'AI チャットの幅' });
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(getChatPanelState().width).toBe(PANEL_DEFAULT_WIDTH + 16);
    expect(localStorage.getItem(STORAGE_KEYS.chatPanelWidth)).toBe(
      String(PANEL_DEFAULT_WIDTH + 16),
    );
    expect(root.style.paddingRight).toBe(`${PANEL_DEFAULT_WIDTH + 16}px`);
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(getChatPanelState().width).toBe(PANEL_DEFAULT_WIDTH);
  });

  it('is a full-screen sheet below lg that closes with Escape', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    try {
      setChatPanelOpen(true);
      const { container } = renderApp();
      const panel = screen.getByRole('complementary', { name: 'AI チャット' });
      expect(panel).toHaveClass('inset-0');
      expect((container.firstElementChild as HTMLElement).style.paddingRight).toBe('');
      expect(screen.queryByRole('separator')).toBeNull();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(getChatPanelState().open).toBe(false);
      expect(screen.getByRole('button', { name: 'AI チャット' })).toHaveFocus();
    } finally {
      window.matchMedia = original;
    }
  });

  it('opens the panel from the legacy /chat route and lands on home', async () => {
    renderApp('/chat');
    expect(await screen.findByText('ホーム本文')).toBeInTheDocument();
    expect(getChatPanelState().open).toBe(true);
  });

  it('shows the article-context checkbox only on article pages', async () => {
    localStorage.setItem(STORAGE_KEYS.apiKey, 'AIzaSyTEST_1234567890abcdef');
    setChatPanelOpen(true);
    renderApp('/wiki/economy/kinah');
    const box = await screen.findByRole('checkbox', { name: 'この記事を文脈に含める' });
    expect(box).toBeChecked();
  });

  it('lists conversations and deletes all after the custom confirm dialog', async () => {
    const repo = await getChatRepository();
    const conv = await repo.create();
    await repo.append(conv.id, { id: 'm1', role: 'user', content: '毎日やること', citations: [] });
    setChatPanelOpen(true);
    renderApp();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: '履歴' }));
    expect(await screen.findByRole('button', { name: /^毎日やること/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'すべて削除' }));
    const dialog = screen.getByRole('alertdialog', { name: '会話履歴をすべて削除しますか' });
    expect(dialog).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(await repo.list()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'すべて削除' }));
    await user.click(screen.getByRole('button', { name: '削除' }));
    await waitFor(async () => expect(await repo.list()).toHaveLength(0));
    expect(await screen.findByText('履歴はありません。')).toBeInTheDocument();
  });
});

describe('article context', () => {
  it('prepends the article chunks in order without duplicates', () => {
    const hits = [EXPEDITION, { ...EXPEDITION, id: 'kinah#0', articleId: 'kinah' }];
    expect(prependArticleChunks(OWN, hits).map((r) => r.id)).toEqual([
      'kinah#0',
      'kinah#1',
      'expedition#0',
    ]);
    expect(prependArticleChunks(OWN, [], 1).map((r) => r.id)).toEqual(['kinah#0']);
  });

  it('sends the current article chunks to Gemini and saves both messages', async () => {
    streamGemini.mockImplementation(async (o: { onText: (t: string) => void }) => {
      o.onText('答え');
      return '答え [kinah]';
    });
    const { result } = renderHook(() =>
      useChat({ apiKey: 'AIzaSyTEST_1234567890abcdef', model: 'm', contextArticleId: 'kinah' }),
    );
    await act(() => result.current.send('上限は？'));
    const options = streamGemini.mock.calls[0]?.[0] as { systemInstruction: string };
    expect(options.systemInstruction).toContain('本文:kinah#0');
    expect(result.current.messages.map((m) => m.status)).toEqual(['done', 'done']);
    await waitFor(() => expect(result.current.conversations[0]?.title).toBe('上限は？'));
    const repo = await getChatRepository();
    const saved = await repo.messages(result.current.activeId ?? '');
    expect(saved.map((m) => m.role)).toEqual(['user', 'model']);
  });

  it('shows references before the answer starts streaming', async () => {
    let finish: (text: string) => void = () => undefined;
    streamGemini.mockImplementation(() => new Promise<string>((resolve) => (finish = resolve)));
    const { result } = renderHook(() =>
      useChat({ apiKey: 'AIzaSyTEST_1234567890abcdef', model: 'm', contextArticleId: 'kinah' }),
    );
    let sending: Promise<void> = Promise.resolve();
    act(() => {
      sending = result.current.send('上限は？');
    });
    await waitFor(() => expect(result.current.messages[1]?.refs?.length).toBeGreaterThan(0));
    const pending = result.current.messages[1];
    expect(pending?.status).toBe('streaming');
    expect(pending?.text).toBe('');
    expect(pending?.refs?.map((r) => r.id)).toContain('kinah');
    await act(async () => {
      finish('答え [kinah]');
      await sending;
    });
    expect(result.current.messages[1]?.status).toBe('done');
  });

  it('does not add article chunks when the checkbox is off', async () => {
    const { result } = renderHook(() =>
      useChat({ apiKey: 'AIzaSyTEST_1234567890abcdef', model: 'm', contextArticleId: null }),
    );
    await act(() => result.current.send('上限は？'));
    expect(streamGemini).not.toHaveBeenCalled();
    expect(result.current.messages[1]?.text).toContain('該当する記事がありません');
  });
});
