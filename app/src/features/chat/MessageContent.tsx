import { Link } from 'react-router';
import { parseMiniMarkdown, type Inline } from '../../lib/mini-markdown';
import { articlePath } from '../../lib/paths';
import { articleByTitle } from '../wiki/data';

function InlineView({ inline }: { readonly inline: Inline }) {
  switch (inline.type) {
    case 'strong':
      return <strong className="font-semibold text-fg">{inline.value}</strong>;
    case 'code':
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{inline.value}</code>
      );
    case 'cite': {
      const article = articleByTitle.get(inline.value);
      if (!article) return <span className="text-fg-subtle">[{inline.value}]</span>;
      return (
        <Link
          to={articlePath(article.category, article.id)}
          className="mx-0.5 inline-flex items-center rounded border border-line bg-surface px-1 text-[0.8em] text-fg-muted no-underline hover:border-accent hover:text-fg"
        >
          {inline.value}
        </Link>
      );
    }
    default:
      return <>{inline.value}</>;
  }
}

function Inlines({ inlines }: { readonly inlines: readonly Inline[] }) {
  return (
    <>
      {inlines.map((inline, i) => (
        <InlineView key={i} inline={inline} />
      ))}
    </>
  );
}

/** モデルの回答を安全に描画する（HTML を挿入しない） */
export function MessageContent({ text }: { readonly text: string }) {
  const blocks = parseMiniMarkdown(text);
  return (
    <div className="space-y-3 text-[15px] leading-[1.8] whitespace-pre-wrap">
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return (
            <p key={i}>
              <Inlines inlines={block.inlines} />
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
                <Inlines inlines={item} />
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
