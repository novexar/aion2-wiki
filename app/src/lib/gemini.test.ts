import { afterEach, describe, expect, it, vi } from 'vitest';

const generateContentStream = vi.fn();
const ctor = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContentStream };
    constructor(options: unknown) {
      ctor(options);
    }
  },
}));

const { streamGemini, toChatError } = await import('./gemini');

async function* chunks(texts: (string | undefined)[]) {
  for (const text of texts) yield { text };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('streamGemini', () => {
  it('streams accumulated text and passes model, system instruction and abort signal', async () => {
    generateContentStream.mockResolvedValue(chunks(['こん', undefined, 'にちは']));
    const onText = vi.fn();
    const controller = new AbortController();
    const result = await streamGemini({
      apiKey: 'key-123',
      model: 'gemini-flash-latest',
      systemInstruction: 'SYS',
      contents: [{ role: 'user', parts: [{ text: 'Q' }] }],
      signal: controller.signal,
      onText,
    });
    expect(result).toBe('こんにちは');
    expect(onText.mock.calls.map((c) => c[0])).toEqual(['こん', 'こんにちは']);
    expect(ctor).toHaveBeenCalledWith({ apiKey: 'key-123' });
    const params = generateContentStream.mock.calls[0]?.[0];
    expect(params).toMatchObject({
      model: 'gemini-flash-latest',
      contents: [{ role: 'user', parts: [{ text: 'Q' }] }],
      config: { systemInstruction: 'SYS', abortSignal: controller.signal },
    });
  });

  it('throws AbortError when aborted', async () => {
    const controller = new AbortController();
    async function* gen() {
      yield { text: 'a' };
      controller.abort();
      yield { text: 'b' };
    }
    generateContentStream.mockResolvedValue(gen());
    await expect(
      streamGemini({
        apiKey: 'k',
        model: 'm',
        systemInstruction: '',
        contents: [],
        signal: controller.signal,
        onText: () => undefined,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('toChatError', () => {
  const withStatus = (status: number, message = 'x') =>
    Object.assign(new Error(message), { status });

  it.each([
    [withStatus(400, 'API key not valid. Please pass a valid API key.'), 'invalid-key'],
    [withStatus(401), 'invalid-key'],
    [withStatus(403), 'permission'],
    [withStatus(404), 'model'],
    [withStatus(429), 'rate-limit'],
    [withStatus(503), 'server'],
    [new TypeError('Failed to fetch'), 'network'],
    [new DOMException('aborted', 'AbortError'), 'aborted'],
    [Object.assign(new Error('x'), { name: 'AbortError' }), 'aborted'],
    [new Error('RESOURCE_EXHAUSTED: quota'), 'rate-limit'],
    [new Error('API_KEY_INVALID'), 'invalid-key'],
    ['weird', 'unknown'],
    [withStatus(418), 'unknown'],
  ])('maps %s to %s', (error, kind) => {
    const result = toChatError(error);
    expect(result.kind).toBe(kind);
    expect(result.message).toMatch(/[ぁ-んァ-ヶ一-龠]/);
  });

  it('uses user-facing Japanese messages', () => {
    expect(toChatError(withStatus(429)).message).toContain('レート制限');
    expect(toChatError(withStatus(401)).message).toContain('API キーが無効');
  });

  it('detects offline state', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(toChatError(new Error('something')).kind).toBe('network');
    spy.mockRestore();
  });
});
