// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { parameters as previewParameters, renderToCanvas, render } from "../../src/preview.js";
import type { PhpComponent } from "../../src/types.js";

const mockShowMain = vi.fn();
const mockShowError = vi.fn();
type RenderContext = Parameters<typeof renderToCanvas>[0];
type StoryContext = RenderContext["storyContext"];
type StoryComponent = NonNullable<StoryContext["component"]>;

function makeContext(
  component: unknown,
  args: Record<string, unknown> = {},
  parameters?: Record<string, unknown>,
): RenderContext {
  const storyContext: StoryContext = {
    args,
    name: "Test",
    title: "Test",
    id: "test",
    ...(component === undefined ? {} : { component: component as StoryComponent }),
    ...(parameters === undefined ? {} : { parameters }),
  };

  return {
    storyContext,
    storyFn: () => "<p>fallback</p>",
    showMain: mockShowMain,
    showError: mockShowError,
  };
}

const phpComponent: PhpComponent = {
  __php: true,
  __id: "cmp_test",
  __type: "classMethod" as const,
  __file: "/path/Component.php",
  __class: "App\\Component",
  __callable: "render",
  __constructorArgs: {},
  __callableArgs: {},
  __publicArgs: {},
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockShowMain.mockReset();
  mockShowError.mockReset();
});

