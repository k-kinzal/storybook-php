/**
 * Tests for the examples refactoring: new PHP patterns, story consolidation,
 * and deletion verification.
 *
 * These tests verify:
 * 1. New PHP pattern examples execute correctly through PhpExecutor
 * 2. New PHP files parse correctly via parsePhpFile
 * 3. Vite plugin generates correct virtual modules for new/consolidated stories
 * 4. Deleted examples no longer exist while kept representatives still work
 */
import { describe, it, expect } from "vite-plus/test";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { PhpExecutor } from "../php-executor.js";
import { parsePhpFile } from "../php-parser.js";
import { storybookPhpPlugin } from "../vite-plugin.js";

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
const hasPhp82 = phpMajor > 8 || (phpMajor === 8 && phpMinor >= 2);

const advancedMonolithDir = resolve(import.meta.dirname!, "../../examples/advanced");
const advancedPatternsDir = resolve(import.meta.dirname!, "../../examples/advanced-patterns/src");
const advancedComponentsDir = resolve(
  import.meta.dirname!,
  "../../examples/advanced-components/src",
);
const advancedCallablesDir = resolve(import.meta.dirname!, "../../examples/advanced-callables/src");
const advancedTemplatesDir = resolve(import.meta.dirname!, "../../examples/advanced-templates/src");
const advancedDirs = [
  advancedPatternsDir,
  advancedComponentsDir,
  advancedCallablesDir,
  advancedTemplatesDir,
];
const php81Dir = resolve(import.meta.dirname!, "../../examples/php81/src");
const advanced = (name: string) => {
  for (const dir of advancedDirs) {
    const candidate = resolve(dir, name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return resolve(advancedPatternsDir, name);
};
const php81 = (name: string) => resolve(php81Dir, name);
const countStories = (dir: string): number => {
  let count = 0;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const target = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      count += countStories(target);
      continue;
    }

    if (entry.name.endsWith(".stories.ts")) {
      count += 1;
    }
  }

  return count;
};

// ==========================================================================
// Phase 1-2: Deletion verification
// ==========================================================================
describe("Phase 1-2: Redundant example deletion", () => {
  describe("advanced-family layout should stay split", () => {
    it("removes the monolithic advanced example", () => {
      expect(existsSync(advancedMonolithDir)).toBe(false);
    });

    it("keeps representative files in separate example units", () => {
      expect(existsSync(resolve(advancedPatternsDir, "TraitTemplate.php"))).toBe(true);
      expect(existsSync(resolve(advancedComponentsDir, "Modal.php"))).toBe(true);
      expect(existsSync(resolve(advancedCallablesDir, "renderHtml.php"))).toBe(true);
      expect(existsSync(resolve(advancedTemplatesDir, "templates/form.php"))).toBe(true);
    });

    it("keeps the advanced-family story load distributed", () => {
      const counts = advancedDirs.map((dir) => countStories(dir));

      expect(counts.every((count) => count >= 15)).toBe(true);
      expect(Math.max(...counts)).toBeLessThan(90);
    });
  });

  describe("advanced/ redundant PHP files should be deleted", () => {
    const deletedFiles = [
      // Generator group (7→1): keep GeneratorList.php
      "Checklist.php",
      "HtmlList.php",
      "Tabs.php",
      "definitionList.php",
      "complexList.php",
      // Void+echo group (4→1): keep VoidEchoCard.php
      "Countdown.php",
      "EchoLayout.php",
      // Multiple instance methods (4→1): keep MultiRender.php
      "MediaCard.php",
      "UserAvatar.php",
      "SplitView.php",
      // Invocable (4→1): keep InvocableGreeting.php
      "InvocableEcho.php",
      "DualCallable.php",
      // Abstract+subclasses (3→1): keep AbstractShape.php
      "NotificationChannel.php",
      // Static factory (3→1): keep PrivateConstruct.php
      "Temperature.php",
      "Money.php",
      // Trait template method (3→1): keep TraitTemplate.php
      "TraitAbstract.php",
      "TraitAccordion.php",
      // Object composition (5→2): keep NestedCompose.php, ComposedCard.php
      "DateRange.php",
      "StyledText.php",
      "ProductCard.php",
      // Nullable (2→1): keep NullableAlert.php
      "nullableLabel.php",
      // Readonly standalone: covered elsewhere
      "ValueObject.php",
      "ValueCard.php",
    ];

    it.each(deletedFiles)("should not have %s after refactoring", (file: string) => {
      // Given: a file that was identified as redundant
      // When: checking for its existence after deletion
      // Then: it should no longer exist
      expect(existsSync(advanced(file))).toBe(false);
    });
  });

  describe("advanced/ representative PHP files should be kept", () => {
    const keptFiles = [
      "GeneratorList.php",
      "VoidEchoCard.php",
      "MultiRender.php",
      "InvocableGreeting.php",
      "AbstractShape.php",
      "PrivateConstruct.php",
      "TraitTemplate.php",
      "NestedCompose.php",
      "ComposedCard.php",
      "NullableAlert.php",
    ];

    it.each(keptFiles)("should still have %s after refactoring", (file: string) => {
      expect(existsSync(advanced(file))).toBe(true);
    });
  });

  describe("advanced/src/templates/ redundant templates should be deleted", () => {
    const deletedTemplates = [
      "list.php",
      "breadcrumb.php",
      "error.php",
      "dashboard.php",
      "notification.php",
      "testimonial.php",
      "timeline.php",
      "search.php",
      "sidebar.php",
      "contact.php",
      "faq.php",
      "features.php",
      "weather.php",
      "login.php",
      "profile.php",
      "portfolio.php",
      "recipe.php",
      "changelog.php",
      "inventory.php",
      "metrics.php",
    ];

    it.each(deletedTemplates)("should not have templates/%s after refactoring", (file: string) => {
      expect(existsSync(advanced(`templates/${file}`))).toBe(false);
    });
  });

  describe("php81/ redundant files should be deleted", () => {
    const deletedFiles = [
      "Status.php",
      "Size.php",
      "Weekday.php",
      "Divider.php",
      "Planet.php",
      "CssColor.php",
      "HttpMethod.php",
      "HttpPort.php",
      "MenuAction.php",
    ];

    it.each(deletedFiles)("should not have %s after refactoring", (file: string) => {
      expect(existsSync(php81(file))).toBe(false);
    });
  });
});

