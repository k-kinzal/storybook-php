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
      typeMap: {
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
      typeMap: {
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
      options.typeMap!.files!,
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
      typeMap: {
        bindings: { "App\\Contracts\\View": "App\\ConcreteView" },
        files: {
          [fixturePath("TypeMapInlineTarget.blade.php")]: {
            phpFile: fixturePath("SimpleComponent.php"),
            includes: [fixturePath("TypeMapBaseClass.php")],
            adapter: fixturePath("fixture-adapter.php"),
          },
          "*.php": {},
        },
      },
    });

    const mapping = findResolvedFileMapping(
      fixturePath("TypeMapInlineTarget.blade.php"),
      options.typeMap!.files!,
    );

    expect(options.typeMap?.bindings).toEqual({ "App\\Contracts\\View": "App\\ConcreteView" });
    expect(mapping).toMatchObject({
      phpFile: fixturePath("SimpleComponent.php"),
      includes: [fixturePath("TypeMapBaseClass.php")],
      adapter: fixturePath("fixture-adapter.php"),
    });
  });

  it("handles absolute mapped imports and merged targets without adapters", () => {
    const options = resolveFrameworkOptions({
      _configDir: FIXTURES,
      typeMap: {
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
      findResolvedFileMapping(fixturePath("SimpleComponent.php"), options.typeMap!.files!),
    ).toMatchObject({
      args: { name: "string" },
      callable: "render",
    });
  });
});
