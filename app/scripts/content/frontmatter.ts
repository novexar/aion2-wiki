import matter from 'gray-matter';
import { z } from 'zod';
import { CATEGORY_IDS } from '../../src/lib/categories';
import { ContentError } from './errors';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** YAML の日付は Date として読まれるので YYYY-MM-DD 文字列に正規化する */
const dateField = z
  .union([z.string(), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value.trim()))
  .refine((value) => DATE_RE.test(value) && !Number.isNaN(Date.parse(value)), {
    message: '日付は YYYY-MM-DD 形式で指定してください',
  });

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} が空です`);

const sourceSchema = z.object({
  id: z.string().regex(/^S\d{2,3}$/, 'sources[].id は S01 のような形式にしてください'),
  title: nonEmpty('sources[].title'),
  url: z.url({ protocol: /^https?$/, message: 'sources[].url は http(s) の URL にしてください' }),
  date: dateField,
  kind: z.enum(['official', 'database', 'guide', 'community'], {
    message: 'sources[].kind は official | database | guide | community のいずれかです',
  }),
});

const eventSchema = z
  .object({ starts: dateField.optional(), ends: dateField.optional() })
  .refine((e) => e.starts !== undefined || e.ends !== undefined, {
    message: 'event には starts か ends を指定してください',
  })
  .refine((e) => !e.starts || !e.ends || e.starts <= e.ends, {
    message: 'event.starts は event.ends 以前にしてください',
  });

const stringList = z.array(z.union([z.string(), z.number()]).transform(String));

export const frontmatterSchema = z
  .object({
    id: z.string().regex(SLUG_RE, 'id は英小文字・数字・ハイフンのみ（ケバブケース）'),
    title: nonEmpty('title'),
    category: z.enum(CATEGORY_IDS, {
      message: `category は ${CATEGORY_IDS.join(' | ')} のいずれかです`,
    }),
    tags: stringList
      .refine((tags) => tags.length >= 2 && tags.length <= 6, 'tags は 2〜6 個にしてください')
      .refine((tags) => tags.every((t) => t.trim().length > 0), 'tags に空の要素があります'),
    summary: nonEmpty('summary'),
    confidence: z.enum(['official', 'verified', 'community'], {
      message:
        'confidence は official | verified | community のいずれかです（unverified は掲載不可）',
    }),
    region: z.literal('global', { message: "region は 'global' にしてください" }),
    updated: dateField,
    aliases: stringList.optional().default([]),
    related: z
      .array(z.string().regex(SLUG_RE, 'related の要素は記事 id（ケバブケース）です'))
      .optional()
      .default([]),
    sources: z.array(sourceSchema).min(1, 'sources を 1 件以上指定してください'),
    /** 任意: 五十音索引用の読み（ひらがな） */
    reading: z.string().trim().min(1).optional(),
    /** カテゴリ内の閲覧順（小さい順）。未設定は ORDER_MISSING として末尾 */
    order: z.number().int('order は整数にしてください').nonnegative().optional(),
    /** 任意: 開催期間（ニュース記事）。ホームの「今週の予定」に出す */
    event: eventSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const ids = data.sources.map((s) => s.id);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup) {
      ctx.addIssue({
        code: 'custom',
        path: ['sources'],
        message: `sources の id が重複しています: ${dup}`,
      });
    }
  });

/** order 未設定の記事に割り当てる値（カテゴリ内の末尾） */
export const ORDER_MISSING = 999;

export type Frontmatter = z.output<typeof frontmatterSchema>;

export interface ParsedFile {
  readonly frontmatter: Frontmatter;
  readonly body: string;
}

export interface ParseContext {
  /** エラー表示用の相対パス */
  readonly file: string;
  /** ファイル名（拡張子なし） */
  readonly basename: string;
  /** 親ディレクトリ名 */
  readonly dirName: string;
}

export function formatIssuePath(path: readonly PropertyKey[]): string {
  return path
    .map((p, i) => (typeof p === 'number' ? `[${p}]` : `${i === 0 ? '' : '.'}${String(p)}`))
    .join('');
}

function parseMatter(raw: string, file: string): matter.GrayMatterFile<string> {
  try {
    // 第2引数を渡すと gray-matter の内部キャッシュを使わない
    return matter(raw, {});
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    throw new ContentError(file, [`frontmatter の YAML を解析できません: ${reason}`]);
  }
}

/** Markdown 文字列を frontmatter + 本文に分け、スキーマ検証する。不正なら ContentError を投げる */
export function parseArticleFile(raw: string, ctx: ParseContext): ParsedFile {
  const parsed = parseMatter(raw, ctx.file);
  if (Object.keys(parsed.data).length === 0) {
    throw new ContentError(ctx.file, ['frontmatter（--- で囲まれた YAML）がありません']);
  }

  const result = frontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    const reasons = result.error.issues.map((issue) => {
      const where = formatIssuePath(issue.path);
      return where ? `${where}: ${issue.message}` : issue.message;
    });
    throw new ContentError(ctx.file, reasons);
  }

  const fm = result.data;
  const reasons: string[] = [];
  if (fm.id !== ctx.basename) {
    reasons.push(`id "${fm.id}" がファイル名 "${ctx.basename}.md" と一致しません`);
  }
  const isSampleDir = ctx.dirName.startsWith('_');
  if (!isSampleDir && fm.category !== ctx.dirName) {
    reasons.push(`category "${fm.category}" がディレクトリ名 "${ctx.dirName}" と一致しません`);
  }
  if (reasons.length > 0) throw new ContentError(ctx.file, reasons);

  return { frontmatter: fm, body: parsed.content };
}
