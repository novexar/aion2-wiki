import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { setChatPanelOpen } from './chat-panel-store';

/** 旧 /chat ルート: パネルを開いてホームへ（既存リンクの互換） */
export function ChatRedirect() {
  useEffect(() => setChatPanelOpen(true), []);
  return <Navigate to="/" replace />;
}
