import { WIKILINK_RE } from './wikilink';

const RELATED_HEADING = /^##\s*関連記事\s*$/;

export interface ExtractedRelated {
  readonly body: string;
  readonly relatedIds: readonly string[];
}

/**
 * 本文の `## 関連記事` 節を取り除き、節内の wikilink の slug を返す。
 * 節は次の `##` 見出しまで（なければ末尾まで）。コードフェンス内は見出しとして扱わない。
 */
export function extractRelatedSection(body: string): ExtractedRelated {
  const lines = body.split('\n');
  let fence = false;
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    if (start < 0 && RELATED_HEADING.test(line)) start = i;
    else if (start >= 0 && /^##\s/.test(line)) {
      end = i;
      break;
    }
  }
  if (start < 0) return { body, relatedIds: [] };
  const section = lines.slice(start, end).join('\n');
  const relatedIds = [...section.matchAll(new RegExp(WIKILINK_RE.source, 'g'))].flatMap((m) =>
    m[1] ? [m[1]] : [],
  );
  const rest = [...lines.slice(0, start), ...lines.slice(end)].join('\n').replace(/\s+$/, '\n');
  return { body: rest, relatedIds: [...new Set(relatedIds)] };
}
