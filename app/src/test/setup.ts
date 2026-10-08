import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetChatPanelStore } from '../features/chat/chat-panel-store';

// jsdom には scrollIntoView が無い
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

afterEach(() => {
  if (typeof window === 'undefined') return;
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetChatPanelStore();
});
