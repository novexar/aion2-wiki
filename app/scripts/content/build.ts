import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { CATEGORIES, isCategoryId } from '../../src/lib/categories';
import { normalizeBase } from '../../src/lib/paths';
import { pageIndexOptions } from '../../src/lib/search-options';
import type {
  Article,
  ArticleChunk,
  ArticleMeta,
  Chunk,
  NavArticle,
  NavJson,
} from '../../src/lib/types';
import { chunkArticle } from './chunker';
import { ContentBuildError, ContentError } from './errors';
import { ORDER_MISSING, parseArticleFile, type Frontmatter } from './frontmatter';
import { readGitDates } from './git-dates';
import { renderMarkdown } from './markdown';
import { extractRelatedSection } from './related-section';
import type { WikilinkTarget } from './wikilink';

export interface BuildOptions {
  /** content/ ディレクトリ */
  readonly contentDir: string;
  /** 出力先（src/generated） */
  readonly outDir: string;
  /** `_` 始まりのディレクトリ（サンプル）を含めるか */
  readonly includeSamples: boolean;
  /** サイトのベースパス（例: '/AION2/'） */
  readonly base: string;
  readonly now?: Date;
  /** false なら git 履歴を読まず frontmatter の updated を使う（既定 true） */
  readonly useGitDates?: boolean;
}

export interface BuildResult {
  readonly articles: number;
  readonly chunks: number;
  readonly warnings: readonly string[];
  readonly files: readonly string[];
}

interface SourceFile {
  readonly absPath: string;
  readonly relPath: string;
  readonly dirName: string;
}

interface LoadedArticle {
  readonly file: SourceFile;
  readonly fm: Frontmatter;
  readonly body: string;
}

async function exists(dir: string): Promise<boolean> {
  try {
    await readdir(dir);
    return true;
  } catch {
    return false;
  }
}

