import type { ArgOverride, PhpArgDef, PhpArgMap } from "../../types.js";

const UNKNOWN_TYPES = new Set(["unknown", "mixed"]);

type PublicArgScope = "constructor" | "method";

interface PublicArgKey {
  scope: PublicArgScope | null;
  name: string;
}

export function argOverridesToArgMap(overrides: Record<string, string | ArgOverride>): PhpArgMap {
  const argMap: PhpArgMap = {};

  for (const [name, def] of Object.entries(overrides)) {
    argMap[name] = applyArgOverride(null, def, Object.keys(argMap).length);
  }

  return argMap;
}

export function buildPublicArgMap(constructorArgs: PhpArgMap, callableArgs: PhpArgMap): PhpArgMap {
  const publicArgs = new Map<string, PhpArgDef>();
  const names = new Set([...Object.keys(constructorArgs), ...Object.keys(callableArgs)]);

  for (const name of names) {
    const constructorArg = constructorArgs[name];
    const callableArg = callableArgs[name];

    if (!constructorArg) {
      publicArgs.set(name, { ...callableArg! });
      continue;
    }

    if (!callableArg) {
      publicArgs.set(name, { ...constructorArg });
      continue;
    }

    const merged = mergeCompatiblePublicArgDef(constructorArg, callableArg);
    if (merged) {
      publicArgs.set(name, merged);
      continue;
    }

    publicArgs.set(`constructor.${name}`, { ...constructorArg });
    publicArgs.set(`method.${name}`, { ...callableArg });
  }

  return reindexArgMap(Object.fromEntries(publicArgs));
}

export function mergePublicArgOverrides(
  basePublicArgs: PhpArgMap,
  constructorArgs: PhpArgMap,
  callableArgs: PhpArgMap,
  overrides?: Record<string, string | ArgOverride> | null,
): PhpArgMap {
  if (!overrides || Object.keys(overrides).length === 0) {
    return reindexArgMap(basePublicArgs);
  }

  const result = new Map<string, PhpArgDef>(
    Object.entries(basePublicArgs).map(([name, argDef]) => [name, { ...argDef }]),
  );
  const explicitFlatKeys = new Set<string>();
  const namespacedBaseNames = new Set<string>();

  for (const key of Object.keys(overrides)) {
    const parsedKey = parsePublicArgKey(key);
    if (parsedKey.scope === null) {
      explicitFlatKeys.add(parsedKey.name);
      continue;
    }

    namespacedBaseNames.add(parsedKey.name);
  }

  for (const baseName of namespacedBaseNames) {
    if (!explicitFlatKeys.has(baseName)) {
      result.delete(baseName);
    }
  }

  let nextPosition = result.size;
  for (const [key, override] of Object.entries(overrides)) {
    const existing = result.get(key) ?? null;
    const fallback = existing ?? resolveOverrideBaseArgDef(key, constructorArgs, callableArgs);
    result.set(key, applyArgOverride(fallback, override, nextPosition));
    nextPosition++;
  }

  return reindexArgMap(Object.fromEntries(result));
}

function resolveOverrideBaseArgDef(
  key: string,
  constructorArgs: PhpArgMap,
  callableArgs: PhpArgMap,
): PhpArgDef | null {
  const parsedKey = parsePublicArgKey(key);

  if (parsedKey.scope === "constructor") {
    return cloneArgDef(constructorArgs[parsedKey.name] ?? null);
  }

  if (parsedKey.scope === "method") {
    return cloneArgDef(callableArgs[parsedKey.name] ?? null);
  }

  const constructorArg = constructorArgs[parsedKey.name] ?? null;
  const callableArg = callableArgs[parsedKey.name] ?? null;

  if (constructorArg && !callableArg) {
    return cloneArgDef(constructorArg);
  }

  if (!constructorArg && callableArg) {
    return cloneArgDef(callableArg);
  }

  if (constructorArg && callableArg) {
    const merged = mergeCompatiblePublicArgDef(constructorArg, callableArg);
    return merged ?? null;
  }

  return null;
}

function mergeCompatiblePublicArgDef(left: PhpArgDef, right: PhpArgDef): PhpArgDef | null {
  if (!areArgTypesCompatible(left.type, right.type)) {
    return null;
  }

  if (!areOptionalStringFieldsCompatible(left.elementType, right.elementType)) {
    return null;
  }

  if (!areOptionalArrayFieldsCompatible(left.options, right.options)) {
    return null;
  }

  const preferred = choosePreferredArgDef(left, right);

  return {
    ...preferred,
    type: choosePreferredType(left.type, right.type),
    required: left.required || right.required,
    nullable: left.nullable && right.nullable,
    ...mergeDefaultValue(left.default, right.default),
    ...mergeOptionalField("options", left.options, right.options),
    ...mergeOptionalField("elementType", left.elementType, right.elementType),
  };
}

