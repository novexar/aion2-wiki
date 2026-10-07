import { AlertTriangle, CalendarDays, MessageSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { PageLoading } from '../../components/PageLoading';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { categoryLabel, isCategoryId } from '../../lib/categories';
import { articlePath, categoryPath } from '../../lib/paths';
import { ISSUES_URL } from '../../lib/site';
import type { Article, ArticleMeta } from '../../lib/types';
import NotFoundPage from '../../routes/NotFoundPage';
import { ArticleBody } from './ArticleBody';
import { ArticleLinkGrid } from './ArticleList';
import { Breadcrumb } from './Breadcrumb';
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
    .filter((a): a is ArticleMeta => a !== undefined);

  return (
    <WikiShell aside={<Toc headings={article.headings} activeId={activeId} />}>
      <article className="max-w-[72ch]">
        <Breadcrumb
          items={[
            { label: 'ホーム', to: '/' },
            { label: categoryLabel(article.category), to: categoryPath(article.category) },
            { label: article.title },
          ]}
        />
        <header className="mb-8">
          <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-balance sm:text-[2rem]">
            {article.title}
          </h1>
          {article.aliases.length > 0 && (
            <p className="mt-2 text-sm text-fg-subtle">別名: {article.aliases.join(' / ')}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-fg-muted">
            <ConfidenceBadge confidence={article.confidence} />
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5 text-fg-subtle" />
              更新 <time dateTime={article.updated}>{article.updated}</time>
            </span>
            <span className="inline-flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <Link
                  key={t}
                  to={`/index?view=tag&tag=${encodeURIComponent(t)}`}
                  className="rounded border border-line px-1.5 py-0.5 text-xs text-fg-muted hover:border-line-strong hover:text-fg"
                >
                  #{t}
                </Link>
              ))}
            </span>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">{article.summary}</p>
          {article.confidence === 'community' && (
            <div
              role="note"
              className="mt-5 flex gap-2.5 rounded-md border border-warn-line bg-warn-bg px-4 py-3 text-sm text-warn"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                この記事は<strong className="font-semibold">要確認</strong>
                の情報を含みます。1
                つの資料や実プレイ報告に基づくため、ゲーム内の表示を優先してください。
              </p>
            </div>
          )}
        </header>

        <MobileToc headings={article.headings} activeId={activeId} />
        <ArticleBody html={article.html} />
        <SourcesList sources={article.sources} />

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-12">
            <h2 id="related" className="mb-3 text-base font-semibold tracking-tight">
              関連記事
            </h2>
            <ArticleLinkGrid articles={related} />
          </section>
        )}

        <footer className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-[13px] text-fg-subtle">
          <Link to="/chat" className="inline-flex items-center gap-1.5 hover:text-fg">
            <MessageSquare aria-hidden="true" className="size-3.5" />
            この話題をチャットで相談
          </Link>
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
            誤りを報告（GitHub）
          </a>
        </footer>
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
  if (state.status === 'loading') return <PageLoading />;
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
