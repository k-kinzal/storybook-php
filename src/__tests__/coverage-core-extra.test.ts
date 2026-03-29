import { describe, expect, it } from "vite-plus/test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { extractClasses, extractStandaloneFunctions } from "../core/analysis/php-parser/extractors.js";
import { preprocess } from "../core/analysis/php-parser/preprocess.js";
import { readSignatureTail } from "../core/analysis/php-parser/scanner.js";
import { buildSchemasFromMeta } from "../core/component/schema-builder.js";
import { generateDeclarationModule } from "../core/component/declaration-emitter.js";
import { resolveSchemasForSource, listCallableNames } from "../core/component/component-schema.js";
import {
  listCallableNamesFromResolvedSource,
  resolveComponentSource,
} from "../core/component/component-source.js";
import { generateVirtualModule } from "../core/component/module-emitter.js";
import {
  findResolvedFileMapping,
  resolveImportSource,
  resolveAdapterForSourceFile,
  resolveFrameworkOptions,
} from "../core/config/framework-config.js";
import {
  generateDeclarationOutputsForResolvedSource,
  versionForResolvedSource,
} from "../core/typescript/declaration-files.js";
import { phpTypeToTs } from "../core/typescript/php-type-to-ts.js";
import { generateDtsForFile } from "../core/typescript/typegen.js";
import type { PhpClassMeta, PhpFileMeta, PhpMethodMeta, PhpRenderPlan } from "../types.js";

const FIXTURES = resolve(__dirname, "fixtures");

function fixturePath(name: string): string {
  return resolve(FIXTURES, name);
}

function classMeta(overrides: Partial<PhpClassMeta> & Pick<PhpClassMeta, "name" | "fqn">): PhpClassMeta {
  return {
    name: overrides.name,
    fqn: overrides.fqn,
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
  };
}

function methodMeta(
  name: string,
  overrides: Partial<PhpMethodMeta> = {},
): PhpMethodMeta {
  return {
    name,
    isStatic: false,
    visibility: "public",
    params: [],
    returnType: null,
    ...overrides,
  };
}

