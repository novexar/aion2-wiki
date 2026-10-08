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

const { streamGemini, toChatError, resetThinkingRejections, TRUNCATED_NOTE } =
  await import('./gemini');

async function* chunks(texts: (string | undefined)[]) {
  for (const text of texts) yield { text };
}

afterEach(() => {
  vi.clearAllMocks();
  resetThinkingRejections();
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

  const run = (model: string) =>
    streamGemini({
      apiKey: 'k',
      model,
      systemInstruction: 'S',
      contents: [{ role: 'user', parts: [{ text: 'Q' }] }],
      onText: vi.fn(),
    });
  const reject400 = (message: string) => Object.assign(new Error(message), { status: 400 });
  const configOf = (call: number) => generateContentStream.mock.calls[call]?.[0].config;

  it('uses thinkingLevel MINIMAL and 512 tokens for Gemini 3 models', async () => {
    generateContentStream.mockResolvedValue(chunks(['a']));
    await run('gemini-3.5-flash-lite');
    expect(configOf(0)).toMatchObject({
      thinkingConfig: { thinkingLevel: 'MINIMAL' },
      maxOutputTokens: 512,
    });
  });

  it('uses thinkingBudget 0 for Gemini 2 models', async () => {
    generateContentStream.mockResolvedValue(chunks(['a']));
    await run('gemini-2.5-flash');
    expect(configOf(0)).toMatchObject({
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 512,
    });
  });

  it('retries with level LOW (1024 tokens) when MINIMAL is rejected, then remembers it', async () => {
    generateContentStream
      .mockRejectedValueOnce(reject400('Unsupported thinking level'))
      .mockResolvedValue(chunks(['ok']));
    expect(await run('gemini-3.8-flash')).toBe('ok');
    expect(generateContentStream).toHaveBeenCalledTimes(2);
    expect(configOf(1)).toMatchObject({
      thinkingConfig: { thinkingLevel: 'LOW' },
      maxOutputTokens: 1024,
    });
    generateContentStream.mockResolvedValue(chunks(['ok']));
    await run('gemini-3.8-flash');
    expect(generateContentStream).toHaveBeenCalledTimes(3);
    expect(configOf(2)).toMatchObject({ thinkingConfig: { thinkingLevel: 'LOW' } });
  });

  it('falls back to no thinking config with 2048 tokens when every setting is rejected', async () => {
    generateContentStream
      .mockRejectedValueOnce(reject400('thinking not supported'))
      .mockRejectedValueOnce(reject400('thinking not supported'))
      .mockRejectedValueOnce(reject400('thinking not supported'))
      .mockResolvedValueOnce(chunks(['ok']));
    expect(await run('mystery-model')).toBe('ok');
    expect(configOf(3)).not.toHaveProperty('thinkingConfig');
    expect(configOf(3).maxOutputTokens).toBe(2048);
  });

  it('does not retry on unrelated errors', async () => {
    generateContentStream.mockRejectedValue(Object.assign(new Error('bad key'), { status: 401 }));
    await expect(run('gemini-3.5-flash-lite')).rejects.toThrow('bad key');
    expect(generateContentStream).toHaveBeenCalledTimes(1);
  });

  it('flags an answer cut off by MAX_TOKENS', async () => {
    async function* gen() {
      yield { text: '長い回答', candidates: [{ finishReason: 'MAX_TOKENS' }] };
    }
    generateContentStream.mockResolvedValue(gen());
    const result = await streamGemini({
      apiKey: 'k',
      model: 'm',
      systemInstruction: '',
      contents: [],
      onText: () => undefined,
    });
    expect(result).toBe(`長い回答${TRUNCATED_NOTE}`);
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
