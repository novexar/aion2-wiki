import { Link } from 'react-router';
import { parseMiniMarkdown, type Inline } from '../../lib/mini-markdown';
import { articlePath } from '../../lib/paths';
import { articleByTitle } from '../wiki/data';
import { citedArticles } from './cited-articles';

function InlineView({
  inline,
  numbers,
}: {
  readonly inline: Inline;
  readonly numbers: ReadonlyMap<string, number>;
}) {
  switch (inline.type) {
    case 'strong':
      return <strong className="font-semibold text-fg">{inline.value}</strong>;
    case 'code':
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{inline.value}</code>
      );
    case 'cite': {
      const article = articleByTitle.get(inline.value);
      const number = article ? numbers.get(article.id) : undefined;
      if (!article || number === undefined) return null;
      return (
        <sup>
          <Link
            to={articlePath(article.category, article.id)}
            aria-label={`出典 ${number}: ${article.title}`}
            className="mx-0.5 text-xs text-accent-strong no-underline hover:underline"
          >
            [{number}]
          </Link>
        </sup>
      );
    }
    default:
      return <>{inline.value}</>;
  }
}

function Inlines({
  inlines,
  numbers,
}: {
  readonly inlines: readonly Inline[];
  readonly numbers: ReadonlyMap<string, number>;
}) {
  return (
    <>
      {inlines.map((inline, i) => (
        <InlineView key={i} inline={inline} numbers={numbers} />
      ))}
    </>
  );
}

/** モデルの回答を安全に描画する（HTML を挿入しない） */
export function MessageContent({ text }: { readonly text: string }) {
  const blocks = parseMiniMarkdown(text);
  const numbers = new Map(citedArticles(text).map((a, i) => [a.id, i + 1]));
  return (
    <div className="space-y-3 text-sm leading-[1.8] whitespace-pre-wrap">
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return (
            <p key={i}>
              <Inlines inlines={block.inlines} numbers={numbers} />
            </p>
          );
        }
        const ListTag = block.type === 'ul' ? 'ul' : 'ol';
        return (
          <ListTag
            key={i}
            className={`space-y-1 pl-5 ${block.type === 'ul' ? 'list-disc' : 'list-decimal'}`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="marker:text-fg-subtle">
                <Inlines inlines={item} numbers={numbers} />
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
