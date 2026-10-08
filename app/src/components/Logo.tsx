import { Link } from 'react-router';

export function Logo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2 rounded-md text-header-fg"
      aria-label="AION2 非公式Wiki ホーム"
    >
      <span aria-hidden="true" className="logo-mark" />
      <span className="text-[15px] font-semibold">
        AION2 <span className="font-normal text-header-muted">非公式Wiki</span>
      </span>
    </Link>
  );
}
