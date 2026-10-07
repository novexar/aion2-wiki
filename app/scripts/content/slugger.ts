/** 見出し ID の払い出し。全角記号を含む記号・空白の連続を `-` にし、重複には連番を付ける */
export class HeadingSlugger {
  private readonly used = new Map<string, number>();

  slug(text: string): string {
    const base = slugify(text);
    let candidate = base;
    let n = this.used.get(base) ?? 0;
    while (this.used.has(candidate)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    this.used.set(base, n);
    this.used.set(candidate, 0);
    return candidate;
  }
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\p{P}\p{S}\p{Z}\s]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
