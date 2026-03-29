import type { IncomingMessage, ServerResponse } from "node:http";
import { PhpExecutor, type PhpExecutorOptions } from "./php-executor.js";
import { RenderRegistry } from "./render-registry.js";
import type {
  PhpCallableType,
  PhpRenderInvokeRequest,
  PhpRenderRequest,
  StoryTypeMap,
} from "./types.js";

const RENDER_PATH = "/__storybook_php/render";
const VALID_TYPES: PhpCallableType[] = [
  "classMethod",
  "staticMethod",
  "function",
  "template",
  "enumMethod",
];

type PhpMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;

class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

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

function resolveExecutionRequest(
  data: PhpRenderInvokeRequest,
  registry: RenderRegistry | undefined,
): PhpRenderRequest {
  if (typeof data.componentId === "string" && data.componentId !== "") {
    if (!registry) {
      throw new RequestValidationError("Component registry is not available.");
    }

    const renderPlan = registry.get(data.componentId);
    if (!renderPlan) {
      throw new RequestValidationError(`Unknown componentId: ${data.componentId}`);
    }

    return {
      type: renderPlan.type,
      file: renderPlan.file,
      sourceFile: renderPlan.sourceFile,
      class: renderPlan.class,
      callable: renderPlan.callable,
      args: isRecord(data.args) ? data.args : {},
      bootstrap: data.bootstrap ?? null,
      adapter: data.adapter ?? renderPlan.adapter ?? null,
      typeMap: (data.typeMap as StoryTypeMap) ?? null,
    };
  }

  return validateLegacyRequest(data);
}

function validateLegacyRequest(data: PhpRenderInvokeRequest): PhpRenderRequest {
  if (!data.type || !VALID_TYPES.includes(data.type)) {
    throw new RequestValidationError(`Invalid type: ${String(data.type)}`);
  }

  if (!data.file) {
    throw new RequestValidationError("Missing required field: file");
  }

  return {
    type: data.type,
    file: data.file,
    sourceFile: data.sourceFile ?? null,
    class: data.class ?? null,
    callable: data.callable ?? null,
    args: isRecord(data.args) ? data.args : {},
    bootstrap: data.bootstrap ?? null,
    adapter: data.adapter ?? null,
    typeMap: (data.typeMap as StoryTypeMap) ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