describe("renderToCanvas", () => {
  it("uses storyFn as innerHTML for non-PHP component", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(undefined);

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe("<p>fallback</p>");
    expect(mockShowMain).toHaveBeenCalled();
  });

  it("sends POST request with correct body for PHP component", async () => {
    const canvas = document.createElement("div");
    const args = { name: "Alice", age: 30 };
    const ctx = makeContext(phpComponent, args);

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: "<div>rendered</div>" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await renderToCanvas(ctx, canvas);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    if (call === undefined) {
      throw new Error("fetch was not called");
    }

    const [url, options] = call;
    expect(url).toBe("/__storybook_php/render");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });

    const body = JSON.parse(options.body);
    expect(body).toEqual({
      componentId: "cmp_test",
      args: { name: "Alice", age: 30 },
    });
  });

  it("includes typeMap in POST body when parameters.typeMap is set", async () => {
    const canvas = document.createElement("div");
    const typeMap = {
      bindings: { "App\\Iface": "App\\Concrete" },
      args: { name: "string" },
    };
    const ctx = makeContext(phpComponent, { name: "Alice" }, { typeMap });

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: "<div>ok</div>" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await renderToCanvas(ctx, canvas);

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    if (call === undefined) {
      throw new Error("fetch was not called");
    }

    const options = call[1];
    expect(options).toBeDefined();
    if (options === undefined) {
      throw new Error("fetch options were not provided");
    }

    const body = JSON.parse(String(options.body));
    expect(body.typeMap).toEqual(typeMap);
  });

  it("omits typeMap from POST body when parameters.typeMap is absent", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent, { name: "Alice" });

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: "<div>ok</div>" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await renderToCanvas(ctx, canvas);

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    if (call === undefined) {
      throw new Error("fetch was not called");
    }

    const options = call[1];
    expect(options).toBeDefined();
    if (options === undefined) {
      throw new Error("fetch options were not provided");
    }

    const body = JSON.parse(String(options.body));
    expect(body.typeMap).toBeUndefined();
  });

  it("sets innerHTML to returned HTML on successful render", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ html: "<h1>Hello PHP</h1>" }),
      }),
    );

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe("<h1>Hello PHP</h1>");
    expect(mockShowMain).toHaveBeenCalled();
  });

  it("calls showError on error response", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({ html: "", error: "Something went wrong", trace: "at line 42" }),
      }),
    );

    await renderToCanvas(ctx, canvas);

    expect(mockShowError).toHaveBeenCalledWith({
      title: "PHP Render Error",
      description: "Something went wrong\n\nat line 42",
    });
    expect(mockShowMain).not.toHaveBeenCalled();
  });

  it("calls showError on fetch failure", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    await renderToCanvas(ctx, canvas);

    expect(mockShowError).toHaveBeenCalledWith({
      title: "PHP Render Error",
      description: "Network error",
    });
  });

  it("aborts stale request when new render is called", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent);

    const mockFetch = vi
      .fn()
      .mockImplementationOnce((_url: string, options: RequestInit) => {
        // First call: wait until aborted, then reject
        return new Promise((_resolve, reject) => {
          options.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({ html: "<div>second</div>" }),
        });
      });

    vi.stubGlobal("fetch", mockFetch);

    // Fire first render (don't await)
    const first = renderToCanvas(ctx, canvas);

    // Fire second render immediately (should abort first)
    const second = renderToCanvas(ctx, canvas);

    await Promise.all([first, second]);

    expect(canvas.innerHTML).toBe("<div>second</div>");
    expect(mockShowMain).toHaveBeenCalled();
    // showError should NOT be called for abort
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it("does not abort requests for a different canvas element", async () => {
    const firstCanvas = document.createElement("div");
    const secondCanvas = document.createElement("div");
    const firstCtx = makeContext(phpComponent, { name: "First" });
    const secondCtx = makeContext(phpComponent, { name: "Second" });

    let resolveFirst: ((value: { json: () => Promise<{ html: string }> }) => void) | undefined;
    let firstSignal: AbortSignal | undefined;

    const mockFetch = vi
      .fn()
      .mockImplementationOnce((_url: string, options: RequestInit) => {
        firstSignal = options.signal as AbortSignal;
        return new Promise((resolve) => {
          resolveFirst = resolve as (value: { json: () => Promise<{ html: string }> }) => void;
        });
      })
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ html: "<div>second-canvas</div>" }),
        }),
      );

    vi.stubGlobal("fetch", mockFetch);

    const firstRender = renderToCanvas(firstCtx, firstCanvas);
    const secondRender = renderToCanvas(secondCtx, secondCanvas);

    expect(firstSignal?.aborted).toBe(false);

    resolveFirst?.({
      json: () => Promise.resolve({ html: "<div>first-canvas</div>" }),
    });

    await Promise.all([firstRender, secondRender]);

    expect(firstCanvas.innerHTML).toBe("<div>first-canvas</div>");
    expect(secondCanvas.innerHTML).toBe("<div>second-canvas</div>");
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it("re-executes script tags in rendered HTML", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            html: '<div>content</div><script data-test="true">window.__phpTestExecuted = true;</script>',
          }),
      }),
    );

    await renderToCanvas(ctx, canvas);

    // The script tag should be replaced with a new one
    const scripts = canvas.querySelectorAll("script");
    expect(scripts.length).toBe(1);
    expect(scripts[0]!.getAttribute("data-test")).toBe("true");
    expect(scripts[0]!.textContent).toBe("window.__phpTestExecuted = true;");
  });

  it("treats component without __php flag as non-PHP", async () => {
    const canvas = document.createElement("div");
    const notPhp = { __type: "classMethod", __file: "/path.php" }; // Missing __php: true
    const ctx = makeContext(notPhp);

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe("<p>fallback</p>");
    expect(mockShowMain).toHaveBeenCalled();
  });
});

describe("render", () => {
  it("returns placeholder comment", () => {
    const result = render({});
    expect(result).toContain("storybook-php-content");
    expect(result).toMatch(/^<!--.*-->$/);
  });
});

describe("decorator support", () => {
  it("injects PHP HTML into decorator wrapper via placeholder", async () => {
    const canvas = document.createElement("div");
    const ctx: RenderContext = {
      storyContext: { component: phpComponent, args: {}, name: "Test", title: "Test", id: "test" },
      storyFn: () => `<div class="wrapper">${render({})}</div>`,
      showMain: mockShowMain,
      showError: mockShowError,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ html: "<p>PHP output</p>" }),
      }),
    );

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toContain('<div class="wrapper">');
    expect(canvas.innerHTML).toContain("<p>PHP output</p>");
    expect(canvas.innerHTML).toContain("</div>");
    expect(canvas.innerHTML).not.toContain("storybook-php-content");
    expect(mockShowMain).toHaveBeenCalled();
  });

  it("falls back to raw PHP HTML when no placeholder in storyFn output", async () => {
    const canvas = document.createElement("div");
    const ctx: RenderContext = {
      storyContext: { component: phpComponent, args: {}, name: "Test", title: "Test", id: "test" },
      storyFn: () => "<p>no placeholder here</p>",
      showMain: mockShowMain,
      showError: mockShowError,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ html: "<p>PHP output</p>" }),
      }),
    );

    await renderToCanvas(ctx, canvas);

    expect(canvas.innerHTML).toBe("<p>PHP output</p>");
    expect(mockShowMain).toHaveBeenCalled();
  });
});

