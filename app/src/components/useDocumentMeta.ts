import { useEffect } from 'react';

export const SITE_NAME = 'AION2 非公式Wiki';
const DEFAULT_DESCRIPTION =
  'AION2（グローバル版）の非公式Wiki。システム・ダンジョン・経済・クラスの攻略情報を出典付きで掲載。';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** ページごとの title / description / OGP を設定する */
export function useDocumentMeta(title?: string, description?: string): void {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description ?? DEFAULT_DESCRIPTION;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
  }, [title, description]);
}
