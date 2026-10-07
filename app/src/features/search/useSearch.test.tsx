import { renderHook, waitFor } from '@testing-library/react';
import type MiniSearch from 'minisearch';
import { describe, expect, it, vi } from 'vitest';
import { buildPageIndex } from '../../test/fixtures';
import { useSearch } from './useSearch';

describe('useSearch', () => {
  it('is loading until the index resolves, then returns results', async () => {
    const index = buildPageIndex();
    const loadIndex = vi.fn(() => Promise.resolve(index));
    const { result, rerender } = renderHook(({ q }) => useSearch(q, { loadIndex }), {
      initialProps: { q: 'ギーナ' },
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.results).toEqual([]);

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.results[0]?.id).toBe('kinah');
    expect(loadIndex).toHaveBeenCalledTimes(1);

    rerender({ q: 'odyle' });
    await waitFor(() => expect(result.current.results[0]?.id).toBe('odyle-energy'));
    expect(result.current.query).toBe('odyle');
  });

  it('returns no results for an empty query', async () => {
    const loadIndex = () => Promise.resolve(buildPageIndex());
    const { result } = renderHook(() => useSearch('', { loadIndex }));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.results).toEqual([]);
  });

  it('applies the limit', async () => {
    const loadIndex = () => Promise.resolve(buildPageIndex());
    const { result } = renderHook(() => useSearch('遠征', { loadIndex, limit: 1 }));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.results).toHaveLength(1);
  });

  it('reports errors when the index fails to load', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const loadIndex = () => Promise.reject<MiniSearch>(new Error('404'));
    const { result } = renderHook(() => useSearch('x', { loadIndex }));
    await waitFor(() => expect(result.current.status).toBe('error'));
    consoleError.mockRestore();
  });
});
