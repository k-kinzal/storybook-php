import { describe, expect, it } from "vite-plus/test";
import type { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { createPhpMiddleware, RENDER_PATH } from "../runtime/server/dev-middleware.js";

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
  _body: string;
} {
  const res = {
    _status: 0,
    _body: "",
    writeHead(status: number) {
      res._status = status;
    },
    end(data?: string) {
      if (data) {
        res._body = data;
      }
    },
  };

  return res as unknown as ServerResponse & {
    _status: number;
    _body: string;
  };
}

describe("dev-middleware coverage extras", () => {
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
