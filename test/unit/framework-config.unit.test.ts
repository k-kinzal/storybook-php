import { describe, expect, it } from "vite-plus/test";
import {
  findResolvedFileMapping,
  resolveAdapterForSourceFile,
  resolveFrameworkOptions,
  resolveImportSource,
} from "../../src/core/config/framework-config.js";
import { FIXTURES, fixturePath } from "../helpers/core-test-helpers.js";

describe("framework-config", () => {
  it("prefers per-file adapters and falls back to the global adapter", () => {
    const options = resolveFrameworkOptions({
      _configDir: FIXTURES,
      adapter: "/global-adapter.php",
      components: {
        files: {
          "SimpleComponent.php": { adapter: "fixture-adapter.php" },
        },
      },
    });

    expect(resolveAdapterForSourceFile(fixturePath("SimpleComponent.php"), options)).toBe(
      fixturePath("fixture-adapter.php"),
    );
    expect(resolveAdapterForSourceFile(fixturePath("TemplateFile.php"), options)).toBe(
      "/global-adapter.php",
    );
  });

  it("merges pattern and exact file mappings for callable, includes, and adapters", () => {
    const options = resolveFrameworkOptions({
      _configDir: FIXTURES,
      components: {
        files: {
          "*.blade.php": {
            callable: "render",
            includes: ["TypeMapBaseClass.php"],
            adapter: "fixture-adapter.php",
          },
          "TypeMapInlineTarget.blade.php": {
            args: {
              title: "string",
            },
          },
        },
      },
    });

    const mapping = findResolvedFileMapping(
      fixturePath("TypeMapInlineTarget.blade.php"),
      options.components!.files!,
    );

    expect(mapping).toMatchObject({
      callable: "render",
      includes: [fixturePath("TypeMapBaseClass.php")],
      adapter: fixturePath("fixture-adapter.php"),
    });
  });

  it("resolves bindings and absolute file-map paths", () => {
    const options = resolveFrameworkOptions({
      _configDir: FIXTURES,
      components: {
        files: {
          [fixturePath("TypeMapInlineTarget.blade.php")]: {
            phpFile: fixturePath("SimpleComponent.php"),
            includes: [fixturePath("TypeMapBaseClass.php")],
            adapter: fixturePath("fixture-adapter.php"),
          },
          "*.php": {},
        },
      },
      types: { "App\\Contracts\\View": "App\\ConcreteView" },
    });

    const mapping = findResolvedFileMapping(
      fixturePath("TypeMapInlineTarget.blade.php"),
      options.components!.files!,
    );

    expect(options.types).toEqual({ "App\\Contracts\\View": "App\\ConcreteView" });
    expect(mapping).toMatchObject({
      phpFile: fixturePath("SimpleComponent.php"),
      includes: [fixturePath("TypeMapBaseClass.php")],
      adapter: fixturePath("fixture-adapter.php"),
    });
  });

  it("keeps runtime class contracts without file mappings", () => {
    const classes = { "App\\Menu": { args: { sections: "App\\MenuSection[]" } } };
    const options = resolveFrameworkOptions({ components: { classes } });

    expect(options.components).toEqual({ classes });
    expect(options.adapterMap).toBeNull();
  });

  it("handles absolute mapped imports and merged targets without adapters", () => {
    const options = resolveFrameworkOptions({
      _configDir: FIXTURES,
      components: {
        files: {
          "*.php": { callable: "render" },
          [fixturePath("SimpleComponent.php")]: { args: { name: "string" } },
        },
      },
    });

    expect(
      resolveImportSource(fixturePath("SimpleComponent.php"), fixturePath("story.ts"), options),
    ).toEqual({
      sourceFile: fixturePath("SimpleComponent.php"),
      callableName: null,
      mapped: true,
    });
    expect(
      findResolvedFileMapping(fixturePath("SimpleComponent.php"), options.components!.files!),
    ).toMatchObject({
      args: { name: "string" },
      callable: "render",
    });
  });
  it("rejects legacy framework typeMap", () => {
    // @ts-expect-error Removed configuration is rejected for JS callers too.
    expect(() => resolveFrameworkOptions({ typeMap: {} })).toThrow("Use components and types");
  });
});