// ==========================================================================
// Phase 3: New advanced/ pattern examples
// ==========================================================================
describe.skipIf(!hasPhp)("Phase 3: New advanced/ pattern examples", () => {
  const executor = new PhpExecutor({ timeout: 10000 });

  // -------------------------------------------------------------------------
  // PhpDocGenericList: PHPDoc generic types (list<T>, array<string, T>)
  // -------------------------------------------------------------------------
  describe("PhpDocGenericList — PHPDoc generic type annotations", () => {
    it("should render with list<string> items", async () => {
      // Given: a class that uses @param list<string> annotation
      const args = { items: ["Alpha", "Beta", "Gamma"], title: "Tags" };

      // When: executing the render method
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("PhpDocGenericList.php"),
        class: "App\\Components\\PhpDocGenericList",
        callable: "render",
        args,
      });

      // Then: all items should appear in the output
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Tags");
      expect(result.html).toContain("Alpha");
      expect(result.html).toContain("Beta");
      expect(result.html).toContain("Gamma");
    });

    it("should render with empty list", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("PhpDocGenericList.php"),
        class: "App\\Components\\PhpDocGenericList",
        callable: "render",
        args: { items: [] },
      });

      expect(result.error).toBeUndefined();
    });

    it("should parse PHPDoc generic annotations", () => {
      // Given: a PHP file with @param list<string> annotation
      // When: parsing the file
      const meta = parsePhpFile(advanced("PhpDocGenericList.php"));

      // Then: class and constructor params should be detected
      const cls = meta.classes.find((c) => c.name === "PhpDocGenericList");
      expect(cls).toBeDefined();
      const itemsParam = cls!.constructorParams.find((p) => p.name === "items");
      expect(itemsParam).toBeDefined();
      expect(itemsParam!.type).toBe("array");
    });

    it("should generate classMethod virtual module", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId(
        "./PhpDocGenericList.php@render",
        advanced("PhpDocGenericList.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("PhpDocGenericList");
    });
  });

  // -------------------------------------------------------------------------
  // ArrayOfObjects: array-of-objects auto-casting (example, not just fixture)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("ArrayOfObjects — list<T> auto-casting showcase", () => {
    it("should cast array of plain objects to typed class instances", async () => {
      // Given: a class with @phpstan-param list<SomeClass> annotation
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayOfObjects.php"),
        class: "App\\Components\\ArrayOfObjects",
        callable: "render",
        args: {
          items: [
            { label: "Item 1", value: 10 },
            { label: "Item 2", value: 20 },
          ],
        },
      });

      // Then: items should be rendered with typed data
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Item 1");
      expect(result.html).toContain("Item 2");
    });

    it("should handle empty items array", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayOfObjects.php"),
        class: "App\\Components\\ArrayOfObjects",
        callable: "render",
        args: { items: [] },
      });

      expect(result.error).toBeUndefined();
    });

    it("should parse array-of-objects class", () => {
      const meta = parsePhpFile(advanced("ArrayOfObjects.php"));
      const cls = meta.classes.find((c) => c.name === "ArrayOfObjects");
      expect(cls).toBeDefined();
      const itemsParam = cls!.constructorParams.find((p) => p.name === "items");
      expect(itemsParam).toBeDefined();
      expect(itemsParam!.type).toBe("array");
    });

    it("should generate classMethod virtual module", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId("./ArrayOfObjects.php@render", advanced("ArrayOfObjects.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("ArrayOfObjects");
    });
  });

  // -------------------------------------------------------------------------
  // MultiClassExport: 1 file, multiple classes → separate story imports
  // -------------------------------------------------------------------------
  describe("MultiClassExport — multiple classes with separate story imports", () => {
    it("should render first exported class", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MultiClassExport.php"),
        class: "App\\Components\\MultiClassExportA",
        callable: "render",
        args: { label: "Component A" },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Component A");
    });

    it("should render second exported class", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MultiClassExport.php"),
        class: "App\\Components\\MultiClassExportB",
        callable: "render",
        args: { label: "Component B" },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Component B");
    });

    it("should parse multiple classes from single file", () => {
      const meta = parsePhpFile(advanced("MultiClassExport.php"));
      const classNames = meta.classes.map((c) => c.name);
      expect(classNames).toContain("MultiClassExportA");
      expect(classNames).toContain("MultiClassExportB");
    });

    it("should generate separate virtual modules per class", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const idA = resolveId(
        "./MultiClassExport.php@render",
        advanced("MultiClassExport.stories.ts"),
      );
      const codeA = load(idA);
      expect(codeA).toContain("export const MultiClassExportA");

      const idB = resolveId(
        "./MultiClassExport.php@render",
        advanced("MultiClassExportB.stories.ts"),
      );
      const codeB = load(idB);
      expect(codeB).toContain("export const MultiClassExportB");
    });
  });

  // -------------------------------------------------------------------------
  // SelfReturn: self/static return types — fluent interface
  // -------------------------------------------------------------------------
  describe("SelfReturn — fluent interface with self/static return", () => {
    it("should render with fluent-chained items", async () => {
      // Given: a class that uses self return type for method chaining
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SelfReturn.php"),
        class: "App\\Components\\SelfReturn",
        callable: "render",
        args: { items: ["First", "Second", "Third"] },
      });

      // Then: all items should be rendered
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("First");
      expect(result.html).toContain("Second");
      expect(result.html).toContain("Third");
    });

    it("should render with empty items", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SelfReturn.php"),
        class: "App\\Components\\SelfReturn",
        callable: "render",
        args: {},
      });

      expect(result.error).toBeUndefined();
    });

    it("should parse self/static return type methods", () => {
      const meta = parsePhpFile(advanced("SelfReturn.php"));
      const cls = meta.classes.find((c) => c.name === "SelfReturn");
      expect(cls).toBeDefined();

      // Should have methods with self or static return types
      const methods = cls!.methods;
      expect(methods.length).toBeGreaterThanOrEqual(1);
    });

    it("should generate classMethod virtual module", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId("./SelfReturn.php@render", advanced("SelfReturn.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("SelfReturn");
    });
  });

  // -------------------------------------------------------------------------
  // NestedArrayDefault: complex nested array default values
  // -------------------------------------------------------------------------
  describe("NestedArrayDefault — deeply nested array defaults", () => {
    it("should render with default nested array values", async () => {
      // Given: a function with complex nested array defaults
      const result = await executor.execute({
        type: "function",
        file: advanced("NestedArrayDefault.php"),
        class: null,
        callable: "App\\Helpers\\renderNestedDefault",
        args: {},
      });

      // Then: should render using the default values
      expect(result.error).toBeUndefined();
      expect(result.html).toBeDefined();
    });

    it("should render with overridden nested array values", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("NestedArrayDefault.php"),
        class: null,
        callable: "App\\Helpers\\renderNestedDefault",
        args: {
          title: "Custom Grid",
          config: { border: false, colors: { header: "#000", cell: "#999" } },
        },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Custom Grid");
    });

    it("should parse nested array default parameters", () => {
      const meta = parsePhpFile(advanced("NestedArrayDefault.php"));
      expect(meta.functions.length).toBeGreaterThanOrEqual(1);
      const fn = meta.functions[0]!;
      const configParam = fn.params.find((p) => p.name === "config");
      expect(configParam).toBeDefined();
      expect(configParam!.default).toBeDefined();
    });

    it("should generate function virtual module", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId(
        "./NestedArrayDefault.php@renderNestedDefault",
        advanced("NestedArrayDefault.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'function'");
    });
  });

  // -------------------------------------------------------------------------
  // VariadicObject: typed object variadic params (MenuItem ...$items)
  // -------------------------------------------------------------------------
  describe("VariadicObject — typed object variadic constructor", () => {
    it("should render with variadic typed objects", async () => {
      // Given: a class with typed object variadic param (e.g., MenuItem ...$items)
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicObject.php"),
        class: "App\\Components\\VariadicObject",
        callable: "render",
        args: {
          items: [
            { label: "Home", url: "/" },
            { label: "About", url: "/about" },
          ],
        },
      });

      // Then: all items should be rendered
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Home");
      expect(result.html).toContain("About");
    });

    it("should render with empty variadic", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicObject.php"),
        class: "App\\Components\\VariadicObject",
        callable: "render",
        args: {},
      });

      expect(result.error).toBeUndefined();
    });

    it("should render with single item", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicObject.php"),
        class: "App\\Components\\VariadicObject",
        callable: "render",
        args: {
          items: [{ label: "Solo", url: "/solo" }],
        },
      });

      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Solo");
    });

    it("should render with items omitting optional constructor params", async () => {
      // Given: MenuItem has optional $url with default '#'
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicObject.php"),
        class: "App\\Components\\VariadicObject",
        callable: "render",
        args: {
          items: [{ label: "LabelOnly" }],
        },
      });

      // Then: item should render with label (url defaults to '#')
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("LabelOnly");
      expect(result.html).toContain('href="#"');
    });

    it("should render with mixed items — some with and without optional params", async () => {
      // Given: items where some provide url and some omit it
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicObject.php"),
        class: "App\\Components\\VariadicObject",
        callable: "render",
        args: {
          items: [{ label: "WithUrl", url: "/page" }, { label: "WithoutUrl" }],
        },
      });

      // Then: both items should render correctly
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("WithUrl");
      expect(result.html).toContain("WithoutUrl");
      expect(result.html).toContain('href="/page"');
      expect(result.html).toContain('href="#"');
    });

    it("should parse variadic object constructor param", () => {
      const meta = parsePhpFile(advanced("VariadicObject.php"));
      const cls = meta.classes.find((c) => c.name === "VariadicObject");
      expect(cls).toBeDefined();
      // Should detect variadic parameter
      const variadicParam = cls!.constructorParams.find((p) => p.isVariadic);
      expect(variadicParam).toBeDefined();
    });

    it("should generate classMethod virtual module", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId("./VariadicObject.php@render", advanced("VariadicObject.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("VariadicObject");
    });
  });
});

