import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/**
 * ページ遷移時に先頭へスクロールする（ハッシュ付きは記事側でスクロール）。
 * レイアウト段階で実行し、入場フェードの最初のフレームより前に位置を確定させる
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  useLayoutEffect(() => {
    // 戻る・進む操作ではブラウザのスクロール位置復元に任せる
    if (!hash && navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash, navigationType]);
  return null;
}
