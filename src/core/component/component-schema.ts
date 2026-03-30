import {
  listCallableNamesFromResolvedSource,
  resolveComponentCallable,
  resolveComponentSource,
  type ResolvedComponentSource,
} from "./component-source.js";
import { buildSchemasFromMeta, buildTemplateSchema } from "./schema-builder.js";
import type { ResolvedFrameworkOptions } from "../config/framework-config.js";
import type { PhpComponentSchema } from "../../types.js";

export interface LoadComponentSchemasResult {
  resolvedSource: ResolvedComponentSource;
  requestedCallableName: string | null;
  effectiveCallableName: string | null;
  schemas: PhpComponentSchema[];
  dependencies: string[];
  error?: string;
}

export function loadComponentSchemas(
  sourceFile: string,
  requestedCallableName: string | null,
  options: ResolvedFrameworkOptions,
): LoadComponentSchemasResult {
  const resolvedSource = resolveComponentSource(sourceFile, options);
  return resolveSchemasForSource(resolvedSource, requestedCallableName);
}

export function resolveSchemasForSource(
  resolvedSource: ResolvedComponentSource,
  requestedCallable: string | null,
): LoadComponentSchemasResult {
  const effectiveCallableName = resolveComponentCallable(resolvedSource, requestedCallable);

  if (resolvedSource.inlineArgs) {
    return buildResult(resolvedSource, requestedCallable, effectiveCallableName, [
      buildTemplateSchema({
        sourceFile: resolvedSource.sourceFile,
        executionFile: resolvedSource.executionFile,
        allArgs: resolvedSource.inlineArgs,
        adapter: resolvedSource.adapter,
      }),
    ]);
  }

  if (effectiveCallableName === null) {
    return buildResult(resolvedSource, requestedCallable, effectiveCallableName, [
      buildTemplateSchema({
        sourceFile: resolvedSource.sourceFile,
        executionFile: resolvedSource.executionFile,
        allArgs: {},
        adapter: resolvedSource.adapter,
      }),
    ]);
  }

  if (!resolvedSource.meta) {
    return buildMissingCallableResult(resolvedSource, requestedCallable, effectiveCallableName);
  }

  const schemas = buildSchemasFromMeta(resolvedSource.meta, effectiveCallableName, {
    sourceFile: resolvedSource.sourceFile,
    executionFile: resolvedSource.executionFile,
    adapter: resolvedSource.adapter,
  });

  if (schemas.length === 0) {
    return buildMissingCallableResult(resolvedSource, requestedCallable, effectiveCallableName);
  }

  return buildResult(resolvedSource, requestedCallable, effectiveCallableName, schemas);
}

export function listCallableNames(sourceFile: string, options: ResolvedFrameworkOptions): string[] {
  return listCallableNamesFromResolvedSource(resolveComponentSource(sourceFile, options));
}

export function isMissingRequestedCallable(result: LoadComponentSchemasResult): boolean {
  return result.effectiveCallableName !== null && result.schemas.length === 0;
}

function buildResult(
  resolvedSource: ResolvedComponentSource,
  requestedCallableName: string | null,
  effectiveCallableName: string | null,
  schemas: PhpComponentSchema[],
): LoadComponentSchemasResult {
  return {
    resolvedSource,
    requestedCallableName,
    effectiveCallableName,
    schemas,
    dependencies: resolvedSource.dependencies,
  };
}

function buildMissingCallableResult(
  resolvedSource: ResolvedComponentSource,
  requestedCallableName: string | null,
  effectiveCallableName: string,
): LoadComponentSchemasResult {
  return {
    ...buildResult(resolvedSource, requestedCallableName, effectiveCallableName, []),
    error: `PHP callable "${effectiveCallableName}" not found in ${resolvedSource.executionFile}`,
  };
}
