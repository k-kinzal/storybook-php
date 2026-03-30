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

  it("applies type-map overrides to method parameters", () => {
    const resolved = resolveComponentSource(
      fixturePath("ComplexComponent.php"),
      resolveFrameworkOptions({
        typeMap: {
          args: {
            "App\\Components\\ComplexComponent::renderCard::$extra": {
              options: ["Alice", "Bob"],
            },
          },
        },
      }),
    );

    const renderMethod = resolved.meta?.classes[0]?.methods.find(
      (method) => method.name === "renderCard",
    );
    const extraParam = renderMethod?.params.find((param) => param.name === "extra") as
      | ({ options?: string[] } & Record<string, unknown>)
      | undefined;

    expect(extraParam?.options).toEqual(["Alice", "Bob"]);
  });

  it("applies rich overrides to constructor params and ignores missing params", () => {
    const resolved = resolveComponentSource(
      fixturePath("SimpleComponent.php"),
      resolveFrameworkOptions({
        typeMap: {
          args: {
            "App\\Components\\SimpleComponent::$name": {
              type: "array",
              nullable: true,
              required: false,
              default: [],
              options: ["primary"],
              elementType: "string",
            },
            "App\\Components\\SimpleComponent::render::$missing": {
              type: "string",
            },
          },
        },
      }),
    );

    const nameParam = resolved.meta?.classes[0]?.constructorParams[0] as
      | ({ options?: string[]; elementType?: string } & Record<string, unknown>)
      | undefined;

    expect(nameParam).toMatchObject({
      type: "array",
      nullable: true,
      required: false,
      default: [],
      options: ["primary"],
      elementType: "string",
    });
  });

  it("handles inline args without explicit types and deduplicates included metadata", () => {
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

    const tagsArg = inlineResolved.inlineArgs?.["tags"];

    expect(tagsArg).toMatchObject({
      type: "unknown",
      required: false,
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

  it("ignores invalid override keys and non-matching classes", () => {
    const resolved = resolveComponentSource(
      fixturePath("SimpleComponent.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          args: {
            invalid: "string",
            "App\\Components\\ComplexComponent::renderCard::$extra": {
              type: "string",
            },
            "App\\Components\\SimpleComponent::$name": {
              type: "string",
            },
          },
        },
      }),
    );

    expect(resolved.meta?.classes[0]?.constructorParams[0]?.type).toBe("string");
  });

  it("skips trait/interface callables and honors explicit required inline args", () => {
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

    const titleArg = inlineResolved.inlineArgs?.["title"];
    const subtitleArg = inlineResolved.inlineArgs?.["subtitle"];

    expect(titleArg?.required).toBe(true);
    expect(subtitleArg?.required).toBe(false);
    expect(listCallableNamesFromResolvedSource(traitMeta)).toContain("display");
    expect(listCallableNamesFromResolvedSource(traitMeta)).not.toContain("factory");
  });
});
