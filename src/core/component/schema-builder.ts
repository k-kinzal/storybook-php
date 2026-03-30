import type {
  PhpArgMap,
  PhpClassMeta,
  PhpComponentSchema,
  PhpFileMeta,
  PhpMethodMeta,
  PhpParamMeta,
} from "../../types.js";
import { buildPublicArgMap } from "./public-args.js";

interface EnrichedParamMeta extends PhpParamMeta {
  options?: (string | number | boolean)[];
  elementType?: string;
}

type MethodOrigin = "direct" | "trait" | "inheritedDirect" | "inheritedTrait";

interface HierarchyMethodMatch {
  hostClass: PhpClassMeta;
  declaringClass: PhpClassMeta;
  method: PhpMethodMeta;
  origin: MethodOrigin;
}

interface MetaClassIndex {
  classesByRef: Map<string, PhpClassMeta>;
}

export interface SchemaBuildContext {
  sourceFile: string;
  executionFile: string;
  adapter: string | null;
}

export function buildTemplateSchema({
  sourceFile,
  executionFile,
  publicArgs,
  adapter,
}: {
  sourceFile: string;
  executionFile: string;
  publicArgs: PhpArgMap;
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
    publicArgs,
  };
}

export function buildSchemasFromMeta(
  meta: PhpFileMeta,
  callableName: string,
  { sourceFile, executionFile, adapter }: SchemaBuildContext,
): PhpComponentSchema[] {
  const schemas: PhpComponentSchema[] = [];
  const classIndex = createMetaClassIndex(meta);

  for (const cls of meta.classes) {
    if (cls.isTrait || cls.isInterface) {
      continue;
    }

    if (cls.isEnum) {
      const method = findEnumMethod(classIndex, cls, callableName);
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
        publicArgs: method.isStatic
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
        publicArgs: callableArgs,
      });
      continue;
    }

    const found = findMethodInHierarchy(classIndex, cls, callableName);
    if (!found) continue;

    if (found.method.isStatic) {
      if (shouldSkipStaticMatch(found)) {
        continue;
      }

      const callableArgs = paramsToArgMap(found.method.params);
      schemas.push({
        exportName: found.hostClass.name,
        renderPlan: {
          type: "staticMethod",
          sourceFile,
          file: executionFile,
          class: found.hostClass.fqn,
          callable: callableName,
          ...(adapter ? { adapter } : {}),
        },
        constructorArgs: {},
        callableArgs,
        publicArgs: callableArgs,
      });
      continue;
    }

    const constructorArgs = paramsToArgMap(resolveConstructorParams(classIndex, found.hostClass));
    const callableArgs = paramsToArgMap(found.method.params);

    schemas.push({
      exportName: found.hostClass.name,
      renderPlan: {
        type: "classMethod",
        sourceFile,
        file: executionFile,
        class: found.hostClass.fqn,
        callable: callableName,
        ...(adapter ? { adapter } : {}),
      },
      constructorArgs,
      callableArgs,
      publicArgs: buildPublicArgMap(constructorArgs, callableArgs),
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
        publicArgs: callableArgs,
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

function createMetaClassIndex(meta: PhpFileMeta): MetaClassIndex {
  const classesByRef = new Map<string, PhpClassMeta>();

  for (const cls of meta.classes) {
    if (!classesByRef.has(cls.name)) {
      classesByRef.set(cls.name, cls);
    }
    if (!classesByRef.has(cls.fqn)) {
      classesByRef.set(cls.fqn, cls);
    }
  }

  return { classesByRef };
}

function findClass(index: MetaClassIndex, ref: string): PhpClassMeta | null {
  return index.classesByRef.get(ref) ?? null;
}

function findMethodInTraitChain(
  index: MetaClassIndex,
  traitCls: PhpClassMeta,
  methodName: string,
  visited: Set<string> = new Set(),
): PhpMethodMeta | null {
  if (visited.has(traitCls.fqn)) {
    return null;
  }
  visited.add(traitCls.fqn);

  const method = traitCls.methods.find((candidate) => candidate.name === methodName);
  if (method) {
    return method;
  }

  for (const innerTraitName of traitCls.traits) {
    const innerTrait = findClass(index, innerTraitName);
    if (!innerTrait) continue;

    const found = findMethodInTraitChain(index, innerTrait, methodName, visited);
    if (found) {
      return found;
    }
  }

  return null;
}

function findMethodInTraits(
  index: MetaClassIndex,
  traitNames: string[],
  methodName: string,
): PhpMethodMeta | null {
  for (const traitName of traitNames) {
    const trait = findClass(index, traitName);
    if (!trait) {
      continue;
    }

    const traitMethod = findMethodInTraitChain(index, trait, methodName);
    if (traitMethod) {
      return traitMethod;
    }
  }

  return null;
}

function findMethodInHierarchy(
  index: MetaClassIndex,
  cls: PhpClassMeta,
  methodName: string,
): HierarchyMethodMatch | null {
  const directMethod = cls.methods.find((candidate) => candidate.name === methodName);
  if (directMethod) {
    return { hostClass: cls, declaringClass: cls, method: directMethod, origin: "direct" };
  }

  const traitMethod = findMethodInTraits(index, cls.traits, methodName);
  if (traitMethod) {
    return { hostClass: cls, declaringClass: cls, method: traitMethod, origin: "trait" };
  }

  if (!cls.extends) {
    return null;
  }

  const parent = findClass(index, cls.extends);
  if (!parent) {
    return null;
  }

  const inheritedMethod = findMethodInHierarchy(index, parent, methodName);
  if (!inheritedMethod) {
    return null;
  }

  return {
    hostClass: cls,
    declaringClass: inheritedMethod.declaringClass,
    method: inheritedMethod.method,
    origin:
      inheritedMethod.origin === "trait" || inheritedMethod.origin === "inheritedTrait"
        ? "inheritedTrait"
        : "inheritedDirect",
  };
}

function resolveConstructorParams(index: MetaClassIndex, cls: PhpClassMeta): PhpParamMeta[] {
  if (cls.hasConstructor) {
    return cls.constructorParams;
  }

  if (!cls.extends) {
    return [];
  }

  const parent = findClass(index, cls.extends);
  return parent ? resolveConstructorParams(index, parent) : [];
}

function findEnumMethod(
  index: MetaClassIndex,
  cls: PhpClassMeta,
  methodName: string,
): PhpMethodMeta | null {
  const directMethod = cls.methods.find((candidate) => candidate.name === methodName);
  if (directMethod) {
    return directMethod;
  }

  return findMethodInTraits(index, cls.traits, methodName);
}

function shouldSkipStaticMatch(match: HierarchyMethodMatch): boolean {
  if (match.origin === "direct" || match.origin === "trait") {
    return false;
  }

  if (match.origin === "inheritedDirect") {
    return true;
  }

  return !match.declaringClass.isAbstract;
}
