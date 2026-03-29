import type {
  PhpArgMap,
  PhpClassMeta,
  PhpComponentSchema,
  PhpFileMeta,
  PhpMethodMeta,
  PhpParamMeta,
} from "../../types.js";

interface EnrichedParamMeta extends PhpParamMeta {
  options?: (string | number | boolean)[];
  elementType?: string;
}

export interface SchemaBuildContext {
  sourceFile: string;
  executionFile: string;
  adapter: string | null;
}

export function buildTemplateSchema({
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
  };
}

export function buildSchemasFromMeta(
  meta: PhpFileMeta,
  callableName: string,
  { sourceFile, executionFile, adapter }: SchemaBuildContext,
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
    if (cls.hasConstructor) return cls.constructorParams;
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
