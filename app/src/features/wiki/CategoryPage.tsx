import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import NotFoundPage from '../../routes/NotFoundPage';
import { ArticleRows } from './ArticleList';
import { Breadcrumb } from './Breadcrumb';
import { nav } from './data';
import { useAllMeta } from './useAllMeta';
import { WikiShell } from './WikiShell';

export default function CategoryPage() {
  const { category } = useParams();
  const info = nav.categories.find((c) => c.id === category);
  useDocumentMeta(info?.label, info?.description);
  const meta = useAllMeta();
  const summaries = useMemo(
    () => new Map(typeof meta === 'string' ? [] : meta.map((m) => [m.id, m.summary])),
    [meta],
  );
  if (!info) return <NotFoundPage />;

  return (
    <WikiShell wide>
      <div>
        <Breadcrumb items={[{ label: 'ホーム', to: '/' }, { label: info.label }]} />
        <h1 className="text-2xl font-bold sm:text-[1.75rem]">{info.label}</h1>
        <p className="mt-2 text-[13px] text-fg-muted">
          <span className="tabular-nums">{info.articles.length}</span> 記事 · {info.description}
        </p>
        <div className="mt-8">
          {info.articles.length === 0 ? (
            <p className="text-sm text-fg-muted">このカテゴリの記事は準備中です。</p>
          ) : (
            <ArticleRows articles={info.articles} summaries={summaries} />
          )}
        </div>
      </div>
    </WikiShell>
  );
}
