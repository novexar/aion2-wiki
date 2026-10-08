import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { PageLoading } from '../../components/PageLoading';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { categoryLabel, isCategoryId } from '../../lib/categories';
import { articlePath, categoryPath } from '../../lib/paths';
import { ISSUES_URL } from '../../lib/site';
import type { Article, NavArticle } from '../../lib/types';
import NotFoundPage from '../../routes/NotFoundPage';
import { ArticleBody } from './ArticleBody';
import { ArticleLinkGrid } from './ArticleList';
import { Breadcrumb } from './Breadcrumb';
import { pushRecentId } from '../../lib/recent';
import { articleById, loadArticle } from './data';
import { SourcesList } from './SourcesList';
import { MobileToc, Toc } from './Toc';
import { useActiveHeading } from './useActiveHeading';
import { WikiShell } from './WikiShell';

type LoadState =
  | { readonly status: 'loading'; readonly id: string }
  | { readonly status: 'ready'; readonly id: string; readonly article: Article }
  | { readonly status: 'missing'; readonly id: string }
  | { readonly status: 'error'; readonly id: string };

function useArticle(id: string): LoadState {
  const [state, setState] = useState<LoadState>({ status: 'loading', id });
  useEffect(() => {
    let active = true;
    loadArticle(id)
      .then((article) => {
        if (article) pushRecentId(id);
        if (active)
          setState(article ? { status: 'ready', id, article } : { status: 'missing', id });
      })
      .catch((error: unknown) => {
        console.error('記事の読み込みに失敗しました', error);
        if (active) setState({ status: 'error', id });
      });
    return () => {
      active = false;
    };
  }, [id]);
  // id が変わった直後は前の記事を表示しない
  return state.id === id ? state : { status: 'loading', id };
}

function useScrollToHash(ready: boolean): void {
  const { hash } = useLocation();
  useEffect(() => {
    if (!ready || !hash) return;
    const raw = hash.slice(1);
    let id = raw;
    try {
      id = decodeURIComponent(raw);
    } catch {
      // 不正なエンコードはそのまま使う
    }
    document.getElementById(id)?.scrollIntoView();
  }, [ready, hash]);
}

function ArticleView({ article }: { readonly article: Article }) {
  useDocumentMeta(article.title, article.summary);
  const headingIds = useMemo(() => article.headings.map((h) => h.id), [article.headings]);
  const activeId = useActiveHeading(headingIds);
  useScrollToHash(true);

  const related = article.related
    .map((id) => articleById.get(id))
    .filter((a): a is NavArticle => a !== undefined);

  return (
    <WikiShell aside={<Toc headings={article.headings} activeId={activeId} />}>
      <article>
        <Breadcrumb
          items={[
            { label: 'ホーム', to: '/' },
            { label: categoryLabel(article.category), to: categoryPath(article.category) },
            { label: article.title },
          ]}
        />
        <header className="mb-8">
          <h1 className="text-[1.75rem] leading-tight font-bold text-balance sm:text-[2rem]">
            {article.title}
          </h1>
          {article.aliases.length > 0 && (
            <p className="mt-2 text-[13px] text-fg-subtle">{article.aliases.join('、')}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-fg-muted">
            <ConfidenceBadge confidence={article.confidence} />
            <span>
              <time dateTime={article.updated}>{article.updated}</time> 更新
            </span>
          </div>
        </header>

        <MobileToc headings={article.headings} activeId={activeId} />
        <ArticleBody html={article.html} />
        {article.tags.length > 0 && (
          <p className="mt-10 text-[13px] text-fg-muted">
            タグ:{' '}
            {article.tags.map((t, i) => (
              <span key={t}>
                {i > 0 && '、'}
                <Link
                  to={`/index?view=tag&tag=${encodeURIComponent(t)}`}
                  className="text-fg hover:underline"
                >
                  {t}
                </Link>
              </span>
            ))}
          </p>
        )}
        <SourcesList sources={article.sources} />

        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg hover:underline"
          >
            誤りを報告 ↗
          </a>
          <Link to="/chat" className="text-fg hover:underline">
            AI チャットで質問する
          </Link>
        </p>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-12">
            <h2 id="related" className="mb-3 text-base font-semibold">
              関連記事
            </h2>
            <ArticleLinkGrid articles={related} />
          </section>
        )}
      </article>
    </WikiShell>
  );
}

export default function ArticlePage() {
  const { category = '', slug = '' } = useParams();
  const meta = articleById.get(slug);
  const state = useArticle(slug);

  if (!isCategoryId(category) || !meta) return <NotFoundPage />;
  if (meta.category !== category)
    return <Navigate to={articlePath(meta.category, meta.id)} replace />;
  if (state.status === 'loading') {
    return (
      <WikiShell>
        <PageLoading bare />
      </WikiShell>
    );
  }
  if (state.status === 'missing') return <NotFoundPage />;
  if (state.status === 'error') {
    return (
      <WikiShell>
        <p role="alert" className="text-sm text-danger">
          記事を読み込めませんでした。ページを再読み込みしてください。
        </p>
      </WikiShell>
    );
  }
  return <ArticleView article={state.article} />;
}
