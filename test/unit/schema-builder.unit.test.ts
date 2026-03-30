import { describe, expect, it } from "vite-plus/test";
import { buildSchemasFromMeta } from "../../src/core/component/schema-builder.js";
import type { PhpClassMeta, PhpFileMeta } from "../../src/types.js";
import { classMeta, methodMeta } from "../helpers/core-test-helpers.js";

describe("schema-builder", () => {
  const context = {
    sourceFile: "/tmp/component.php",
    executionFile: "/tmp/component.php",
    adapter: null,
  };

  it("stops recursive trait traversal when a trait cycle is encountered", () => {
    const meta: PhpFileMeta = {
      filePath: "/tmp/traits.php",
      namespace: null,
      classes: [
        classMeta({ name: "Host", fqn: "Host", traits: ["TraitA"] }),
        classMeta({ name: "TraitA", fqn: "TraitA", isTrait: true, traits: ["TraitB"] }),
        classMeta({ name: "TraitB", fqn: "TraitB", isTrait: true, traits: ["TraitA"] }),
      ],
      functions: [],
    };

    expect(buildSchemasFromMeta(meta, "render", context)).toEqual([]);
  });

  it("ignores missing traits and missing parents", () => {
    const missingTraitMeta: PhpFileMeta = {
      filePath: "/tmp/missing-trait.php",
      namespace: null,
      classes: [classMeta({ name: "Host", fqn: "Host", traits: ["MissingTrait"] })],
      functions: [],
    };
    const missingParentMeta: PhpFileMeta = {
      filePath: "/tmp/missing-parent.php",
      namespace: null,
      classes: [classMeta({ name: "Child", fqn: "Child", extends: "MissingParent" })],
      functions: [],
    };

    expect(buildSchemasFromMeta(missingTraitMeta, "render", context)).toEqual([]);
    expect(buildSchemasFromMeta(missingParentMeta, "render", context)).toEqual([]);
  });

  it("returns no schema when an inherited method is still missing", () => {
    const meta: PhpFileMeta = {
      filePath: "/tmp/inherited.php",
      namespace: null,
      classes: [
        classMeta({ name: "ParentView", fqn: "ParentView", methods: [methodMeta("show")] }),
        classMeta({ name: "ChildView", fqn: "ChildView", extends: "ParentView" }),
      ],
      functions: [],
    };

    expect(buildSchemasFromMeta(meta, "render", context)).toEqual([]);
  });

  it("preserves enriched constructor metadata and inherited constructor params", () => {
    const meta: PhpFileMeta = {
      filePath: "/tmp/enriched.php",
      namespace: null,
      classes: [
        classMeta({
          name: "BaseList",
          fqn: "BaseList",
          hasConstructor: true,
          constructorParams: [
            {
              name: "items",
              type: "array",
              required: false,
              position: 0,
              nullable: false,
              default: [],
              isVariadic: false,
              isPromoted: false,
              options: ["a"],
              elementType: "string",
            } as unknown as PhpClassMeta["constructorParams"][number],
          ],
          methods: [methodMeta("render")],
        }),
        classMeta({ name: "ChildList", fqn: "ChildList", extends: "BaseList" }),
      ],
      functions: [],
    };

    const schemas = buildSchemasFromMeta(meta, "render", context);

    expect(schemas[1]?.constructorArgs["items"]).toMatchObject({
      options: ["a"],
      elementType: "string",
    });
  });

  it("includes adapters for every schema kind and handles duplicate class names", () => {
    const contextWithAdapter = {
      sourceFile: "/tmp/component.php",
      executionFile: "/tmp/component.php",
      adapter: "/tmp/adapter.php",
    };
    const duplicatedNames: PhpFileMeta = {
      filePath: "/tmp/dup.php",
      namespace: null,
      classes: [
        classMeta({ name: "Shared", fqn: "App\\Shared", methods: [methodMeta("render")] }),
        classMeta({ name: "Shared", fqn: "App\\Other\\Shared", methods: [methodMeta("render")] }),
        classMeta({
          name: "AbstractView",
          fqn: "AbstractView",
          isAbstract: true,
          methods: [methodMeta("build", { isStatic: true })],
        }),
        classMeta({
          name: "Palette",
          fqn: "Palette",
          isEnum: true,
          enumCases: ["Warm"],
          methods: [methodMeta("badge")],
        }),
      ],
      functions: [
        {
          name: "preview",
          fqn: "preview",
          params: [],
          returnType: null,
        },
      ],
    };

    expect(
      buildSchemasFromMeta(duplicatedNames, "render", contextWithAdapter)[0]?.renderPlan.adapter,
    ).toBe("/tmp/adapter.php");
    expect(
      buildSchemasFromMeta(duplicatedNames, "build", contextWithAdapter)[0]?.renderPlan.adapter,
    ).toBe("/tmp/adapter.php");
    expect(
      buildSchemasFromMeta(duplicatedNames, "badge", contextWithAdapter)[0]?.renderPlan.adapter,
    ).toBe("/tmp/adapter.php");
    expect(
      buildSchemasFromMeta(duplicatedNames, "preview", contextWithAdapter)[0]?.renderPlan.adapter,
    ).toBe("/tmp/adapter.php");
  });

  it("handles missing inner traits and missing inherited constructors", () => {
    const meta: PhpFileMeta = {
      filePath: "/tmp/missing-inner.php",
      namespace: null,
      classes: [
        classMeta({
          name: "UsesNestedTrait",
          fqn: "UsesNestedTrait",
          traits: ["HasNestedTrait"],
          methods: [methodMeta("render")],
          extends: "MissingParent",
        }),
        classMeta({
          name: "HasNestedTrait",
          fqn: "HasNestedTrait",
          isTrait: true,
          traits: ["MissingNestedTrait"],
        }),
      ],
      functions: [],
    };

    expect(buildSchemasFromMeta(meta, "render", context)).toHaveLength(1);
    expect(buildSchemasFromMeta(meta, "render", context)[0]?.constructorArgs).toEqual({});
  });

  it("adds adapters to concrete static methods and skips missing nested traits", () => {
    const contextWithAdapter = {
      sourceFile: "/tmp/component.php",
      executionFile: "/tmp/component.php",
      adapter: "/tmp/adapter.php",
    };
    const staticMeta: PhpFileMeta = {
      filePath: "/tmp/static.php",
      namespace: null,
      classes: [
        classMeta({
          name: "Banner",
          fqn: "Banner",
          methods: [methodMeta("build", { isStatic: true })],
        }),
      ],
      functions: [],
    };
    const nestedMissingTraitMeta: PhpFileMeta = {
      filePath: "/tmp/nested-trait.php",
      namespace: null,
      classes: [
        classMeta({ name: "Host", fqn: "Host", traits: ["OuterTrait"] }),
        classMeta({
          name: "OuterTrait",
          fqn: "OuterTrait",
          isTrait: true,
          traits: ["MissingInner"],
        }),
      ],
      functions: [],
    };

    expect(
      buildSchemasFromMeta(staticMeta, "build", contextWithAdapter)[0]?.renderPlan.adapter,
    ).toBe("/tmp/adapter.php");
    expect(buildSchemasFromMeta(nestedMissingTraitMeta, "render", context)).toEqual([]);
  });
});
