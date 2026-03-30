import { describe, expect, it } from "vite-plus/test";
import {
  listCallableNamesFromResolvedSource,
  resolveComponentSource,
} from "../../src/core/component/component-source.js";
import { resolveFrameworkOptions } from "../../src/core/config/framework-config.js";
import { FIXTURES, fixturePath } from "../helpers/core-test-helpers.js";

describe("component-source", () => {
  it("merges standalone functions from included files", () => {
    const resolved = resolveComponentSource(
      fixturePath("TypeMapInlineTarget.blade.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "TypeMapInlineTarget.blade.php": {
              phpFile: "SimpleComponent.php",
              includes: ["StandaloneFunctions.php"],
            },
          },
        },
      }),
    );

    expect(resolved.meta?.functions.map((fn) => fn.name)).toContain("badge");
    expect(listCallableNamesFromResolvedSource(resolved)).toContain("render");
  });

  it("stores callable-specific public args overrides", () => {
    const resolved = resolveComponentSource(
      fixturePath("ComplexComponent.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "ComplexComponent.php": {
              callables: {
                renderCard: {
                  args: {
                    extra: {
                      options: ["Alice", "Bob"],
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );

    expect(resolved.callableArgOverrides["renderCard"]?.["extra"]).toEqual({
      options: ["Alice", "Bob"],
    });
  });

  it("stores rich file-level public args overrides for PHP files", () => {
    const resolved = resolveComponentSource(
      fixturePath("SimpleComponent.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "SimpleComponent.php": {
              args: {
                name: {
                  type: "array",
                  nullable: true,
                  required: false,
                  default: [],
                  options: ["primary"],
                  elementType: "string",
                },
              },
            },
          },
        },
      }),
    );

    expect(resolved.fileArgOverrides?.["name"]).toMatchObject({
      type: "array",
      nullable: true,
      required: false,
      default: [],
      options: ["primary"],
      elementType: "string",
    });
  });

  it("stores file-level public args without explicit types and deduplicates included metadata", () => {
    const inlineResolved = resolveComponentSource(
      fixturePath("TypeMapInlineTarget.blade.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "TypeMapInlineTarget.blade.php": {
              args: {
                tags: {
                  default: [],
                  options: ["a"],
                  elementType: "string",
                },
              },
            },
          },
        },
      }),
    );

    expect(inlineResolved.fileArgOverrides?.["tags"]).toMatchObject({
      default: [],
      options: ["a"],
      elementType: "string",
    });

    const duplicateClasses = resolveComponentSource(
      fixturePath("TypeMapInlineTarget.blade.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "TypeMapInlineTarget.blade.php": {
              phpFile: "SimpleComponent.php",
              includes: ["SimpleComponent.php"],
            },
          },
        },
      }),
    );
    const duplicateFunctions = resolveComponentSource(
      fixturePath("TypeMapInlineTarget.blade.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "TypeMapInlineTarget.blade.php": {
              phpFile: "StandaloneFunctions.php",
              includes: ["StandaloneFunctions.php"],
            },
          },
        },
      }),
    );

    expect(duplicateClasses.meta?.classes).toHaveLength(1);
    expect(duplicateFunctions.meta?.functions.map((fn) => fn.name)).toEqual(["badge", "icon"]);
  });

  it("skips trait/interface callables and preserves explicit public arg metadata", () => {
    const inlineResolved = resolveComponentSource(
      fixturePath("TypeMapInlineTarget.blade.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "TypeMapInlineTarget.blade.php": {
              args: {
                title: {
                  required: true,
                },
                subtitle: {
                  nullable: true,
                },
              },
            },
          },
        },
      }),
    );
    const traitMeta = resolveComponentSource(
      fixturePath("TraitInterface.php"),
      resolveFrameworkOptions(),
    );

    const titleArg = inlineResolved.fileArgOverrides?.["title"] as
      | ({ required?: boolean } & Record<string, unknown>)
      | undefined;
    const subtitleArg = inlineResolved.fileArgOverrides?.["subtitle"];

    expect(titleArg?.required).toBe(true);
    expect((subtitleArg as { nullable?: boolean } | undefined)?.nullable).toBe(true);
    expect(listCallableNamesFromResolvedSource(traitMeta)).toContain("display");
    expect(listCallableNamesFromResolvedSource(traitMeta)).not.toContain("factory");
  });
});