// ==========================================================================
// Phase 4: New php81/ pattern examples
// ==========================================================================
describe.skipIf(!hasPhp81)("Phase 4: New php81/ pattern examples", () => {
  const executor = new PhpExecutor({ timeout: 10000 });

  // -------------------------------------------------------------------------
  // FirstClassCallable: PHP 8.1 first-class callable syntax
  // -------------------------------------------------------------------------
  describe("FirstClassCallable — first-class callable syntax", () => {
    it("should render using first-class callable", async () => {
      // Given: a class demonstrating strlen(...) or $obj->method(...) syntax
      const result = await executor.execute({
        type: "classMethod",
        file: php81("FirstClassCallable.php"),
        class: "App\\Components\\FirstClassCallable",
        callable: "render",
        args: { text: "Hello World" },
      });

      // Then: should produce output using first-class callable
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello World");
    });

    it("should render with empty text", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("FirstClassCallable.php"),
        class: "App\\Components\\FirstClassCallable",
        callable: "render",
        args: { text: "" },
      });

      expect(result.error).toBeUndefined();
    });

    it("should parse first-class callable class", () => {
      const meta = parsePhpFile(php81("FirstClassCallable.php"));
      const cls = meta.classes.find((c) => c.name === "FirstClassCallable");
      expect(cls).toBeDefined();
      expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
    });

    it("should generate classMethod virtual module", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId(
        "./FirstClassCallable.php@render",
        php81("FirstClassCallable.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("FirstClassCallable");
    });
  });
});

