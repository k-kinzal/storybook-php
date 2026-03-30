import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { parsePhpSource } from "../../src/core/analysis/php-parser.js";
import {
  generateDts,
  generateDtsForFile,
  generateDtsOutputsForFile,
} from "../../src/core/typescript/typegen.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const fixture = (name: string) =>
  readFileSync(resolve(import.meta.dirname!, "../fixtures", name), "utf-8");
const fixturePath = (name: string) => resolve(import.meta.dirname!, "../fixtures", name);

const fixtureSource = (name: string) =>
  parsePhpSource(fixture(name), resolve(import.meta.dirname!, "../fixtures", name));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("Type Generation", () => {
  // -----------------------------------------------------------------------
  // 1. Simple class: constructor args + method args
  // -----------------------------------------------------------------------
  it("generates interface with constructor args + method args for simple class", () => {
    const meta = fixtureSource("SimpleComponent.php");
    const dts = generateDts(meta);

    expect(dts).toContain("import type { PhpComponent } from 'storybook-php';");
    expect(dts).toContain("interface SimpleComponent_render_Args");
    expect(dts).toContain("name: string;");
    expect(dts).toContain("age?: number;");
    expect(dts).toContain(
      "export declare const SimpleComponent: PhpComponent<SimpleComponent_render_Args>;",
    );
  });

  // -----------------------------------------------------------------------
  // 2. Static method: only method args
  // -----------------------------------------------------------------------
  it("generates interface with only method args for static method", () => {
    const meta = fixtureSource("StaticMethods.php");
    const dts = generateDts(meta);

    expect(dts).toContain("interface Alert_danger_Args");
    expect(dts).toContain("message: string;");
    expect(dts).toContain("dismissible?: boolean;");
    expect(dts).toContain("export declare const Alert: PhpComponent<Alert_danger_Args>;");
  });

  // -----------------------------------------------------------------------
  // 3. Standalone function
  // -----------------------------------------------------------------------
  it("generates function-style interface for standalone functions", () => {
    const meta = fixtureSource("StandaloneFunctions.php");
    const dts = generateDts(meta);

    expect(dts).toContain("interface badge_Args");
    expect(dts).toContain("label: string;");
    expect(dts).toContain("color?: string;");
    expect(dts).toContain("export declare const badge: PhpComponent<badge_Args>;");

    expect(dts).toContain("interface icon_Args");
    expect(dts).toContain("name: string;");
    expect(dts).toContain("size?: number;");
    expect(dts).toContain("export declare const icon: PhpComponent<icon_Args>;");
  });

  // -----------------------------------------------------------------------
  // 4. Enum with method
  // -----------------------------------------------------------------------
  it("generates interface with _case arg for enum methods", () => {
    const meta = fixtureSource("EnumComponent.php");
    const dts = generateDts(meta);

    expect(dts).toContain("interface Color_badge_Args");
    expect(dts).toContain("_case: string;");
    expect(dts).toContain("export declare const Color: PhpComponent<Color_badge_Args>;");

    // Enum with label method that has a param
    expect(dts).toContain("interface Color_label_Args");
    expect(dts).toContain("prefix?: string;");
  });

  // -----------------------------------------------------------------------
  // 5. Template: default export
  // -----------------------------------------------------------------------
  it("generates default export for template files", () => {
    const meta = fixtureSource("TemplateFile.php");
    const dts = generateDts(meta);

    expect(dts).toContain("import type { PhpComponent } from 'storybook-php';");
    expect(dts).toContain("declare const _default: PhpComponent<Record<string, unknown>>;");
    expect(dts).toContain("export default _default;");
  });

  // -----------------------------------------------------------------------
  // 6. PHP type mapping
  // -----------------------------------------------------------------------
  it("maps PHP types to TypeScript types correctly", () => {
    const source = `<?php
class TypeTest {
    public function __construct(
        private string $a,
        private int $b,
        private float $c,
        private bool $d,
        private array $e,
        private ?string $f = null,
    ) {}

    public function render(): string {
        return "";
    }
}
`;
    const meta = parsePhpSource(source, "test.php");
    const dts = generateDts(meta);

    // string -> string
    expect(dts).toContain("a: string;");
    // int -> number
    expect(dts).toContain("b: number;");
    // float -> number
    expect(dts).toContain("c: number;");
    // bool -> boolean
    expect(dts).toContain("d: boolean;");
    // array -> unknown[]
    expect(dts).toContain("e: unknown[];");
    // ?string -> string | null
    expect(dts).toContain("f?: string | null;");
  });

  // -----------------------------------------------------------------------
  // 7. Optional params have ? in interface
  // -----------------------------------------------------------------------
  it("marks optional params with ? in interface", () => {
    const meta = fixtureSource("ComplexComponent.php");
    const dts = generateDts(meta);

    expect(dts).toContain("interface ComplexComponent_render_Args");
    // title is required
    expect(dts).toContain("title: string;");
    // subtitle is nullable with default null -- optional
    expect(dts).toContain("subtitle?: string | null;");
    // featured has a default -- optional
    expect(dts).toContain("featured?: boolean;");
    // items has a default -- optional
    expect(dts).toContain("items?: unknown[];");
  });

  // -----------------------------------------------------------------------
  // 8. Multiple classes -> multiple exports
  // -----------------------------------------------------------------------
  it("generates multiple exports for multiple classes", () => {
    const meta = fixtureSource("MultipleClasses.php");
    const dts = generateDts(meta);

    expect(dts).toContain("interface Header_render_Args");
    expect(dts).toContain("export declare const Header: PhpComponent<Header_render_Args>;");

    expect(dts).toContain("interface Footer_render_Args");
    expect(dts).toContain("export declare const Footer: PhpComponent<Footer_render_Args>;");
  });

  // -----------------------------------------------------------------------
  // Additional type mapping tests
  // -----------------------------------------------------------------------
  it("maps union types correctly", () => {
    const source = `<?php
class UnionDemo {
    public function handle(string|int $id): void {}
}
`;
    const meta = parsePhpSource(source, "test.php");
    const dts = generateDts(meta);

    expect(dts).toContain("id: string | number;");
  });

  it("maps object and mixed to unknown", () => {
    const source = `<?php
class MixedDemo {
    public function handle(object $a, mixed $b): void {}
}
`;
    const meta = parsePhpSource(source, "test.php");
    const dts = generateDts(meta);

    expect(dts).toContain("a: unknown;");
    expect(dts).toContain("b: unknown;");
  });

  it("maps class-typed params to Record<string, unknown>", () => {
    const source = `<?php
class ClassParam {
    public function handle(SomeService $service): void {}
}
`;
    const meta = parsePhpSource(source, "test.php");
    const dts = generateDts(meta);

    expect(dts).toContain("service: Record<string, unknown>;");
  });

  it("maps untyped params to unknown", () => {
    const source = `<?php
function loose($anything): void {}
`;
    const meta = parsePhpSource(source, "test.php");
    const dts = generateDts(meta);

    expect(dts).toContain("anything: unknown;");
  });

  it("generates exact-import outputs for the primary typegen path", () => {
    const outputs = generateDtsOutputsForFile(fixturePath("SimpleComponent.php"), {
      defaultMethod: "render",
    });

    expect(outputs.map((output) => output.path)).toEqual([
      `${fixturePath("SimpleComponent.php")}.d.ts`,
      `${fixturePath("SimpleComponent.php")}@render.d.ts`,
    ]);

    expect(outputs[0]!.content).toContain("interface SimpleComponent_render_Args");
    expect(outputs[0]!.content).toContain("name: string;");
  });

  it("applies typeMap inline args in exact-import outputs", () => {
    const outputs = generateDtsOutputsForFile(fixturePath("TypeMapInlineTarget.blade.php"), {
      _configDir: resolve(import.meta.dirname!, "../fixtures"),
      typeMap: {
        files: {
          "TypeMapInlineTarget.blade.php": {
            args: {
              title: "string",
              featured: { type: "bool", default: false },
            },
          },
        },
      },
    });

    expect(outputs).toHaveLength(1);
    expect(outputs[0]!.content).toContain("title: string;");
    expect(outputs[0]!.content).toContain("featured?: boolean;");
  });

  it("skips bare declaration outputs when defaultMethod does not resolve", () => {
    const outputs = generateDtsOutputsForFile(fixturePath("SimpleComponent.php"), {
      defaultMethod: "missingMethod",
    });

    expect(outputs.map((output) => output.path)).toEqual([
      `${fixturePath("SimpleComponent.php")}@render.d.ts`,
    ]);
    expect(outputs[0]!.content).toContain("interface SimpleComponent_render_Args");
  });

  it("deduplicates schemas before emitting declarations", async () => {
    const duplicatedSchema = {
      exportName: "Card",
      renderPlan: {
        type: "classMethod" as const,
        file: "/tmp/Card.php",
        sourceFile: "/tmp/Card.php",
        class: "App\\Card",
        callable: "render",
      },
      constructorArgs: {},
      callableArgs: {},
      publicArgs: {},
    };

    vi.doMock("../../src/core/component/component-source.js", () => ({
      listCallableNamesFromMeta: () => ["render"],
      resolveComponentSource: vi.fn(),
    }));
    vi.doMock("../../src/core/component/schema-builder.js", () => ({
      buildSchemasFromMeta: () => [duplicatedSchema, duplicatedSchema],
      buildTemplateSchema: vi.fn(),
    }));

    const { generateDts: mockedGenerateDts } = await import("../../src/core/typescript/typegen.js");
    const output = mockedGenerateDts({
      filePath: "/tmp/Card.php",
      namespace: null,
      classes: [],
      functions: [],
    });

    expect(output.match(/export declare const Card/g)).toHaveLength(1);
  });

  it("returns the bare declaration module when the default callable resolves", () => {
    const dts = generateDtsForFile(
      fixturePath("SimpleComponent.php"),
      undefined,
      undefined,
      "render",
    );

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
      resolve(import.meta.dirname!, "../fixtures"),
      "render",
    );

    expect(dts).toContain("title: string;");
  });

  it("works when no default method is provided", () => {
    const dts = generateDtsForFile(fixturePath("SimpleComponent.php"));

    expect(dts).toContain("declare const _default: PhpComponent<Record<string, unknown>>;");
  });
});
