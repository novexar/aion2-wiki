import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Header } from '../components/Header';
import { SUGGESTED_MODELS } from '../lib/gemini-config';
import { getModel } from '../lib/settings';
import SettingsPage from './SettingsPage';

vi.mock('../features/search/search-context', () => ({
  useSearchPalette: () => ({ open: vi.fn() }),
}));

function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>;
}

function renderApp(entries: string[], index?: number) {
  return render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <Header />
      <Where />
      <Routes>
        <Route path="/" element={<p>ホーム</p>} />
        <Route path="/about" element={<p>概要</p>} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const where = () => screen.getByTestId('where').textContent;

describe('settings close', () => {
  it('close button returns to the previous page', async () => {
    renderApp(['/about', '/settings'], 1);
    await userEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(where()).toBe('/about');
  });

  it('close button goes home when there is no history', async () => {
    renderApp(['/settings']);
    await userEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(where()).toBe('/');
  });

  it('Escape closes settings', async () => {
    renderApp(['/about', '/settings'], 1);
    await userEvent.keyboard('{Escape}');
    expect(where()).toBe('/about');
  });

  it('header icon toggles settings and reflects aria-current', async () => {
    renderApp(['/about']);
    const toggle = screen.getByRole('button', { name: '設定' });
    expect(toggle).not.toHaveAttribute('aria-current');
    await userEvent.click(toggle);
    expect(where()).toBe('/settings');
    expect(toggle).toHaveAttribute('aria-current', 'page');
    await userEvent.click(toggle);
    expect(where()).toBe('/about');
    expect(toggle).not.toHaveAttribute('aria-current');
  });
});

describe('model select', () => {
  const select = () => screen.getByRole('combobox', { name: 'モデル' }) as HTMLSelectElement;

  it('is a native select listing suggested models plus manual entry', () => {
    renderApp(['/settings']);
    expect(select().tagName).toBe('SELECT');
    expect(Array.from(select().options).map((o) => o.value)).toEqual([
      ...SUGGESTED_MODELS,
      '__custom__',
    ]);
    expect(screen.getByRole('option', { name: 'その他（手入力）' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'モデル名' })).not.toBeInTheDocument();
  });

  it('selects with the mouse and saves', async () => {
    renderApp(['/settings']);
    await userEvent.selectOptions(select(), SUGGESTED_MODELS[1]!);
    await userEvent.click(within(select().form!).getByRole('button', { name: '保存' }));
    expect(getModel()).toBe(SUGGESTED_MODELS[1]);
  });

  it('is reachable and operable with the keyboard', async () => {
    renderApp(['/settings']);
    const user = userEvent.setup();
    // jsdom は ArrowDown によるネイティブ select の値変更を実装しないため、変更結果を発火して以降を検証する
    while (document.activeElement !== select()) await user.tab();
    await user.keyboard('{ArrowDown}');
    fireEvent.change(select(), { target: { value: SUGGESTED_MODELS[1]! } });
    await user.tab();
    expect(within(select().form!).getByRole('button', { name: '保存' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(getModel()).toBe(SUGGESTED_MODELS[1]);
  });

  it('works with touch input', async () => {
    renderApp(['/settings']);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await user.pointer({ keys: '[TouchA>]', target: select() });
    await user.pointer({ keys: '[/TouchA]', target: select() });
    fireEvent.change(select(), { target: { value: '__custom__' } });
    expect(screen.getByRole('textbox', { name: 'モデル名' })).toBeInTheDocument();
  });

  it('reveals a text input for manual entry and saves the typed model', async () => {
    renderApp(['/settings']);
    await userEvent.selectOptions(select(), '__custom__');
    const input = screen.getByRole('textbox', { name: 'モデル名' });
    await userEvent.clear(input);
    await userEvent.type(input, 'gemini-x-test');
    await userEvent.click(within(select().form!).getByRole('button', { name: '保存' }));
    expect(getModel()).toBe('gemini-x-test');
  });
});
