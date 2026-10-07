export function PageLoading({ bare = false }: { readonly bare?: boolean }) {
  return (
    <div className={bare ? '' : 'mx-auto max-w-3xl px-4 py-16'} role="status" aria-live="polite">
      <span className="sr-only">読み込み中</span>
      <div className="space-y-3" aria-hidden="true">
        <div className="h-7 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
