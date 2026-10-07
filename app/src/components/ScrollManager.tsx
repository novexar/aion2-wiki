import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** ページ遷移時に先頭へスクロールする（ハッシュ付きは記事側でスクロール） */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}
