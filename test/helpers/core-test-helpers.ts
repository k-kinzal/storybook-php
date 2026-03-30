import { resolve } from "node:path";
import type { PhpClassMeta, PhpMethodMeta } from "../../src/types.js";

export const FIXTURES: string = resolve(import.meta.dirname!, "../fixtures");

export function fixturePath(name: string): string {
  return resolve(FIXTURES, name);
}

export function classMeta(
  overrides: Partial<PhpClassMeta> & Pick<PhpClassMeta, "name" | "fqn">,
): PhpClassMeta {
  return {
    isAbstract: false,
    isFinal: false,
    isReadonly: false,
    isTrait: false,
    isInterface: false,
    extends: null,
    implements: [],
    traits: [],
    hasConstructor: false,
    constructorParams: [],
    methods: [],
    isEnum: false,
    ...overrides,
    name: overrides.name,
    fqn: overrides.fqn,
  };
}

export function methodMeta(name: string, overrides: Partial<PhpMethodMeta> = {}): PhpMethodMeta {
  return {
    name,
    isStatic: false,
    visibility: "public",
    params: [],
    returnType: null,
    ...overrides,
  };
}
