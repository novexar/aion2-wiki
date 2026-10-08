import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { buildPageIndex, mockWikiData } from '../../test/fixtures';

vi.mock('../wiki/data', () => mockWikiData());
vi.mock('./index-loader', () => ({
  loadPageIndex: () => Promise.resolve(buildPageIndex()),
  loadPageTexts: () => Promise.resolve(new Map<string, string>()),
}));

const { default: CommandPalette } = await import('./CommandPalette');

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function setup(initialQuery = '') {
  const onClose = vi.fn();
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
      <CommandPalette initialQuery={initialQuery} onClose={onClose} />
    </MemoryRouter>,
  );
  return { onClose, user: userEvent.setup() };
}

describe('CommandPalette', () => {
  it('shows featured articles and the pages section when nothing was opened yet', () => {
    localStorage.removeItem('aion2wiki:recent-articles');
    setup();
    const input = screen.getByRole('combobox', { name: '記事を検索' });
    expect(input).toHaveFocus();
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('オードエネルギー');
    expect(options[1]).toHaveTextContent('ギーナ');
    expect(options[2]).toHaveTextContent('索引');
    expect(options.at(-1)).toHaveTextContent('このサイトについて');
    expect(screen.queryByText('最近開いた記事')).toBeNull();
    expect(screen.getByText('はじめての人へ')).toBeInTheDocument();
    expect(screen.getByText('ページ')).toBeInTheDocument();
  });

  it('lists recently opened articles before the pages section', () => {
    localStorage.setItem('aion2wiki:recent-articles', JSON.stringify(['kinah', 'unknown-id']));
    setup();
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('ギーナ');
    expect(screen.getByText('最近開いた記事')).toBeInTheDocument();
    expect(screen.getByText('ページ')).toBeInTheDocument();
    localStorage.removeItem('aion2wiki:recent-articles');
  });

  it('searches as you type with highlighted matches', async () => {
    const { user } = setup();
    await user.type(screen.getByRole('combobox'), 'ギーナ');
    await waitFor(() => expect(screen.getAllByRole('option')[0]).toHaveTextContent('ギーナ'));
    expect(screen.getAllByRole('option')[0]?.querySelector('mark')).toHaveTextContent('ギーナ');
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('要確認');
  });

  it('moves the active option with arrow keys and opens it with Enter', async () => {
    const { user, onClose } = setup('遠征');
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(2));
    const input = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1]?.id);

    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getAllByRole('option').at(-1)).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('option').at(-1)).toHaveTextContent('すべての結果を見る →');

    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByTestId('location')).toHaveTextContent(
      `/search?q=${encodeURIComponent('遠征')}`,
    );
  });

  it('shows a message when nothing matches', async () => {
    const { user } = setup();
    await user.type(screen.getByRole('combobox'), 'zzzzzz');
    await waitFor(() =>
      expect(screen.getByText(/一致する記事は見つかりませんでした/)).toBeInTheDocument(),
    );
  });

  it('closes on Escape', async () => {
    const { user, onClose } = setup();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape even when focus is not in the input', async () => {
    const { user, onClose } = setup();
    screen.getByRole('button', { name: /閉じる|Esc/ }).focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates when an option is clicked', async () => {
    localStorage.setItem('aion2wiki:recent-articles', JSON.stringify(['odyle-energy', 'kinah']));
    const { user } = setup();
    await user.click(screen.getAllByRole('option')[1] as HTMLElement);
    expect(screen.getByTestId('location')).toHaveTextContent('/wiki/economy/kinah');
    localStorage.removeItem('aion2wiki:recent-articles');
  });
});
