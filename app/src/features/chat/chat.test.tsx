import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../../lib/storage';
import { mockWikiData } from '../../test/fixtures';
import { ApiKeyForm } from './ApiKeyForm';
import {
  clearHistory,
  loadHistory,
  newId,
  saveHistory,
  toTurns,
  type ChatMessage,
} from './chat-history';

vi.mock('../wiki/data', () => mockWikiData());
const { MessageContent } = await import('./MessageContent');

describe('ApiKeyForm', () => {
  it('validates and saves the key to localStorage', async () => {
    const onSaved = vi.fn();
    render(<ApiKeyForm onSaved={onSaved} />);
    const user = userEvent.setup();
    expect(screen.getByText(/このブラウザにだけ保存され/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Google AI Studio/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );

    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(screen.getByRole('alert')).toHaveTextContent('入力してください');

    await user.type(screen.getByLabelText('Gemini API キー'), 'short key');
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(screen.getByRole('alert')).toHaveTextContent('形式');

    await user.clear(screen.getByLabelText('Gemini API キー'));
    await user.type(screen.getByLabelText('Gemini API キー'), 'AIzaSyTEST_1234567890abcdef');
    await user.click(screen.getByRole('button', { name: 'キーを表示' }));
    expect(screen.getByLabelText('Gemini API キー')).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(localStorage.getItem(STORAGE_KEYS.apiKey)).toBe('AIzaSyTEST_1234567890abcdef');
    expect(onSaved).toHaveBeenCalled();
  });
});

describe('chat history', () => {
  const msgs: ChatMessage[] = [
    { id: '1', role: 'user', text: 'Q', status: 'done' },
    { id: '2', role: 'model', text: 'A', status: 'done' },
    { id: '3', role: 'user', text: 'Q2', status: 'done' },
    { id: '4', role: 'model', text: '', status: 'error', error: 'x' },
    { id: '5', role: 'model', text: 'partial', status: 'streaming' },
  ];

  it('persists to sessionStorage without streaming messages', () => {
    saveHistory(msgs);
    expect(loadHistory().map((m) => m.id)).toEqual(['1', '2', '3', '4']);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it('marks interrupted streaming messages as done on load and ignores corrupt data', () => {
    sessionStorage.setItem(STORAGE_KEYS.chat, JSON.stringify([msgs[4]]));
    expect(loadHistory()[0]?.status).toBe('done');
    sessionStorage.setItem(STORAGE_KEYS.chat, JSON.stringify([{ id: 1 }]));
    expect(loadHistory()).toEqual([]);
  });

  it('converts completed messages to turns', () => {
    expect(toTurns(msgs)).toEqual([
      { role: 'user', text: 'Q' },
      { role: 'model', text: 'A' },
      { role: 'user', text: 'Q2' },
    ]);
    expect(newId()).not.toBe(newId());
  });
});

describe('MessageContent', () => {
  it('renders lists, bold and links citations to known articles without injecting HTML', () => {
    render(
      <MemoryRouter>
        <MessageContent
          text={'上限は **560** です [オードエネルギー]\n\n- a <b>x</b>\n- [不明な記事]'}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('560').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: '出典 1: オードエネルギー' })).toHaveTextContent('[1]');
    expect(screen.getByRole('link', { name: '出典 1: オードエネルギー' })).toHaveAttribute(
      'href',
      '/wiki/dungeons/odyle-energy',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/<b>x<\/b>/)).toBeInTheDocument();
    expect(screen.queryByText(/不明な記事/)).toBeNull();
  });
});
