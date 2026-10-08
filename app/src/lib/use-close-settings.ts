import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

/** 設定ページを閉じる。アプリ内の履歴があれば直前のページへ、なければホームへ戻る。 */
export function useCloseSettings(): () => void {
  const navigate = useNavigate();
  const { key } = useLocation();
  return useCallback(() => {
    if (key !== 'default') navigate(-1);
    else navigate('/', { replace: true });
  }, [key, navigate]);
}