/** content/<dir>/*.md を列挙する。`_` 始まりのディレクトリは includeSamples の時だけ対象 */
export async function discoverFiles(
  contentDir: string,
  includeSamples: boolean,
): Promise<{ files: SourceFile[]; errors: ContentError[] }> {
  const files: SourceFile[] = [];
  const errors: ContentError[] = [];
  const entries = await readdir(contentDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  for (const dir of dirs.sort((a, b) => a.name.localeCompare(b.name))) {
    const isSample = dir.name.startsWith('_');
    if (isSample && !includeSamples) continue;
    const dirPath = path.join(contentDir, dir.name);
    const mdFiles = (await readdir(dirPath, { withFileTypes: true }))
      .filter((e) => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('_'))
      .map((e) => e.name)
      .sort();
    if (!isSample && !isCategoryId(dir.name)) {
      if (mdFiles.length > 0) {
        errors.push(
          new ContentError(`content/${dir.name}/`, [
            `未知のカテゴリーディレクトリです（${CATEGORIES.map((c) => c.id).join(', ')} のいずれか）`,
          ]),
        );
      }
      continue;
    }
    for (const name of mdFiles) {
      files.push({
        absPath: path.join(dirPath, name),
        relPath: `content/${dir.name}/${name}`,
        dirName: dir.name,
      });
    }
  }
  return { files, errors };
}

async function loadArticles(
  files: readonly SourceFile[],
): Promise<{ loaded: LoadedArticle[]; errors: ContentError[] }> {
  const loaded: LoadedArticle[] = [];
  const errors: ContentError[] = [];
  const seen = new Map<string, string>();

  for (const file of files) {
    const raw = await readFile(file.absPath, 'utf8');
    try {
      const { frontmatter, body } = parseArticleFile(raw, {
        file: file.relPath,
        basename: path.basename(file.relPath, '.md'),
        dirName: file.dirName,
      });
      const prev = seen.get(frontmatter.id);
      if (prev) {
        errors.push(
          new ContentError(file.relPath, [`id "${frontmatter.id}" が ${prev} と重複しています`]),
        );
        continue;
      }
      seen.set(frontmatter.id, file.relPath);
      loaded.push({ file, fm: frontmatter, body });
    } catch (error) {
      if (error instanceof ContentError) errors.push(error);
      else throw error;
    }
  }
  return { loaded, errors };
}

/** Frontmatter / Article から一覧用メタデータだけを取り出す */
export function toMeta(src: ArticleMeta): ArticleMeta {
  return {
    id: src.id,
    title: src.title,
    category: src.category,
    tags: src.tags,
    summary: src.summary,
    confidence: src.confidence,
    updated: src.updated,
    ...(src.updatedAt ? { updatedAt: src.updatedAt } : {}),
    aliases: src.aliases,
    ...(src.reading ? { reading: src.reading } : {}),
    order: src.order,
    ...(src.event ? { event: src.event } : {}),
  };
}

const byTitle = (a: ArticleMeta, b: ArticleMeta): number =>
  (a.reading ?? a.title).localeCompare(b.reading ?? b.title, 'ja');

const CATEGORY_RANK: ReadonlyMap<string, number> = new Map(CATEGORIES.map((c, i) => [c.id, i]));

/** 閲覧順: カテゴリの並び → order 昇順 → 読み（五十音は /index だけで使う） */
export const byReadingOrder = (a: ArticleMeta, b: ArticleMeta): number =>
  (CATEGORY_RANK.get(a.category) ?? 0) - (CATEGORY_RANK.get(b.category) ?? 0) ||
  a.order - b.order ||
  byTitle(a, b);

const byUpdatedDesc = (a: ArticleMeta, b: ArticleMeta): number =>
  (b.updatedAt ?? b.updated).localeCompare(a.updatedAt ?? a.updated) || byTitle(a, b);

/** 初期バンドル用: 一覧・ナビに要る項目だけを残す */
export function toNavArticle(src: ArticleMeta): NavArticle {
  return {
    id: src.id,
    title: src.title,
    category: src.category,
    confidence: src.confidence,
    updated: src.updated,
    ...(src.updatedAt ? { updatedAt: src.updatedAt } : {}),
    order: src.order,
    ...(src.event ? { event: src.event } : {}),
  };
}

export function buildNav(metas: readonly ArticleMeta[], now: Date): NavJson {
  return {
    generatedAt: now.toISOString(),
    categories: CATEGORIES.map((c) => ({
      id: c.id,
      articles: metas
        .filter((m) => m.category === c.id)
        .sort(byReadingOrder)
        .map((m) => m.id),
    })),
    articles: [...metas].sort(byUpdatedDesc).map(toNavArticle),
  };
}

/** タイトルがこの文字数を超えたら警告する（規約は 18 文字以内。SCHEMA.md） */
export const TITLE_WARN_LENGTH = 24;

export function titleLengthWarning(relPath: string, title: string): string | null {
  const length = Array.from(title).length;
  return length > TITLE_WARN_LENGTH
    ? `${relPath}: title が ${length} 文字です（${TITLE_WARN_LENGTH} 文字超。規約は 18 文字以内）`
    : null;
}

/** 関連記事を閲覧順（カテゴリ → order → 読み）に並べ替えた記事配列を返す */
export function withSortedRelated(articles: readonly Article[]): Article[] {
  const byId = new Map(articles.map((a) => [a.id, a]));
  const compare = (x: string, y: string): number => {
    const ax = byId.get(x);
    const ay = byId.get(y);
    return ax && ay ? byReadingOrder(ax, ay) : 0;
  };
  return articles.map((a) => ({ ...a, related: [...a.related].sort(compare) }));
}

interface HashLink {
  readonly file: string;
  readonly slug: string;
  readonly hash: string;
}

/** `[[slug#hash]]` が対象記事の見出し（id または本文）に一致しなければ警告する */
function checkHashLinks(
  hashLinks: readonly HashLink[],
  articles: readonly Article[],
  warn: (message: string) => void,
): void {
  const byId = new Map(articles.map((a) => [a.id, a]));
  for (const { file, slug, hash } of hashLinks) {
    const target = byId.get(slug);
    if (!target) continue;
    if (!target.headings.some((h) => h.id === hash || h.text === hash)) {
      warn(`${file}: [[${slug}#${hash}]] の見出しが ${slug} に存在しません`);
    }
  }
}

/** タイトル・別名が複数記事で重複していれば、ファイル名つきのメッセージを返す */
export function findDuplicateNames(
  items: readonly { readonly relPath: string; readonly names: readonly string[] }[],
): string[] {
  const owners = new Map<string, Set<string>>();
  for (const { relPath, names } of items) {
    for (const name of names) {
      const key = name.normalize('NFKC').toLowerCase();
      owners.set(key, (owners.get(key) ?? new Set()).add(relPath));
    }
  }
  return [...owners]
    .filter(([, files]) => files.size > 1)
    .map(([name, files]) => `タイトル/別名 "${name}" が重複しています: ${[...files].join(', ')}`);
}

async function renderArticle(
  item: LoadedArticle,
  targets: ReadonlyMap<string, WikilinkTarget>,
  warn: (message: string) => void,
  hashLinks: HashLink[],
  gitDates: ReadonlyMap<string, string>,
): Promise<{ article: Article; chunks: Chunk[] }> {
  const { fm, file } = item;
  const longTitle = titleLengthWarning(file.relPath, fm.title);
  if (longTitle) warn(longTitle);
  if (fm.reading && !/^[ぁ-ゖァ-ヺ]/.test(fm.reading))
    warn(`${file.relPath}: reading が仮名始まりではありません（五十音索引の「その他」になります）`);
  if (fm.order === undefined)
    warn(`${file.relPath}: order が未設定です（末尾 ${ORDER_MISSING} として扱います）`);
  const { body, relatedIds } = extractRelatedSection(item.body);
  const { html, headings } = await renderMarkdown(body, {
    resolve: (slug) => targets.get(slug),
    sourceIds: new Set(fm.sources.map((s) => s.id)),
    onMissingLink: (slug) => warn(`${file.relPath}: リンク先 [[${slug}]] が存在しません`),
    onHashLink: (slug, hash) => hashLinks.push({ file: file.relPath, slug, hash }),
    onMissingSource: (id) => warn(`${file.relPath}: 本文の [${id}] が sources にありません`),
  });
  const related = [...new Set([...fm.related, ...relatedIds])].filter((id) => {
    if (id === fm.id) return false;
    if (targets.has(id)) return true;
    warn(`${file.relPath}: related の "${id}" が存在しません（無視します）`);
    return false;
  });
  const gitDate = gitDates.get(file.relPath.replace(/^content\//, ''));
  const base = { ...fm, order: fm.order ?? ORDER_MISSING };
  const article: Article = {
    ...toMeta(gitDate ? { ...base, updated: gitDate.slice(0, 10), updatedAt: gitDate } : base),
    region: fm.region,
    related,
    sources: fm.sources,
    html,
    headings,
  };
  const chunks = chunkArticle({
    articleId: fm.id,
    category: fm.category,
    title: fm.title,
    markdown: body,
    resolveTitle: (slug) => targets.get(slug)?.title,
  });
  return { article, chunks };
}

/** 記事検索インデックス。本文は索引に入れず、ブラウザで search-text.json を部分一致で照合する */
function buildPageIndex(articles: readonly Article[]): unknown {
  const index = new MiniSearch(pageIndexOptions);
  index.addAll(
    articles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      confidence: a.confidence,
      summary: a.summary,
      aliases: a.aliases.join(' / '),
      tags: a.tags.join(' '),
      headings: a.headings.map((h) => h.text).join(' '),
    })),
  );
  return index.toJSON();
}

