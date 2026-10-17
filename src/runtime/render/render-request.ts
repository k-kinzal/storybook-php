import { RenderRegistry } from "./render-registry.js";
import { mergePublicArgOverrides } from "../../core/component/public-args.js";
import type {
  PhpRenderInvokeRequest,
  PhpRenderRequest,
  PhpRenderPlan,
  PhpStoryParameters,
} from "../../types.js";

export { RENDER_PATH } from "../../shared/render-contract.js";

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
  publicArgDefs: PhpRenderRequest["publicArgDefs"];
  constructorArgDefs: PhpRenderRequest["constructorArgDefs"];
  callableArgDefs: PhpRenderRequest["callableArgDefs"];
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

  const componentId = parsed["componentId"];
  if (typeof componentId !== "string" || componentId === "") {
    throw new RequestValidationError("Render request body must include componentId");
  }

  const args = parsed["args"];
  if (!isRecord(args)) {
    throw new RequestValidationError('Render request body field "args" must be a JSON object');
  }

  if ("typeMap" in parsed) {
    throw new RequestValidationError(
      "typeMap is no longer supported. Use php.component and php.types.",
    );
  }
  const php = parsed["php"];
  if (php !== undefined && php !== null && !isRecord(php)) {
    throw new RequestValidationError(
      'Render request body field "php" must be a JSON object or null',
    );
  }
  if (isRecord(php)) {
    for (const field of ["component", "types"]) {
      if (php[field] !== undefined && !isRecord(php[field])) {
        throw new RequestValidationError(
          `Render request body field "php.${field}" must be a JSON object`,
        );
      }
    }
  }

  return {
    componentId,
    args,
    ...(php !== undefined ? { php: php as PhpStoryParameters | null } : {}),
  };
}

export function resolveExecutionRequest(
  data: PhpRenderInvokeRequest,
  registry: RenderRegistry | undefined,
): PhpRenderRequest {
  return buildExecutionRequest(resolveRegisteredTarget(data.componentId, registry), data);
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

function executionTargetFromPlan(renderTarget: {
  plan: PhpRenderPlan;
  publicArgDefs: PhpRenderRequest["publicArgDefs"];
  constructorArgDefs: PhpRenderRequest["constructorArgDefs"];
  callableArgDefs: PhpRenderRequest["callableArgDefs"];
}): ExecutionTarget {
  return {
    type: renderTarget.plan.type,
    file: renderTarget.plan.file,
    sourceFile: renderTarget.plan.sourceFile,
    class: renderTarget.plan.class,
    callable: renderTarget.plan.callable,
    publicArgDefs: renderTarget.publicArgDefs ?? null,
    constructorArgDefs: renderTarget.constructorArgDefs ?? null,
    callableArgDefs: renderTarget.callableArgDefs ?? null,
    adapter: renderTarget.plan.adapter ?? null,
  };
}

function buildExecutionRequest(
  target: ExecutionTarget,
  data: PhpRenderInvokeRequest,
): PhpRenderRequest {
  const php = normalizePhpStoryParameters(data.php);

  return {
    ...target,
    args: isRecord(data.args) ? data.args : {},
    publicArgDefs: mergeStoryPublicArgDefs(target, php) ?? null,
    constructorArgDefs: target.constructorArgDefs ?? null,
    callableArgDefs: target.callableArgDefs ?? null,
    bootstrap: null,
    adapter: target.adapter,
    types: php?.types ?? null,
  };
}

function normalizePhpStoryParameters(value: unknown): PhpStoryParameters | null {
  return isRecord(value) ? (value as PhpStoryParameters) : null;
}

function mergeStoryPublicArgDefs(
  target: ExecutionTarget,
  php: PhpStoryParameters | null,
): PhpRenderRequest["publicArgDefs"] {
  if (!target.publicArgDefs) {
    return null;
  }

  return mergePublicArgOverrides(
    target.publicArgDefs,
    target.constructorArgDefs ?? {},
    target.callableArgDefs ?? {},
    php?.component?.args ?? null,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
