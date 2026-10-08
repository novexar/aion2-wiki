import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { consumeRouteEnter } from '../lib/route-motion';

interface RouteFadeProps {
  readonly children: ReactNode;
  readonly className?: string;
}

function FadeIn({ children, className = '' }: RouteFadeProps) {
  // マウント時に一度だけ決める（再描画で再生しない）
  const [animate] = useState(consumeRouteEnter);
  return <div className={`${className} ${animate ? 'route-enter' : ''}`.trim()}>{children}</div>;
}

/**
 * ページ入場のフェード（opacity 0→1、y 6px→0、200ms ease-out）。pathname ごとに再生する。
 * motion を初期バンドルに入れないため CSS animation で行う（reduced motion では index.css の規則で即時）。
 * 退場アニメーションは付けない（サイドバーを再マウントせず、クリックから表示までを最短にするため）
 */
export function RouteFade({ children, className }: RouteFadeProps) {
  const { pathname } = useLocation();
  return (
    <FadeIn key={pathname} className={className}>
      {children}
    </FadeIn>
  );
}
