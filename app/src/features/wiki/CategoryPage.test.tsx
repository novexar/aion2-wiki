import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { mockWikiData } from '../../test/fixtures';
import CategoryPage from './CategoryPage';

vi.mock('./data', () => mockWikiData());

function renderCategory(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/wiki/${id}`]}>
      <Routes>
        <Route path="/wiki/:category" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CategoryPage', () => {
  it('件数と説明を 1 行にまとめ、各行に要約を添える', async () => {
    renderCategory('dungeons');
    expect(screen.getByText(/記事 · 遠征・超越/)).toHaveTextContent(/^2 記事 · /);
    const main = screen.getByRole('heading', { level: 1 }).parentElement;
    if (!main) throw new Error('no container');
    expect(within(main).getByRole('link', { name: /オードエネルギー/ })).toHaveAttribute(
      'href',
      '/wiki/dungeons/odyle-energy',
    );
    expect(await within(main).findByText('ダンジョン報酬の受取に使う資源。')).toBeInTheDocument();
  });
});
