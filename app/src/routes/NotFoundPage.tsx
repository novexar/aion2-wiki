import { Link } from 'react-router';
import { buttonClass } from '../components/button-class';
import { useDocumentMeta } from '../components/useDocumentMeta';
import { useSearchPalette } from '../features/search/search-context';
import { WikiShell } from '../features/wiki/WikiShell';

export default function NotFoundPage() {
  useDocumentMeta('ページが見つかりません');
  const { open } = useSearchPalette();
  return (
    <WikiShell wide>
      <h1 className="text-[1.75rem] font-bold">ページが見つかりません</h1>
      <p className="mt-3 text-sm text-fg-muted">
        URL が間違っているか、記事が移動した可能性があります。
      </p>
      <div className="mt-6 flex gap-2">
        <Link to="/" className={buttonClass('primary')}>
          ホームへ
        </Link>
        <button type="button" onClick={() => open()} className={buttonClass('secondary')}>
          検索
        </button>
      </div>
    </WikiShell>
  );
}
