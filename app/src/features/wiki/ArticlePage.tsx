import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { ConfidenceBadge } from '../../components/ConfidenceBadge';
import { PageLoading } from '../../components/PageLoading';
import { useDocumentMeta } from '../../components/useDocumentMeta';
import { categoryLabel, isCategoryId } from '../../lib/categories';
import { formatDate } from '../../lib/format';
import { articlePath, categoryPath } from '../../lib/paths';
import { ISSUES_URL } from '../../lib/site';
import type { Article, NavArticle } from '../../lib/types';
import NotFoundPage from '../../routes/NotFoundPage';
import { ArticleBody } from './ArticleBody';
import { ArticleLinkGrid } from './ArticleList';
import { Breadcrumb } from './Breadcrumb';
import { pushRecentId } from '../../lib/recent';
import { articleById, loadArticle, nav } from './data';
import { adjacentArticles } from './adjacent';
import { PrevNext } from './PrevNext';
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

/** 別名行。先頭に「別名: 」ラベル、表示は 2 件まで、残りは「他 n 件」で展開 */
const ALIAS_LIMIT = 2;

function Aliases({ aliases }: { readonly aliases: readonly string[] }) {
  const [expanded, setExpanded] = useState(false);
  if (aliases.length === 0) return null;
  const hidden = aliases.length - ALIAS_LIMIT;
  const shown = expanded || hidden <= 0 ? aliases : aliases.slice(0, ALIAS_LIMIT);
  return (
    <p className="mt-2 text-[13px] text-fg-subtle">
      別名: {shown.join('、')}
      {hidden > 0 && !expanded && (
        <>
          {'、'}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="underline decoration-line-strong underline-offset-2 hover:text-fg"
          >
            他 {hidden} 件
          </button>
        </>
      )}
    </p>
  );
}

function ArticleView({ article }: { readonly article: Article }) {
  useDocumentMeta(article.title, article.summary);
  const headingIds = useMemo(() => article.headings.map((h) => h.id), [article.headings]);
  const checkedAt = useMemo(
    () => article.sources.reduce((max, s) => (s.date > max ? s.date : max), ''),
    [article.sources],
  );
  const activeId = useActiveHeading(headingIds);
  useScrollToHash(true);

  const related = article.related
    .map((id) => articleById.get(id))
    .filter((a): a is NavArticle => a !== undefined);

  const siblings = nav.categories.find((c) => c.id === article.category)?.articles ?? [];
  const { prev, next } = adjacentArticles(siblings, article.id);

  return (
    <WikiShell aside={<Toc headings={article.headings} activeId={activeId} />}>
      <article>
        <Breadcrumb
          items={[
            { label: 'ホーム', to: '/' },
            { label: categoryLabel(article.category), to: categoryPath(article.category) },
          ]}
        />
        <header className="mb-8">
          <h1 className="text-[1.75rem] leading-[1.35] font-bold text-balance">{article.title}</h1>
          <Aliases aliases={article.aliases} />
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-fg-muted">
            <ConfidenceBadge confidence={article.confidence} hideVerified linked />
            {checkedAt && (
              <span>
                出典確認日 <time dateTime={checkedAt}>{formatDate(checkedAt)}</time>
              </span>
            )}
          </div>
        </header>

        <MobileToc headings={article.headings} activeId={activeId} />
        <ArticleBody html={article.html} />
        {article.tags.length > 0 && (
          <ul aria-label="タグ" className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <li key={t}>
                <Link
                  to={`/index?view=tag&tag=${encodeURIComponent(t)}`}
                  className="block rounded-[4px] border border-line px-2 py-0.5 text-xs text-link hover:bg-muted"
                >
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <SourcesList
          sources={article.sources}
          actions={
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg hover:underline"
              >
                誤りを報告 ↗
              </a>
              <Link to="/chat" className="hover:text-fg hover:underline">
                AI チャットで質問する
              </Link>
            </span>
          }
        />

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-12">
            <h2
              id="related"
              className="sec-title mb-3 border-b border-line pb-[0.4em] text-xl leading-[1.4] font-bold"
            >
              関連記事
            </h2>
            <ArticleLinkGrid articles={related} />
          </section>
        )}
        <PrevNext prev={prev} next={next} />
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
