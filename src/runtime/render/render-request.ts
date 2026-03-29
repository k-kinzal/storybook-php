import { RenderRegistry } from "./render-registry.js";
import type {
  PhpCallableType,
  PhpRenderInvokeRequest,
  PhpRenderRequest,
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

export function resolveExecutionRequest(
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
  if (!data.type || !VALID_RENDER_TYPES.includes(data.type)) {
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
