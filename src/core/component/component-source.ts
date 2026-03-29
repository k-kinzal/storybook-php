import { parsePhpFile } from "../analysis/php-parser.js";
import {
  findResolvedFileMapping,
  resolveAdapterForSourceFile,
  type ResolvedFrameworkOptions,
} from "../config/framework-config.js";
import type { ArgOverride, PhpArgMap, PhpFileMeta, PhpParamMeta } from "../../types.js";

interface EnrichedParamMeta extends PhpParamMeta {
  options?: (string | number | boolean)[];
  elementType?: string;
}

export interface ResolvedComponentSource {
  sourceFile: string;
  executionFile: string;
  adapter: string | null;
  dependencies: string[];
  meta: PhpFileMeta | null;
  inlineArgs: PhpArgMap | null;
  mappedCallable: string | null;
}

export function resolveComponentSource(
  sourceFile: string,
  options: ResolvedFrameworkOptions,
): ResolvedComponentSource {
  const mapping = options.typeMap?.files
    ? findResolvedFileMapping(sourceFile, options.typeMap.files)
    : null;
  const adapter = resolveAdapterForSourceFile(sourceFile, options);

  if (mapping?.args) {
    return {
      sourceFile,
      executionFile: sourceFile,
      adapter,
      dependencies: [sourceFile],
      meta: null,
      inlineArgs: inlineArgsToArgMap(mapping.args),
      mappedCallable: mapping.callable ?? null,
    };
  }

  const executionFile = mapping?.phpFile ?? sourceFile;
  const dependencies = uniquePaths([sourceFile, executionFile, ...(mapping?.includes ?? [])]);

  let meta = parsePhpFile(executionFile);

  if (mapping?.includes && mapping.includes.length > 0) {
    const extraMetas = mapping.includes.map((includePath) => parsePhpFile(includePath));
    meta = mergeFileMetas(meta, ...extraMetas);
  }

  if (options.typeMap?.args) {
    applyArgOverrides(meta, options.typeMap.args);
  }

  return {
    sourceFile,
    executionFile,
    adapter,
    dependencies,
    meta,
    inlineArgs: null,
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
  if (!resolvedSource.meta || resolvedSource.inlineArgs) {
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

function inlineArgsToArgMap(args: Record<string, string | ArgOverride>): PhpArgMap {
  return Object.fromEntries(
    Object.entries(args).map(([name, def], position) => {
      if (typeof def === "string") {
        const nullable = def.startsWith("?");
        return [
          name,
          {
            type: nullable ? def.slice(1) : def,
            required: !nullable,
            position,
            nullable,
          },
        ] as const;
      }

      return [
        name,
        {
          type: def.type ?? "unknown",
          required: def.required ?? (def.default === undefined && !(def.nullable ?? false)),
          position,
          nullable: def.nullable ?? false,
          ...(def.default !== undefined ? { default: def.default } : {}),
          ...(def.options !== undefined ? { options: def.options } : {}),
          ...(def.elementType !== undefined ? { elementType: def.elementType } : {}),
        },
      ] as const;
    }),
  );
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

function applyArgOverrides(
  meta: PhpFileMeta,
  argOverrides: Record<string, string | ArgOverride>,
): void {
  for (const [key, override] of Object.entries(argOverrides)) {
    const match = key.match(/^(.+?)::(?:(\w+)::\$(\w+)|\$(\w+))$/);
    if (!match) continue;

    const fqn = match[1]!;
    const methodName = match[2] ?? null;
    const paramName = match[3] ?? match[4]!;

    for (const cls of meta.classes) {
      if (cls.fqn !== fqn && cls.name !== fqn) continue;
      if (methodName) {
        for (const method of cls.methods) {
          if (method.name !== methodName) continue;
          applyOverrideToParam(method.params, paramName, override);
        }
      } else {
        applyOverrideToParam(cls.constructorParams, paramName, override);
      }
    }
  }
}

function applyOverrideToParam(
  params: PhpParamMeta[],
  paramName: string,
  override: string | ArgOverride,
): void {
  const param = params.find((candidate) => candidate.name === paramName) as
    | EnrichedParamMeta
    | undefined;
  if (!param) return;

  if (typeof override === "string") {
    param.type = override;
    return;
  }

  if (override.type !== undefined) param.type = override.type;
  if (override.nullable !== undefined) param.nullable = override.nullable;
  if (override.required !== undefined) param.required = override.required;
  if (override.default !== undefined) param.default = override.default;
  if (override.options !== undefined) param.options = override.options;
  if (override.elementType !== undefined) param.elementType = override.elementType;
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}