// ==========================================================================
// Phase 5: Story cleanup
// ==========================================================================
describe("Phase 5: Story file cleanup", () => {
  describe("primary story files should remain", () => {
    const primaryStories = [
      "CodeBlock.stories.ts",
      "DeepInheritance.stories.ts",
      "Dropdown.stories.ts",
      "Pagination.stories.ts",
      "Rating.stories.ts",
    ];

    it.each(primaryStories)("should keep primary %s", (file: string) => {
      expect(existsSync(advanced(file))).toBe(true);
    });
  });

  describe("distinct callable/class stories should stay split", () => {
    const splitStories = [
      {
        file: "CodeBlockInline.stories.ts",
        expectedImport: "./CodeBlock.php@inline",
        expectedExport: "FunctionCall",
      },
      {
        file: "DeepInheritanceInfo.stories.ts",
        expectedImport: "./DeepInheritance.php@render",
        expectedExport: "InfoWidget",
      },
      {
        file: "DropdownSearch.stories.ts",
        expectedImport: "./Dropdown.php@search",
        expectedExport: "Filtered",
      },
      {
        file: "PaginationSimple.stories.ts",
        expectedImport: "./Pagination.php@simple",
        expectedExport: "FirstPage",
      },
      {
        file: "RatingPercent.stories.ts",
        expectedImport: "./Rating.php@fromPercent",
        expectedExport: "Fifty",
      },
    ];

    it.each(splitStories)(
      "should keep %s pointing at its distinct callable/class",
      ({
        file,
        expectedImport,
        expectedExport,
      }: {
        file: string;
        expectedImport: string;
        expectedExport: string;
      }) => {
        const storyPath = advanced(file);
        expect(existsSync(storyPath)).toBe(true);

        const source = readFileSync(storyPath, "utf8");
        expect(source).toContain(expectedImport);
        expect(source).toContain(expectedExport);
      },
    );
  });

  describe("multi-component or multi-callable stories should stay split", () => {
    const splitStories = [
      "AbstractFactoryBadge.stories.ts",
      "AbstractFactoryOutline.stories.ts",
      "AbstractTraitChildQuote.stories.ts",
      "AbstractWidgetCounter.stories.ts",
      "AbstractWidgetVariants.stories.ts",
      "ChipInfo.stories.ts",
      "ChipSuccess.stories.ts",
      "ChipDanger.stories.ts",
      "SectionsHeader.stories.ts",
      "SectionsFooter.stories.ts",
      "WidgetIcon.stories.ts",
      "WidgetActions.stories.ts",
      "WidgetBadge.stories.ts",
      "ModalAnimate.stories.ts",
      "ModalOverlay.stories.ts",
      "TraitChainRow.stories.ts",
      "TraitChainStyled.stories.ts",
      "TraitConflictFormat.stories.ts",
      "MultiClassExportB.stories.ts",
    ];

    it.each(splitStories)("should keep split %s", (file: string) => {
      expect(existsSync(advanced(file))).toBe(true);
    });
  });

  describe("dangling stories tied to removed PHP sources should be deleted", () => {
    const removedStories = [
      "Chip.stories.ts",
      "Sections.stories.ts",
      "NotificationEmail.stories.ts",
      "NotificationSlack.stories.ts",
      "NotificationSms.stories.ts",
      "TraitTooltip.stories.ts",
    ];

    it.each(removedStories)("should remove %s", (file: string) => {
      expect(existsSync(advanced(file))).toBe(false);
    });
  });

  describe("dangling php81 stories tied to removed PHP sources should be deleted", () => {
    const removedStories = [
      "CssColorSwatch.stories.ts",
      "HttpMethodEndpoint.stories.ts",
      "HttpPortTable.stories.ts",
      "MenuActionPalette.stories.ts",
    ];

    it.each(removedStories)("should remove %s", (file: string) => {
      expect(existsSync(php81(file))).toBe(false);
    });
  });
});

