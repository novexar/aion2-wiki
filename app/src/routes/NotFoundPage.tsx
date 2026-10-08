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
      <h1 className="text-[1.75rem] font-bold">このページは存在しません。</h1>
      <div className="mt-6 flex gap-2">
        <Link to="/" className={buttonClass('primary')}>
          ホーム
        </Link>
        <button type="button" onClick={() => open()} className={buttonClass('secondary')}>
          検索
        </button>
      </div>
    </WikiShell>
  );
}
