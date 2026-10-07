import { useParams } from 'react-router';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import NotFoundPage from '../../routes/NotFoundPage';
import { ArticleRows } from './ArticleList';
import { Breadcrumb } from './Breadcrumb';
import { nav } from './data';
import { WikiShell } from './WikiShell';

export default function CategoryPage() {
  const { category } = useParams();
  const info = nav.categories.find((c) => c.id === category);
  useDocumentMeta(info?.label, info?.description);
  if (!info) return <NotFoundPage />;

  return (
    <WikiShell>
      <div>
        <Breadcrumb items={[{ label: 'ホーム', to: '/' }, { label: info.label }]} />
        <h1 className="text-2xl font-bold sm:text-[1.75rem]">{info.label}</h1>
        <p className="mt-2 text-fg-muted">{info.description}</p>
        <p className="mt-1 text-sm text-fg-subtle">{info.articles.length} 記事</p>
        <div className="mt-8">
          {info.articles.length === 0 ? (
            <p className="text-sm text-fg-muted">このカテゴリの記事は準備中です。</p>
          ) : (
            <ArticleRows articles={info.articles} columns />
          )}
        </div>
      </div>
    </WikiShell>
  );
}