// ==========================================================================
// Phase 3 parser: representative kept files still parse correctly
// ==========================================================================
describe("Representative files still parse correctly after deletion", () => {
  it("should parse GeneratorList.php (kept from generator group)", () => {
    const meta = parsePhpFile(advanced("GeneratorList.php"));
    const cls = meta.classes.find((c) => c.name === "GeneratorList");
    expect(cls).toBeDefined();
    expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
  });

  it("should parse InvocableGreeting.php (kept from invocable group)", () => {
    const meta = parsePhpFile(advanced("InvocableGreeting.php"));
    const cls = meta.classes.find((c) => c.name === "InvocableGreeting");
    expect(cls).toBeDefined();
  });

  it("should parse AbstractShape.php (kept from abstract group)", () => {
    const meta = parsePhpFile(advanced("AbstractShape.php"));
    const cls = meta.classes.find((c) => c.name === "AbstractShape");
    expect(cls).toBeDefined();
    expect(cls!.isAbstract).toBe(true);
  });

  it("should parse TraitTemplate.php (kept from trait group)", () => {
    const meta = parsePhpFile(advanced("TraitTemplate.php"));
    expect(meta.classes.length).toBeGreaterThanOrEqual(1);
  });

  it("should parse PrivateConstruct.php (kept from static factory group)", () => {
    const meta = parsePhpFile(advanced("PrivateConstruct.php"));
    const cls = meta.classes.find((c) => c.name === "PrivateConstruct");
    expect(cls).toBeDefined();
  });
});

