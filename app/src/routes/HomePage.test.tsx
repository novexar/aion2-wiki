import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('shows the sidebar category navigation next to the home content', () => {
    renderHome();
    expect(screen.getByRole('complementary', { name: 'サイドバー' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'カテゴリ' })).toBeInTheDocument();
  });

  it('has no hero copy and shows a plain search box', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'AION2 グローバル版 攻略 Wiki',
    );
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

describe('HomePage の節', () => {
  afterEach(() => vi.useRealTimers());

  it('今週の予定に開催中の記事とシーズン終了までの日数を出す', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-08T12:00:00+09:00'));
    renderHome();
    const week = screen.getByRole('region', { name: '今週の予定' });
    expect(within(week).getByRole('link', { name: /遠征/ })).toHaveTextContent('10/05〜10/16');
    expect(within(week).getByText(/シーズン1終了まで/)).toHaveTextContent(
      'シーズン1終了まで 70 日',
    );
  });

  it('期間を過ぎた予定は出さない', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-12-20T12:00:00+09:00'));
    renderHome();
    expect(screen.queryByRole('region', { name: '今週の予定' })).not.toBeInTheDocument();
  });

  it('節の順序は カテゴリ → 今週の予定 → 最近の更新 → はじめての人へ → 日課・週課', () => {
    renderHome();
    const names = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const order = ['カテゴリ', '今週の予定', '最近の更新', 'はじめての人へ', '日課・週課'];
    expect(names.filter((n) => order.includes(n ?? ''))).toEqual(
      order.filter((n) => names.includes(n)),
    );
    expect(names).toContain('はじめての人へ');
  });
});

describe('HomePage の段差表示', () => {
  const rows = () =>
    within(screen.getByRole('region', { name: 'カテゴリ' })).getAllByRole('listitem');

  it('セッションの初回だけ再生し、遅延は 24ms 刻みで全体が 320ms 以内', () => {
    const first = renderHome();
    const delays = rows().map((r) => r.style.animationDelay);
    expect(rows().every((r) => r.classList.contains('home-rise'))).toBe(true);
    expect(delays.slice(0, 3)).toEqual(['0ms', '24ms', '48ms']);
    expect(Math.max(...delays.map((d) => parseInt(d, 10))) + 200).toBeLessThanOrEqual(320);
    first.unmount();
    renderHome();
    expect(rows().some((r) => r.classList.contains('home-rise'))).toBe(false);
  });
});