/** 記事ごとの本文先頭 2,000 文字。検索の本文一致（部分一致）とスニペットに使う（インデックスには含めない） */
export const SEARCH_TEXT_LIMIT = 2000;

function buildPageTexts(
  articles: readonly Article[],
  chunksById: ReadonlyMap<string, Chunk[]>,
): Record<string, string> {
  return Object.fromEntries(
    articles.map((a) => [
      a.id,
      (chunksById.get(a.id) ?? [])
        .map((c) => c.text)
        .join(' ')
        .slice(0, SEARCH_TEXT_LIMIT),
    ]),
  );
}

/** chunk-text/<articleId>.json の中身。添字がチャンクの記事内位置 */
function toArticleChunks(chunks: readonly Chunk[]): ArticleChunk[] {
  return chunks.map(({ heading, anchor, text }) => ({ heading, anchor, text }));
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(data)}\n`, 'utf8');
}

/** content/ を読み、src/generated/ に pages / search-index / chunk-text / nav を出力する */
export async function buildContent(options: BuildOptions): Promise<BuildResult> {
  const base = normalizeBase(options.base);
  const warnings: string[] = [];
  const warn = (message: string): void => {
    warnings.push(message);
  };

  let files: SourceFile[] = [];
  const errors: ContentError[] = [];
  if (await exists(options.contentDir)) {
    const discovered = await discoverFiles(options.contentDir, options.includeSamples);
    files = discovered.files;
    errors.push(...discovered.errors);
  } else {
    if (!options.includeSamples) {
      throw new ContentBuildError([
        new ContentError(options.contentDir, ['content ディレクトリが見つかりません']),
      ]);
    }
    warn(`content ディレクトリが見つかりません: ${options.contentDir}（記事 0 件で出力します）`);
  }

  const { loaded, errors: parseErrors } = await loadArticles(files);
  errors.push(...parseErrors);
  if (errors.length === 0 && loaded.length === 0 && !options.includeSamples) {
    errors.push(new ContentError(options.contentDir, ['公開できる記事が 0 件です']));
  }
  const duplicateTitles = findDuplicateNames(
    loaded.map(({ file, fm }) => ({ relPath: file.relPath, names: [fm.title] })),
  );
  for (const message of duplicateTitles) {
    errors.push(new ContentError(options.contentDir, [message]));
  }
  // 別名の重複は実コンテンツに多数あるため警告に留める（タイトル同士の重複のみエラー）
  const allDuplicates = findDuplicateNames(
    loaded.map(({ file, fm }) => ({ relPath: file.relPath, names: [fm.title, ...fm.aliases] })),
  );
  for (const message of allDuplicates) {
    if (!duplicateTitles.includes(message)) warn(message);
  }
  if (errors.length > 0) throw new ContentBuildError(errors);

  const targets = new Map<string, WikilinkTarget>(
    loaded.map(({ fm }) => [
      fm.id,
      { href: `${base}wiki/${fm.category}/${fm.id}`, title: fm.title },
    ]),
  );

  const rendered: Article[] = [];
  const chunksById = new Map<string, Chunk[]>();
  const hashLinks: HashLink[] = [];
  const gitDates = options.useGitDates === false ? new Map() : readGitDates(options.contentDir);
  for (const item of loaded) {
    const { article, chunks } = await renderArticle(item, targets, warn, hashLinks, gitDates);
    rendered.push(article);
    chunksById.set(article.id, chunks);
  }
  checkHashLinks(hashLinks, rendered, warn);
  const articles = withSortedRelated(rendered);
  const allChunks = [...chunksById.values()].flat();
  const pageTexts = buildPageTexts(articles, chunksById);
  const nav = buildNav(articles.map(toMeta), options.now ?? new Date());

  // 旧チャット専用索引（廃止）が残っていれば消す
  await rm(path.join(options.outDir, 'chunks.json'), { force: true });
  const pagesDir = path.join(options.outDir, 'pages');
  await rm(pagesDir, { recursive: true, force: true });
  await mkdir(pagesDir, { recursive: true });
  await Promise.all(articles.map((a) => writeJson(path.join(pagesDir, `${a.id}.json`), a)));
  const chunkTextDir = path.join(options.outDir, 'chunk-text');
  await rm(chunkTextDir, { recursive: true, force: true });
  await mkdir(chunkTextDir, { recursive: true });
  await Promise.all(
    [...chunksById].map(([id, chunks]) =>
      writeJson(path.join(chunkTextDir, `${id}.json`), toArticleChunks(chunks)),
    ),
  );
  await writeJson(path.join(options.outDir, 'pages.json'), articles);
  await writeJson(path.join(options.outDir, 'meta.json'), articles.map(toMeta));
  await writeJson(path.join(options.outDir, 'search-index.json'), buildPageIndex(articles));
  await writeJson(path.join(options.outDir, 'search-text.json'), pageTexts);
  await writeJson(path.join(options.outDir, 'nav.json'), nav);

  return {
    articles: articles.length,
    chunks: allChunks.length,
    warnings,
    files: loaded.map((l) => l.file.relPath),
  };
}