describe("coverage core extras", () => {
  describe("module-emitter", () => {
    it("emits a default error when no schemas are present", () => {
      expect(generateVirtualModule([])).toContain("Unknown storybook-php module error");
    });

    it("serializes extended arg metadata fields", () => {
      const code = generateVirtualModule([
        {
          exportName: "Widget",
          componentId: "cmp_1",
          renderPlan: {
            type: "classMethod",
            file: "/tmp/widget.php",
            sourceFile: "/tmp/widget.php",
            class: "App\\Widget",
            callable: "render",
          },
          constructorArgs: {},
          callableArgs: {},
          allArgs: {
            items: {
              type: "App\\Dto\\Item[]",
              required: false,
              position: 0,
              nullable: false,
              default: [],
              isVariadic: false,
              isPromoted: true,
              visibility: "private",
              options: ["a", "b"],
              elementType: "App\\Dto\\Item",
              enumType: "App\\Enums\\Mode",
              classType: "App\\Dto\\ItemList",
              unionTypes: ["array", "Traversable"],
            },
          },
        },
      ]);

      expect(code).toContain('elementType: "App\\\\Dto\\\\Item"');
      expect(code).toContain('enumType: "App\\\\Enums\\\\Mode"');
      expect(code).toContain('classType: "App\\\\Dto\\\\ItemList"');
      expect(code).toContain('unionTypes: ["array","Traversable"]');
    });
  });

  describe("declaration-emitter", () => {
    it("uses a sanitized callable name for class exports", () => {
      const declaration = generateDeclarationModule([
        {
          exportName: "FancyCard",
          renderPlan: {
            type: "classMethod",
            file: "/tmp/fancy.php",
            sourceFile: "/tmp/fancy.php",
            class: "App\\FancyCard",
            callable: "App\\Ui\\render-card",
          },
          constructorArgs: {},
          callableArgs: {},
          allArgs: {
            title: { type: "string", required: true, position: 0, nullable: false },
          },
        },
      ]);

      expect(declaration).toContain("interface FancyCard_render_card_Args");
    });

    it("falls back to template for missing callable names", () => {
      const declaration = generateDeclarationModule([
        {
          exportName: "PartialView",
          renderPlan: {
            type: "classMethod",
            file: "/tmp/view.php",
            sourceFile: "/tmp/view.php",
            class: "App\\PartialView",
            callable: null,
          },
          constructorArgs: {},
          callableArgs: {},
          allArgs: {
            body: { type: "string", required: true, position: 0, nullable: false },
          },
        },
      ]);

      expect(declaration).toContain("interface PartialView_template_Args");
    });

    it("falls back to template when the callable name sanitizes to an empty string", () => {
      const declaration = generateDeclarationModule([
        {
          exportName: "Symbolic",
          renderPlan: {
            type: "classMethod",
            file: "/tmp/symbolic.php",
            sourceFile: "/tmp/symbolic.php",
            class: "App\\Symbolic",
            callable: "!!!",
          },
          constructorArgs: {},
          callableArgs: {},
          allArgs: {
            body: { type: "string", required: true, position: 0, nullable: false },
          },
        },
      ]);

      expect(declaration).toContain("interface Symbolic_template_Args");
    });
  });

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

      expect(inlineResolved.inlineArgs?.tags).toMatchObject({
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

      expect(inlineResolved.inlineArgs?.title.required).toBe(true);
      expect(inlineResolved.inlineArgs?.subtitle.required).toBe(false);
      expect(listCallableNamesFromResolvedSource(traitMeta)).toContain("display");
      expect(listCallableNamesFromResolvedSource(traitMeta)).not.toContain("factory");
    });
  });

  describe("component-schema", () => {
    it("lists callables for a source file", () => {
      const names = listCallableNames(
        fixturePath("SimpleComponent.php"),
        resolveFrameworkOptions(),
      );

      expect(names).toContain("render");
    });

    it("reports a missing callable when metadata is unavailable", () => {
      const result = resolveSchemasForSource(
        {
          sourceFile: "/tmp/partial.blade.php",
          executionFile: "/tmp/partial.blade.php",
          adapter: null,
          dependencies: ["/tmp/partial.blade.php"],
          meta: null,
          inlineArgs: null,
          mappedCallable: null,
        },
        "render",
      );

      expect(result.schemas).toEqual([]);
      expect(result.error).toContain('PHP callable "render" not found');
    });
  });

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

      expect(schemas[1]?.constructorArgs.items).toMatchObject({
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

      expect(buildSchemasFromMeta(duplicatedNames, "render", contextWithAdapter)[0]?.renderPlan.adapter).toBe(
        "/tmp/adapter.php",
      );
      expect(buildSchemasFromMeta(duplicatedNames, "build", contextWithAdapter)[0]?.renderPlan.adapter).toBe(
        "/tmp/adapter.php",
      );
      expect(buildSchemasFromMeta(duplicatedNames, "badge", contextWithAdapter)[0]?.renderPlan.adapter).toBe(
        "/tmp/adapter.php",
      );
      expect(buildSchemasFromMeta(duplicatedNames, "preview", contextWithAdapter)[0]?.renderPlan.adapter).toBe(
        "/tmp/adapter.php",
      );
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
          classMeta({ name: "OuterTrait", fqn: "OuterTrait", isTrait: true, traits: ["MissingInner"] }),
        ],
        functions: [],
      };

      expect(buildSchemasFromMeta(staticMeta, "build", contextWithAdapter)[0]?.renderPlan.adapter).toBe(
        "/tmp/adapter.php",
      );
      expect(buildSchemasFromMeta(nestedMissingTraitMeta, "render", context)).toEqual([]);
    });
  });

  describe("declaration-files", () => {
    it("skips outputs when a mapped callable cannot be resolved", () => {
      const resolved = resolveComponentSource(
        fixturePath("SimpleComponent.php"),
        resolveFrameworkOptions({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "SimpleComponent.php": {
                callable: "missingMethod",
              },
            },
          },
        }),
      );

      expect(generateDeclarationOutputsForResolvedSource(resolved, null)).toEqual([]);
    });

    it("includes missing dependencies in the version hash", () => {
      const version = versionForResolvedSource({
        sourceFile: fixturePath("SimpleComponent.php"),
        executionFile: fixturePath("SimpleComponent.php"),
        adapter: null,
        dependencies: [fixturePath("SimpleComponent.php"), "/tmp/missing.php"],
        meta: null,
        inlineArgs: null,
        mappedCallable: null,
      });

      expect(version).toContain(`${fixturePath("SimpleComponent.php")}:`);
      expect(version).toContain("/tmp/missing.php:-1");
    });
  });

  describe("typegen", () => {
    it("returns the bare declaration module when the default callable resolves", () => {
      const dts = generateDtsForFile(fixturePath("SimpleComponent.php"), undefined, undefined, "render");

      expect(dts).toContain("interface SimpleComponent_render_Args");
    });

    it("returns an empty string when the default callable is missing", () => {
      expect(
        generateDtsForFile(fixturePath("SimpleComponent.php"), undefined, undefined, "missingMethod"),
      ).toBe("");
    });

    it("passes through type-map and config-dir options", () => {
      const dts = generateDtsForFile(
        fixturePath("TypeMapInlineTarget.blade.php"),
        {
          files: {
            "TypeMapInlineTarget.blade.php": {
              args: {
                title: "string",
              },
            },
          },
        },
        FIXTURES,
        "render",
      );

      expect(dts).toContain("title: string;");
    });

    it("works when no default method is provided", () => {
      expect(generateDtsForFile(fixturePath("SimpleComponent.php"))).toContain(
        "declare const _default: PhpComponent<Record<string, unknown>>;",
      );
    });
  });

  describe("php-type-to-ts", () => {
    it("maps arrays, nullable shorthand, and special scalar forms", () => {
      expect(phpTypeToTs("array", true, "int")).toBe("number[] | null");
      expect(phpTypeToTs("array", false, "int")).toBe("number[]");
      expect(phpTypeToTs("?string")).toBe("string | null");
      expect(phpTypeToTs(null, true)).toBe("unknown | null");
      expect(phpTypeToTs(null, false)).toBe("unknown");
      expect(phpTypeToTs("int|string", true)).toBe("number | string | null");
      expect(phpTypeToTs("void")).toBe("void");
      expect(phpTypeToTs("null")).toBe("null");
      expect(phpTypeToTs("true")).toBe("true");
      expect(phpTypeToTs("false")).toBe("false");
      expect(phpTypeToTs("self")).toBe("Record<string, unknown>");
      expect(phpTypeToTs("static")).toBe("Record<string, unknown>");
      expect(phpTypeToTs("parent")).toBe("Record<string, unknown>");
    });
  });

  describe("parser internals", () => {
    it("handles EOF comments and escaped backticks during preprocessing", () => {
      const processed = preprocess("<?php $cmd = `echo \\`whoami\\``; // trailing comment");

      expect(processed).toContain("`__PLACEHOLDER__`");
      expect(processed).not.toContain("// trailing comment");
    });

    it("masks block comments, hash comments, and attributes", () => {
      const processed = preprocess("<?php /* block */\n# hash comment\n#[Attr([1])]\nclass Demo {}");

      expect(processed).not.toContain("block");
      expect(processed).not.toContain("hash comment");
      expect(processed).not.toContain("Attr");
      expect(processed).toContain("class Demo {}");
    });

    it("keeps malformed block comments and incomplete heredocs stable", () => {
      expect(preprocess("<?php /* unterminated")).toContain("/* unterminated");
      expect(preprocess("<?php $value = <<<TXT\nbody")).toContain("<<<TXT");
      expect(preprocess("<?php $value = <<<\nbody")).toContain("<<<");
      expect(preprocess("<?php $value = <<<TXT\nbody\nTXT")).toContain("__PLACEHOLDER__");
      expect(preprocess("<?php # comment")).not.toContain("# comment");
    });

    it("parses shaped return types and missing terminators", () => {
      expect(readSignatureTail(": (array{foo:string});", 0)).toEqual({
        returnType: "(array{foo:string})",
        terminator: ";",
        terminatorIndex: ": (array{foo:string});".length - 1,
      });

      expect(readSignatureTail(": (array{foo:string})", 0)).toEqual({
        returnType: "(array{foo:string})",
        terminator: null,
        terminatorIndex: ": (array{foo:string})".length,
      });
    });

    it("parses non-type signature tails and bracketed return segments", () => {
      expect(readSignatureTail("{", 0)).toEqual({
        returnType: null,
        terminator: "{",
        terminatorIndex: 0,
      });
      expect(readSignatureTail("x", 0)).toEqual({
        returnType: null,
        terminator: null,
        terminatorIndex: 0,
      });
      expect(readSignatureTail(": ;", 0)).toEqual({
        returnType: null,
        terminator: ";",
        terminatorIndex: 2,
      });
      expect(readSignatureTail(": array[0];", 0)).toEqual({
        returnType: "array[0]",
        terminator: ";",
        terminatorIndex: ": array[0];".length - 1,
      });
    });

    it("extracts standalone functions declared without bodies", () => {
      const functions = extractStandaloneFunctions(
        "<?php function preview(string $label): string; function render(): string { return ''; }",
        null,
      );

      expect(functions.map((fn) => fn.name)).toEqual(["preview", "render"]);
    });

    it("skips malformed params and handles enum and interface members without bodies", () => {
      const functions = extractStandaloneFunctions("<?php function broken(string): void {}", null);
      const interfaces = extractClasses(
        "interface Viewable { public function render(): string; } enum Tone { case Warm }",
        null,
      );

      expect(functions[0]?.params).toEqual([]);
      expect(interfaces[0]?.methods[0]?.name).toBe("render");
      expect(interfaces[1]?.enumCases).toEqual(["Warm"]);
    });

    it("skips incomplete standalone functions and class methods without terminators", () => {
      expect(extractStandaloneFunctions("<?php function preview(string $label)", null)).toEqual([]);
      expect(
        extractClasses("class Broken { public function render(): string }", null)[0]?.methods[0]
          ?.name,
      ).toBe("render");
    });
  });
});
