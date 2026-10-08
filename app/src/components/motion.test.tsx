import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetRouteEnter, routeFadeScope } from '../lib/route-motion';
import { nav } from '../features/wiki/data';
import { CategoryNav } from './CategoryNav';
import { MobileDrawer } from './MobileDrawer';
import { RouteFade } from './RouteFade';

describe('routeFadeScope', () => {
  it.each([
    ['/', 'home'],
    ['/wiki/basics', 'shell'],
    ['/wiki/basics/first-steps', 'shell'],
    ['/index', 'page'],
    ['/search', 'page'],
  ] as const)('%s → %s', (path, scope) => {
    expect(routeFadeScope(path)).toBe(scope);
  });
});

function Page({ name, to }: { readonly name: string; readonly to: string }) {
  return (
    <RouteFade>
      <p data-testid="page">{name}</p>
      <Link to={to}>next</Link>
    </RouteFade>
  );
}

describe('RouteFade', () => {
  beforeEach(() => resetRouteEnter());

  it('最初の表示ではフェードせず、遷移後の画面だけ入場アニメーションを付ける', () => {
    render(
      <MemoryRouter initialEntries={['/a']}>
        <Routes>
          <Route path="/a" element={<Page name="A" to="/b" />} />
          <Route path="/b" element={<Page name="B" to="/a" />} />
        </Routes>
      </MemoryRouter>,
    );
    const first = screen.getByTestId('page').parentElement as HTMLElement;
    expect(first).not.toHaveClass('route-enter');
    fireEvent.click(screen.getByText('next'));
    expect(screen.getByTestId('page')).toHaveTextContent('B');
    const second = screen.getByTestId('page').parentElement as HTMLElement;
    expect(second).toHaveClass('route-enter');
  });
});

describe('CategoryNav の開閉', () => {
  const first = nav.categories[0]!;

  function renderNav() {
    render(
      <MemoryRouter initialEntries={[`/wiki/${first.id}`]}>
        <Routes>
          <Route path="/wiki/:category" element={<CategoryNav />} />
        </Routes>
      </MemoryRouter>,
    );
    return screen.getByRole('button', { name: new RegExp(first.label) });
  }

  it('現在のカテゴリは最初から開き、アニメーションを付けない', () => {
    const button = renderNav();
    const region = document.getElementById(`nav-${first.id}`)!.closest('.nav-collapse')!;
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(region).not.toHaveClass('nav-collapse-anim');
  });

  it('閉じると高さアニメーションの後に一覧を外す', () => {
    const button = renderNav();
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const region = document.getElementById(`nav-${first.id}`)!.closest('.nav-collapse')!;
    expect(region).toHaveClass('nav-collapse-anim');
    expect(region).not.toHaveAttribute('data-open');
    fireEvent.transitionEnd(region);
    expect(document.getElementById(`nav-${first.id}`)).toBeNull();
    fireEvent.click(button);
    expect(document.getElementById(`nav-${first.id}`)!.closest('.nav-collapse')).toHaveAttribute(
      'data-open',
    );
  });
});

describe('MobileDrawer のスライド', () => {
  const renderDrawer = (open: boolean) => (
    <MobileDrawer open={open} onClose={() => undefined} title="メニュー">
      <a href="/x">x</a>
    </MobileDrawer>
  );

  it('閉じるスライドの間は残し、transitionend で外す', () => {
    const { rerender } = render(renderDrawer(true));
    const dialog = screen.getByRole('dialog', { name: 'メニュー' });
    expect(dialog.parentElement).toHaveAttribute('data-open');
    rerender(renderDrawer(false));
    expect(dialog).toBeInTheDocument();
    expect(dialog.parentElement).not.toHaveAttribute('data-open');
    fireEvent.transitionEnd(dialog);
    expect(screen.queryByRole('dialog', { name: 'メニュー' })).toBeNull();
  });
});
