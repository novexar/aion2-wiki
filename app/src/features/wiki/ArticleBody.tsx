import { useCallback, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { toRouterPath } from '../../lib/paths';

interface ArticleBodyProps {
  /** ビルド時に生成した HTML（content/ の Markdown のみ由来。生 HTML は除去済み） */
  readonly html: string;
}

/** 記事本文。内部リンクのクリックはルーターで遷移させる */
export function ArticleBody({ html }: ArticleBodyProps) {
  const navigate = useNavigate();

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor || anchor.target === '_blank') return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const path = toRouterPath(href, import.meta.env.BASE_URL, window.location.origin);
      if (path === null) return;
      event.preventDefault();
      navigate(path);
    },
    [navigate],
  );

  return (
    // クリックの委譲のみ。キーボード操作は内部の <a> 要素がそのまま扱う
    <div className="prose-wiki" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
