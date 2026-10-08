import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { NO_ANSWER_TEXT } from './chat-history';
import {
  commitChatPanelWidth,
  getChatPanelState,
  resetChatPanelStore,
  setChatPanelWidth,
} from './chat-panel-store';
import { MessageView } from './MessageView';
import { STORAGE_KEYS } from '../../lib/storage';

describe('MessageView', () => {
  it('回答なしのときは検索と索引へのリンクを添える', () => {
    render(
      <MemoryRouter>
        <MessageView
          message={{ id: 'a', role: 'model', text: NO_ANSWER_TEXT, status: 'done' }}
          question="ギーナ 稼ぎ"
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: '検索で探す →' })).toHaveAttribute(
      'href',
      '/search?q=%E3%82%AE%E3%83%BC%E3%83%8A%20%E7%A8%BC%E3%81%8E',
    );
    expect(screen.getByRole('link', { name: '索引' })).toHaveAttribute('href', '/index');
    expect(screen.queryByRole('button', { name: 'コピー' })).toBeNull();
  });

  it('通常の回答にはコピーボタンがある', () => {
    render(
      <MemoryRouter>
        <MessageView message={{ id: 'a', role: 'model', text: '回答', status: 'done' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
  });
});

describe('chat-panel-store の幅の保存', () => {
  beforeEach(() => {
    localStorage.clear();
    resetChatPanelStore();
  });

  it('ドラッグ中は保存せず、commit で 1 回保存する', () => {
    setChatPanelWidth(500, false);
    expect(getChatPanelState().width).toBe(500);
    expect(localStorage.getItem(STORAGE_KEYS.chatPanelWidth)).toBeNull();
    commitChatPanelWidth();
    expect(localStorage.getItem(STORAGE_KEYS.chatPanelWidth)).toBe('500');
  });
});