function choosePreferredArgDef(left: PhpArgDef, right: PhpArgDef): PhpArgDef {
  if (UNKNOWN_TYPES.has(left.type.toLowerCase()) && !UNKNOWN_TYPES.has(right.type.toLowerCase())) {
    return { ...right };
  }

  return { ...left };
}

function choosePreferredType(left: string, right: string): string {
  if (UNKNOWN_TYPES.has(left.toLowerCase()) && !UNKNOWN_TYPES.has(right.toLowerCase())) {
    return right;
  }

  if (UNKNOWN_TYPES.has(right.toLowerCase()) && !UNKNOWN_TYPES.has(left.toLowerCase())) {
    return left;
  }

  return left;
}

function areArgTypesCompatible(left: string, right: string): boolean {
  if (left === right) return true;
  return UNKNOWN_TYPES.has(left.toLowerCase()) || UNKNOWN_TYPES.has(right.toLowerCase());
}

function areOptionalStringFieldsCompatible(
  left: string | undefined,
  right: string | undefined,
): boolean {
  if (left === undefined || right === undefined) {
    return true;
  }

  return left === right;
}

function areOptionalArrayFieldsCompatible(
  left: PhpArgDef["options"],
  right: PhpArgDef["options"],
): boolean {
  if (left === undefined || right === undefined) {
    return true;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeDefaultValue(
  left: unknown,
  right: unknown,
): Pick<PhpArgDef, "default"> | Record<string, never> {
  if (left === undefined && right === undefined) {
    return {};
  }

  if (left === undefined) {
    return { default: right };
  }

  if (right === undefined) {
    return { default: left };
  }

  return JSON.stringify(left) === JSON.stringify(right) ? { default: left } : {};
}

function mergeOptionalField<TKey extends "options" | "elementType">(
  key: TKey,
  left: PhpArgDef[TKey],
  right: PhpArgDef[TKey],
): Pick<PhpArgDef, TKey> | Record<string, never> {
  if (left === undefined && right === undefined) {
    return {};
  }

  return { [key]: left ?? right } as Pick<PhpArgDef, TKey>;
}

function applyArgOverride(
  base: PhpArgDef | null,
  override: string | ArgOverride,
  position: number,
): PhpArgDef {
  if (typeof override === "string") {
    const nullable = override.startsWith("?");
    const type = nullable ? override.slice(1) : override;

    return {
      ...base,
      type,
      required: base?.required ?? !nullable,
      position,
      nullable,
    };
  }

  const rawType = override.type ?? base?.type ?? "unknown";
  const type = rawType.startsWith("?") ? rawType.slice(1) : rawType;
  const hasDefault = Object.prototype.hasOwnProperty.call(override, "default");
  const nullable =
    override.nullable ?? (rawType.startsWith("?") ? true : (base?.nullable ?? false));
  const required = override.required ?? (hasDefault ? false : (base?.required ?? !nullable));

  return {
    ...base,
    type,
    required,
    position,
    nullable,
    ...(hasDefault
      ? { default: override.default }
      : base?.default !== undefined
        ? { default: base.default }
        : {}),
    ...(override.options !== undefined
      ? { options: override.options }
      : base?.options !== undefined
        ? { options: base.options }
        : {}),
    ...(override.elementType !== undefined
      ? { elementType: override.elementType }
      : base?.elementType !== undefined
        ? { elementType: base.elementType }
        : {}),
  };
}

function parsePublicArgKey(key: string): PublicArgKey {
  if (key.startsWith("constructor.")) {
    return { scope: "constructor", name: key.slice("constructor.".length) };
  }

  if (key.startsWith("method.")) {
    return { scope: "method", name: key.slice("method.".length) };
  }

  return { scope: null, name: key };
}

function cloneArgDef(argDef: PhpArgDef | null): PhpArgDef | null {
  return argDef ? { ...argDef } : null;
}

function reindexArgMap(argMap: PhpArgMap): PhpArgMap {
  return Object.fromEntries(
    Object.entries(argMap).map(([name, argDef], position) => [
      name,
      {
        ...argDef,
        position,
      },
    ]),
  );
}
