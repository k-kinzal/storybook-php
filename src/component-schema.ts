import {
  listCallableNamesFromResolvedSource,
  resolveComponentCallable,
  resolveComponentSource,
  type ResolvedComponentSource,
} from "./component-source.js";
import { buildSchemasFromMeta, buildTemplateSchema } from "./schema-builder.js";
import type { PhpComponentSchema } from "./types.js";
import type { ResolvedFrameworkOptions } from "./framework-config.js";

export interface LoadComponentSchemasResult {
  schemas: PhpComponentSchema[];
  dependencies: string[];
  error?: string;
}

export function loadComponentSchemas(
  sourceFile: string,
  callableName: string | null,
  options: ResolvedFrameworkOptions,
): LoadComponentSchemasResult {
  const resolvedSource = resolveComponentSource(sourceFile, options);
  return resolveSchemasForSource(resolvedSource, callableName);
}

export function resolveSchemasForSource(
  resolvedSource: ResolvedComponentSource,
  requestedCallable: string | null,
): LoadComponentSchemasResult {
  if (resolvedSource.inlineArgs) {
    return {
      schemas: [
        buildTemplateSchema({
          sourceFile: resolvedSource.sourceFile,
          executionFile: resolvedSource.executionFile,
          allArgs: resolvedSource.inlineArgs,
          adapter: resolvedSource.adapter,
        }),
      ],
      dependencies: resolvedSource.dependencies,
    };
  }

  const effectiveCallableName = resolveComponentCallable(resolvedSource, requestedCallable);

  if (effectiveCallableName === null) {
    return {
      schemas: [
        buildTemplateSchema({
          sourceFile: resolvedSource.sourceFile,
          executionFile: resolvedSource.executionFile,
          allArgs: {},
          adapter: resolvedSource.adapter,
        }),
      ],
      dependencies: resolvedSource.dependencies,
    };
  }

  if (!resolvedSource.meta) {
    return {
      schemas: [],
      dependencies: resolvedSource.dependencies,
      error: `PHP callable "${effectiveCallableName}" not found in ${resolvedSource.executionFile}`,
    };
  }

  const schemas = buildSchemasFromMeta(resolvedSource.meta, effectiveCallableName, {
    sourceFile: resolvedSource.sourceFile,
    executionFile: resolvedSource.executionFile,
    adapter: resolvedSource.adapter,
  });

  if (schemas.length === 0) {
    return {
      schemas: [],
      dependencies: resolvedSource.dependencies,
      error: `PHP callable "${effectiveCallableName}" not found in ${resolvedSource.executionFile}`,
    };
  }

  return { schemas, dependencies: resolvedSource.dependencies };
}

export function listCallableNames(sourceFile: string, options: ResolvedFrameworkOptions): string[] {
  return listCallableNamesFromResolvedSource(resolveComponentSource(sourceFile, options));
}
