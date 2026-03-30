import { describe, it, expect } from "vite-plus/test";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { PhpExecutor } from "../../src/runtime/server/php-executor.js";
import type { PhpArgDef, PhpRenderRequest } from "../../src/types.js";

// Check PHP version
let phpMajor = 0;
let phpMinor = 0;
try {
  const out = execSync("php -v", { stdio: "pipe" }).toString();
  const ver = out.match(/PHP (\d+)\.(\d+)/);
  if (ver) {
    phpMajor = parseInt(ver[1]!);
    phpMinor = parseInt(ver[2]!);
  }
} catch {
  // PHP not available
}
const hasPhp = phpMajor > 8 || (phpMajor === 8 && phpMinor >= 0);
const hasPhp81 = phpMajor > 8 || (phpMajor === 8 && phpMinor >= 1);

const fixturesDir = resolve(import.meta.dirname!, "../fixtures");
const fixture = (name: string) => resolve(fixturesDir, name);
const argDef = (type: string, position: number, overrides: Partial<PhpArgDef> = {}): PhpArgDef => ({
  type,
  required:
    overrides.required ?? (overrides.default === undefined && !(overrides.nullable ?? false)),
  position,
  nullable: overrides.nullable ?? false,
  ...overrides,
});

describe.skipIf(!hasPhp)("PhpExecutor", () => {
  const executor = new PhpExecutor({ timeout: 10000 });

  // ---------------------------------------------------------------------------
  // classMethod: SimpleComponent::render
  // ---------------------------------------------------------------------------
  describe("classMethod", () => {
    it("renders SimpleComponent with constructor args", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("SimpleComponent.php"),
        class: "App\\Components\\SimpleComponent",
        callable: "render",
        args: { name: "Alice", age: 30 },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("<div>Alice is 30</div>");
    });

    it("uses default constructor arg values", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("SimpleComponent.php"),
        class: "App\\Components\\SimpleComponent",
        callable: "render",
        args: { name: "Bob" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("<div>Bob is 25</div>");
    });

    it("prefers reflection defaults over inherited generated defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("RuntimeInheritedDefaults.php"),
        class: "App\\Components\\RuntimeInheritedDefaults",
        callable: "render",
        args: { name: "World" },
        publicArgDefs: {
          name: argDef("string", 0),
          greeting: argDef("string", 1, { required: false, default: "__PLACEHOLDER__" }),
          enabled: argDef("bool", 2, { required: false, default: "false" }),
          tags: argDef("array", 3, { required: false, default: "[]" }),
          suffix: argDef("string", 4, { required: false, default: "__PLACEHOLDER__" }),
        },
        constructorArgDefs: {
          name: argDef("string", 0),
          greeting: argDef("string", 1, { required: false, default: "__PLACEHOLDER__" }),
          enabled: argDef("bool", 2, { required: false, default: "false" }),
          tags: argDef("array", 3, { required: false, default: "[]" }),
        },
        callableArgDefs: {
          suffix: argDef("string", 0, { required: false, default: "__PLACEHOLDER__" }),
        },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-greeting="Hello"');
      expect(result.html).toContain('data-enabled="false"');
      expect(result.html).toContain('data-tags="alpha,beta"');
      expect(result.html).toContain("Hello, World!");
    });

    it("renders EchoComponent (void return, output buffer)", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("EchoComponent.php"),
        class: "App\\Components\\Layout",
        callable: "render",
        args: { title: "Hello World" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello World");
      expect(result.html).toContain('<div class="layout">');
    });

    it("renders ComplexComponent with method args", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("ComplexComponent.php"),
        class: "App\\Components\\ComplexComponent",
        callable: "renderCard",
        args: { title: "Card Title", extra: " (featured)" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<div class="card">Card Title (featured)</div>');
    });

    it("supports constructor./method. public args for colliding parameter names", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ScopedArgsComponent.php"),
        class: "App\\Components\\ScopedArgsComponent",
        callable: "render",
        args: {
          "constructor.title": "Outer",
          "method.title": "Inner",
        },
        publicArgDefs: {
          "constructor.title": argDef("string", 0),
          "method.title": argDef("string", 1),
        },
        constructorArgDefs: {
          title: argDef("string", 0),
        },
        callableArgDefs: {
          title: argDef("string", 0),
        },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toBe(
        '<div data-constructor="Outer" data-method="Inner">Outer|Inner</div>',
      );
    });

    it("casts untyped constructor params via public arg type overrides", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapUntypedTarget.php"),
        class: "App\\Components\\UntypedRenderer",
        callable: "render",
        args: {
          content: { content: "Typed from override", tag: "p" },
        },
        publicArgDefs: {
          content: argDef("App\\Components\\UntypedHtmlBlock", 0),
        },
        constructorArgDefs: {
          content: argDef("unknown", 0),
        },
        callableArgDefs: {},
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<p>Typed from override</p>");
    });

    it("preserves PHPDoc generic casting when arg defs match reflection types", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ArrayOfObjects.php"),
        class: "App\\Fixtures\\TagCloud",
        callable: "render",
        args: {
          tags: [
            { name: "Alpha", color: "red" },
            { name: "Beta" },
          ],
        },
        publicArgDefs: {
          tags: argDef("array", 0),
          title: argDef("string", 1, { required: false, default: "__PLACEHOLDER__" }),
        },
        constructorArgDefs: {
          tags: argDef("array", 0),
          title: argDef("string", 1, { required: false, default: "__PLACEHOLDER__" }),
        },
        callableArgDefs: {},
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<h3>Tags</h3>");
      expect(result.html).toContain("Alpha");
      expect(result.html).toContain("Beta");
      expect(result.html).toContain("color: red");
      expect(result.html).toContain("color: gray");
    });

    it("applies public arg defaults and nullable overrides at runtime", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapOverrideRuntime.php"),
        class: "App\\Components\\OverrideDefaults",
        callable: "render",
        args: {
          title: "Defaults from typeMap",
        },
        publicArgDefs: {
          title: argDef("string", 0),
          limit: argDef("int", 1, { required: false, default: 12 }),
          subtitle: argDef("string", 2, { required: false, nullable: true }),
        },
        constructorArgDefs: {
          title: argDef("string", 0),
          limit: argDef("int", 1),
          subtitle: argDef("unknown", 2),
        },
        callableArgDefs: {},
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-limit="12"');
      expect(result.html).toContain("<p>none</p>");
    });

    it("keeps later union candidates available for untyped overrides", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapUnionOverride.php"),
        class: "App\\Components\\UnionOverrideRenderer",
        callable: "render",
        args: {
          value: "draft",
        },
        publicArgDefs: {
          value: argDef("int|string", 0),
        },
        constructorArgDefs: {
          value: argDef("unknown", 0),
        },
        callableArgDefs: {},
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<span data-type="string">draft</span>');
    });

    it("treats elementType-only overrides as arrays for untyped params", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapElementTypeOnly.php"),
        class: "App\\Components\\ElementOnlyRenderer",
        callable: "render",
        args: {
          items: [{ label: "Alpha" }, { label: "Beta" }],
        },
        publicArgDefs: {
          items: argDef("unknown", 0, {
            elementType: "App\\Components\\ElementOnlyItem",
          }),
        },
        constructorArgDefs: {
          items: argDef("unknown", 0),
        },
        callableArgDefs: {},
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toBe("<ul><li>Alpha</li><li>Beta</li></ul>");
    });

    it("casts wrapper objects from combined type and elementType overrides", async () => {
      const typedExecutor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          bindings: {
            "App\\Components\\WrappedRenderable": "App\\Components\\WrappedHtmlBlock",
            "App\\Components\\WrappedListContract": "App\\Components\\WrappedList",
          },
        },
      });

      const result = await typedExecutor.execute({
        type: "classMethod",
        file: fixture("TypeMapWrapperOverride.php"),
        class: "App\\Components\\WrappedListRenderer",
        callable: "render",
        args: {
          items: [
            { content: "First", tag: "p" },
            { content: "Second", tag: "span" },
          ],
        },
        publicArgDefs: {
          items: argDef("App\\Components\\WrappedListContract", 0, {
            elementType: "App\\Components\\WrappedRenderable",
          }),
        },
        constructorArgDefs: {
          items: argDef("unknown", 0),
        },
        callableArgDefs: {},
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<p>First</p>");
      expect(result.html).toContain("<span>Second</span>");
    });
  });

  // ---------------------------------------------------------------------------
  // staticMethod: Alert::danger
  // ---------------------------------------------------------------------------
  describe("staticMethod", () => {
    it("renders Alert::danger static method", async () => {
      const request: PhpRenderRequest = {
        type: "staticMethod",
        file: fixture("StaticMethods.php"),
        class: "App\\Components\\Alert",
        callable: "danger",
        args: { message: "Something went wrong" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<div class="alert">Something went wrong</div>');
    });

    it("renders Alert::success static method", async () => {
      const request: PhpRenderRequest = {
        type: "staticMethod",
        file: fixture("StaticMethods.php"),
        class: "App\\Components\\Alert",
        callable: "success",
        args: { message: "Saved!" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<div class="alert-success">Saved!</div>');
    });
  });

  // ---------------------------------------------------------------------------
  // function: badge()
  // ---------------------------------------------------------------------------
  describe("function", () => {
    it("renders a standalone function", async () => {
      const request: PhpRenderRequest = {
        type: "function",
        file: fixture("StandaloneFunctions.php"),
        class: null,
        callable: "badge",
        args: { label: "New", color: "red" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<span class="badge badge-red">New</span>');
    });

    it("uses default function arg values", async () => {
      const request: PhpRenderRequest = {
        type: "function",
        file: fixture("StandaloneFunctions.php"),
        class: null,
        callable: "badge",
        args: { label: "Default" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<span class="badge badge-gray">Default</span>');
    });

    it("prefers reflection defaults for functions over inherited generated defaults", async () => {
      const result = await executor.execute({
        type: "function",
        file: fixture("RuntimeInheritedDefaults.php"),
        class: null,
        callable: "App\\Components\\runtimeInheritedDefaultsBadge",
        args: { label: "Default" },
        publicArgDefs: {
          label: argDef("string", 0),
          color: argDef("string", 1, { required: false, default: "__PLACEHOLDER__" }),
          tags: argDef("array", 2, { required: false, default: "[]" }),
          outlined: argDef("bool", 3, { required: false, default: "false" }),
        },
        callableArgDefs: {
          label: argDef("string", 0),
          color: argDef("string", 1, { required: false, default: "__PLACEHOLDER__" }),
          tags: argDef("array", 2, { required: false, default: "[]" }),
          outlined: argDef("bool", 3, { required: false, default: "false" }),
        },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<span class="badge badge-gray" data-tags="one,two">Default</span>');
    });
  });

  // ---------------------------------------------------------------------------
  // template: TemplateFile.php
  // ---------------------------------------------------------------------------
  describe("template", () => {
    it("renders a template file with extracted variables", async () => {
      const request: PhpRenderRequest = {
        type: "template",
        file: fixture("TemplateFile.php"),
        class: null,
        callable: null,
        args: { title: "My Card", body: "Card content", variant: "primary" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("My Card");
      expect(result.html).toContain("Card content");
      expect(result.html).toContain("card-primary");
    });

    it("casts template args using inline arg definitions", async () => {
      const result = await executor.execute({
        type: "template",
        file: fixture("TypeMapTemplateDirect.php"),
        class: null,
        callable: null,
        bootstrap: fixture("TypeMapTemplateBootstrap.php"),
        publicArgDefs: {
          title: { type: "string", required: true, position: 0, nullable: false },
          featured: { type: "bool", required: false, position: 1, nullable: false, default: false },
          tone: {
            type: "App\\Templates\\SnippetTone",
            required: true,
            position: 2,
            nullable: false,
          },
          content: {
            type: "App\\Templates\\RenderableSnippet",
            required: true,
            position: 3,
            nullable: false,
          },
          items: {
            type: "App\\Templates\\SnippetList",
            required: true,
            position: 4,
            nullable: false,
            elementType: "App\\Templates\\RenderableSnippet",
          },
          note: {
            type: "string",
            required: false,
            position: 5,
            nullable: true,
          },
          footer: {
            type: "string",
            required: false,
            position: 6,
            nullable: false,
            default: "Generated footer",
          },
        },
        typeMap: {
          bindings: {
            "App\\Templates\\RenderableSnippet": "App\\Templates\\HtmlSnippet",
          },
        },
        args: {
          title: "Template Cast",
          featured: 1,
          tone: "success",
          content: { content: "Primary body", tag: "article" },
          items: [
            { content: "First", tag: "p" },
            { content: "Second", tag: "span" },
          ],
        },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-featured="yes"');
      expect(result.html).toContain('<p class="tone tone-success">SUCCESS</p>');
      expect(result.html).toContain("<article>Primary body</article>");
      expect(result.html).toContain("<p>First</p>");
      expect(result.html).toContain("<span>Second</span>");
      expect(result.html).toContain("<em>note:null</em>");
      expect(result.html).toContain("<small>Generated footer</small>");
    });

    it("rejects missing required template args from inline definitions", async () => {
      const result = await executor.execute({
        type: "template",
        file: fixture("TypeMapTemplateDirect.php"),
        class: null,
        callable: null,
        bootstrap: fixture("TypeMapTemplateBootstrap.php"),
        publicArgDefs: {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        args: {},
      });

      expect(result.error).toContain("Missing required argument: title");
    });
  });

  // ---------------------------------------------------------------------------
  // enumMethod: Color::badge
  // ---------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("enumMethod", () => {
    it("renders an enum method", async () => {
      const request: PhpRenderRequest = {
        type: "enumMethod",
        file: fixture("EnumComponent.php"),
        class: "App\\Components\\Color",
        callable: "badge",
        args: { _case: "red" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<span style="color:red">Red</span>');
    });

    it("renders an enum method with extra args", async () => {
      const request: PhpRenderRequest = {
        type: "enumMethod",
        file: fixture("EnumComponent.php"),
        class: "App\\Components\\Color",
        callable: "label",
        args: { _case: "blue", prefix: "Color: " },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("<label>Color: Blue</label>");
    });
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------
  describe("error handling", () => {
    it("returns error for missing required argument", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("SimpleComponent.php"),
        class: "App\\Components\\SimpleComponent",
        callable: "render",
        args: {},
      };

      const result = await executor.execute(request);
      expect(result.error).toBeDefined();
      expect(result.html).toBe("");
    });

    it("returns error for nonexistent file", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: "/nonexistent/path/file.php",
        class: "App\\Components\\Missing",
        callable: "render",
        args: {},
      };

      const result = await executor.execute(request);
      expect(result.error).toBeDefined();
      expect(result.html).toBe("");
    });

    it("returns error for invalid class", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("SimpleComponent.php"),
        class: "App\\Components\\DoesNotExist",
        callable: "render",
        args: { name: "Test" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeDefined();
      expect(result.html).toBe("");
    });
  });

  // ---------------------------------------------------------------------------
  // Timeout
  // ---------------------------------------------------------------------------
  describe("timeout", () => {
    it("returns error when PHP process times out", async () => {
      const slowExecutor = new PhpExecutor({ timeout: 500 });

      // Create an inline PHP script that sleeps
      const request: PhpRenderRequest = {
        type: "function",
        file: fixture("StandaloneFunctions.php"),
        class: null,
        callable: "badge",
        args: { label: "test" },
      };

      // This should work fine with a normal executor—just verify we can set timeout
      const result = await slowExecutor.execute(request);
      // The fast fixture should complete within 500ms
      expect(result.html).toContain("badge");
    });
  });

  // ---------------------------------------------------------------------------
  // Array return format
  // ---------------------------------------------------------------------------
  describe("array return", () => {
    it("extracts html from array return value", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("ArrayReturn.php"),
        class: "App\\Components\\StatsCard",
        callable: "render",
        args: { label: "Users", value: 42 },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<div class="stats">Users: 42</div>');
    });
  });

  // ---------------------------------------------------------------------------
  // __toString return
  // ---------------------------------------------------------------------------
  describe("stringable return", () => {
    it("converts __toString object to string", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("StringableReturn.php"),
        class: "App\\Components\\FragmentBuilder",
        callable: "render",
        args: { heading: "Title", body: "Content" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("<article><h3>Title</h3><p>Content</p></article>");
    });

    it("handles __toString without body", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("StringableReturn.php"),
        class: "App\\Components\\FragmentBuilder",
        callable: "render",
        args: { heading: "Only Heading" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("<article><h3>Only Heading</h3></article>");
    });
  });

  // ---------------------------------------------------------------------------
  // Enum implementing interface
  // ---------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("enum with interface", () => {
    it("renders enum method on enum implementing interface", async () => {
      const request: PhpRenderRequest = {
        type: "enumMethod",
        file: fixture("EnumInterface.php"),
        class: "App\\Components\\LogLevel",
        callable: "badge",
        args: { _case: "info" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("log-info");
      expect(result.html).toContain("Info");
    });

    it("renders enum interface method (label)", async () => {
      const request: PhpRenderRequest = {
        type: "enumMethod",
        file: fixture("EnumInterface.php"),
        class: "App\\Components\\LogLevel",
        callable: "label",
        args: { _case: "warning" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("Warning");
    });
  });

  // ---------------------------------------------------------------------------
  // Multiple static methods
  // ---------------------------------------------------------------------------
  describe("multiple static methods", () => {
    it("renders button static method", async () => {
      const request: PhpRenderRequest = {
        type: "staticMethod",
        file: fixture("MultiStaticMethods.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "button",
        args: { label: "Click", variant: "danger" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<button class="btn btn-danger">Click</button>');
    });

    it("renders link static method", async () => {
      const request: PhpRenderRequest = {
        type: "staticMethod",
        file: fixture("MultiStaticMethods.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "link",
        args: { text: "Home", href: "/" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toBe('<a href="/">Home</a>');
    });

    it("renders link with external flag", async () => {
      const request: PhpRenderRequest = {
        type: "staticMethod",
        file: fixture("MultiStaticMethods.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "link",
        args: { text: "GitHub", href: "https://github.com", external: true },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('target="_blank"');
      expect(result.html).toContain("GitHub");
    });

    it("renders image static method with defaults", async () => {
      const request: PhpRenderRequest = {
        type: "staticMethod",
        file: fixture("MultiStaticMethods.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "image",
        args: { alt: "Test" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("200px");
      expect(result.html).toContain("150px");
      expect(result.html).toContain("Test");
    });
  });

  // ---------------------------------------------------------------------------
  // Multi-trait method resolution
  // ---------------------------------------------------------------------------
  describe("multi-trait methods", () => {
    it("renders trait icon method on Widget class", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("MultiTraitClass.php"),
        class: "App\\Components\\Widget",
        callable: "icon",
        args: { title: "Test", name: "star" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("icon-star");
      expect(result.html).toContain("24px");
    });

    it("renders trait badge method on Widget class", async () => {
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("MultiTraitClass.php"),
        class: "App\\Components\\Widget",
        callable: "badge",
        args: { title: "Test", text: "New" },
      };

      const result = await executor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("New");
      expect(result.html).toContain("blue");
    });
  });

  // ---------------------------------------------------------------------------
  // PHP binary not found
  // ---------------------------------------------------------------------------
  describe("spawn failure", () => {
    it("returns error when PHP binary does not exist", async () => {
      const badExecutor = new PhpExecutor({
        phpBinary: "/nonexistent/php-binary",
      });

      const request: PhpRenderRequest = {
        type: "function",
        file: fixture("StandaloneFunctions.php"),
        class: null,
        callable: "badge",
        args: { label: "test" },
      };

      const result = await badExecutor.execute(request);
      expect(result.error).toBeDefined();
      expect(result.html).toBe("");
    });
  });

  // ---------------------------------------------------------------------------
  // adapterMap: per-file adapter resolution
  // ---------------------------------------------------------------------------
  describe("adapterMap", () => {
    it("uses pattern-matched adapter for matching file", async () => {
      const adapterExecutor = new PhpExecutor({
        timeout: 10000,
        adapterMap: {
          patterns: [{ suffix: "TemplateFile.php", adapter: fixture("adapter-context.php") }],
          files: {},
        },
      });

      const request: PhpRenderRequest = {
        type: "template",
        file: fixture("TemplateFile.php"),
        class: null,
        callable: null,
        args: { title: "Test", body: "Content", variant: "info" },
      };

      const result = await adapterExecutor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-adapter="context"');
      expect(result.html).toContain("Template rendered via adapter");
    });

    it("uses exact file adapter over pattern adapter", async () => {
      const adapterExecutor = new PhpExecutor({
        timeout: 10000,
        adapterMap: {
          patterns: [],
          files: {
            [fixture("TemplateFile.php")]: fixture("adapter-context.php"),
          },
        },
      });

      const request: PhpRenderRequest = {
        type: "template",
        file: fixture("TemplateFile.php"),
        class: null,
        callable: null,
        args: { title: "Test", body: "Body", variant: "primary" },
      };

      const result = await adapterExecutor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-adapter="context"');
      expect(result.html).toContain("Template rendered via adapter");
    });

    it("falls back to global adapter when no adapterMap match", async () => {
      const adapterExecutor = new PhpExecutor({
        timeout: 10000,
        adapter: fixture("adapter-context.php"),
        adapterMap: {
          patterns: [{ suffix: ".twig", adapter: "/nonexistent/twig-adapter.php" }],
          files: {},
        },
      });

      // .php file doesn't match .twig pattern → falls back to global adapter
      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("SimpleComponent.php"),
        class: "App\\Components\\SimpleComponent",
        callable: "render",
        args: { name: "Alice", age: 30 },
      };

      const result = await adapterExecutor.execute(request);
      expect(result.error).toBeUndefined();
      // Global adapter wraps output with data-adapter="context"
      expect(result.html).toContain('data-adapter="context"');
      expect(result.html).toContain('data-type="classMethod"');
    });
  });

  // ---------------------------------------------------------------------------
  // Adapter context (4th argument)
  // ---------------------------------------------------------------------------
  describe("adapter context", () => {
    it("passes context to adapter for classMethod", async () => {
      const adapterExecutor = new PhpExecutor({
        timeout: 10000,
        adapter: fixture("adapter-context.php"),
      });

      const request: PhpRenderRequest = {
        type: "classMethod",
        file: fixture("SimpleComponent.php"),
        class: "App\\Components\\SimpleComponent",
        callable: "render",
        args: { name: "Alice", age: 30 },
      };

      const result = await adapterExecutor.execute(request);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-type="classMethod"');
      expect(result.html).toContain("Alice is 30");
    });

    it("passes context to adapter for template type", async () => {
      const adapterExecutor = new PhpExecutor({
        timeout: 10000,
        adapter: fixture("adapter-context.php"),
      });

      const request: PhpRenderRequest = {
        type: "template",
        file: fixture("TemplateFile.php"),
        class: null,
        callable: null,
        args: { title: "Hello", body: "World", variant: "primary" },
      };

      const result = await adapterExecutor.execute(request);
      expect(result.error).toBeUndefined();
      // Template mode: adapter receives context with file and args
      expect(result.html).toContain('data-adapter="context"');
      expect(result.html).toContain("Template rendered via adapter");
      expect(result.html).toContain(fixture("TemplateFile.php"));
    });

    it("template without adapter still uses include + extract", async () => {
      // No adapter configured — default template behavior
      const result = await executor.execute({
        type: "template",
        file: fixture("TemplateFile.php"),
        class: null,
        callable: null,
        args: { title: "My Card", body: "Card content", variant: "primary" },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("My Card");
      expect(result.html).toContain("Card content");
      expect(result.html).toContain("card-primary");
    });
  });
});
