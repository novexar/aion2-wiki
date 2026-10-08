export interface ChatTimer {
  /** 検索（記事選定 + チャンク取得）が終わった */
  readonly retrieved: () => void;
  /** 最初のトークンを受け取った（2 回目以降は無視） */
  readonly firstToken: () => void;
  /** 回答が最後まで届いた */
  readonly done: () => void;
}

const NOOP_TIMER: ChatTimer = {
  retrieved: () => undefined,
  firstToken: () => undefined,
  done: () => undefined,
};

/**
 * 開発ビルドのみ、検索 ms / 初動（送信から最初のトークン）ms / 合計 ms を console.debug に出す。
 * 本番ビルドでは import.meta.env.DEV が false になり、何も計測しない。
 */
export function startChatTimer(
  enabled: boolean = import.meta.env.DEV,
  now: () => number = () => performance.now(),
  // eslint-disable-next-line no-console -- 開発ビルド専用の計測ログ
  log: (message: string) => void = (message) => console.debug(message),
): ChatTimer {
  if (!enabled) return NOOP_TIMER;
  const start = now();
  let searchMs: number | null = null;
  let firstMs: number | null = null;
  const ms = (value: number | null): string => (value === null ? '-' : `${Math.round(value)}ms`);
  return {
    retrieved: () => {
      searchMs = now() - start;
    },
    firstToken: () => {
      firstMs ??= now() - start;
    },
    done: () => {
      log(`[chat] 検索 ${ms(searchMs)} / 初動 ${ms(firstMs)} / 合計 ${ms(now() - start)}`);
    },
  };
}
