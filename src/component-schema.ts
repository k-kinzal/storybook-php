import { parsePhpFile } from "./php-parser.js";
import {
  findResolvedFileMapping,
  resolveAdapterForSourceFile,
  type ResolvedFrameworkOptions,
} from "./framework-config.js";
import type {
  ArgOverride,
  PhpArgMap,
  PhpClassMeta,
  PhpComponentSchema,
  PhpFileMeta,
  PhpMethodMeta,
  PhpParamMeta,
} from "./types.js";

interface EnrichedParamMeta extends PhpParamMeta {
  options?: (string | number | boolean)[];
  elementType?: string;
}

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
  const mapping = options.typeMap?.files
    ? findResolvedFileMapping(sourceFile, options.typeMap.files)
    : null;
  const effectiveCallableName = mapping?.callable ?? callableName;
  const adapter = resolveAdapterForSourceFile(sourceFile, options);

  if (mapping?.args) {
    const allArgs = inlineArgsToArgMap(mapping.args);
    return {
      schemas: [
        buildTemplateSchema({
          sourceFile,
          executionFile: sourceFile,
          allArgs,
          adapter,
        }),
      ],
      dependencies: [sourceFile],
    };
  }

  if (effectiveCallableName === null) {
    return {
      schemas: [
        buildTemplateSchema({
          sourceFile,
          executionFile: sourceFile,
          allArgs: {},
          adapter,
        }),
      ],
      dependencies: [sourceFile],
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

  const schemas = resolveSchemasFromMeta(
    meta,
    sourceFile,
    executionFile,
    effectiveCallableName,
    adapter,
  );
  if (schemas.length === 0) {
    return {
      schemas: [],
      dependencies,
      error: `PHP callable "${effectiveCallableName}" not found in ${executionFile}`,
    };
  }

  return { schemas, dependencies };
}

export function listCallableNames(sourceFile: string, options: ResolvedFrameworkOptions): string[] {
  const mapping = options.typeMap?.files
    ? findResolvedFileMapping(sourceFile, options.typeMap.files)
    : null;
  if (mapping?.args) {
    return [];
  }

  const executionFile = mapping?.phpFile ?? sourceFile;
  let meta = parsePhpFile(executionFile);

  if (mapping?.includes && mapping.includes.length > 0) {
    const extraMetas = mapping.includes.map((includePath) => parsePhpFile(includePath));
    meta = mergeFileMetas(meta, ...extraMetas);
  }

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

  if (mapping?.callable) {
    callableNames.add(mapping.callable);
  }

  return [...callableNames].sort();
}

function buildTemplateSchema({
  sourceFile,
  executionFile,
  allArgs,
  adapter,
}: {
  sourceFile: string;
  executionFile: string;
  allArgs: PhpArgMap;
  adapter: string | null;
}): PhpComponentSchema {
  return {
    exportName: "default",
    renderPlan: {
      type: "template",
      sourceFile,
      file: executionFile,
      class: null,
      callable: null,
      ...(adapter ? { adapter } : {}),
    },
    constructorArgs: {},
    callableArgs: {},
    allArgs,
    dependencies: uniquePaths([sourceFile, executionFile]),
  };
}

function resolveSchemasFromMeta(
  meta: PhpFileMeta,
  sourceFile: string,
  executionFile: string,
  callableName: string,
  adapter: string | null,
): PhpComponentSchema[] {
  const schemas: PhpComponentSchema[] = [];

  const findMethodInTraitChain = (
    traitCls: PhpClassMeta,
    methodName: string,
    visited: Set<string> = new Set(),
  ): PhpMethodMeta | null => {
    if (visited.has(traitCls.fqn)) return null;
    visited.add(traitCls.fqn);

    const method = traitCls.methods.find((candidate) => candidate.name === methodName);
    if (method) return method;

    for (const innerTraitName of traitCls.traits) {
      const innerTrait = meta.classes.find(
        (candidate) => candidate.name === innerTraitName || candidate.fqn === innerTraitName,
      );
      if (!innerTrait) continue;
      const found = findMethodInTraitChain(innerTrait, methodName, visited);
      if (found) return found;
    }

    return null;
  };

  const findMethodInHierarchy = (
    cls: PhpClassMeta,
    methodName: string,
  ): { cls: PhpClassMeta; method: PhpMethodMeta } | null => {
    const method = cls.methods.find((candidate) => candidate.name === methodName);
    if (method) return { cls, method };

    for (const traitName of cls.traits) {
      const trait = meta.classes.find(
        (candidate) => candidate.name === traitName || candidate.fqn === traitName,
      );
      if (!trait) continue;
      const traitMethod = findMethodInTraitChain(trait, methodName);
      if (traitMethod) {
        return { cls, method: traitMethod };
      }
    }

    if (cls.extends) {
      const parent = meta.classes.find(
        (candidate) => candidate.name === cls.extends || candidate.fqn === cls.extends,
      );
      if (parent) {
        const found = findMethodInHierarchy(parent, methodName);
        if (found) {
          return { cls, method: found.method };
        }
      }
    }

    return null;
  };

  const resolveConstructorParams = (cls: PhpClassMeta): PhpParamMeta[] => {
    if (cls.constructorParams.length > 0) return cls.constructorParams;
    if (!cls.extends) return [];

    const parent = meta.classes.find(
      (candidate) => candidate.name === cls.extends || candidate.fqn === cls.extends,
    );
    return parent ? resolveConstructorParams(parent) : [];
  };

  const findEnumMethod = (cls: PhpClassMeta, methodName: string): PhpMethodMeta | null => {
    const method = cls.methods.find((candidate) => candidate.name === methodName);
    if (method) return method;

    for (const traitName of cls.traits) {
      const trait = meta.classes.find(
        (candidate) => candidate.name === traitName || candidate.fqn === traitName,
      );
      if (!trait) continue;
      const traitMethod = findMethodInTraitChain(trait, methodName);
      if (traitMethod) return traitMethod;
    }

    return null;
  };

  for (const cls of meta.classes) {
    if (cls.isTrait || cls.isInterface) {
      continue;
    }

    if (cls.isEnum) {
      const method = findEnumMethod(cls, callableName);
      if (!method) continue;

      schemas.push({
        exportName: cls.name,
        renderPlan: {
          type: method.isStatic ? "staticMethod" : "enumMethod",
          sourceFile,
          file: executionFile,
          class: cls.fqn,
          callable: callableName,
          ...(adapter ? { adapter } : {}),
        },
        constructorArgs: {},
        callableArgs: paramsToArgMap(method.params),
        allArgs: method.isStatic
          ? paramsToArgMap(method.params)
          : { ...enumCaseArgMap(), ...paramsToArgMap(method.params) },
        dependencies: uniquePaths([sourceFile, executionFile]),
      });
      continue;
    }

    if (cls.isAbstract) {
      const method = cls.methods.find(
        (candidate) => candidate.name === callableName && candidate.isStatic,
      );
      if (!method) continue;

      const callableArgs = paramsToArgMap(method.params);
      schemas.push({
        exportName: cls.name,
        renderPlan: {
          type: "staticMethod",
          sourceFile,
          file: executionFile,
          class: cls.fqn,
          callable: callableName,
          ...(adapter ? { adapter } : {}),
        },
        constructorArgs: {},
        callableArgs,
        allArgs: callableArgs,
        dependencies: uniquePaths([sourceFile, executionFile]),
      });
      continue;
    }

    const found = findMethodInHierarchy(cls, callableName);
    if (!found) continue;

    if (found.method.isStatic) {
      const definedDirectly = cls.methods.some((candidate) => candidate.name === callableName);
      if (!definedDirectly) {
        continue;
      }

      const callableArgs = paramsToArgMap(found.method.params);
      schemas.push({
        exportName: found.cls.name,
        renderPlan: {
          type: "staticMethod",
          sourceFile,
          file: executionFile,
          class: found.cls.fqn,
          callable: callableName,
          ...(adapter ? { adapter } : {}),
        },
        constructorArgs: {},
        callableArgs,
        allArgs: callableArgs,
        dependencies: uniquePaths([sourceFile, executionFile]),
      });
      continue;
    }

    const constructorArgs = paramsToArgMap(resolveConstructorParams(found.cls));
    const callableArgs = paramsToArgMap(found.method.params);

    schemas.push({
      exportName: found.cls.name,
      renderPlan: {
        type: "classMethod",
        sourceFile,
        file: executionFile,
        class: found.cls.fqn,
        callable: callableName,
        ...(adapter ? { adapter } : {}),
      },
      constructorArgs,
      callableArgs,
      allArgs: { ...constructorArgs, ...callableArgs },
      dependencies: uniquePaths([sourceFile, executionFile]),
    });
  }

  if (schemas.length > 0) {
    return schemas;
  }

  for (const fn of meta.functions) {
    if (fn.name !== callableName) continue;

    const callableArgs = paramsToArgMap(fn.params);
    return [
      {
        exportName: fn.name,
        renderPlan: {
          type: "function",
          sourceFile,
          file: executionFile,
          class: null,
          callable: fn.fqn,
          ...(adapter ? { adapter } : {}),
        },
        constructorArgs: {},
        callableArgs,
        allArgs: callableArgs,
        dependencies: uniquePaths([sourceFile, executionFile]),
      },
    ];
  }

  return [];
}

function paramsToArgMap(params: (PhpParamMeta | EnrichedParamMeta)[]): PhpArgMap {
  return Object.fromEntries(
    params.map((param) => {
      const entry: PhpArgMap[string] = {
        type: param.type ?? "unknown",
        required: param.required,
        position: param.position,
        nullable: param.nullable,
      };

      if (param.default !== undefined) entry.default = param.default;
      if (param.isVariadic) entry.isVariadic = true;
      if (param.isPromoted) entry.isPromoted = true;
      if (param.visibility) entry.visibility = param.visibility;

      const enriched = param as EnrichedParamMeta;
      if (enriched.options !== undefined) entry.options = enriched.options;
      if (enriched.elementType !== undefined) entry.elementType = enriched.elementType;

      return [param.name, entry] as const;
    }),
  );
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

function enumCaseArgMap(): PhpArgMap {
  return {
    _case: {
      type: "string",
      required: true,
      position: 0,
      nullable: false,
    },
  };
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
