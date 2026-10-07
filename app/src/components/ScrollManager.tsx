import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/** ページ遷移時に先頭へスクロールする（ハッシュ付きは記事側でスクロール） */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    // 戻る・進む操作ではブラウザのスクロール位置復元に任せる
    if (!hash && navigationType !== 'POP') window.scrollTo({ top: 0 });
  }, [pathname, hash, navigationType]);
  return null;
}
