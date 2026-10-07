/** コンテンツビルドのエラー。ファイル名と理由を必ず含める */
export class ContentError extends Error {
  readonly file: string;
  readonly reasons: readonly string[];

  constructor(file: string, reasons: readonly string[]) {
    super(`${file}\n${reasons.map((r) => `  - ${r}`).join('\n')}`);
    this.name = 'ContentError';
    this.file = file;
    this.reasons = reasons;
  }
}

export class ContentBuildError extends Error {
  readonly errors: readonly ContentError[];

  constructor(errors: readonly ContentError[]) {
    super(
      `コンテンツの検証に失敗しました（${errors.length} 件）:\n${errors.map((e) => e.message).join('\n')}`,
    );
    this.name = 'ContentBuildError';
    this.errors = errors;
  }
}
