import { Link } from 'react-router';
import { buttonClass } from '../components/button-class';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { useSearchPalette } from '../features/search/search-context';

export default function NotFoundPage() {
  useDocumentMeta('ページが見つかりません');
  const { open } = useSearchPalette();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-fg-subtle">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">ページが見つかりません</h1>
      <p className="mt-3 text-fg-muted">記事が移動または削除された可能性があります。</p>
      <div className="mt-8 flex justify-center gap-2">
        <Link to="/" className={buttonClass('primary')}>
          ホームへ
        </Link>
        <button type="button" onClick={() => open()} className={buttonClass('secondary')}>
          記事を検索
        </button>
      </div>
    </div>
  );
}
