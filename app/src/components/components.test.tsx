import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ArticleBody } from '../features/wiki/ArticleBody';
import { SearchProvider } from '../features/search/SearchProvider';
import { useSearchPalette } from '../features/search/search-context';
import { MobileToc, Toc } from '../features/wiki/Toc';
import { ConfidenceBadge } from './ConfidenceBadge';

vi.mock('../features/search/CommandPalette', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="palette">
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.hash}</div>;
}

describe('ConfidenceBadge', () => {
  it.each([
    ['official', '公式', 'text-ok'],
    ['verified', '検証済み', 'text-info'],
    ['community', '要確認', 'text-warn'],
  ] as const)('renders %s as %s', (confidence, label, cls) => {
    render(<ConfidenceBadge confidence={confidence} />);
    const badge = screen.getByText(label).closest('span[title]');
    expect(badge).toHaveClass(cls);
    expect(badge).toHaveTextContent(`信頼度: ${label}`);
  });
});

describe('ArticleBody', () => {
  const html =
    '<p><a href="/AION2/wiki/economy/kinah" class="wikilink">ギーナ</a> <a href="#source-S01">[S01]</a> <a href="https://example.com" target="_blank" rel="noopener noreferrer">ext</a></p>';

  function renderBody() {
    render(
      <MemoryRouter initialEntries={['/wiki/dungeons/a']}>
        <ArticleBody html={html} />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('routes internal wikilinks through the router (base path stripped)', async () => {
    vi.stubEnv('BASE_URL', '/AION2/');
    renderBody();
    await userEvent.click(screen.getByText('ギーナ'));
    expect(screen.getByTestId('location')).toHaveTextContent('/wiki/economy/kinah');
    vi.unstubAllEnvs();
  });

  it('leaves hash links, modified clicks and external links alone', () => {
    renderBody();
    fireEvent.click(screen.getByText('[S01]'));
    fireEvent.click(screen.getByText('ギーナ'), { ctrlKey: true });
    fireEvent.click(screen.getByText('ext'));
    expect(screen.getByTestId('location')).toHaveTextContent('/wiki/dungeons/a');
  });
});

describe('Toc', () => {
  it('marks the active heading and indents h3', () => {
    render(
      <Toc
        headings={[
          { id: 'a', text: 'A', depth: 2 },
          { id: 'b', text: 'B', depth: 3 },
        ]}
        activeId="b"
      />,
    );
    expect(screen.getByRole('navigation', { name: '目次' })).toBeInTheDocument();
    expect(screen.getByText('B')).toHaveAttribute('aria-current', 'location');
    expect(screen.getByText('B')).toHaveClass('pl-6');
    expect(screen.getByText('A')).not.toHaveAttribute('aria-current');
  });

  it('renders nothing without headings', () => {
    const { container } = render(<Toc headings={[]} activeId={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('SearchProvider', () => {
  function Opener() {
    const { open, isOpen } = useSearchPalette();
    return (
      <button onClick={() => open()} data-open={isOpen}>
        open
      </button>
    );
  }

  it('opens the palette with Ctrl+K, toggles it closed, and opens with "/"', async () => {
    render(
      <SearchProvider>
        <Opener />
      </SearchProvider>,
    );
    act(() => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    });
    expect(await screen.findByRole('dialog', { name: 'palette' })).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, { key: 'K', metaKey: true });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, { key: '/' });
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByText('close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not hijack "/" while typing', () => {
    render(
      <SearchProvider>
        <input aria-label="field" />
      </SearchProvider>,
    );
    fireEvent.keyDown(screen.getByLabelText('field'), { key: '/' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Toc / MobileToc exclusivity', () => {
  const headings = [{ id: 'a', text: 'A', depth: 2 as const }];

  it('renders only one landmark depending on viewport width', () => {
    const original = window.matchMedia;
    const stub = (matches: boolean) =>
      (() => ({
        matches,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      })) as unknown as typeof window.matchMedia;
    try {
      window.matchMedia = stub(true);
      const wide = render(
        <>
          <Toc headings={headings} activeId={null} />
          <MobileToc headings={headings} activeId={null} />
        </>,
      );
      expect(screen.getAllByRole('navigation', { name: '目次' })).toHaveLength(1);
      wide.unmount();
      window.matchMedia = stub(false);
      render(
        <>
          <Toc headings={headings} activeId={null} />
          <MobileToc headings={headings} activeId={null} />
        </>,
      );
      expect(screen.getAllByRole('navigation', { name: '目次', hidden: true })).toHaveLength(1);
    } finally {
      window.matchMedia = original;
    }
  });
});
