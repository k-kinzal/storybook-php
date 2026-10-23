import type { IncomingMessage, ServerResponse } from "node:http";
import { PhpExecutor, type PhpExecutorOptions } from "./php-executor.js";
import { RenderRegistry } from "../render/render-registry.js";
import { RENDER_PATH } from "../../shared/render-contract.js";
import {
  parseRenderInvokeRequest,
  RequestValidationError,
  resolveExecutionRequest,
} from "../render/render-request.js";

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

    if (!isTrustedRequest(req)) {
      sendJson(res, 403, { html: "", error: "Cross-origin render requests are not allowed" });
      return;
    }

    // Requiring JSON prevents cross-origin HTML forms and no-cors fetches from
    // invoking PHP without a CORS preflight, even when Origin is absent.
    const contentType = req.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "application/json") {
      sendJson(res, 415, { html: "", error: "Render requests require application/json" });
      return;
    }

    try {
      const body = await readBody(req);
      const data = parseRenderInvokeRequest(body);
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

function isTrustedRequest(req: IncomingMessage): boolean {
  const fetchSite = req.headers["sec-fetch-site"];
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  const origin = req.headers.origin;
  // Non-browser clients do not necessarily send Origin. They still have to
  // use JSON, and Storybook/Vite validates the request's Host header.
  if (origin === undefined) {
    return true;
  }

  try {
    const url = new URL(origin);
    // Compare the public host and port so HTTPS-terminating proxies work too.
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin === origin &&
      url.host === req.headers.host
    );
  } catch {
    return false;
  }
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
