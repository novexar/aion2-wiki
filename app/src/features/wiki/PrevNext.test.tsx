import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { NavArticle } from '../../lib/types';
import { adjacentArticles } from './adjacent';
import { PrevNext } from './PrevNext';

const make = (id: string): NavArticle =>
  ({ id, title: `題${id}`, category: 'systems', order: 1 }) as unknown as NavArticle;
const list = [make('a'), make('b'), make('c')];

describe('adjacentArticles', () => {
  it('returns neighbours in order', () => {
    expect(adjacentArticles(list, 'b')).toEqual({ prev: list[0], next: list[2] });
  });
  it('has no prev at the start and no next at the end', () => {
    expect(adjacentArticles(list, 'a').prev).toBeNull();
    expect(adjacentArticles(list, 'c').next).toBeNull();
  });
  it('returns nothing for an unknown id', () => {
    expect(adjacentArticles(list, 'z')).toEqual({ prev: null, next: null });
  });
});

describe('PrevNext', () => {
  it('renders labelled links', () => {
    render(
      <MemoryRouter>
        <PrevNext prev={list[0] ?? null} next={list[2] ?? null} />
      </MemoryRouter>,
    );
    const nav = screen.getByRole('navigation', { name: '前後の記事' });
    expect(nav.querySelectorAll('a')).toHaveLength(2);
    expect(screen.getByText('題a')).toBeTruthy();
    expect(screen.getByText('題c')).toBeTruthy();
  });
  it('renders nothing without neighbours', () => {
    const { container } = render(
      <MemoryRouter>
        <PrevNext prev={null} next={null} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
