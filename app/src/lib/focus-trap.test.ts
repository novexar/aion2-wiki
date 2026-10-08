import { afterEach, describe, expect, it } from 'vitest';
import { trapTab } from './focus-trap';

function key(shiftKey = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
}

describe('trapTab', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('最後の要素から先頭へ、先頭から最後へ循環する', () => {
    document.body.innerHTML =
      '<div id="c"><a href="#a">a</a><input id="i"><button id="b">b</button></div>';
    const box = document.getElementById('c');
    const items = Array.from(document.querySelectorAll<HTMLElement>('a, input, button'));
    // jsdom にはレイアウトが無いので可視判定を満たす
    for (const el of items) el.getClientRects = () => [{}] as unknown as DOMRectList;
    const [first, , last] = items;
    last?.focus();
    expect(trapTab(key(), box)).toBe(true);
    expect(document.activeElement).toBe(first);
    expect(trapTab(key(true), box)).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  it('Tab 以外は何もしない', () => {
    expect(trapTab(new KeyboardEvent('keydown', { key: 'a' }), document.body)).toBe(false);
  });
});
