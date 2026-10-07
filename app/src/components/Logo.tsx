import { Link } from 'react-router';

export function Logo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center rounded-md text-fg"
      aria-label="AION2 非公式Wiki ホーム"
    >
      <span className="text-[15px] font-semibold">
        AION2 <span className="font-normal text-fg-muted">非公式Wiki</span>
      </span>
    </Link>
  );
}
