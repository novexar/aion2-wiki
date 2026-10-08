import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { articlePath } from '../../lib/paths';
import type { NavArticle } from '../../lib/types';

export interface PrevNextProps {
  readonly prev: NavArticle | null;
  readonly next: NavArticle | null;
}

function Item({
  article,
  label,
  side,
}: {
  readonly article: NavArticle;
  readonly label: string;
  readonly side: 'prev' | 'next';
}) {
  const Arrow = side === 'prev' ? ArrowLeft : ArrowRight;
  return (
    <Link
      to={articlePath(article.category, article.id)}
      rel={side}
      className={`group block rounded-[4px] px-3 py-3 hover:bg-muted ${side === 'next' ? 'text-right sm:col-start-2' : ''}`}
    >
      <span
        className={`flex items-center gap-1 text-[13px] text-fg-muted ${side === 'next' ? 'justify-end' : ''}`}
      >
        {side === 'prev' && <Arrow aria-hidden="true" className="size-3.5" />}
        {label}
        {side === 'next' && <Arrow aria-hidden="true" className="size-3.5" />}
      </span>
      <span className="mt-0.5 block text-[15px] text-fg group-hover:underline">
        {article.title}
      </span>
    </Link>
  );
}

/** 記事末尾の前後ナビ。同カテゴリ内の閲覧順で 2 列 */
export function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="前後の記事"
      className="mt-12 grid grid-cols-1 border-y border-line py-2 sm:grid-cols-2 sm:gap-4"
    >
      {prev && <Item article={prev} label="前: " side="prev" />}
      {next && <Item article={next} label="次: " side="next" />}
    </nav>
  );
}
