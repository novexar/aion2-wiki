import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiniSearch from 'minisearch';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { pageIndexOptions } from '../../lib/search-options';
import { mockWikiData } from '../../test/fixtures';

const TOTAL = 120;

function manyHitsIndex(): MiniSearch {
  const index = new MiniSearch(pageIndexOptions);
  index.addAll(
    Array.from({ length: TOTAL }, (_, i) => ({
      id: `doc-${i}`,
      title: `ダンジョン報酬 ${i}`,
      category: 'dungeons',
      confidence: 'verified',
      summary: 'ダンジョン報酬の説明',
      aliases: '',
      tags: '',
      headings: '',
      body: 'ダンジョン報酬',
    })),
  );
  return index;
}

vi.mock('../wiki/data', () => mockWikiData());
vi.mock('./index-loader', () => ({
  loadPageIndex: () => Promise.resolve(manyHitsIndex()),
  loadPageTexts: () => Promise.resolve(new Map<string, string>()),
}));

const { default: SearchPage } = await import('./SearchPage');

describe('SearchPage', () => {
  it('クエリが変わると表示件数が初期値（50 件）に戻る', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/search?q=ダンジョン']}>
        <SearchPage />
      </MemoryRouter>,
    );
    await screen.findByText(`${TOTAL} 件中 50 件を表示`);
    await user.click(screen.getByRole('button', { name: 'さらに表示' }));
    await screen.findByText(`${TOTAL} 件中 100 件を表示`);

    await user.type(screen.getByRole('searchbox'), '報酬');
    await waitFor(() => expect(screen.getByText(`${TOTAL} 件中 50 件を表示`)).toBeInTheDocument());
  });
});