describe("preview request lifecycle", () => {
  it("falls back to an empty args object for malformed story args", async () => {
    const canvas = document.createElement("div");
    const ctx = makeContext(phpComponent);
    ctx.storyContext.args = undefined as unknown as Record<string, unknown>;
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ html: "<div>ok</div>" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderToCanvas(ctx, canvas);

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      componentId: "cmp_test",
      args: {},
    });
  });

  it("returns early when a request is aborted before reading JSON", async () => {
    const canvas = document.createElement("div");
    const first = makeContext(phpComponent);
    const second = makeContext(phpComponent);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce((_url: string, options: RequestInit) => {
          const signal = options.signal as AbortSignal;
          return new Promise((resolvePromise) => {
            signal.addEventListener("abort", () => {
              resolvePromise({
                json: () => Promise.resolve({ html: "<div>stale</div>" }),
              });
            });
          });
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ html: "<div>fresh</div>" }),
        }),
    );

    const firstRender = renderToCanvas(first, canvas);
    const secondRender = renderToCanvas(second, canvas);

    await Promise.all([firstRender, secondRender]);

    expect(canvas.innerHTML).toBe("<div>fresh</div>");
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it("returns early when a request is aborted after JSON resolves", async () => {
    const canvas = document.createElement("div");
    const first = makeContext(phpComponent);
    const second = makeContext(phpComponent);
    let resolveJson: ((value: { html: string }) => void) | undefined;

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          json: () =>
            new Promise((innerResolve) => {
              resolveJson = innerResolve;
            }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ html: "<div>fresher</div>" }),
        }),
    );

    const firstRender = renderToCanvas(first, canvas);
    await Promise.resolve();
    const secondRender = renderToCanvas(second, canvas);
    resolveJson?.({ html: "<div>stale</div>" });

    await Promise.all([firstRender, secondRender]);

    expect(canvas.innerHTML).toBe("<div>fresher</div>");
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it("returns early when the response object arrives after abort", async () => {
    const canvas = document.createElement("div");
    const first = makeContext(phpComponent);
    const second = makeContext(phpComponent);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce((_url: string, _options: RequestInit) =>
          Promise.resolve({
            json: () => Promise.resolve({ html: "<div>stale</div>" }),
          }),
        )
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ html: "<div>freshest</div>" }),
        }),
    );

    const firstRender = renderToCanvas(first, canvas);
    const secondRender = renderToCanvas(second, canvas);

    await Promise.all([firstRender, secondRender]);

    expect(canvas.innerHTML).toBe("<div>freshest</div>");
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it("shows trace-less PHP errors and string-thrown failures", async () => {
    const errorCanvas = document.createElement("div");
    const errorCtx = makeContext(phpComponent);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ html: "", error: "Broken render" }),
      }),
    );

    await renderToCanvas(errorCtx, errorCanvas);

    expect(mockShowError).toHaveBeenCalledWith({
      title: "PHP Render Error",
      description: "Broken render",
    });

    mockShowError.mockReset();

    const thrownCanvas = document.createElement("div");
    const thrownCtx = makeContext(phpComponent);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("Network down"));

    await renderToCanvas(thrownCtx, thrownCanvas);

    expect(mockShowError).toHaveBeenCalledWith({
      title: "PHP Render Error",
      description: "Network down",
    });
    expect(previewParameters.renderer).toBe("storybook-php");
  });
});
