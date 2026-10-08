import { useEffect, useState } from 'react';
import type { ArticleMeta } from '../../lib/types';
import { loadAllMeta } from './data';

export type MetaState = readonly ArticleMeta[] | 'loading' | 'error';

/** 全記事のメタデータ（要約・別名・タグ・読み）を遅延読込する */
export function useAllMeta(): MetaState {
  const [state, setState] = useState<MetaState>('loading');
  useEffect(() => {
    let active = true;
    loadAllMeta()
      .then((articles) => {
        if (active) setState(articles);
      })
      .catch((error: unknown) => {
        console.error('記事データの読み込みに失敗しました', error);
        if (active) setState('error');
      });
    return () => {
      active = false;
    };
  }, []);
  return state;
}
