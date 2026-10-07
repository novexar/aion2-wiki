import { Link } from 'react-router';

export function Logo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2 rounded-md text-fg"
      aria-label="AION2 非公式Wiki ホーム"
    >
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="fill-fg" />
        <path
          d="M16 6 25 25h-4.2l-1.7-3.9h-6.2L11.2 25H7Zm0 7.6-1.9 4.6h3.8Z"
          className="fill-accent"
        />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">
        AION2 <span className="font-normal text-fg-muted">非公式Wiki</span>
      </span>
    </Link>
  );
}
