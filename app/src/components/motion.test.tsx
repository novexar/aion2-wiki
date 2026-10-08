import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetRouteEnter, routeFadeScope } from '../lib/route-motion';
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
