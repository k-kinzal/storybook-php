import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import type { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { RenderRegistry } from "../../src/runtime/render/render-registry.js";
import { createPhpMiddleware, RENDER_PATH } from "../../src/runtime/server/dev-middleware.js";

// ---------------------------------------------------------------------------
// Mock PhpExecutor
// ---------------------------------------------------------------------------
const mockExecute = vi.fn();

vi.mock("../../src/runtime/server/php-executor.js", () => ({
  PhpExecutor: vi.fn().mockImplementation(function () {
    return { execute: mockExecute };
  }),
}));

// ---------------------------------------------------------------------------
// Helpers to create mock req/res objects
// ---------------------------------------------------------------------------
function createMockReq(method: string, url: string, body?: string): IncomingMessage {
  const emitter = new EventEmitter();
  const req = emitter as unknown as IncomingMessage;
  req.method = method;
  req.url = url;

  // Simulate body delivery on next tick
  if (body !== undefined) {
    process.nextTick(() => {
      emitter.emit("data", Buffer.from(body));
      emitter.emit("end");
    });
  } else {
    process.nextTick(() => {
      emitter.emit("end");
    });
  }

  return req;
}

function createErrorReq(): IncomingMessage {
  const emitter = new EventEmitter();
  const req = emitter as unknown as IncomingMessage;
  req.method = "POST";
  req.url = RENDER_PATH;

  process.nextTick(() => {
    emitter.emit("error", "socket failed");
  });

  return req;
}

function createMockRes(): ServerResponse & {
  _status: number;
  _headers: Record<string, string>;
  _body: string;
} {
  const res = {
    _status: 0,
    _headers: {} as Record<string, string>,
    _body: "",
    writeHead(status: number, headers?: Record<string, string>) {
      res._status = status;
      if (headers) {
        Object.assign(res._headers, headers);
      }
    },
    end(data?: string) {
      if (data) {
        res._body = data;
      }
    },
  };
  return res as unknown as ServerResponse & {
    _status: number;
    _headers: Record<string, string>;
    _body: string;
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("createPhpMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const middleware = createPhpMiddleware();

  // -------------------------------------------------------------------------
  // Routing: non-matching requests call next()
  // -------------------------------------------------------------------------
  it("calls next() for non-POST requests", async () => {
    const req = createMockReq("GET", RENDER_PATH);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res._status).toBe(0);
  });

  it("calls next() for wrong path", async () => {
    const req = createMockReq("POST", "/some/other/path");
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res._status).toBe(0);
  });

  it("calls next() for GET to wrong path", async () => {
    const req = createMockReq("GET", "/other");
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------
  it("returns 400 for invalid type", async () => {
    const body = JSON.stringify({
      type: "invalidType",
      file: "/some/file.php",
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    const parsed = JSON.parse(res._body) as { error: string };
    expect(parsed.error).toContain("Invalid type");
  });

  it("returns 400 for missing type", async () => {
    const body = JSON.stringify({ file: "/some/file.php" });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
  });

  it("returns 400 for missing file", async () => {
    const body = JSON.stringify({ type: "classMethod" });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    const parsed = JSON.parse(res._body) as { error: string };
    expect(parsed.error).toContain("Missing required field: file");
  });

  // -------------------------------------------------------------------------
  // Successful execution
  // -------------------------------------------------------------------------
  it("returns 200 with HTML for valid request", async () => {
    mockExecute.mockResolvedValueOnce({
      html: "<div>Hello</div>",
    });

    const body = JSON.stringify({
      type: "classMethod",
      file: "/some/file.php",
      class: "App\\MyClass",
      callable: "render",
      args: { name: "World" },
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");

    const parsed = JSON.parse(res._body) as { html: string };
    expect(parsed.html).toBe("<div>Hello</div>");

    // Verify executor was called with proper request
    expect(mockExecute).toHaveBeenCalledWith({
      type: "classMethod",
      file: "/some/file.php",
      sourceFile: null,
      class: "App\\MyClass",
      callable: "render",
      args: { name: "World" },
      bootstrap: null,
      adapter: null,
      typeMap: null,
    });
  });

  it("returns 200 for staticMethod type", async () => {
    mockExecute.mockResolvedValueOnce({
      html: '<div class="alert">Error</div>',
    });

    const body = JSON.stringify({
      type: "staticMethod",
      file: "/some/alert.php",
      class: "App\\Alert",
      callable: "danger",
      args: { message: "Error" },
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res._status).toBe(200);
  });

  it("returns 200 for function type", async () => {
    mockExecute.mockResolvedValueOnce({
      html: "<span>badge</span>",
    });

    const body = JSON.stringify({
      type: "function",
      file: "/some/functions.php",
      callable: "badge",
      args: { label: "New" },
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res._status).toBe(200);
  });

  it("returns 200 for template type", async () => {
    mockExecute.mockResolvedValueOnce({
      html: "<div>template</div>",
    });

    const body = JSON.stringify({
      type: "template",
      file: "/some/template.php",
      args: { title: "Hi" },
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res._status).toBe(200);
  });

  it("returns 200 for enumMethod type", async () => {
    mockExecute.mockResolvedValueOnce({
      html: '<span style="color:red">Red</span>',
    });

    const body = JSON.stringify({
      type: "enumMethod",
      file: "/some/enum.php",
      class: "App\\Color",
      callable: "badge",
      args: { _case: "red" },
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res._status).toBe(200);
  });

  it("resolves componentId through the registry", async () => {
    mockExecute.mockResolvedValueOnce({ html: "<div>registry</div>" });

    const registry = new RenderRegistry();
    const componentId = registry.register({
      type: "classMethod",
      file: "/some/runtime.php",
      sourceFile: "/some/source.php",
      class: "App\\RegistryComponent",
      callable: "render",
      adapter: "/some/adapter.php",
    });

    const middlewareWithRegistry = createPhpMiddleware({}, registry);
    const body = JSON.stringify({
      componentId,
      args: { title: "Hello" },
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middlewareWithRegistry(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(200);
    expect(mockExecute).toHaveBeenCalledWith({
      type: "classMethod",
      file: "/some/runtime.php",
      sourceFile: "/some/source.php",
      class: "App\\RegistryComponent",
      callable: "render",
      args: { title: "Hello" },
      bootstrap: null,
      adapter: "/some/adapter.php",
      typeMap: null,
    });
  });

  // -------------------------------------------------------------------------
  // Executor error propagation
  // -------------------------------------------------------------------------
  it("returns 500 when executor returns an error", async () => {
    mockExecute.mockResolvedValueOnce({
      html: "",
      error: "PHP fatal error",
      trace: "stack trace here",
    });

    const body = JSON.stringify({
      type: "classMethod",
      file: "/some/file.php",
      class: "App\\Broken",
      callable: "render",
      args: {},
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(500);
    const parsed = JSON.parse(res._body) as { error: string };
    expect(parsed.error).toBe("PHP fatal error");
  });

  // -------------------------------------------------------------------------
  // Invalid JSON body
  // -------------------------------------------------------------------------
  it("returns 400 for invalid JSON body", async () => {
    const req = createMockReq("POST", RENDER_PATH, "not valid json{{{");
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    const parsed = JSON.parse(res._body) as { error: string };
    expect(parsed.error).toBe("Invalid JSON body");
  });

  it("returns 400 for non-object JSON body", async () => {
    const req = createMockReq("POST", RENDER_PATH, "null");
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    const parsed = JSON.parse(res._body) as { error: string };
    expect(parsed.error).toBe("Render request body must be a JSON object");
  });

  // -------------------------------------------------------------------------
  // Per-story typeMap forwarding
  // -------------------------------------------------------------------------
  it("forwards typeMap from POST body to executor", async () => {
    mockExecute.mockResolvedValueOnce({ html: "<p>ok</p>" });

    const typeMap = {
      bindings: { "App\\Iface": "App\\Concrete" },
      args: { "App\\Foo::$bar": "string" },
    };
    const body = JSON.stringify({
      type: "classMethod",
      file: "/some/file.php",
      class: "App\\MyClass",
      callable: "render",
      args: {},
      typeMap,
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res._status).toBe(200);
    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({ typeMap }));
  });

  // -------------------------------------------------------------------------
  // Defaults for optional fields
  // -------------------------------------------------------------------------
  it("fills in defaults for optional fields (class, callable, args, bootstrap)", async () => {
    mockExecute.mockResolvedValueOnce({ html: "<p>ok</p>" });

    const body = JSON.stringify({
      type: "template",
      file: "/some/template.php",
    });
    const req = createMockReq("POST", RENDER_PATH, body);
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res._status).toBe(200);
    expect(mockExecute).toHaveBeenCalledWith({
      type: "template",
      file: "/some/template.php",
      sourceFile: null,
      class: null,
      callable: null,
      args: {},
      bootstrap: null,
      adapter: null,
      typeMap: null,
    });
  });

  it("serializes non-Error request failures", async () => {
    const middleware = createPhpMiddleware();
    const req = createErrorReq();
    const res = createMockRes();

    await middleware(req, res, () => undefined);

    expect(res._status).toBe(500);
    expect(JSON.parse(res._body)).toEqual({
      html: "",
      error: "socket failed",
    });
  });
});
