import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { mockWikiData } from '../test/fixtures';
import HomePage from './HomePage';

vi.mock('../features/wiki/data', () => mockWikiData());
vi.mock('../features/search/search-context', () => ({
  useSearchPalette: () => ({ open: vi.fn() }),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('lists every category in reading order with counts and lead articles', () => {
    renderHome();
    const section = screen.getByRole('region', { name: 'カテゴリ' });
    const rows = within(section).getAllByRole('listitem');
    expect(rows.map((r) => within(r).getAllByRole('link')[0]?.textContent)).toEqual([
      '初心者ガイド',
      '基本',
      'レベリング',
      'システム',
      'ダンジョン',
      '経済',
      'クラス',
      'PvP',
      '小技',
      'FAQ',
      'ニュース',
    ]);
    const dungeons = rows[4];
    expect(dungeons).toBeDefined();
    if (!dungeons) return;
    expect(dungeons).toHaveTextContent('2');
    expect(within(dungeons).getByRole('link', { name: 'オードエネルギー' })).toHaveAttribute(
      'href',
      '/wiki/dungeons/odyle-energy',
    );
  });

  it('has no hero copy and shows a plain search box', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AION2 非公式Wiki');
    expect(screen.getByRole('button', { name: 'サイト内検索を開く' })).toHaveTextContent('検索');
  });

  it('shows recent updates only when dates differ, plus the index link', () => {
    renderHome();
    const updates = screen.getByRole('region', { name: '最近の更新' });
    expect(within(updates).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'すべての記事（索引）' })).toHaveAttribute(
      'href',
      '/index',
    );
  });
});
