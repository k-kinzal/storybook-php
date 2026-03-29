import type { IncomingMessage, ServerResponse } from "node:http";
import { PhpExecutor, type PhpExecutorOptions } from "./php-executor.js";
import type { PhpRenderInvokeRequest } from "./types.js";
import { RenderRegistry } from "./render/render-registry.js";
import {
  RENDER_PATH,
  RequestValidationError,
  resolveExecutionRequest,
} from "./render/render-request.js";

type PhpMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;

export function createPhpMiddleware(
  options: PhpExecutorOptions = {},
  registry?: RenderRegistry,
): PhpMiddleware {
  const executor = new PhpExecutor(options);

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== RENDER_PATH || req.method !== "POST") {
      next();
      return;
    }

    try {
      const body = await readBody(req);
      const data = JSON.parse(body) as PhpRenderInvokeRequest;
      const request = resolveExecutionRequest(data, registry);

      const result = await executor.execute(request);
      sendJson(res, result.error ? 500 : 200, result);
    } catch (err) {
      sendJson(res, err instanceof RequestValidationError ? 400 : 500, {
        html: "",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export { RENDER_PATH };
