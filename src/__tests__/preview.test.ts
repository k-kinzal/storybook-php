// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToCanvas, render } from '../preview.js';

const mockShowMain = vi.fn();
const mockShowError = vi.fn();

function makeContext(component: any, args: Record<string, unknown> = {}) {
  return {
    storyContext: { component, args, name: 'Test', title: 'Test', id: 'test' },
    storyFn: () => '<p>fallback</p>',
    showMain: mockShowMain,
    showError: mockShowError,
  };
}

const phpComponent = {
  __php: true,
  __type: 'classMethod' as const,
  __file: '/path/Component.php',
  __class: 'App\\Component',
  __callable: 'render',
  __constructorArgs: {},
  __callableArgs: {},
  __allArgs: {},
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockShowMain.mockReset();
  mockShowError.mockReset();
});

describe('renderToCanvas', () => {
  it('uses storyFn as innerHTML for non-PHP component', async () => {
    const canvas = document.createElement('div');
    const ctx = makeContext(undefined);

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe('<p>fallback</p>');
    expect(mockShowMain).toHaveBeenCalled();
  });

  it('sends POST request with correct body for PHP component', async () => {
    const canvas = document.createElement('div');
    const args = { name: 'Alice', age: 30 };
    const ctx = makeContext(phpComponent, args);

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: '<div>rendered</div>' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await renderToCanvas(ctx, canvas);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/__storybook_php/render');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });

    const body = JSON.parse(options.body);
    expect(body).toEqual({
      type: 'classMethod',
      file: '/path/Component.php',
      class: 'App\\Component',
      callable: 'render',
      args: { name: 'Alice', age: 30 },
    });
  });

  it('sets innerHTML to returned HTML on successful render', async () => {
    const canvas = document.createElement('div');
    const ctx = makeContext(phpComponent);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: '<h1>Hello PHP</h1>' }),
    }));

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe('<h1>Hello PHP</h1>');
    expect(mockShowMain).toHaveBeenCalled();
  });

  it('calls showError on error response', async () => {
    const canvas = document.createElement('div');
    const ctx = makeContext(phpComponent);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: '', error: 'Something went wrong', trace: 'at line 42' }),
    }));

    await renderToCanvas(ctx, canvas);

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'PHP Render Error',
      description: 'Something went wrong\n\nat line 42',
    });
    expect(mockShowMain).not.toHaveBeenCalled();
  });

  it('calls showError on fetch failure', async () => {
    const canvas = document.createElement('div');
    const ctx = makeContext(phpComponent);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await renderToCanvas(ctx, canvas);

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'PHP Render Error',
      description: 'Network error',
    });
  });

  it('aborts stale request when new render is called', async () => {
    const canvas = document.createElement('div');
    const ctx = makeContext(phpComponent);

    let fetchResolve: (value: any) => void;
    const firstFetchPromise = new Promise((resolve) => { fetchResolve = resolve; });

    const mockFetch = vi.fn()
      .mockImplementationOnce((_url: string, options: RequestInit) => {
        // First call: wait until aborted, then reject
        return new Promise((resolve, reject) => {
          options.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
          // Also allow resolve from outside
          firstFetchPromise.then(() => resolve({ json: () => Promise.resolve({ html: '<div>first</div>' }) }));
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({ html: '<div>second</div>' }),
        });
      });

    vi.stubGlobal('fetch', mockFetch);

    // Fire first render (don't await)
    const first = renderToCanvas(ctx, canvas);

    // Fire second render immediately (should abort first)
    const second = renderToCanvas(ctx, canvas);

    await Promise.all([first, second]);

    expect(canvas.innerHTML).toBe('<div>second</div>');
    expect(mockShowMain).toHaveBeenCalled();
    // showError should NOT be called for abort
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('re-executes script tags in rendered HTML', async () => {
    const canvas = document.createElement('div');
    const ctx = makeContext(phpComponent);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: '<div>content</div><script data-test="true">window.__phpTestExecuted = true;</script>' }),
    }));

    await renderToCanvas(ctx, canvas);

    // The script tag should be replaced with a new one
    const scripts = canvas.querySelectorAll('script');
    expect(scripts.length).toBe(1);
    expect(scripts[0]!.getAttribute('data-test')).toBe('true');
    expect(scripts[0]!.textContent).toBe('window.__phpTestExecuted = true;');
  });

  it('treats component without __php flag as non-PHP', async () => {
    const canvas = document.createElement('div');
    const notPhp = { __type: 'classMethod', __file: '/path.php' }; // Missing __php: true
    const ctx = makeContext(notPhp);

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe('<p>fallback</p>');
    expect(mockShowMain).toHaveBeenCalled();
  });
});

describe('render', () => {
  it('returns empty string', () => {
    expect(render({})).toBe('');
  });
});
