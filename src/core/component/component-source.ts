import { parsePhpFile } from "../analysis/php-parser.js";
import {
  resolveSourceFileMapping,
  type ResolvedFrameworkOptions,
} from "../config/framework-config.js";
import type { ArgOverride, PhpFileMeta } from "../../types.js";

export interface ResolvedComponentSource {
  sourceFile: string;
  executionFile: string;
  adapter: string | null;
  dependencies: string[];
  meta: PhpFileMeta | null;
  fileArgOverrides: Record<string, string | ArgOverride> | null;
  callableArgOverrides: Record<string, Record<string, string | ArgOverride>>;
  mappedCallable: string | null;
}

export function resolveComponentSource(
  sourceFile: string,
  options: ResolvedFrameworkOptions,
): ResolvedComponentSource {
  const mapping = resolveSourceFileMapping(sourceFile, options);
  const adapter = mapping?.adapter ?? options.adapter;

  const executionFile = mapping?.phpFile ?? sourceFile;
  const dependencies = uniquePaths([sourceFile, executionFile, ...(mapping?.includes ?? [])]);

  let meta = parsePhpFile(executionFile);

  if (mapping?.includes && mapping.includes.length > 0) {
    const extraMetas = mapping.includes.map((includePath) => parsePhpFile(includePath));
    meta = mergeFileMetas(meta, ...extraMetas);
  }

  return {
    sourceFile,
    executionFile,
    adapter,
    dependencies,
    meta,
    fileArgOverrides: mapping?.args ?? null,
    callableArgOverrides: mapping?.callables
      ? Object.fromEntries(
          Object.entries(mapping.callables).map(([callableName, target]) => [
            callableName,
            target.args ?? {},
          ]),
        )
      : {},
    mappedCallable: mapping?.callable ?? null,
  };
}

export function resolveComponentCallable(
  resolvedSource: ResolvedComponentSource,
  requestedCallable: string | null,
): string | null {
  return resolvedSource.mappedCallable ?? requestedCallable;
}

export function listCallableNamesFromResolvedSource(
  resolvedSource: ResolvedComponentSource,
): string[] {
  if (!resolvedSource.meta) {
    return [];
  }

  const callableNames = new Set(listCallableNamesFromMeta(resolvedSource.meta));

  if (resolvedSource.mappedCallable) {
    callableNames.add(resolvedSource.mappedCallable);
  }

  return [...callableNames].sort();
}

export function listCallableNamesFromMeta(meta: PhpFileMeta): string[] {
  const callableNames = new Set<string>();

  for (const fn of meta.functions) {
    callableNames.add(fn.name);
  }

  for (const cls of meta.classes) {
    if (cls.isTrait || cls.isInterface) continue;
    for (const method of cls.methods) {
      callableNames.add(method.name);
    }
  }

  return [...callableNames].sort();
}

function mergeFileMetas(base: PhpFileMeta, ...extras: PhpFileMeta[]): PhpFileMeta {
  const mergedClasses = [...base.classes];
  const mergedFunctions = [...base.functions];
  const seenClassFqns = new Set(base.classes.map((cls) => cls.fqn));
  const seenFunctionFqns = new Set(base.functions.map((fn) => fn.fqn));

  for (const extra of extras) {
    for (const cls of extra.classes) {
      if (seenClassFqns.has(cls.fqn)) continue;
      mergedClasses.push(cls);
      seenClassFqns.add(cls.fqn);
    }
    for (const fn of extra.functions) {
      if (seenFunctionFqns.has(fn.fqn)) continue;
      mergedFunctions.push(fn);
      seenFunctionFqns.add(fn.fqn);
    }
  }

  return {
    filePath: base.filePath,
    namespace: base.namespace,
    classes: mergedClasses,
    functions: mergedFunctions,
  };
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}
