import { RenderRegistry } from "./render-registry.js";
import type {
  PhpCallableType,
  PhpRenderInvokeRequest,
  PhpRenderRequest,
  PhpRenderPlan,
  StoryTypeMap,
} from "../../types.js";

export { RENDER_PATH } from "../../shared/render-contract.js";
export const VALID_RENDER_TYPES: PhpCallableType[] = [
  "classMethod",
  "staticMethod",
  "function",
  "template",
  "enumMethod",
];

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

interface ExecutionTarget {
  type: PhpRenderRequest["type"];
  file: string;
  sourceFile: string | null;
  class: string | null;
  callable: string | null;
  adapter: string | null;
}

export function parseRenderInvokeRequest(body: string): PhpRenderInvokeRequest {
  let parsed: unknown;

  try {
    parsed = JSON.parse(body);
  } catch {
    throw new RequestValidationError("Invalid JSON body");
  }

  if (!isRecord(parsed)) {
    throw new RequestValidationError("Render request body must be a JSON object");
  }

  return parsed as unknown as PhpRenderInvokeRequest;
}

export function resolveExecutionRequest(
  data: PhpRenderInvokeRequest,
  registry: RenderRegistry | undefined,
): PhpRenderRequest {
  return buildExecutionRequest(resolveExecutionTarget(data, registry), data);
}

function resolveExecutionTarget(
  data: PhpRenderInvokeRequest,
  registry: RenderRegistry | undefined,
): ExecutionTarget {
  if (hasComponentId(data)) {
    return resolveRegisteredTarget(data.componentId, registry);
  }

  return validateLegacyTarget(data);
}

function resolveRegisteredTarget(
  componentId: string,
  registry: RenderRegistry | undefined,
): ExecutionTarget {
  if (!registry) {
    throw new RequestValidationError("Component registry is not available.");
  }

  const renderPlan = registry.get(componentId);
  if (!renderPlan) {
    throw new RequestValidationError(`Unknown componentId: ${componentId}`);
  }

  return executionTargetFromPlan(renderPlan);
}

function executionTargetFromPlan(renderPlan: PhpRenderPlan): ExecutionTarget {
  return {
    type: renderPlan.type,
    file: renderPlan.file,
    sourceFile: renderPlan.sourceFile,
    class: renderPlan.class,
    callable: renderPlan.callable,
    adapter: renderPlan.adapter ?? null,
  };
}

function validateLegacyTarget(data: PhpRenderInvokeRequest): ExecutionTarget {
  if (!data.type || !VALID_RENDER_TYPES.includes(data.type)) {
    throw new RequestValidationError(`Invalid type: ${String(data.type)}`);
  }

  if (typeof data.file !== "string" || data.file === "") {
    throw new RequestValidationError("Missing required field: file");
  }

  return {
    type: data.type,
    file: data.file,
    sourceFile: nullableString(data.sourceFile),
    class: nullableString(data.class),
    callable: nullableString(data.callable),
    adapter: null,
  };
}

function buildExecutionRequest(
  target: ExecutionTarget,
  data: PhpRenderInvokeRequest,
): PhpRenderRequest {
  return {
    ...target,
    args: isRecord(data.args) ? data.args : {},
    bootstrap: nullableString(data.bootstrap),
    adapter: nullableString(data.adapter) ?? target.adapter,
    typeMap: normalizeStoryTypeMap(data.typeMap),
  };
}

function normalizeStoryTypeMap(value: unknown): StoryTypeMap | null {
  return isRecord(value) ? (value as StoryTypeMap) : null;
}

function hasComponentId(data: PhpRenderInvokeRequest): data is PhpRenderInvokeRequest & {
  componentId: string;
} {
  return typeof data.componentId === "string" && data.componentId !== "";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
