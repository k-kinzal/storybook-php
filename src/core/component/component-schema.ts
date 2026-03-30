import {
  listCallableNamesFromResolvedSource,
  resolveComponentCallable,
  resolveComponentSource,
  type ResolvedComponentSource,
} from "./component-source.js";
import { argOverridesToArgMap, mergePublicArgOverrides } from "./public-args.js";
import { buildSchemasFromMeta, buildTemplateSchema } from "./schema-builder.js";
import type { ResolvedFrameworkOptions } from "../config/framework-config.js";
import type { ArgOverride, PhpComponentSchema } from "../../types.js";

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
  const publicArgOverrides = mergeArgOverrideMaps(
    resolvedSource.fileArgOverrides,
    effectiveCallableName
      ? (resolvedSource.callableArgOverrides[effectiveCallableName] ?? null)
      : null,
  );
  const templatePublicArgs = publicArgOverrides ? argOverridesToArgMap(publicArgOverrides) : {};

  if (
    Object.keys(templatePublicArgs).length > 0 &&
    (!resolvedSource.meta || listCallableNamesFromResolvedSource(resolvedSource).length === 0)
  ) {
    return buildResult(resolvedSource, requestedCallable, effectiveCallableName, [
      buildTemplateSchema({
        sourceFile: resolvedSource.sourceFile,
        executionFile: resolvedSource.executionFile,
        publicArgs: templatePublicArgs,
        adapter: resolvedSource.adapter,
      }),
    ]);
  }

  if (effectiveCallableName === null) {
    return buildResult(resolvedSource, requestedCallable, effectiveCallableName, [
      buildTemplateSchema({
        sourceFile: resolvedSource.sourceFile,
        executionFile: resolvedSource.executionFile,
        publicArgs: templatePublicArgs,
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

  return buildResult(
    resolvedSource,
    requestedCallable,
    effectiveCallableName,
    schemas.map((schema) => ({
      ...schema,
      publicArgs: mergePublicArgOverrides(
        schema.publicArgs,
        schema.constructorArgs,
        schema.callableArgs,
        publicArgOverrides,
      ),
    })),
  );
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

function mergeArgOverrideMaps(
  base: Record<string, string | ArgOverride> | null,
  override: Record<string, string | ArgOverride> | null,
): Record<string, string | ArgOverride> | null {
  if (!base && !override) {
    return null;
  }

  return {
    ...base,
    ...override,
  };
}