// ==========================================================================
// Phase 3 executor: representative kept files still execute correctly
// ==========================================================================
describe.skipIf(!hasPhp)("Representative files still execute correctly", () => {
  const executor = new PhpExecutor({ timeout: 10000 });

  it("should execute GeneratorList.php render", async () => {
    const result = await executor.execute({
      type: "classMethod",
      file: advanced("GeneratorList.php"),
      class: "App\\Components\\GeneratorList",
      callable: "render",
      args: { title: "Test", count: 2 },
    });
    expect(result.error).toBeUndefined();
    expect(result.html).toContain("Test");
    expect(result.html).toContain("Item 1");
    expect(result.html).toContain("Item 2");
  });

  it("should execute VoidEchoCard.php render", async () => {
    const result = await executor.execute({
      type: "classMethod",
      file: advanced("VoidEchoCard.php"),
      class: "App\\Components\\VoidEchoCard",
      callable: "render",
      args: { title: "Echo Test" },
    });
    expect(result.error).toBeUndefined();
    expect(result.html).toContain("Echo Test");
  });

  it("should execute NullableAlert.php render", async () => {
    const result = await executor.execute({
      type: "classMethod",
      file: advanced("NullableAlert.php"),
      class: "App\\Components\\NullableAlert",
      callable: "render",
      args: { message: "Alert!" },
    });
    expect(result.error).toBeUndefined();
    expect(result.html).toContain("Alert!");
  });

  it.skipIf(!hasPhp82)("should execute NestedCompose.php render", async () => {
    const result = await executor.execute({
      type: "classMethod",
      file: advanced("NestedCompose.php"),
      class: "App\\Components\\NestedCompose",
      callable: "render",
      args: {
        name: "Test User",
        address: {
          street: "1 Main St",
          city: "Testville",
        },
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.html).toContain("Test User");
    expect(result.html).toContain("Testville");
  });
});
