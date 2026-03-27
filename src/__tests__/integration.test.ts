/**
 * Integration tests: verify every plan pattern runs through the PHP executor.
 * These require PHP 8.0+ installed on the system.
 */
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PhpExecutor } from "../php-executor.js";
import { parsePhpFile } from "../php-parser.js";
import { storybookPhpPlugin } from "../vite-plugin.js";
import type { PhpRenderRequest } from "../types.js";

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
const hasPhp83 = phpMajor > 8 || (phpMajor === 8 && phpMinor >= 3);
const hasPhp84 = phpMajor > 8 || (phpMajor === 8 && phpMinor >= 4);
const hasPhp85 = phpMajor > 8 || (phpMajor === 8 && phpMinor >= 5);

const fixturesDir = resolve(import.meta.dirname!, "fixtures");
const examplesDir = resolve(import.meta.dirname!, "../../examples/basic/src");
const advancedDir = resolve(import.meta.dirname!, "../../examples/advanced/src");
const php80Dir = resolve(import.meta.dirname!, "../../examples/php80/src");
const php81Dir = resolve(import.meta.dirname!, "../../examples/php81/src");
const php82Dir = resolve(import.meta.dirname!, "../../examples/php82/src");
const php83Dir = resolve(import.meta.dirname!, "../../examples/php83/src");
const php84Dir = resolve(import.meta.dirname!, "../../examples/php84/src");
const php85Dir = resolve(import.meta.dirname!, "../../examples/php85/src");
const laravelDir = resolve(import.meta.dirname!, "../../examples/laravel/src");
const advancedBootstrap = resolve(import.meta.dirname!, "../../examples/advanced/bootstrap.php");
const hasAdvancedVendor = existsSync(
  resolve(import.meta.dirname!, "../../examples/advanced/vendor/autoload.php"),
);
const laravelBootstrap = resolve(import.meta.dirname!, "../../examples/laravel/bootstrap.php");
const laravelAdapter = resolve(import.meta.dirname!, "../../examples/laravel/adapter.php");
const fixture = (name: string) => resolve(fixturesDir, name);
const basic = (name: string) => resolve(examplesDir, name);
const advanced = (name: string) => resolve(advancedDir, name);
const php80 = (name: string) => resolve(php80Dir, name);
const php81 = (name: string) => resolve(php81Dir, name);
const php82 = (name: string) => resolve(php82Dir, name);
const php83 = (name: string) => resolve(php83Dir, name);
const php84 = (name: string) => resolve(php84Dir, name);
const php85 = (name: string) => resolve(php85Dir, name);
const laravel = (name: string) => resolve(laravelDir, name);

describe.skipIf(!hasPhp)("Integration: All Plan Patterns", () => {
  const executor = new PhpExecutor({ timeout: 10000 });

  // -------------------------------------------------------------------------
  // UC1: Class with constructor + instance method
  // -------------------------------------------------------------------------
  describe("UC1: Class instance method", () => {
    it("renders Greeting with constructor args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Greeting.php"),
        class: "App\\Components\\Greeting",
        callable: "render",
        args: { name: "World" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello, World!");
    });

    it("uses default constructor values", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Greeting.php"),
        class: "App\\Components\\Greeting",
        callable: "render",
        args: { name: "Storybook", greeting: "Welcome" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Welcome, Storybook!");
    });
  });

  // -------------------------------------------------------------------------
  // UC2: Method with own params (separate from constructor)
  // -------------------------------------------------------------------------
  describe("UC2: Method with own params", () => {
    it("maps args to constructor vs method params", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Formatter.php"),
        class: "App\\Components\\Formatter",
        callable: "formatCurrency",
        args: { locale: "en_US", amount: 42.5, symbol: "$" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("$42.50");
      expect(result.html).toContain("currency");
    });

    it("uses defaults for both constructor and method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Formatter.php"),
        class: "App\\Components\\Formatter",
        callable: "formatCurrency",
        args: { amount: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("$100.00");
    });
  });

  // -------------------------------------------------------------------------
  // UC3: Static method
  // -------------------------------------------------------------------------
  describe("UC3: Static method", () => {
    it("renders Alert::danger", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Alert.php"),
        class: "App\\Components\\Alert",
        callable: "danger",
        args: { message: "Error!", dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("alert-danger");
      expect(result.html).toContain("Error!");
      expect(result.html).toContain("&times;");
    });

    it("renders without optional args", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Alert.php"),
        class: "App\\Components\\Alert",
        callable: "info",
        args: { message: "Info text" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("alert-info");
    });
  });

  // -------------------------------------------------------------------------
  // UC4: Standalone function (global)
  // -------------------------------------------------------------------------
  describe("UC4: Global function", () => {
    it("renders badge()", async () => {
      const result = await executor.execute({
        type: "function",
        file: basic("badge.php"),
        class: null,
        callable: "badge",
        args: { label: "New", color: "green" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("New");
      expect(result.html).toContain("green");
    });

    it("uses default color", async () => {
      const result = await executor.execute({
        type: "function",
        file: basic("badge.php"),
        class: null,
        callable: "badge",
        args: { label: "Default" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("gray");
    });
  });

  // -------------------------------------------------------------------------
  // UC5: Namespaced function
  // -------------------------------------------------------------------------
  describe("UC5: Namespaced function", () => {
    it("renders namespaced pill()", async () => {
      const result = await executor.execute({
        type: "function",
        file: basic("helpers.php"),
        class: null,
        callable: "App\\Helpers\\pill",
        args: { text: "Tag" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pill");
      expect(result.html).toContain("Tag");
    });

    it("passes outline arg", async () => {
      const result = await executor.execute({
        type: "function",
        file: basic("helpers.php"),
        class: null,
        callable: "App\\Helpers\\pill",
        args: { text: "Outlined", outline: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pill-outline");
    });
  });

  // -------------------------------------------------------------------------
  // UC6: Template file
  // -------------------------------------------------------------------------
  describe("UC6: Template file", () => {
    it("renders template with extracted variables", async () => {
      const result = await executor.execute({
        type: "template",
        file: basic("templates/card.php"),
        class: null,
        callable: null,
        args: { title: "Template", body: "Content", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Template");
      expect(result.html).toContain("Content");
      expect(result.html).toContain("card-primary");
    });
  });

  // -------------------------------------------------------------------------
  // UC7: Invocable class (__invoke)
  // -------------------------------------------------------------------------
  describe("UC7: Invocable class (__invoke)", () => {
    it("renders English greeting", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("InvocableGreeting.php"),
        class: "App\\Components\\InvocableGreeting",
        callable: "__invoke",
        args: { locale: "en", name: "World" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello World");
    });

    it("renders Japanese greeting", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("InvocableGreeting.php"),
        class: "App\\Components\\InvocableGreeting",
        callable: "__invoke",
        args: { locale: "ja", name: "太郎" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("こんにちは");
      expect(result.html).toContain("太郎");
    });

    it("renders French greeting", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("InvocableGreeting.php"),
        class: "App\\Components\\InvocableGreeting",
        callable: "__invoke",
        args: { locale: "fr", name: "Marie" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Bonjour Marie");
    });
  });

  // -------------------------------------------------------------------------
  // UC8: Laravel Component + Blade (real illuminate/view)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC8: Laravel Component + Blade", () => {
    const bladeExecutor = new PhpExecutor({
      timeout: 10000,
      bootstrap: laravelBootstrap,
      adapter: laravelAdapter,
    });

    it("renders BladeAlert via Blade template", async () => {
      const result = await bladeExecutor.execute({
        type: "classMethod",
        file: laravel("BladeAlert.php"),
        class: "App\\Components\\BladeAlert",
        callable: "render",
        args: {
          title: "Error",
          type: "danger",
          message: "Something went wrong.",
          dismissible: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("alert-danger");
      expect(result.html).toContain("Error");
      expect(result.html).toContain("Something went wrong.");
      expect(result.html).toContain("btn-close");
    });

    it("renders BladeCard via Blade template", async () => {
      const result = await bladeExecutor.execute({
        type: "classMethod",
        file: laravel("BladeCard.php"),
        class: "App\\Components\\BladeCard",
        callable: "render",
        args: { title: "Featured", body: "Content", featured: true, footer: "Today" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("card-featured");
      expect(result.html).toContain("Featured");
      expect(result.html).toContain("Content");
      expect(result.html).toContain("Today");
    });

    it("renders BladeStats via Blade @foreach", async () => {
      const result = await bladeExecutor.execute({
        type: "classMethod",
        file: laravel("BladeStats.php"),
        class: "App\\Components\\BladeStats",
        callable: "render",
        args: {
          items: [
            { label: "Users", value: "1,234" },
            { label: "Revenue", value: "$56K" },
          ],
          color: "#10b981",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("stats-grid");
      expect(result.html).toContain("1,234");
      expect(result.html).toContain("$56K");
      expect(result.html).toContain("#10b981");
    });

    it("renders BladeNestedPage with multi-level nesting", async () => {
      const result = await bladeExecutor.execute({
        type: "classMethod",
        file: laravel("BladeNestedPage.php"),
        class: "App\\Components\\BladeNestedPage",
        callable: "render",
        args: {
          title: "Test Page",
          subtitle: "Integration test",
          items: [
            { name: "Alpha", status: "active" },
            { name: "Beta", status: "pending" },
          ],
          showAlert: true,
        },
      });
      expect(result.error).toBeUndefined();
      // Pattern 1+2: @include section-header
      expect(result.html).toContain('data-pattern="include"');
      expect(result.html).toContain("Test Page");
      // Pattern 3: nested @include (badge inside wrapper)
      expect(result.html).toContain('data-pattern="nested-include"');
      // Pattern 4: @component/@slot
      expect(result.html).toContain('data-pattern="component-slot"');
      expect(result.html).toContain("card-slot");
      // Pattern 5: @each
      expect(result.html).toContain('data-pattern="each"');
      expect(result.html).toContain("Alpha");
      expect(result.html).toContain("Beta");
      // Pattern 6: @include → @component (mixed nesting)
      expect(result.html).toContain('data-pattern="include-then-component"');
      // Badge partial rendered at multiple nesting levels
      expect(result.html).toContain("active");
      expect(result.html).toContain("pending");
      // $showAlert conditional rendering
      expect(result.html).toContain('data-pattern="alert"');
    });
  });

  // -------------------------------------------------------------------------
  // UC9: Readonly class + enum params + object params (recursive instantiation)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC9: Readonly + enum + object params", () => {
    it("renders ProductCard with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProductCard.php"),
        class: "App\\Components\\ProductCard",
        callable: "render",
        args: { name: "Widget", price: 29.99 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Widget");
      expect(result.html).toContain("USD");
      expect(result.html).toContain("29.99");
      expect(result.html).toContain("Draft");
    });

    it("renders with enum status and nested object config", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProductCard.php"),
        class: "App\\Components\\ProductCard",
        callable: "render",
        args: {
          name: "Premium",
          price: 99.99,
          config: { currency: "JPY", decimals: 0 },
          status: "published",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Premium");
      expect(result.html).toContain("JPY");
      expect(result.html).toContain("100"); // 99.99 with 0 decimals = 100
      expect(result.html).toContain("Published");
    });
  });

  // -------------------------------------------------------------------------
  // UC10: Echo-based output (void return)
  // -------------------------------------------------------------------------
  describe("UC10: Echo-based void return", () => {
    it("captures output buffer from void method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Layout.php"),
        class: "App\\Components\\Layout",
        callable: "render",
        args: { title: "My Page" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("My Page");
      expect(result.html).toContain("layout");
    });

    it("works with dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Layout.php"),
        class: "App\\Components\\Layout",
        callable: "render",
        args: { title: "Dark", theme: "dark" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("layout-dark");
    });
  });

  // -------------------------------------------------------------------------
  // UC11: Enum with methods
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC11: Enum method", () => {
    it("renders Color::badge for red", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: basic("Color.php"),
        class: "App\\Components\\Color",
        callable: "badge",
        args: { _case: "red" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Red");
      expect(result.html).toContain("red");
      expect(result.html).toContain("badge");
    });

    it("renders Color::badge for blue", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: basic("Color.php"),
        class: "App\\Components\\Color",
        callable: "badge",
        args: { _case: "blue" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Blue");
    });
  });

  // -------------------------------------------------------------------------
  // UC12: Inherited method
  // -------------------------------------------------------------------------
  describe("UC12: Inherited method", () => {
    it("renders inherited render() on child class", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("CardWithBase.php"),
        class: "App\\Components\\CardWithBase",
        callable: "render",
        args: { title: "My Card", content: "Inherited body" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("base-component");
      expect(result.html).toContain("Inherited body");
    });
  });

  // -------------------------------------------------------------------------
  // UC13: Nullable parameters
  // -------------------------------------------------------------------------
  describe("UC13: Nullable parameters", () => {
    it("renders Nav with all nullables omitted", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Nav.php"),
        class: "App\\Components\\Nav",
        callable: "render",
        args: { brand: "My App" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("My App");
      expect(result.html).toContain("nav");
    });

    it("renders Nav with nullable subtitle provided", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Nav.php"),
        class: "App\\Components\\Nav",
        callable: "render",
        args: { brand: "My App", subtitle: "Dashboard", activeItem: "Settings" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("Settings");
    });

    it("renders Nav with sticky flag", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Nav.php"),
        class: "App\\Components\\Nav",
        callable: "render",
        args: { brand: "App", sticky: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("nav-sticky");
    });
  });

  // -------------------------------------------------------------------------
  // UC14: Array parameters
  // -------------------------------------------------------------------------
  describe("UC14: Array parameters", () => {
    it("renders Table with headers and rows", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Table.php"),
        class: "App\\Components\\Table",
        callable: "render",
        args: {
          headers: ["Name", "Role"],
          rows: [
            ["Alice", "Engineer"],
            ["Bob", "Designer"],
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alice");
      expect(result.html).toContain("Engineer");
      expect(result.html).toContain("Bob");
      expect(result.html).toContain("<table");
    });

    it("renders striped Table", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Table.php"),
        class: "App\\Components\\Table",
        callable: "render",
        args: {
          headers: ["Item"],
          rows: [["One"], ["Two"]],
          striped: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("table-striped");
    });
  });

  // -------------------------------------------------------------------------
  // UC15: Enum method with additional params
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC15: Enum method with params", () => {
    it("renders Status::label with default params", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Status.php"),
        class: "App\\Components\\Status",
        callable: "label",
        args: { _case: "active" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Active");
      expect(result.html).toContain("#22c55e");
    });

    it("renders Status::label with prefix and uppercase", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Status.php"),
        class: "App\\Components\\Status",
        callable: "label",
        args: { _case: "pending", prefix: "Status", uppercase: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("STATUS: PENDING");
      expect(result.html).toContain("#f59e0b");
    });
  });

  // -------------------------------------------------------------------------
  // UC16: Multiple static methods from same class
  // -------------------------------------------------------------------------
  describe("UC16: Multiple static methods", () => {
    it("renders Alert::success", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Alert.php"),
        class: "App\\Components\\Alert",
        callable: "success",
        args: { message: "Saved!", dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("alert-success");
      expect(result.html).toContain("Saved!");
      expect(result.html).toContain("&times;");
    });
  });

  // -------------------------------------------------------------------------
  // UC17: Multiple namespaced functions from same file
  // -------------------------------------------------------------------------
  describe("UC17: Multiple functions from same file", () => {
    it("renders tag() from helpers.php", async () => {
      const result = await executor.execute({
        type: "function",
        file: basic("helpers.php"),
        class: null,
        callable: "App\\Helpers\\tag",
        args: { label: "Feature", color: "green" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tag");
      expect(result.html).toContain("Feature");
      expect(result.html).toContain("green");
    });
  });

  // -------------------------------------------------------------------------
  // UC18: Additional template file
  // -------------------------------------------------------------------------
  describe("UC18: Profile template", () => {
    it("renders profile template with variables", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/profile.php"),
        class: null,
        callable: null,
        args: { name: "Alice Johnson", role: "Engineer" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alice Johnson");
      expect(result.html).toContain("Engineer");
      expect(result.html).toContain("profile-card");
    });

    it("renders profile with defaults for missing variables", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/profile.php"),
        class: null,
        callable: null,
        args: { name: "Bob" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Bob");
      expect(result.html).toContain("Member");
    });
  });

  // -------------------------------------------------------------------------
  // UC19: Variadic parameters
  // -------------------------------------------------------------------------
  describe("UC19: Variadic parameters", () => {
    it("renders Breadcrumb with variadic segments", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Breadcrumb.php"),
        class: "App\\Components\\Breadcrumb",
        callable: "render",
        args: { separator: " / ", segments: ["Home", "Products", "Widget"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Home");
      expect(result.html).toContain("Products");
      expect(result.html).toContain("Widget");
      expect(result.html).toContain("breadcrumb");
    });

    it("renders Breadcrumb with empty segments", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Breadcrumb.php"),
        class: "App\\Components\\Breadcrumb",
        callable: "render",
        args: { segments: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("breadcrumb-empty");
    });

    it("renders Breadcrumb with single segment", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Breadcrumb.php"),
        class: "App\\Components\\Breadcrumb",
        callable: "render",
        args: { segments: ["Home"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("breadcrumb-current");
      expect(result.html).toContain("Home");
    });
  });

  // -------------------------------------------------------------------------
  // UC20: Union type parameters
  // -------------------------------------------------------------------------
  describe("UC20: Union type parameters", () => {
    it("renders Progress with int value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Progress.php"),
        class: "App\\Components\\Progress",
        callable: "render",
        args: { value: 75 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("75%");
      expect(result.html).toContain("progress-bar");
    });

    it("renders Progress with string value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Progress.php"),
        class: "App\\Components\\Progress",
        callable: "render",
        args: { value: "42", max: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("42%");
    });

    it("renders Progress with custom label", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Progress.php"),
        class: "App\\Components\\Progress",
        callable: "render",
        args: { value: 3, max: 10, label: "3 of 10" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("3 of 10");
    });
  });

  // -------------------------------------------------------------------------
  // UC21: Generator return
  // -------------------------------------------------------------------------
  describe("UC21: Generator return", () => {
    it("renders HtmlList from generator yield", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("HtmlList.php"),
        class: "App\\Components\\HtmlList",
        callable: "render",
        args: { items: ["Apples", "Bananas", "Cherries"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<ul");
      expect(result.html).toContain("Apples");
      expect(result.html).toContain("Bananas");
      expect(result.html).toContain("Cherries");
      expect(result.html).toContain("</ul>");
    });

    it("renders ordered HtmlList from generator", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("HtmlList.php"),
        class: "App\\Components\\HtmlList",
        callable: "render",
        args: { items: ["First", "Second"], ordered: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<ol");
      expect(result.html).toContain("First");
      expect(result.html).toContain("Second");
      expect(result.html).toContain("</ol>");
    });
  });

  // -------------------------------------------------------------------------
  // UC22: Template with loops and conditionals
  // -------------------------------------------------------------------------
  describe("UC22: Template with loops", () => {
    it("renders list template with items", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/list.php"),
        class: null,
        callable: null,
        args: { title: "Shopping", items: ["Milk", "Eggs"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Shopping");
      expect(result.html).toContain("Milk");
      expect(result.html).toContain("Eggs");
      expect(result.html).toContain("<ul");
    });

    it("renders numbered list template", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/list.php"),
        class: null,
        callable: null,
        args: { title: "Steps", items: ["Install", "Configure"], numbered: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<ol");
      expect(result.html).toContain("Install");
    });

    it("renders empty list template", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/list.php"),
        class: null,
        callable: null,
        args: { title: "Empty" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No items to display");
    });
  });

  // -------------------------------------------------------------------------
  // UC23: Unit enum (non-backed)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC23: Unit enum", () => {
    it("renders Size::button for Small", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Size.php"),
        class: "App\\Components\\Size",
        callable: "button",
        args: { _case: "Small", text: "Click me" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("btn-Small");
      expect(result.html).toContain("Click me");
      expect(result.html).toContain("font-size: 12px");
    });

    it("renders Size::button for ExtraLarge with custom color", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Size.php"),
        class: "App\\Components\\Size",
        callable: "button",
        args: { _case: "ExtraLarge", text: "Big Button", color: "#ef4444" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("btn-ExtraLarge");
      expect(result.html).toContain("Big Button");
      expect(result.html).toContain("#ef4444");
      expect(result.html).toContain("font-size: 18px");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: verify virtual modules generate correctly for all patterns
  // -------------------------------------------------------------------------
  describe("Vite plugin: virtual module generation", () => {
    const plugin = storybookPhpPlugin();
    // We only need load + resolveId
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC2: Formatter@formatCurrency generates classMethod with ctor+method args", () => {
      const id = resolveId("./Formatter.php@formatCurrency", advanced("Formatter.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "formatCurrency"');
      expect(code).toContain("locale:"); // ctor arg
      expect(code).toContain("amount:"); // method arg
      expect(code).toContain("symbol:"); // method arg
    });

    it("UC5: helpers.php@pill generates function with FQN callable", () => {
      const id = resolveId("./helpers.php@pill", basic("helpers.php"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("App\\\\Helpers\\\\pill"); // FQN in JSON string
    });

    it("UC7: InvocableGreeting@__invoke generates classMethod", () => {
      const id = resolveId("./InvocableGreeting.php@__invoke", advanced("InvocableGreeting.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "__invoke"');
      expect(code).toContain("locale:"); // ctor arg
      expect(code).toContain("name:"); // invoke arg
    });

    it("UC11: Color@badge generates enumMethod", () => {
      const id = resolveId("./Color.php@badge", basic("Color.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
    });

    it("UC12: CardWithBase@render finds inherited method", () => {
      const id = resolveId("./CardWithBase.php@render", advanced("CardWithBase.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("CardWithBase");
      expect(code).toContain("title:"); // ctor arg from CardWithBase
      expect(code).toContain("content:"); // method arg from BaseComponent.render
    });

    it("UC9: ProductCard@render generates classMethod", () => {
      const id = resolveId("./ProductCard.php@render", advanced("ProductCard.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("name:");
      expect(code).toContain("price:");
      expect(code).toContain("config:");
      expect(code).toContain("status:");
    });

    it("UC13: Nav@render generates classMethod with nullable params", () => {
      const id = resolveId("./Nav.php@render", advanced("Nav.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("brand:");
      expect(code).toContain("subtitle:");
      expect(code).toContain("activeItem:");
    });

    it("UC14: Table@render generates classMethod with array params", () => {
      const id = resolveId("./Table.php@render", advanced("Table.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("headers:");
      expect(code).toContain("rows:");
      expect(code).toContain("striped:");
    });

    it("UC15: Status@label generates enumMethod with extra params", () => {
      const id = resolveId("./Status.php@label", php81("Status.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
      expect(code).toContain("prefix:");
      expect(code).toContain("uppercase:");
    });

    it("UC16: Alert@success generates staticMethod", () => {
      const id = resolveId("./Alert.php@success", basic("Alert.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('__callable: "success"');
      expect(code).toContain("message:");
      expect(code).toContain("dismissible:");
    });

    it("UC17: helpers.php@tag generates function for second function", () => {
      const id = resolveId("./helpers.php@tag", basic("helpers.php"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("App\\\\Helpers\\\\tag");
      expect(code).toContain("label:");
      expect(code).toContain("color:");
    });

    it("UC19: Breadcrumb@render generates classMethod with variadic param", () => {
      const id = resolveId("./Breadcrumb.php@render", advanced("Breadcrumb.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("separator:");
      expect(code).toContain("segments:");
    });

    it("UC20: Progress@render generates classMethod with union type param", () => {
      const id = resolveId("./Progress.php@render", advanced("Progress.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("value:");
      expect(code).toContain("max:");
      expect(code).toContain("label:");
    });

    it("UC21: HtmlList@render generates classMethod", () => {
      const id = resolveId("./HtmlList.php@render", advanced("HtmlList.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("items:");
      expect(code).toContain("ordered:");
    });

    it("UC23: Size@button generates enumMethod for unit enum", () => {
      const id = resolveId("./Size.php@button", php81("Size.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
      expect(code).toContain("text:");
      expect(code).toContain("color:");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: verify PHP parser extracts metadata correctly for all patterns
  // -------------------------------------------------------------------------
  describe("Parser: metadata extraction for all patterns", () => {
    it("parses namespaced functions correctly", () => {
      const meta = parsePhpFile(basic("helpers.php"));
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(2);
      expect(meta.functions[0]!.name).toBe("pill");
      expect(meta.functions[0]!.fqn).toBe("App\\Helpers\\pill");
      expect(meta.functions[1]!.name).toBe("tag");
      expect(meta.functions[1]!.fqn).toBe("App\\Helpers\\tag");
    });

    it("parses enum with methods and cases", () => {
      const meta = parsePhpFile(basic("Color.php"));
      const color = meta.classes.find((c) => c.name === "Color");
      expect(color).toBeDefined();
      expect(color!.isEnum).toBe(true);
      expect(color!.enumBackingType).toBe("string");
      expect(color!.enumCases).toContain("Red");
      expect(color!.enumCases).toContain("Blue");
      const badge = color!.methods.find((m) => m.name === "badge");
      expect(badge).toBeDefined();
    });

    it("parses readonly class with enum and object params", () => {
      const meta = parsePhpFile(advanced("ProductCard.php"));
      const pc = meta.classes.find((c) => c.name === "ProductCard");
      expect(pc).toBeDefined();
      expect(pc!.isReadonly).toBe(true);
      expect(pc!.constructorParams).toHaveLength(4);
      const configParam = pc!.constructorParams.find((p) => p.name === "config");
      expect(configParam).toBeDefined();
      expect(configParam!.type).toBe("ProductConfig");
    });

    it("parses inherited class structure", () => {
      const meta = parsePhpFile(advanced("CardWithBase.php"));
      const card = meta.classes.find((c) => c.name === "CardWithBase");
      expect(card).toBeDefined();
      expect(card!.extends).toBe("BaseComponent");
      // Card itself has no methods (render is inherited)
      expect(card!.methods).toHaveLength(0);
      // BaseComponent has render
      const base = meta.classes.find((c) => c.name === "BaseComponent");
      expect(base).toBeDefined();
      expect(base!.methods.some((m) => m.name === "render")).toBe(true);
    });

    it("parses __invoke as a method", () => {
      const meta = parsePhpFile(advanced("InvocableGreeting.php"));
      const cls = meta.classes[0]!;
      expect(cls.methods.some((m) => m.name === "__invoke")).toBe(true);
    });

    it("parses Nav with nullable constructor and method params", () => {
      const meta = parsePhpFile(advanced("Nav.php"));
      const nav = meta.classes.find((c) => c.name === "Nav");
      expect(nav).toBeDefined();
      const subtitle = nav!.constructorParams.find((p) => p.name === "subtitle");
      expect(subtitle).toBeDefined();
      expect(subtitle!.nullable).toBe(true);
      const render = nav!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      const activeItem = render!.params.find((p) => p.name === "activeItem");
      expect(activeItem).toBeDefined();
      expect(activeItem!.nullable).toBe(true);
    });

    it("parses Table with array params", () => {
      const meta = parsePhpFile(advanced("Table.php"));
      const table = meta.classes.find((c) => c.name === "Table");
      expect(table).toBeDefined();
      const headers = table!.constructorParams.find((p) => p.name === "headers");
      expect(headers).toBeDefined();
      expect(headers!.type).toBe("array");
      const rows = table!.constructorParams.find((p) => p.name === "rows");
      expect(rows).toBeDefined();
      expect(rows!.type).toBe("array");
    });

    it("parses Status enum with method params", () => {
      const meta = parsePhpFile(php81("Status.php"));
      const status = meta.classes.find((c) => c.name === "Status");
      expect(status).toBeDefined();
      expect(status!.isEnum).toBe(true);
      expect(status!.enumBackingType).toBe("string");
      expect(status!.enumCases).toContain("Active");
      expect(status!.enumCases).toContain("Inactive");
      expect(status!.enumCases).toContain("Pending");
      const label = status!.methods.find((m) => m.name === "label");
      expect(label).toBeDefined();
      expect(label!.params).toHaveLength(2);
      expect(label!.params[0]!.name).toBe("prefix");
      expect(label!.params[1]!.name).toBe("uppercase");
    });

    it("parses multiple functions from helpers.php", () => {
      const meta = parsePhpFile(basic("helpers.php"));
      expect(meta.functions).toHaveLength(2);
      const tag = meta.functions.find((f) => f.name === "tag");
      expect(tag).toBeDefined();
      expect(tag!.fqn).toBe("App\\Helpers\\tag");
      expect(tag!.params).toHaveLength(2);
      expect(tag!.params[0]!.name).toBe("label");
      expect(tag!.params[1]!.name).toBe("color");
    });

    it("parses Breadcrumb with variadic method param", () => {
      const meta = parsePhpFile(advanced("Breadcrumb.php"));
      const cls = meta.classes.find((c) => c.name === "Breadcrumb");
      expect(cls).toBeDefined();
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      const segments = render!.params.find((p) => p.name === "segments");
      expect(segments).toBeDefined();
      expect(segments!.isVariadic).toBe(true);
      expect(segments!.type).toBe("string");
    });

    it("parses Progress with union type constructor param", () => {
      const meta = parsePhpFile(advanced("Progress.php"));
      const cls = meta.classes.find((c) => c.name === "Progress");
      expect(cls).toBeDefined();
      const value = cls!.constructorParams.find((p) => p.name === "value");
      expect(value).toBeDefined();
      expect(value!.type).toBe("int|string");
    });

    it("parses HtmlList with Generator return type", () => {
      const meta = parsePhpFile(advanced("HtmlList.php"));
      const cls = meta.classes.find((c) => c.name === "HtmlList");
      expect(cls).toBeDefined();
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.returnType).toContain("Generator");
    });

    it("parses Size as unit enum without backing type", () => {
      const meta = parsePhpFile(php81("Size.php"));
      const size = meta.classes.find((c) => c.name === "Size");
      expect(size).toBeDefined();
      expect(size!.isEnum).toBe(true);
      expect(size!.enumBackingType).toBeNull();
      expect(size!.enumCases).toContain("Small");
      expect(size!.enumCases).toContain("Medium");
      expect(size!.enumCases).toContain("Large");
      expect(size!.enumCases).toContain("ExtraLarge");
      const button = size!.methods.find((m) => m.name === "button");
      expect(button).toBeDefined();
      expect(button!.params).toHaveLength(2);
    });

    it("parses Accordion with trait usage", () => {
      const meta = parsePhpFile(advanced("Accordion.php"));
      const accordion = meta.classes.find((c) => c.name === "Accordion");
      expect(accordion).toBeDefined();
      expect(accordion!.traits).toContain("HasToggle");
      expect(accordion!.constructorParams).toHaveLength(1);
      expect(accordion!.constructorParams[0]!.name).toBe("label");
      // Trait itself is parsed
      const hasToggle = meta.classes.find((c) => c.name === "HasToggle");
      expect(hasToggle).toBeDefined();
      expect(hasToggle!.methods).toHaveLength(1);
      expect(hasToggle!.methods[0]!.name).toBe("toggle");
    });

    it("parses Sections file with two classes", () => {
      const meta = parsePhpFile(advanced("Sections.php"));
      expect(meta.classes).toHaveLength(2);
      const header = meta.classes.find((c) => c.name === "SectionHeader");
      expect(header).toBeDefined();
      expect(header!.constructorParams).toHaveLength(2);
      const footer = meta.classes.find((c) => c.name === "SectionFooter");
      expect(footer).toBeDefined();
      expect(footer!.constructorParams).toHaveLength(2);
    });

    it("parses Tooltip with Stringable return type", () => {
      const meta = parsePhpFile(advanced("Tooltip.php"));
      const tooltip = meta.classes.find((c) => c.name === "Tooltip");
      expect(tooltip).toBeDefined();
      expect(tooltip!.methods).toHaveLength(1);
      expect(tooltip!.methods[0]!.name).toBe("render");
      expect(tooltip!.methods[0]!.returnType).toBe("HtmlFragment");
    });
  });

  // -------------------------------------------------------------------------
  // UC24: Trait usage (class using trait method)
  // -------------------------------------------------------------------------
  describe("UC24: Trait usage", () => {
    it("renders Accordion using trait toggle method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Accordion.php"),
        class: "App\\Components\\Accordion",
        callable: "toggle",
        args: { label: "Show Details", content: "<p>Hidden content</p>" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("toggle");
      expect(result.html).toContain("Show Details");
      expect(result.html).toContain("Hidden content");
    });

    it("renders Accordion with open=true", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Accordion.php"),
        class: "App\\Components\\Accordion",
        callable: "toggle",
        args: { label: "FAQ", content: "<p>Answer</p>", open: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("open");
      expect(result.html).toContain("FAQ");
      expect(result.html).toContain("Answer");
    });
  });

  // -------------------------------------------------------------------------
  // UC25: Multiple classes in one file (both exported)
  // -------------------------------------------------------------------------
  describe("UC25: Multiple classes in one file", () => {
    it("renders SectionHeader", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Sections.php"),
        class: "App\\Components\\SectionHeader",
        callable: "render",
        args: { title: "Welcome" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("section-header");
      expect(result.html).toContain("Welcome");
      expect(result.html).toContain("<h1");
    });

    it("renders SectionHeader with h2 level", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Sections.php"),
        class: "App\\Components\\SectionHeader",
        callable: "render",
        args: { title: "Sub Title", level: "h2" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<h2");
      expect(result.html).toContain("Sub Title");
    });

    it("renders SectionFooter", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Sections.php"),
        class: "App\\Components\\SectionFooter",
        callable: "render",
        args: { copyright: "My Company" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("section-footer");
      expect(result.html).toContain("My Company");
      expect(result.html).toContain("2025");
    });

    it("renders SectionFooter with custom year", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Sections.php"),
        class: "App\\Components\\SectionFooter",
        callable: "render",
        args: { copyright: "Acme Inc.", year: 2024 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("2024");
      expect(result.html).toContain("Acme Inc.");
    });
  });

  // -------------------------------------------------------------------------
  // UC26: __toString / Stringable return
  // -------------------------------------------------------------------------
  describe("UC26: Stringable return", () => {
    it("renders Tooltip with __toString conversion", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Tooltip.php"),
        class: "App\\Components\\Tooltip",
        callable: "render",
        args: { text: "Helpful tip" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tooltip");
      expect(result.html).toContain("Helpful tip");
      expect(result.html).toContain("tooltip-top");
    });

    it("renders Tooltip with bottom position", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Tooltip.php"),
        class: "App\\Components\\Tooltip",
        callable: "render",
        args: { text: "More info", position: "bottom" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tooltip-bottom");
      expect(result.html).toContain("More info");
    });
  });

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // UC28: Form template (complex nested data)
  // -------------------------------------------------------------------------
  describe("UC28: Form template", () => {
    it("renders contact form with fields", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/form.php"),
        class: null,
        callable: null,
        args: {
          action: "/contact",
          method: "POST",
          submitLabel: "Send Message",
          fields: [
            { label: "Name", name: "name", type: "text", placeholder: "Your name" },
            { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<form");
      expect(result.html).toContain("/contact");
      expect(result.html).toContain("Send Message");
      expect(result.html).toContain("Name");
      expect(result.html).toContain("Email");
    });

    it("renders form with textarea field", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/form.php"),
        class: null,
        callable: null,
        args: {
          action: "/feedback",
          fields: [
            { label: "Message", name: "message", type: "textarea", placeholder: "Your message..." },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<textarea");
      expect(result.html).toContain("Message");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for new patterns
  // -------------------------------------------------------------------------
  describe("Vite plugin: new pattern virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC24: Accordion@toggle generates classMethod via trait", () => {
      const id = resolveId("./Accordion.php@toggle", advanced("Accordion.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "toggle"');
      expect(code).toContain("label:"); // ctor arg
      expect(code).toContain("content:"); // trait method arg
      expect(code).toContain("open:"); // trait method arg
    });

    it("UC25: Sections.php@render generates both SectionHeader and SectionFooter", () => {
      const id = resolveId("./Sections.php@render", advanced("Sections.php"));
      const code = load(id);
      expect(code).toContain("SectionHeader");
      expect(code).toContain("SectionFooter");
      expect(code).toContain("__type: 'classMethod'");
    });

    it("UC26: Tooltip@render generates classMethod", () => {
      const id = resolveId("./Tooltip.php@render", advanced("Tooltip.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Tooltip");
      expect(code).toContain("text:"); // ctor arg
      expect(code).toContain("position:"); // method arg
    });
  });

  // -------------------------------------------------------------------------
  // UC29: Final class (Avatar)
  // -------------------------------------------------------------------------
  describe("UC29: Final class", () => {
    it("renders Avatar with initials", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Avatar.php"),
        class: "App\\Components\\Avatar",
        callable: "render",
        args: { name: "John Doe" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("avatar");
      expect(result.html).toContain("JD");
    });

    it("renders Avatar with image URL", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Avatar.php"),
        class: "App\\Components\\Avatar",
        callable: "render",
        args: { name: "Jane", imageUrl: "https://example.com/avatar.png", size: 64 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("img");
      expect(result.html).toContain("https://example.com/avatar.png");
    });

    it("renders Avatar with custom size", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Avatar.php"),
        class: "App\\Components\\Avatar",
        callable: "render",
        args: { name: "AB", size: 32 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("32px");
    });

    it("parser detects final class", () => {
      const meta = parsePhpFile(advanced("Avatar.php"));
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.isFinal).toBe(true);
      expect(meta.classes[0]!.name).toBe("Avatar");
    });
  });

  // -------------------------------------------------------------------------
  // UC30: Abstract class with concrete subclasses (Chip)
  // -------------------------------------------------------------------------
  describe("UC30: Abstract class with concrete subclasses", () => {
    it("renders InfoChip via inherited render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Chip.php"),
        class: "App\\Components\\InfoChip",
        callable: "render",
        args: { label: "Info Tag" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("chip-info");
      expect(result.html).toContain("Info Tag");
    });

    it("renders SuccessChip with removable", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Chip.php"),
        class: "App\\Components\\SuccessChip",
        callable: "render",
        args: { label: "Approved", removable: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("chip-success");
      expect(result.html).toContain("Approved");
      expect(result.html).toContain("&times;");
    });

    it("renders DangerChip", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Chip.php"),
        class: "App\\Components\\DangerChip",
        callable: "render",
        args: { label: "Error" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("chip-danger");
    });

    it("parser detects abstract class and subclasses", () => {
      const meta = parsePhpFile(advanced("Chip.php"));
      const base = meta.classes.find((c) => c.name === "BaseChip")!;
      expect(base.isAbstract).toBe(true);

      const info = meta.classes.find((c) => c.name === "InfoChip")!;
      expect(info.extends).toBe("BaseChip");

      const danger = meta.classes.find((c) => c.name === "DangerChip")!;
      expect(danger.extends).toBe("BaseChip");
    });
  });

  // -------------------------------------------------------------------------
  // UC31: Int-backed enum (Priority)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC31: Int-backed enum", () => {
    it("renders Priority badge with int value", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Priority.php"),
        class: "App\\Components\\Priority",
        callable: "badge",
        args: { _case: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("priority-High");
      expect(result.html).toContain("High");
    });

    it("renders Priority Low", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Priority.php"),
        class: "App\\Components\\Priority",
        callable: "badge",
        args: { _case: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("priority-Low");
    });

    it("renders Priority icon method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Priority.php"),
        class: "App\\Components\\Priority",
        callable: "icon",
        args: { _case: 4 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Critical");
    });

    it("parser detects int-backed enum", () => {
      const meta = parsePhpFile(php81("Priority.php"));
      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("int");
      expect(cls.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);
      expect(cls.methods).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // UC32: Static factory methods (Button)
  // -------------------------------------------------------------------------
  describe("UC32: Static factory methods", () => {
    it("renders Button.primary() static factory", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Button.php"),
        class: "App\\Components\\Button",
        callable: "primary",
        args: { label: "Click Me" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("btn-primary");
      expect(result.html).toContain("Click Me");
    });

    it("renders Button.secondary() static factory", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Button.php"),
        class: "App\\Components\\Button",
        callable: "secondary",
        args: { label: "Cancel" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("btn-secondary");
      expect(result.html).toContain("Cancel");
    });

    it("renders Button.primary() with disabled", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Button.php"),
        class: "App\\Components\\Button",
        callable: "primary",
        args: { label: "Disabled", disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("disabled");
    });

    it("renders Button instance render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Button.php"),
        class: "App\\Components\\Button",
        callable: "render",
        args: { label: "Outline", variant: "outline" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("btn-outline");
    });
  });

  // -------------------------------------------------------------------------
  // UC33: Interface + implementing class (Stepper)
  // -------------------------------------------------------------------------
  describe("UC33: Interface implementing class", () => {
    it("renders Stepper with steps", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Stepper.php"),
        class: "App\\Components\\Stepper",
        callable: "render",
        args: { current: 2, steps: ["Cart", "Shipping", "Payment"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("stepper");
      expect(result.html).toContain("Cart");
      expect(result.html).toContain("Shipping");
      expect(result.html).toContain("Payment");
      expect(result.html).toContain("step-active");
      expect(result.html).toContain("step-inactive");
    });

    it("renders Stepper empty state", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Stepper.php"),
        class: "App\\Components\\Stepper",
        callable: "render",
        args: { steps: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("stepper-empty");
    });

    it("parser detects implements", () => {
      const meta = parsePhpFile(advanced("Stepper.php"));
      const stepper = meta.classes.find((c) => c.name === "Stepper")!;
      expect(stepper.implements).toContain("StepRenderer");
    });
  });

  // -------------------------------------------------------------------------
  // UC34: Rating with static + instance methods
  // -------------------------------------------------------------------------
  describe("UC34: Rating component", () => {
    it("renders Rating stars", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Rating.php"),
        class: "App\\Components\\Rating",
        callable: "render",
        args: { value: 3, max: 5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("rating");
      expect(result.html).toContain("(3/5)");
    });

    it("renders Rating::fromPercent()", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Rating.php"),
        class: "App\\Components\\Rating",
        callable: "fromPercent",
        args: { percent: 80 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("rating");
      expect(result.html).toContain("(4/5)");
    });
  });

  // -------------------------------------------------------------------------
  // UC35: Table template with complex array data
  // -------------------------------------------------------------------------
  describe("UC35: Table template", () => {
    it("renders table with headers and rows", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/table.php"),
        class: null,
        callable: null,
        args: {
          caption: "Users",
          headers: ["Name", "Email"],
          rows: [
            ["Alice", "alice@test.com"],
            ["Bob", "bob@test.com"],
          ],
          striped: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Users");
      expect(result.html).toContain("Alice");
      expect(result.html).toContain("bob@test.com");
      expect(result.html).toContain("<th");
      expect(result.html).toContain("<td");
    });

    it("renders striped table", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/table.php"),
        class: null,
        callable: null,
        args: {
          caption: "Items",
          headers: ["ID", "Name"],
          rows: [
            [1, "A"],
            [2, "B"],
            [3, "C"],
          ],
          striped: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Items");
      expect(result.html).toContain("#f9fafb");
    });

    it("renders empty table", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/table.php"),
        class: null,
        callable: null,
        args: {
          headers: ["Col"],
          rows: [],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<table");
      expect(result.html).toContain("Col");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: new example virtual modules
  // -------------------------------------------------------------------------
  describe("Vite plugin: expanded example virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC29: Avatar@render generates classMethod for final class", () => {
      const id = resolveId("./Avatar.php@render", advanced("Avatar.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Avatar");
      expect(code).toContain("name:");
      expect(code).toContain("size:");
      expect(code).toContain("imageUrl:");
    });

    it("UC30: Chip@render generates classMethod for all concrete subclasses", () => {
      const id = resolveId("./Chip.php@render", advanced("Chip.php"));
      const code = load(id);
      // Should export InfoChip, SuccessChip, DangerChip (all inherit render from BaseChip)
      expect(code).toContain("InfoChip");
      expect(code).toContain("SuccessChip");
      expect(code).toContain("DangerChip");
      expect(code).toContain("__type: 'classMethod'");
    });

    it("UC31: Priority@badge generates enumMethod for int-backed enum", () => {
      const id = resolveId("./Priority.php@badge", php81("Priority.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("Priority");
      expect(code).toContain("_case:");
    });

    it("UC32: Button@primary generates staticMethod", () => {
      const id = resolveId("./Button.php@primary", basic("Button.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("disabled:");
    });

    it("UC32: Button@render generates classMethod", () => {
      const id = resolveId("./Button.php@render", basic("Button.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("variant:");
    });

    it("UC33: Stepper@render generates classMethod for interface implementor", () => {
      const id = resolveId("./Stepper.php@render", advanced("Stepper.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Stepper");
      expect(code).toContain("current:");
      expect(code).toContain("steps:");
    });

    it("UC34: Rating@fromPercent generates staticMethod", () => {
      const id = resolveId("./Rating.php@fromPercent", advanced("Rating.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("percent:");
    });
  });

  // -------------------------------------------------------------------------
  // UC36: Multi-trait usage (Modal with two traits)
  // -------------------------------------------------------------------------
  describe("UC36: Multi-trait usage", () => {
    it("renders Modal via instance render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Modal.php"),
        class: "App\\Components\\Modal",
        callable: "render",
        args: { title: "Confirm", body: "Are you sure?", size: "lg" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("modal-lg");
      expect(result.html).toContain("Confirm");
      expect(result.html).toContain("Are you sure?");
    });

    it("renders Modal with default body", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Modal.php"),
        class: "App\\Components\\Modal",
        callable: "render",
        args: { title: "Empty Modal" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("modal-md");
      expect(result.html).toContain("Empty Modal");
    });

    it("calls trait method animate() on Modal", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Modal.php"),
        class: "App\\Components\\Modal",
        callable: "animate",
        args: { title: "Test", content: "<p>Animated</p>", effect: "slide", duration: 500 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("animation-slide");
      expect(result.html).toContain("500ms");
      expect(result.html).toContain("Animated");
    });

    it("calls trait method overlay() on Modal", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Modal.php"),
        class: "App\\Components\\Modal",
        callable: "overlay",
        args: { title: "Test", content: "<div>Overlay content</div>", opacity: "0.8" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("overlay");
      expect(result.html).toContain("0.8");
      expect(result.html).toContain("Overlay content");
    });

    it("parser detects multiple traits", () => {
      const meta = parsePhpFile(advanced("Modal.php"));
      const modal = meta.classes.find((c) => c.name === "Modal")!;
      expect(modal.traits).toEqual(["HasAnimation", "HasOverlay"]);
    });
  });

  // -------------------------------------------------------------------------
  // UC37: Class with constants and mixed type (Notification)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC37: Class with constants and mixed type", () => {
    it("renders Notification with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("Notification.php"),
        class: "App\\Components\\Notification",
        callable: "render",
        args: { message: "File saved successfully" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("notification-info");
      expect(result.html).toContain("File saved successfully");
      expect(result.html).toContain('data-timeout="5000"');
    });

    it("renders Notification with explicit type and metadata", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("Notification.php"),
        class: "App\\Components\\Notification",
        callable: "render",
        args: { message: "Disk full", type: "error", metadata: "disk-usage-95", timeout: 10000 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("notification-error");
      expect(result.html).toContain("Disk full");
      expect(result.html).toContain('data-meta="disk-usage-95"');
      expect(result.html).toContain('data-timeout="10000"');
    });

    it("renders Notification with warning type", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("Notification.php"),
        class: "App\\Components\\Notification",
        callable: "render",
        args: { message: "Low battery", type: "warning" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("notification-warning");
    });

    it("parser handles self::CONSTANT defaults", () => {
      const meta = parsePhpFile(php82("Notification.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Notification");
      const typeParam = cls.constructorParams.find((p) => p.name === "type")!;
      expect(typeParam.default).toBe("self::TYPE_INFO");
      const metaParam = cls.constructorParams.find((p) => p.name === "metadata")!;
      expect(metaParam.type).toBe("mixed");
    });
  });

  // -------------------------------------------------------------------------
  // UC38: Static + instance methods (Pagination)
  // -------------------------------------------------------------------------
  describe("UC38: Pagination with static and instance methods", () => {
    it("renders paginated list via instance render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Pagination.php"),
        class: "App\\Components\\Pagination",
        callable: "render",
        args: { total: 50, perPage: 10, current: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pagination");
      expect(result.html).toContain("Page 3 of 5");
      expect(result.html).toContain("page-active");
    });

    it("renders first page with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Pagination.php"),
        class: "App\\Components\\Pagination",
        callable: "render",
        args: { total: 25 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Page 1 of 3");
    });

    it("renders simple static pagination", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Pagination.php"),
        class: "App\\Components\\Pagination",
        callable: "simple",
        args: { total: 100, current: 5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pagination-simple");
      expect(result.html).toContain("page-prev");
      expect(result.html).toContain("page-next");
    });

    it("renders simple pagination first page (no prev)", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Pagination.php"),
        class: "App\\Components\\Pagination",
        callable: "simple",
        args: { total: 30, current: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pagination-simple");
      expect(result.html).not.toContain("page-prev");
      expect(result.html).toContain("page-next");
    });
  });

  // -------------------------------------------------------------------------
  // UC39: TagCloud (array of objects/strings, method params)
  // -------------------------------------------------------------------------
  describe("UC39: TagCloud component", () => {
    it("renders simple string tags", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TagCloud.php"),
        class: "App\\Components\\TagCloud",
        callable: "render",
        args: { tags: ["PHP", "TypeScript", "Storybook"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tag-cloud");
      expect(result.html).toContain("PHP");
      expect(result.html).toContain("TypeScript");
      expect(result.html).toContain("Storybook");
      expect(result.html).toContain("tag-weight-1");
    });

    it("renders weighted tags", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TagCloud.php"),
        class: "App\\Components\\TagCloud",
        callable: "render",
        args: {
          tags: [
            { label: "Popular", weight: 5 },
            { label: "New", weight: 2 },
          ],
          baseSize: "12",
          maxWeight: 5,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tag-weight-5");
      expect(result.html).toContain("tag-weight-2");
      expect(result.html).toContain("Popular");
      expect(result.html).toContain("New");
    });

    it("renders empty tag cloud", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TagCloud.php"),
        class: "App\\Components\\TagCloud",
        callable: "render",
        args: { tags: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tag-cloud-empty");
    });
  });

  // -------------------------------------------------------------------------
  // UC40: Dashboard template (nested data, conditionals)
  // -------------------------------------------------------------------------
  describe("UC40: Dashboard template", () => {
    it("renders dashboard with stats", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: {
          title: "Analytics",
          stats: [
            { label: "Users", value: "1,234", change: 12 },
            { label: "Revenue", value: "$56K", change: -3 },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dashboard");
      expect(result.html).toContain("Analytics");
      expect(result.html).toContain("Users");
      expect(result.html).toContain("1,234");
      expect(result.html).toContain("+12%");
      expect(result.html).toContain("positive");
      expect(result.html).toContain("-3%");
      expect(result.html).toContain("negative");
    });

    it("renders empty dashboard", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: { title: "Empty Dashboard" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Empty Dashboard");
      expect(result.html).toContain("dashboard-empty");
    });

    it("renders dashboard with chart", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: {
          title: "Chart View",
          stats: [{ label: "Visits", value: "500" }],
          showChart: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dashboard-chart");
      expect(result.html).toContain("Chart placeholder");
      expect(result.html).toContain("Visits");
    });

    it("renders dashboard with default title", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("dashboard-empty");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: new pattern virtual modules (UC36-UC40)
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC36-UC40 virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC36: Modal@render generates classMethod", () => {
      const id = resolveId("./Modal.php@render", advanced("Modal.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Modal");
      expect(code).toContain("title:");
      expect(code).toContain("body:");
      expect(code).toContain("size:");
    });

    it("UC36: Modal@animate generates classMethod via trait", () => {
      const id = resolveId("./Modal.php@animate", advanced("Modal.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Modal");
      expect(code).toContain("content:");
      expect(code).toContain("effect:");
      expect(code).toContain("duration:");
    });

    it("UC36: Modal@overlay generates classMethod via second trait", () => {
      const id = resolveId("./Modal.php@overlay", advanced("Modal.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Modal");
      expect(code).toContain("content:");
      expect(code).toContain("opacity:");
    });

    it("UC37: Notification@render generates classMethod", () => {
      const id = resolveId("./Notification.php@render", php82("Notification.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("message:");
      expect(code).toContain("type:");
      expect(code).toContain("metadata:");
      expect(code).toContain("timeout:");
    });

    it("UC38: Pagination@render generates classMethod", () => {
      const id = resolveId("./Pagination.php@render", advanced("Pagination.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("total:");
      expect(code).toContain("perPage:");
      expect(code).toContain("current:");
    });

    it("UC38: Pagination@simple generates staticMethod", () => {
      const id = resolveId("./Pagination.php@simple", advanced("Pagination.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("total:");
      expect(code).toContain("current:");
    });

    it("UC39: TagCloud@render generates classMethod", () => {
      const id = resolveId("./TagCloud.php@render", advanced("TagCloud.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("tags:");
      expect(code).toContain("baseSize:");
      expect(code).toContain("maxWeight:");
      expect(code).toContain("unit:");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: metadata extraction for new patterns
  // -------------------------------------------------------------------------
  describe("Parser: new pattern metadata", () => {
    it("parses Modal with multiple traits", () => {
      const meta = parsePhpFile(advanced("Modal.php"));
      const modal = meta.classes.find((c) => c.name === "Modal")!;
      expect(modal).toBeDefined();
      expect(modal.traits).toEqual(["HasAnimation", "HasOverlay"]);
      // Two traits also parsed
      const anim = meta.classes.find((c) => c.name === "HasAnimation")!;
      expect(anim.methods[0]!.name).toBe("animate");
      const overlay = meta.classes.find((c) => c.name === "HasOverlay")!;
      expect(overlay.methods[0]!.name).toBe("overlay");
    });

    it("parses Notification with constant defaults and mixed type", () => {
      const meta = parsePhpFile(php82("Notification.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Notification");
      expect(cls.constructorParams).toHaveLength(4);
      expect(cls.constructorParams[1]!.default).toBe("self::TYPE_INFO");
      expect(cls.constructorParams[2]!.type).toBe("mixed");
    });

    it("parses Pagination with static and instance methods", () => {
      const meta = parsePhpFile(advanced("Pagination.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Pagination");
      expect(cls.constructorParams).toHaveLength(3);
      const simple = cls.methods.find((m) => m.name === "simple")!;
      expect(simple.isStatic).toBe(true);
      expect(simple.params[0]!.name).toBe("total");
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);
    });

    it("parses TagCloud with array constructor and method params", () => {
      const meta = parsePhpFile(advanced("TagCloud.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("TagCloud");
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe("tags");
      expect(cls.constructorParams[0]!.type).toBe("array");
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(2);
      expect(render.params[0]!.name).toBe("maxWeight");
      expect(render.params[0]!.type).toBe("int");
      expect(render.params[1]!.name).toBe("unit");
    });
  });

  // -------------------------------------------------------------------------
  // UC41: Readonly properties without visibility (ValueCard)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC41: Readonly properties without visibility", () => {
    it("renders ValueCard with label and value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ValueCard.php"),
        class: "App\\Components\\ValueCard",
        callable: "render",
        args: { label: "Temperature", value: "23.5", unit: "°C" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("value-card");
      expect(result.html).toContain("Temperature");
      expect(result.html).toContain("23.5");
      expect(result.html).toContain("°C");
    });

    it("renders ValueCard with up trend", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ValueCard.php"),
        class: "App\\Components\\ValueCard",
        callable: "render",
        args: { label: "Revenue", value: "$12,345", trend: "+12%" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("trend-up");
      expect(result.html).toContain("+12%");
    });

    it("renders ValueCard with down trend", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ValueCard.php"),
        class: "App\\Components\\ValueCard",
        callable: "render",
        args: { label: "Errors", value: "42", trend: "-8%" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("trend-down");
      expect(result.html).toContain("-8%");
    });

    it("parser detects readonly without visibility as promoted", () => {
      const meta = parsePhpFile(advanced("ValueCard.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ValueCard");
      expect(cls.constructorParams).toHaveLength(4);
      const label = cls.constructorParams.find((p) => p.name === "label")!;
      expect(label.isPromoted).toBe(true);
      expect(label.type).toBe("string");
      const trend = cls.constructorParams.find((p) => p.name === "trend")!;
      expect(trend.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC42: Iterable/mixed type params (DataRenderer)
  // -------------------------------------------------------------------------
  describe("UC42: Iterable and mixed type params", () => {
    it("renders DataRenderer with string items", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DataRenderer.php"),
        class: "App\\Components\\DataRenderer",
        callable: "render",
        args: { items: ["Alpha", "Bravo", "Charlie"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("data-renderer");
      expect(result.html).toContain("Alpha");
      expect(result.html).toContain("Bravo");
      expect(result.html).toContain("Charlie");
    });

    it("renders with uppercase transform", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DataRenderer.php"),
        class: "App\\Components\\DataRenderer",
        callable: "render",
        args: { items: ["hello", "world"], transform: "upper" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("HELLO");
      expect(result.html).toContain("WORLD");
    });

    it("renders empty state", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DataRenderer.php"),
        class: "App\\Components\\DataRenderer",
        callable: "render",
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("data-empty");
    });

    it("renders with custom wrapper", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DataRenderer.php"),
        class: "App\\Components\\DataRenderer",
        callable: "render",
        args: { items: ["Item"], wrapper: "section" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<section");
      expect(result.html).toContain("</section>");
    });

    it("parser detects iterable and mixed types", () => {
      const meta = parsePhpFile(advanced("DataRenderer.php"));
      const cls = meta.classes[0]!;
      const items = cls.constructorParams.find((p) => p.name === "items")!;
      expect(items.type).toBe("iterable");
      const render = cls.methods.find((m) => m.name === "render")!;
      const transform = render.params.find((p) => p.name === "transform")!;
      expect(transform.type).toBe("mixed");
    });
  });

  // -------------------------------------------------------------------------
  // UC43: Enum with match expression and multiple methods (Visibility)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC43: Enum with match expression", () => {
    it("renders Visibility::badge for public", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Visibility.php"),
        class: "App\\Components\\Visibility",
        callable: "badge",
        args: { _case: "public" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("visibility-badge");
      expect(result.html).toContain("visibility-public");
      expect(result.html).toContain("#22c55e");
    });

    it("renders Visibility::badge for private", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Visibility.php"),
        class: "App\\Components\\Visibility",
        callable: "badge",
        args: { _case: "private" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("visibility-private");
      expect(result.html).toContain("#ef4444");
    });

    it("renders Visibility::description", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Visibility.php"),
        class: "App\\Components\\Visibility",
        callable: "description",
        args: { _case: "unlisted" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("visibility-desc");
      expect(result.html).toContain("Accessible via direct link");
    });

    it("parser detects Visibility enum with all cases and methods", () => {
      const meta = parsePhpFile(php81("Visibility.php"));
      const vis = meta.classes.find((c) => c.name === "Visibility")!;
      expect(vis.isEnum).toBe(true);
      expect(vis.enumBackingType).toBe("string");
      expect(vis.enumCases).toEqual(["Public", "Private", "Unlisted", "Draft"]);
      expect(vis.methods).toHaveLength(2);
      expect(vis.methods.map((m) => m.name).sort()).toEqual(["badge", "description"]);
    });
  });

  // -------------------------------------------------------------------------
  // UC44: Array return with 'html' key (Timeline)
  // -------------------------------------------------------------------------
  describe("UC44: Array return with html key", () => {
    it("renders Timeline with events", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Timeline.php"),
        class: "App\\Components\\Timeline",
        callable: "render",
        args: {
          events: [
            { date: "2024-01", title: "Start", description: "Project started" },
            { date: "2024-06", title: "Launch", description: "Public launch" },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("timeline");
      expect(result.html).toContain("timeline-left");
      expect(result.html).toContain("timeline-right");
      expect(result.html).toContain("Start");
      expect(result.html).toContain("Launch");
      expect(result.html).toContain("2024-01");
    });

    it("renders empty Timeline", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Timeline.php"),
        class: "App\\Components\\Timeline",
        callable: "render",
        args: { events: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("timeline-empty");
    });

    it("renders reversed Timeline", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Timeline.php"),
        class: "App\\Components\\Timeline",
        callable: "render",
        args: {
          events: [{ title: "First" }, { title: "Second" }],
          reversed: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("timeline");
      expect(result.html).toContain("Second");
      expect(result.html).toContain("First");
    });
  });

  // -------------------------------------------------------------------------
  // UC45: Echo/void return (EchoLayout)
  // -------------------------------------------------------------------------
  describe("UC45: Echo-based void return", () => {
    it("renders EchoLayout with light theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("EchoLayout.php"),
        class: "App\\Components\\EchoLayout",
        callable: "render",
        args: { title: "My App" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-layout");
      expect(result.html).toContain("echo-layout-light");
      expect(result.html).toContain("My App");
    });

    it("renders EchoLayout with dark theme and footer", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("EchoLayout.php"),
        class: "App\\Components\\EchoLayout",
        callable: "render",
        args: { title: "Dark Mode", theme: "dark", footer: "© 2025" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-layout-dark");
      expect(result.html).toContain("echo-layout-footer");
      expect(result.html).toContain("© 2025");
    });

    it("renders EchoLayout without footer", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("EchoLayout.php"),
        class: "App\\Components\\EchoLayout",
        callable: "render",
        args: { title: "No Footer" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).not.toContain("echo-layout-footer");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for new examples
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC41-UC45 virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC41: ValueCard@render generates classMethod with readonly params", () => {
      const id = resolveId("./ValueCard.php@render", advanced("ValueCard.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("ValueCard");
      expect(code).toContain("label:");
      expect(code).toContain("value:");
      expect(code).toContain("unit:");
      expect(code).toContain("trend:");
    });

    it("UC42: DataRenderer@render generates classMethod with iterable/mixed", () => {
      const id = resolveId("./DataRenderer.php@render", advanced("DataRenderer.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("items:");
      expect(code).toContain("wrapper:");
      expect(code).toContain("transform:");
    });

    it("UC43: Visibility@badge generates enumMethod", () => {
      const id = resolveId("./Visibility.php@badge", php81("Visibility.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
    });

    it("UC43: Visibility@description generates enumMethod", () => {
      const id = resolveId("./Visibility.php@description", php81("Visibility.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
    });

    it("UC44: Timeline@render generates classMethod", () => {
      const id = resolveId("./Timeline.php@render", advanced("Timeline.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("events:");
      expect(code).toContain("reversed:");
    });

    it("UC45: EchoLayout@render generates classMethod", () => {
      const id = resolveId("./EchoLayout.php@render", advanced("EchoLayout.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("title:");
      expect(code).toContain("theme:");
      expect(code).toContain("footer:");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: metadata extraction for new examples
  // -------------------------------------------------------------------------
  describe("Parser: new example metadata", () => {
    it("parses ValueCard with readonly no-visibility params", () => {
      const meta = parsePhpFile(advanced("ValueCard.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ValueCard");
      expect(cls.constructorParams).toHaveLength(4);
      const label = cls.constructorParams[0]!;
      expect(label.name).toBe("label");
      expect(label.isPromoted).toBe(true);
      expect(label.type).toBe("string");
      const trend = cls.constructorParams[3]!;
      expect(trend.name).toBe("trend");
      expect(trend.nullable).toBe(true);
    });

    it("parses DataRenderer with iterable and mixed types", () => {
      const meta = parsePhpFile(advanced("DataRenderer.php"));
      const cls = meta.classes[0]!;
      expect(cls.constructorParams[0]!.type).toBe("iterable");
      const render = cls.methods[0]!;
      expect(render.params[0]!.type).toBe("mixed");
    });

    it("parses Visibility enum with multiple methods", () => {
      const meta = parsePhpFile(php81("Visibility.php"));
      const vis = meta.classes[0]!;
      expect(vis.isEnum).toBe(true);
      expect(vis.enumBackingType).toBe("string");
      expect(vis.enumCases).toHaveLength(4);
      expect(vis.methods).toHaveLength(2);
    });

    it("parses Timeline with array return type", () => {
      const meta = parsePhpFile(advanced("Timeline.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Timeline");
      const render = cls.methods[0]!;
      expect(render.returnType).toBe("array");
    });

    it("parses EchoLayout with void return type", () => {
      const meta = parsePhpFile(advanced("EchoLayout.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("EchoLayout");
      const render = cls.methods[0]!;
      expect(render.returnType).toBe("void");
      expect(cls.constructorParams).toHaveLength(3);
      const footer = cls.constructorParams[2]!;
      expect(footer.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC46: Float parameter + static factory (Temperature)
  // -------------------------------------------------------------------------
  describe("UC46: Float parameter + static factory", () => {
    it("renders Temperature with float value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Temperature.php"),
        class: "App\\Components\\Temperature",
        callable: "render",
        args: { value: 22.5, unit: "C" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("22.5");
      expect(result.html).toContain("temperature");
    });

    it("renders Temperature below zero with blue color", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Temperature.php"),
        class: "App\\Components\\Temperature",
        callable: "render",
        args: { value: -5.0, unit: "C" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("-5.0");
      expect(result.html).toContain("#3b82f6");
    });

    it("renders Temperature via static fromFahrenheit", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Temperature.php"),
        class: "App\\Components\\Temperature",
        callable: "fromFahrenheit",
        args: { degrees: 212 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("100.0");
      expect(result.html).toContain("temperature");
    });

    it("renders Temperature via static fromCelsius", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Temperature.php"),
        class: "App\\Components\\Temperature",
        callable: "fromCelsius",
        args: { degrees: 38.0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("38.0");
      expect(result.html).toContain("#ef4444");
    });
  });

  // -------------------------------------------------------------------------
  // UC47: Multiple render methods from same class (MediaCard)
  // -------------------------------------------------------------------------
  describe("UC47: Multiple render methods", () => {
    it("renders MediaCard full view", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MediaCard.php"),
        class: "App\\Components\\MediaCard",
        callable: "full",
        args: { title: "Test Article", description: "Some description", category: "tech" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("media-card-full");
      expect(result.html).toContain("Test Article");
      expect(result.html).toContain("Some description");
      expect(result.html).toContain("tech");
    });

    it("renders MediaCard compact view", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MediaCard.php"),
        class: "App\\Components\\MediaCard",
        callable: "compact",
        args: { title: "Quick Update", category: "news" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("media-card-compact");
      expect(result.html).toContain("Quick Update");
      expect(result.html).toContain("news");
    });

    it("renders MediaCard header view", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MediaCard.php"),
        class: "App\\Components\\MediaCard",
        callable: "header",
        args: { title: "Featured" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("media-card-header");
      expect(result.html).toContain("Featured");
      expect(result.html).toContain("<h2");
    });
  });

  // -------------------------------------------------------------------------
  // UC48: Template with conditionals (hero)
  // -------------------------------------------------------------------------
  describe("UC48: Template with conditionals", () => {
    it("renders hero template with light theme", async () => {
      const result = await executor.execute({
        type: "template",
        file: basic("templates/hero.php"),
        class: null,
        callable: null,
        args: { title: "Welcome", subtitle: "Get Started", ctaLabel: "Learn More", theme: "light" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("hero-light");
      expect(result.html).toContain("Welcome");
      expect(result.html).toContain("Get Started");
      expect(result.html).toContain("Learn More");
    });

    it("renders hero template with dark theme", async () => {
      const result = await executor.execute({
        type: "template",
        file: basic("templates/hero.php"),
        class: null,
        callable: null,
        args: { title: "Dark Hero", theme: "dark" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("hero-dark");
      expect(result.html).toContain("#1f2937");
    });

    it("renders hero template with gradient theme", async () => {
      const result = await executor.execute({
        type: "template",
        file: basic("templates/hero.php"),
        class: null,
        callable: null,
        args: { title: "Gradient", theme: "gradient" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("hero-gradient");
      expect(result.html).toContain("linear-gradient");
    });

    it("renders hero without optional elements", async () => {
      const result = await executor.execute({
        type: "template",
        file: basic("templates/hero.php"),
        class: null,
        callable: null,
        args: { title: "Minimal" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Minimal");
      expect(result.html).not.toContain("hero-cta");
    });
  });

  // -------------------------------------------------------------------------
  // UC49: Stats template with grid and conditionals
  // -------------------------------------------------------------------------
  describe("UC49: Stats template", () => {
    it("renders stats grid with items", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/stats.php"),
        class: null,
        callable: null,
        args: {
          items: [
            { label: "Users", value: "12,345" },
            { label: "Revenue", value: "$89K" },
          ],
          columns: 2,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("stats-grid");
      expect(result.html).toContain("12,345");
      expect(result.html).toContain("$89K");
    });

    it("renders colored variant with icons", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/stats.php"),
        class: null,
        callable: null,
        args: {
          items: [{ label: "Downloads", value: "1M", icon: "📦" }],
          columns: 1,
          variant: "colored",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("stats-colored");
      expect(result.html).toContain("stat-icon");
    });

    it("renders empty stats", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/stats.php"),
        class: null,
        callable: null,
        args: { items: [], columns: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("stats-empty");
    });
  });

  // -------------------------------------------------------------------------
  // UC50: Unit enum with multiple methods (HttpMethod)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC50: Unit enum with multiple methods", () => {
    it("renders HttpMethod::badge for GET", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("HttpMethod.php"),
        class: "App\\Components\\HttpMethod",
        callable: "badge",
        args: { _case: "GET" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("http-method-GET");
      expect(result.html).toContain("#22c55e");
      expect(result.html).toContain("GET");
    });

    it("renders HttpMethod::badge for DELETE", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("HttpMethod.php"),
        class: "App\\Components\\HttpMethod",
        callable: "badge",
        args: { _case: "DELETE" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("http-method-DELETE");
      expect(result.html).toContain("#ef4444");
    });

    it("renders HttpMethod::endpoint with path and description", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("HttpMethod.php"),
        class: "App\\Components\\HttpMethod",
        callable: "endpoint",
        args: { _case: "POST", path: "/api/users", description: "Create user" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("endpoint");
      expect(result.html).toContain("/api/users");
      expect(result.html).toContain("Create user");
      expect(result.html).toContain("POST");
    });

    it("renders HttpMethod::endpoint without description", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("HttpMethod.php"),
        class: "App\\Components\\HttpMethod",
        callable: "endpoint",
        args: { _case: "GET", path: "/api/health" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("/api/health");
      expect(result.html).not.toContain("endpoint-desc");
    });
  });

  // -------------------------------------------------------------------------
  // UC51: Generator return (Tabs)
  // -------------------------------------------------------------------------
  describe("UC51: Generator return with complex iteration", () => {
    it("renders Tabs with active tab", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Tabs.php"),
        class: "App\\Components\\Tabs",
        callable: "render",
        args: {
          tabs: [
            { label: "Overview", content: "<p>Overview</p>" },
            { label: "Details", content: "<p>Details</p>" },
          ],
          activeIndex: 0,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tabs-nav");
      expect(result.html).toContain("tab-active");
      expect(result.html).toContain("Overview");
      expect(result.html).toContain("tab-panel");
    });

    it("renders Tabs with second tab active", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Tabs.php"),
        class: "App\\Components\\Tabs",
        callable: "render",
        args: {
          tabs: [
            { label: "Code", content: "<pre>code</pre>" },
            { label: "Preview", content: "<p>preview</p>" },
          ],
          activeIndex: 1,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Preview");
    });

    it("renders empty Tabs", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Tabs.php"),
        class: "App\\Components\\Tabs",
        callable: "render",
        args: { tabs: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("tabs-empty");
    });
  });

  // -------------------------------------------------------------------------
  // UC52: Invocable class with enum param (Divider)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC52: Invocable class with enum param", () => {
    it("renders Divider with solid style", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("Divider.php"),
        class: "App\\Components\\Divider",
        callable: "__invoke",
        args: { style: "solid" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("divider");
      expect(result.html).toContain("solid");
    });

    it("renders Divider with dashed style and custom color", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("Divider.php"),
        class: "App\\Components\\Divider",
        callable: "__invoke",
        args: { style: "dashed", color: "#3b82f6" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dashed");
      expect(result.html).toContain("#3b82f6");
    });

    it("renders Divider with label", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("Divider.php"),
        class: "App\\Components\\Divider",
        callable: "__invoke",
        args: { label: "OR", style: "solid" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("divider-labeled");
      expect(result.html).toContain("OR");
    });
  });

  // -------------------------------------------------------------------------
  // UC53: Void return countdown (echo-based with loop)
  // -------------------------------------------------------------------------
  describe("UC53: Void return countdown", () => {
    it("renders Countdown from 10", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Countdown.php"),
        class: "App\\Components\\Countdown",
        callable: "render",
        args: { from: 5, finishMessage: "Go!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("countdown");
      expect(result.html).toContain("countdown-num");
      expect(result.html).toContain("countdown-finish");
      expect(result.html).toContain("Go!");
    });

    it("renders Countdown without zero", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Countdown.php"),
        class: "App\\Components\\Countdown",
        callable: "render",
        args: { from: 3, showZero: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("countdown-num");
    });
  });

  // -------------------------------------------------------------------------
  // UC54: Global function with array param (KeyValue)
  // -------------------------------------------------------------------------
  describe("UC54: Global function with array param", () => {
    it("renders key-value list", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("KeyValue.php"),
        class: null,
        callable: "keyValueList",
        args: { items: { Name: "John", Email: "john@example.com" } },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("kv-list");
      expect(result.html).toContain("John");
      expect(result.html).toContain("john@example.com");
      expect(result.html).toContain("<dl");
    });

    it("renders horizontal key-value list", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("KeyValue.php"),
        class: null,
        callable: "keyValueList",
        args: { items: { Status: "Active" }, horizontal: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("flex");
    });

    it("renders empty key-value list", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("KeyValue.php"),
        class: null,
        callable: "keyValueList",
        args: { items: {}, emptyMessage: "Nothing here" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("kv-empty");
      expect(result.html).toContain("Nothing here");
    });
  });

  // -------------------------------------------------------------------------
  // UC55: Class with self-return methods (FlexGrid)
  // -------------------------------------------------------------------------
  describe("UC55: Class with method params", () => {
    it("renders FlexGrid with items", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexGrid.php"),
        class: "App\\Components\\FlexGrid",
        callable: "render",
        args: { id: "test-grid", items: ["A", "B", "C"], columns: 3, gap: "16px" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("flex-grid");
      expect(result.html).toContain("test-grid");
      expect(result.html).toContain("flex-grid-item");
    });

    it("renders empty FlexGrid", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexGrid.php"),
        class: "App\\Components\\FlexGrid",
        callable: "render",
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("flex-grid-empty");
    });

    it("renders FlexGrid with two columns", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexGrid.php"),
        class: "App\\Components\\FlexGrid",
        callable: "render",
        args: { id: "two", items: ["X", "Y"], columns: 2 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("repeat(2, 1fr)");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for UC46-UC55
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC46-UC55 virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC46: Temperature@render generates classMethod with float param", () => {
      const id = resolveId("./Temperature.php@render", advanced("Temperature.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("value:");
      expect(code).toContain("unit:");
    });

    it("UC46: Temperature@fromFahrenheit generates staticMethod", () => {
      const id = resolveId("./Temperature.php@fromFahrenheit", advanced("Temperature.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("degrees:");
    });

    it("UC47: MediaCard@full generates classMethod", () => {
      const id = resolveId("./MediaCard.php@full", advanced("MediaCard.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("title:");
      expect(code).toContain("description:");
      expect(code).toContain("category:");
    });

    it("UC47: MediaCard@compact generates classMethod", () => {
      const id = resolveId("./MediaCard.php@compact", advanced("MediaCard.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "compact"');
    });

    it("UC47: MediaCard@header generates classMethod", () => {
      const id = resolveId("./MediaCard.php@header", advanced("MediaCard.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "header"');
    });

    it("UC50: HttpMethod@badge generates enumMethod for unit enum", () => {
      const id = resolveId("./HttpMethod.php@badge", php81("HttpMethod.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
    });

    it("UC50: HttpMethod@endpoint generates enumMethod with params", () => {
      const id = resolveId("./HttpMethod.php@endpoint", php81("HttpMethod.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
      expect(code).toContain("path:");
      expect(code).toContain("description:");
    });

    it("UC51: Tabs@render generates classMethod", () => {
      const id = resolveId("./Tabs.php@render", advanced("Tabs.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("tabs:");
      expect(code).toContain("activeIndex:");
    });

    it("UC52: Divider@__invoke generates classMethod", () => {
      const id = resolveId("./Divider.php@__invoke", php81("Divider.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "__invoke"');
      expect(code).toContain("style:");
      expect(code).toContain("label:");
    });

    it("UC54: KeyValue@keyValueList generates function", () => {
      const id = resolveId("./KeyValue.php@keyValueList", advanced("KeyValue.php"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("items:");
      expect(code).toContain("horizontal:");
    });

    it("UC55: FlexGrid@render generates classMethod", () => {
      const id = resolveId("./FlexGrid.php@render", advanced("FlexGrid.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("items:");
      expect(code).toContain("columns:");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: metadata extraction for UC46-UC55
  // -------------------------------------------------------------------------
  describe("Parser: UC46-UC55 metadata", () => {
    it("parses Temperature with float param and static methods", () => {
      const meta = parsePhpFile(advanced("Temperature.php"));
      const cls = meta.classes.find((c) => c.name === "Temperature");
      expect(cls).toBeDefined();
      const value = cls!.constructorParams.find((p) => p.name === "value");
      expect(value).toBeDefined();
      expect(value!.type).toBe("float");
      const staticMethods = cls!.methods.filter((m) => m.isStatic);
      expect(staticMethods).toHaveLength(2);
      expect(staticMethods.map((m) => m.name)).toContain("fromFahrenheit");
      expect(staticMethods.map((m) => m.name)).toContain("fromCelsius");
    });

    it("parses MediaCard with three render methods", () => {
      const meta = parsePhpFile(advanced("MediaCard.php"));
      const cls = meta.classes.find((c) => c.name === "MediaCard");
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(4);
      const methodNames = cls!.methods.map((m) => m.name);
      expect(methodNames).toContain("compact");
      expect(methodNames).toContain("full");
      expect(methodNames).toContain("header");
    });

    it("parses HttpMethod as unit enum with multiple methods", () => {
      const meta = parsePhpFile(php81("HttpMethod.php"));
      const cls = meta.classes.find((c) => c.name === "HttpMethod");
      expect(cls).toBeDefined();
      expect(cls!.isEnum).toBe(true);
      expect(cls!.enumBackingType).toBeNull();
      expect(cls!.enumCases).toHaveLength(5);
      expect(cls!.enumCases).toContain("GET");
      expect(cls!.enumCases).toContain("DELETE");
      expect(cls!.methods).toHaveLength(2);
      const endpoint = cls!.methods.find((m) => m.name === "endpoint");
      expect(endpoint).toBeDefined();
      expect(endpoint!.params).toHaveLength(2);
    });

    it("parses Tabs with Generator return type", () => {
      const meta = parsePhpFile(advanced("Tabs.php"));
      const cls = meta.classes.find((c) => c.name === "Tabs");
      expect(cls).toBeDefined();
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.returnType).toContain("Generator");
    });

    it("parses Divider class and DividerStyle enum", () => {
      const meta = parsePhpFile(php81("Divider.php"));
      const divEnum = meta.classes.find((c) => c.name === "DividerStyle");
      expect(divEnum).toBeDefined();
      expect(divEnum!.isEnum).toBe(true);
      expect(divEnum!.enumBackingType).toBe("string");
      expect(divEnum!.enumCases).toHaveLength(4);
      const divider = meta.classes.find((c) => c.name === "Divider");
      expect(divider).toBeDefined();
      const invoke = divider!.methods.find((m) => m.name === "__invoke");
      expect(invoke).toBeDefined();
    });

    it("parses Countdown with void return and int params", () => {
      const meta = parsePhpFile(advanced("Countdown.php"));
      const cls = meta.classes.find((c) => c.name === "Countdown");
      expect(cls).toBeDefined();
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render!.returnType).toBe("void");
      const from = cls!.constructorParams.find((p) => p.name === "from");
      expect(from!.type).toBe("int");
    });

    it("parses keyValueList global function", () => {
      const meta = parsePhpFile(advanced("KeyValue.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("keyValueList");
      expect(fn.params).toHaveLength(3);
      expect(fn.params[0]!.type).toBe("array");
      expect(fn.params[1]!.name).toBe("horizontal");
      expect(fn.params[1]!.type).toBe("bool");
    });

    it("parses FlexGrid with self return type method", () => {
      const meta = parsePhpFile(advanced("FlexGrid.php"));
      const cls = meta.classes.find((c) => c.name === "FlexGrid");
      expect(cls).toBeDefined();
      const configure = cls!.methods.find((m) => m.name === "configure");
      expect(configure).toBeDefined();
      expect(configure!.returnType).toBe("self");
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.params).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // UC56: Meter - int|float union type constructor param
  // -------------------------------------------------------------------------
  describe("UC56: Meter with int|float union type", () => {
    it("renders Meter with int value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Meter.php"),
        class: "App\\Components\\Meter",
        callable: "render",
        args: { value: 75 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("meter");
      expect(result.html).toContain("meter-fill");
      expect(result.html).toContain("75.0%");
    });

    it("renders Meter with float value and custom range", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Meter.php"),
        class: "App\\Components\\Meter",
        callable: "render",
        args: { value: 33.7, min: 0, max: 50, label: "Temp" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("meter-label");
      expect(result.html).toContain("Temp");
      expect(result.html).toContain("67.4%");
    });

    it("renders Meter with custom color", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Meter.php"),
        class: "App\\Components\\Meter",
        callable: "render",
        args: { value: 100, color: "#3b82f6" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#3b82f6");
      expect(result.html).toContain("100.0%");
    });

    it("renders Meter with low value (red)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Meter.php"),
        class: "App\\Components\\Meter",
        callable: "render",
        args: { value: 10 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#ef4444");
    });

    it("parser detects int|float union type", () => {
      const meta = parsePhpFile(advanced("Meter.php"));
      const cls = meta.classes.find((c) => c.name === "Meter");
      expect(cls).toBeDefined();
      const value = cls!.constructorParams.find((p) => p.name === "value");
      expect(value).toBeDefined();
      expect(value!.type).toBe("int|float");
      expect(value!.required).toBe(true);
      const min = cls!.constructorParams.find((p) => p.name === "min");
      expect(min!.type).toBe("int|float");
      expect(min!.required).toBe(false);
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.params[0]!.name).toBe("color");
      expect(render!.params[0]!.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC57: Dropdown - class implementing multiple interfaces
  // -------------------------------------------------------------------------
  describe("UC57: Dropdown with multiple interfaces", () => {
    it("renders Dropdown toggle closed", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Dropdown.php"),
        class: "App\\Components\\Dropdown",
        callable: "toggle",
        args: { label: "Options", items: ["Edit", "Delete"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dropdown-closed");
      expect(result.html).toContain("Options");
      expect(result.html).toContain("Edit");
      expect(result.html).toContain("Delete");
    });

    it("renders Dropdown toggle open", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Dropdown.php"),
        class: "App\\Components\\Dropdown",
        callable: "toggle",
        args: { label: "Actions", items: ["Copy", "Move"], open: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dropdown-open");
      expect(result.html).toContain("display: block");
    });

    it("renders Dropdown toggle with placeholder", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Dropdown.php"),
        class: "App\\Components\\Dropdown",
        callable: "toggle",
        args: { label: "Filter", items: ["A"], open: true, placeholder: "Pick one..." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Pick one...");
    });

    it("renders Dropdown search with results", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Dropdown.php"),
        class: "App\\Components\\Dropdown",
        callable: "search",
        args: { label: "Search", items: ["Apple", "Banana", "Cherry"], query: "an" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dropdown-search");
      expect(result.html).toContain("Banana");
    });

    it("renders Dropdown search no results", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Dropdown.php"),
        class: "App\\Components\\Dropdown",
        callable: "search",
        args: { label: "Search", items: ["One", "Two"], query: "xyz" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dropdown-empty");
      expect(result.html).toContain("xyz");
    });

    it("parser detects multiple interfaces", () => {
      const meta = parsePhpFile(advanced("Dropdown.php"));
      const cls = meta.classes.find((c) => c.name === "Dropdown");
      expect(cls).toBeDefined();
      expect(cls!.implements).toContain("Togglable");
      expect(cls!.implements).toContain("Searchable");
      expect(cls!.methods).toHaveLength(2);
      expect(cls!.methods.map((m) => m.name).sort()).toEqual(["search", "toggle"]);
    });
  });

  // -------------------------------------------------------------------------
  // UC58: TextFormatter - multiple global functions without namespace
  // -------------------------------------------------------------------------
  describe("UC58: TextFormatter global functions", () => {
    it("renders truncate with short text", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "truncate",
        args: { text: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("truncated-full");
      expect(result.html).toContain("Hello");
    });

    it("renders truncate with long text", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "truncate",
        args: { text: "This is a very long string that should be truncated", length: 20 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("truncated-cut");
      expect(result.html).toContain("...");
    });

    it("renders truncate with custom suffix", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "truncate",
        args: { text: "A really long piece of text for testing", length: 15, suffix: " [more]" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("[more]");
    });

    it("renders highlight with matching term", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "highlight",
        args: { text: "The quick brown fox", term: "fox" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("highlight-mark");
      expect(result.html).toContain("fox");
    });

    it("renders highlight with custom color", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "highlight",
        args: { text: "Hello World", term: "World", color: "#bbf7d0" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#bbf7d0");
    });

    it("renders slugify", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "slugify",
        args: { text: "Hello World Example" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("slug");
      expect(result.html).toContain("hello-world-example");
    });

    it("renders slugify with custom separator", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("TextFormatter.php"),
        class: null,
        callable: "slugify",
        args: { text: "My Blog Post", separator: "_" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("my_blog_post");
    });

    it("parser detects all three global functions", () => {
      const meta = parsePhpFile(advanced("TextFormatter.php"));
      expect(meta.namespace).toBeNull();
      expect(meta.functions).toHaveLength(3);
      const names = meta.functions.map((f) => f.name);
      expect(names).toContain("truncate");
      expect(names).toContain("highlight");
      expect(names).toContain("slugify");
      // Verify FQN has no namespace prefix
      const truncate = meta.functions.find((f) => f.name === "truncate")!;
      expect(truncate.fqn).toBe("truncate");
      expect(truncate.params).toHaveLength(3);
      expect(truncate.params[0]!.type).toBe("string");
      expect(truncate.params[1]!.type).toBe("int");
    });
  });

  // -------------------------------------------------------------------------
  // UC59: Pricing template with match expression
  // -------------------------------------------------------------------------
  describe("UC59: Pricing template", () => {
    it("renders pricing grid with USD plans", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/pricing.php"),
        class: null,
        callable: null,
        args: {
          plans: [
            { name: "Starter", price: 9, features: ["5 Projects", "1 GB"] },
            { name: "Pro", price: 29, features: ["Unlimited", "10 GB", "Support"] },
          ],
          currency: "USD",
          period: "month",
          highlighted: "Pro",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pricing-grid");
      expect(result.html).toContain("Starter");
      expect(result.html).toContain("$9.00");
      expect(result.html).toContain("$29.00");
      expect(result.html).toContain("pricing-highlighted");
      expect(result.html).toContain("Popular");
      expect(result.html).toContain("/ month");
    });

    it("renders pricing with EUR currency", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/pricing.php"),
        class: null,
        callable: null,
        args: {
          plans: [{ name: "Basic", price: 19, features: ["API"] }],
          currency: "EUR",
          period: "year",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("€19.00");
      expect(result.html).toContain("/ year");
    });

    it("renders pricing with JPY (no decimals)", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/pricing.php"),
        class: null,
        callable: null,
        args: {
          plans: [{ name: "Plan", price: 980, features: [] }],
          currency: "JPY",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("¥980");
    });

    it("renders empty pricing", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/pricing.php"),
        class: null,
        callable: null,
        args: { plans: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pricing-empty");
    });
  });

  // -------------------------------------------------------------------------
  // UC60: Carousel - variadic constructor params + __toString
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC60: Carousel with variadic params", () => {
    it("renders Carousel with string items", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Carousel.php"),
        class: "App\\Components\\Carousel",
        callable: "render",
        args: { items: ["First", "Second", "Third"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("carousel");
      expect(result.html).toContain("carousel-active");
      expect(result.html).toContain("First");
      expect(result.html).toContain("Second");
      expect(result.html).toContain("Slide 1 of 3");
    });

    it("renders Carousel with second slide active", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Carousel.php"),
        class: "App\\Components\\Carousel",
        callable: "render",
        args: { items: ["A", "B"], activeIndex: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Slide 2 of 2");
    });

    it("renders Carousel with autoplay", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Carousel.php"),
        class: "App\\Components\\Carousel",
        callable: "render",
        args: { items: ["Slide"], autoplay: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-autoplay="true"');
    });

    it("renders empty Carousel", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Carousel.php"),
        class: "App\\Components\\Carousel",
        callable: "render",
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("carousel-empty");
    });

    it("parser detects Carousel with variadic constructor and method params", () => {
      const meta = parsePhpFile(advanced("Carousel.php"));
      const cls = meta.classes.find((c) => c.name === "Carousel");
      expect(cls).toBeDefined();
      const ctorSlides = cls!.constructorParams.find((p) => p.name === "slides");
      expect(ctorSlides).toBeDefined();
      expect(ctorSlides!.isVariadic).toBe(true);
      expect(ctorSlides!.type).toBe("Slide");
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      const items = render!.params.find((p) => p.name === "items");
      expect(items).toBeDefined();
      expect(items!.isVariadic).toBe(true);
      expect(items!.type).toBe("string");
    });

    it("parser detects Slide class with __toString", () => {
      const meta = parsePhpFile(advanced("Carousel.php"));
      const slide = meta.classes.find((c) => c.name === "Slide");
      expect(slide).toBeDefined();
      expect(slide!.methods.some((m) => m.name === "__toString")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for UC56-UC60
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC56-UC60 virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC56: Meter@render generates classMethod with union type", () => {
      const id = resolveId("./Meter.php@render", advanced("Meter.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Meter");
      expect(code).toContain("value:");
      expect(code).toContain("min:");
      expect(code).toContain("max:");
      expect(code).toContain("color:");
    });

    it("UC57: Dropdown@toggle generates classMethod", () => {
      const id = resolveId("./Dropdown.php@toggle", advanced("Dropdown.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Dropdown");
      expect(code).toContain("label:");
      expect(code).toContain("items:");
      expect(code).toContain("open:");
    });

    it("UC57: Dropdown@search generates classMethod for second interface method", () => {
      const id = resolveId("./Dropdown.php@search", advanced("Dropdown.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("query:");
    });

    it("UC58: TextFormatter@truncate generates function", () => {
      const id = resolveId("./TextFormatter.php@truncate", advanced("TextFormatter.php"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("text:");
      expect(code).toContain("length:");
      expect(code).toContain("suffix:");
    });

    it("UC58: TextFormatter@highlight generates function", () => {
      const id = resolveId("./TextFormatter.php@highlight", advanced("TextFormatter.php"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("text:");
      expect(code).toContain("term:");
      expect(code).toContain("color:");
    });

    it("UC58: TextFormatter@slugify generates function", () => {
      const id = resolveId("./TextFormatter.php@slugify", advanced("TextFormatter.php"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("text:");
      expect(code).toContain("separator:");
    });

    it("UC60: Carousel@render generates classMethod", () => {
      const id = resolveId("./Carousel.php@render", advanced("Carousel.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Carousel");
      expect(code).toContain("items:");
    });
  });

  // -------------------------------------------------------------------------
  // UC61: Enum implementing interface
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC61: Enum implementing interface", () => {
    it("parses LogLevel enum with implements HasLabel", () => {
      const meta = parsePhpFile(php81("LogLevel.php"));
      const logLevel = meta.classes.find((c) => c.name === "LogLevel");
      expect(logLevel).toBeDefined();
      expect(logLevel!.isEnum).toBe(true);
      expect(logLevel!.enumBackingType).toBe("string");
      expect(logLevel!.implements).toContain("HasLabel");
      expect(logLevel!.enumCases).toContain("Debug");
      expect(logLevel!.enumCases).toContain("Critical");
    });

    it("renders LogLevel::badge for info case", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("LogLevel.php"),
        class: "App\\Components\\LogLevel",
        callable: "badge",
        args: { _case: "info" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("log-badge-info");
      expect(result.html).toContain("Info");
    });

    it("renders LogLevel::entry with timestamp", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("LogLevel.php"),
        class: "App\\Components\\LogLevel",
        callable: "entry",
        args: { _case: "error", message: "DB down", timestamp: "2025-01-01 00:00:00" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("log-entry-error");
      expect(result.html).toContain("DB down");
      expect(result.html).toContain("2025-01-01");
    });
  });

  // -------------------------------------------------------------------------
  // UC62: Multiple traits in one class
  // -------------------------------------------------------------------------
  describe("UC62: Multiple traits", () => {
    it("parses Widget with HasIcon, HasBadge, HasActions traits", () => {
      const meta = parsePhpFile(advanced("Widget.php"));
      const widget = meta.classes.find((c) => c.name === "Widget");
      expect(widget).toBeDefined();
      expect(widget!.traits).toContain("HasIcon");
      expect(widget!.traits).toContain("HasBadge");
      expect(widget!.traits).toContain("HasActions");
    });

    it("renders Widget@icon (from HasIcon trait)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Widget.php"),
        class: "App\\Components\\Widget",
        callable: "icon",
        args: { title: "Test", name: "star", size: 32 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("icon-star");
      expect(result.html).toContain("32px");
    });

    it("renders Widget@badge (from HasBadge trait)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Widget.php"),
        class: "App\\Components\\Widget",
        callable: "badge",
        args: { title: "Test", text: "HOT", color: "#ef4444" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("HOT");
      expect(result.html).toContain("#ef4444");
    });

    it("renders Widget@actionBar (from HasActions trait)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Widget.php"),
        class: "App\\Components\\Widget",
        callable: "actionBar",
        args: { title: "Test", primaryLabel: "Save", secondaryLabel: "Cancel" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Save");
      expect(result.html).toContain("Cancel");
      expect(result.html).toContain("btn-primary");
    });
  });

  // -------------------------------------------------------------------------
  // UC63: Array return format
  // -------------------------------------------------------------------------
  describe("UC63: Array return with html key", () => {
    it("parses StatsCard with array return type", () => {
      const meta = parsePhpFile(advanced("ArrayReturn.php"));
      const cls = meta.classes.find((c) => c.name === "StatsCard");
      expect(cls).toBeDefined();
      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.returnType).toBe("array");
    });

    it("renders StatsCard with change indicator", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayReturn.php"),
        class: "App\\Components\\StatsCard",
        callable: "render",
        args: { label: "Revenue", value: 12450, unit: "USD", change: 12.5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Revenue");
      expect(result.html).toContain("12,450");
      expect(result.html).toContain("USD");
      expect(result.html).toContain("12.5%");
    });

    it("renders StatsCard without change", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayReturn.php"),
        class: "App\\Components\\StatsCard",
        callable: "render",
        args: { label: "Uptime", value: 99.9, unit: "%" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Uptime");
      expect(result.html).toContain("99.9");
    });
  });

  // -------------------------------------------------------------------------
  // UC64: __toString object return
  // -------------------------------------------------------------------------
  describe("UC64: Stringable return", () => {
    it("parses FragmentBuilder with HtmlFragment return type", () => {
      const meta = parsePhpFile(php80("HtmlFragment.php"));
      const builder = meta.classes.find((c) => c.name === "FragmentBuilder");
      expect(builder).toBeDefined();
      const render = builder!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.returnType).toBe("HtmlFragment");
    });

    it("renders FragmentBuilder with heading and body", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("HtmlFragment.php"),
        class: "App\\Components\\FragmentBuilder",
        callable: "render",
        args: { heading: "My Title", body: "My content" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("My Title");
      expect(result.html).toContain("My content");
      expect(result.html).toContain("<article>");
    });

    it("renders FragmentBuilder with heading only", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("HtmlFragment.php"),
        class: "App\\Components\\FragmentBuilder",
        callable: "render",
        args: { heading: "Solo Heading" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Solo Heading");
      expect(result.html).not.toContain("<p");
    });
  });

  // -------------------------------------------------------------------------
  // UC65: Multiple static methods utility class
  // -------------------------------------------------------------------------
  describe("UC65: Multiple static methods", () => {
    it("parses MarkupHelper with three static methods", () => {
      const meta = parsePhpFile(advanced("MarkupHelper.php"));
      const cls = meta.classes.find((c) => c.name === "MarkupHelper");
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(0);
      const statics = cls!.methods.filter((m) => m.isStatic);
      expect(statics).toHaveLength(3);
    });

    it("renders MarkupHelper::button", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("MarkupHelper.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "button",
        args: { label: "Submit", variant: "danger" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Submit");
      expect(result.html).toContain("markup-btn-danger");
    });

    it("renders MarkupHelper::button disabled", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("MarkupHelper.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "button",
        args: { label: "Disabled", disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("disabled");
      expect(result.html).toContain("not-allowed");
    });

    it("renders MarkupHelper::link external", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("MarkupHelper.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "link",
        args: { text: "GitHub", href: "https://github.com", external: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('target="_blank"');
      expect(result.html).toContain("noopener");
      expect(result.html).toContain("GitHub");
    });

    it("renders MarkupHelper::image with defaults", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("MarkupHelper.php"),
        class: "App\\Components\\MarkupHelper",
        callable: "image",
        args: { alt: "Placeholder" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("200px");
      expect(result.html).toContain("150px");
      expect(result.html).toContain("Placeholder");
    });
  });

  // -------------------------------------------------------------------------
  // UC66: FAQ template
  // -------------------------------------------------------------------------
  describe("UC66: FAQ template", () => {
    it("renders FAQ template with items", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/faq.php"),
        class: null,
        callable: null,
        args: {
          title: "Help",
          items: [
            { question: "How?", answer: "Like this." },
            { question: "Why?", answer: "Because." },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Help");
      expect(result.html).toContain("How?");
      expect(result.html).toContain("Like this.");
      expect(result.html).toContain("Why?");
    });

    it("renders FAQ template with numbered items", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/faq.php"),
        class: null,
        callable: null,
        args: {
          title: "Steps",
          numbered: true,
          items: [{ question: "First step", answer: "Do this." }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("1. First step");
    });

    it("renders FAQ template with empty items", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/faq.php"),
        class: null,
        callable: null,
        args: { title: "Empty FAQ", items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No questions yet");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: UC61-UC66 virtual modules
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC61-UC66 virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("UC61: LogLevel@badge generates enumMethod", () => {
      const id = resolveId("./LogLevel.php@badge", php81("LogLevel.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("LogLevel");
      expect(code).toContain("_case:");
    });

    it("UC61: LogLevel@entry generates enumMethod with params", () => {
      const id = resolveId("./LogLevel.php@entry", php81("LogLevel.php"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("message:");
      expect(code).toContain("timestamp:");
    });

    it("UC62: Widget@icon generates classMethod from trait", () => {
      const id = resolveId("./Widget.php@icon", advanced("Widget.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("Widget");
      expect(code).toContain("name:");
      expect(code).toContain("size:");
    });

    it("UC62: Widget@badge generates classMethod from second trait", () => {
      const id = resolveId("./Widget.php@badge", advanced("Widget.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("text:");
    });

    it("UC62: Widget@actionBar generates classMethod from third trait", () => {
      const id = resolveId("./Widget.php@actionBar", advanced("Widget.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("primaryLabel:");
    });

    it("UC63: ArrayReturn@render generates classMethod", () => {
      const id = resolveId("./ArrayReturn.php@render", advanced("ArrayReturn.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("value:");
    });

    it("UC64: HtmlFragment@render generates classMethod for FragmentBuilder", () => {
      const id = resolveId("./HtmlFragment.php@render", php80("HtmlFragment.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("heading:");
    });

    it("UC65: MarkupHelper@button generates staticMethod", () => {
      const id = resolveId("./MarkupHelper.php@button", advanced("MarkupHelper.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("variant:");
    });

    it("UC65: MarkupHelper@link generates staticMethod", () => {
      const id = resolveId("./MarkupHelper.php@link", advanced("MarkupHelper.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("text:");
      expect(code).toContain("href:");
    });

    it("UC65: MarkupHelper@image generates staticMethod", () => {
      const id = resolveId("./MarkupHelper.php@image", advanced("MarkupHelper.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("alt:");
      expect(code).toContain("width:");
    });

    // --- New examples ---

    it("UC66: Anchor@render generates classMethod with nullable param", () => {
      const id = resolveId("./Anchor.php@render", basic("Anchor.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("text:");
      expect(code).toContain("href:");
      expect(code).toContain("target:");
      expect(code).toContain("underline:");
    });

    it("UC67: Money@render generates classMethod for final readonly class", () => {
      const id = resolveId("./Money.php@render", advanced("Money.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("amount:");
      expect(code).toContain("currency:");
    });

    it("UC67: Money@fromCents generates staticMethod", () => {
      const id = resolveId("./Money.php@fromCents", advanced("Money.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("cents:");
      expect(code).toContain("currency:");
    });

    it("UC67: Money@fromDollars generates staticMethod", () => {
      const id = resolveId("./Money.php@fromDollars", advanced("Money.php"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("dollars:");
      expect(code).toContain("currency:");
    });

    it("UC69: Toggle@render generates classMethod", () => {
      const id = resolveId("./Toggle.php@render", basic("Toggle.php"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("checked:");
      expect(code).toContain("disabled:");
      expect(code).toContain("size:");
    });
  });

  // -------------------------------------------------------------------------
  // UC66: Nullable param component (Anchor)
  // -------------------------------------------------------------------------
  describe("UC66: Nullable param component", () => {
    it("renders Anchor with all args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Anchor.php"),
        class: "App\\Components\\Anchor",
        callable: "render",
        args: {
          text: "Click here",
          href: "https://example.com",
          target: "_blank",
          underline: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Click here");
      expect(result.html).toContain("https://example.com");
      expect(result.html).toContain('target="_blank"');
      expect(result.html).toContain("text-decoration: none");
    });

    it("renders Anchor with null href", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Anchor.php"),
        class: "App\\Components\\Anchor",
        callable: "render",
        args: { text: "Placeholder" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('href="#"');
      expect(result.html).toContain("Placeholder");
    });
  });

  // -------------------------------------------------------------------------
  // UC67: Final readonly class with static factories (Money)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC67: Final readonly class + static factory", () => {
    it("renders Money via render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Money.php"),
        class: "App\\Components\\Money",
        callable: "render",
        args: { amount: 1999, currency: "USD" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("$19.99");
      expect(result.html).toContain("money");
    });

    it("renders Money::fromCents", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Money.php"),
        class: "App\\Components\\Money",
        callable: "fromCents",
        args: { cents: 4999 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("$49.99");
      expect(result.html).toContain("money-cents");
    });

    it("renders Money::fromDollars with EUR", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("Money.php"),
        class: "App\\Components\\Money",
        callable: "fromDollars",
        args: { dollars: 19.99, currency: "EUR" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("19.99");
      expect(result.html).toContain("money-dollars");
    });
  });

  // -------------------------------------------------------------------------
  // UC69: Bool-heavy component (Toggle)
  // -------------------------------------------------------------------------
  describe("UC69: Bool-heavy component", () => {
    it("renders Toggle unchecked", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Toggle.php"),
        class: "App\\Components\\Toggle",
        callable: "render",
        args: { label: "Enable" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Enable");
      expect(result.html).toContain("toggle");
    });

    it("renders Toggle checked and disabled", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Toggle.php"),
        class: "App\\Components\\Toggle",
        callable: "render",
        args: { label: "Locked", checked: true, disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Locked");
      expect(result.html).toContain("checked");
      expect(result.html).toContain("disabled");
      expect(result.html).toContain("not-allowed");
    });

    it("renders Toggle with size", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("Toggle.php"),
        class: "App\\Components\\Toggle",
        callable: "render",
        args: { label: "Small toggle", size: "small" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("toggle-small");
    });
  });

  // -------------------------------------------------------------------------
  // UC70: Login template
  // -------------------------------------------------------------------------
  describe("UC70: Login template", () => {
    it("renders login form with defaults", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/login.php"),
        class: null,
        callable: null,
        args: { title: "Sign In" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Sign In");
      expect(result.html).toContain("login-form");
      expect(result.html).toContain("Remember me");
      expect(result.html).toContain("Forgot password?");
    });

    it("renders login with error message", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/login.php"),
        class: null,
        callable: null,
        args: { title: "Sign In", error: "Invalid credentials" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("login-error");
      expect(result.html).toContain("Invalid credentials");
    });

    it("renders minimal login without remember/forgot", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/login.php"),
        class: null,
        callable: null,
        args: { title: "Login", showRemember: false, showForgot: false, buttonText: "Log In" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Log In");
      expect(result.html).not.toContain("Remember me");
      expect(result.html).not.toContain("Forgot password?");
    });
  });

  // -------------------------------------------------------------------------
  // UC71: Error page template
  // -------------------------------------------------------------------------
  describe("UC71: Error page template", () => {
    it("renders 404 error page", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 404 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("404");
      expect(result.html).toContain("Not Found");
      expect(result.html).toContain("error-page");
      expect(result.html).toContain("Go Home");
    });

    it("renders 500 error page", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 500 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("500");
      expect(result.html).toContain("Internal Server Error");
    });

    it("renders error page with custom message", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 404, message: "Article not found" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Article not found");
    });

    it("renders error page without home link", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 503, showHome: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Service Unavailable");
      expect(result.html).not.toContain("Go Home");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: new fixtures
  // -------------------------------------------------------------------------
  describe("Parser: new fixture metadata", () => {
    it("parses ReadonlyClass fixture", () => {
      const meta = parsePhpFile(fixture("ReadonlyClass.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Settings");
      expect(cls.isReadonly).toBe(true);
      expect(cls.constructorParams).toHaveLength(3);
    });

    it("parses DefaultNewExpression fixture", () => {
      const meta = parsePhpFile(fixture("DefaultNewExpression.php"));
      expect(meta.classes).toHaveLength(2);
      const widget = meta.classes[1]!;
      expect(widget.name).toBe("Widget");
      const optionsParam = widget.constructorParams.find((p) => p.name === "options")!;
      expect(optionsParam.type).toBe("Options");
      expect(optionsParam.required).toBe(false);
    });

    it("parses EnumWithInterface fixture", () => {
      const meta = parsePhpFile(fixture("EnumWithInterface.php"));
      const level = meta.classes.find((c) => c.name === "Level")!;
      expect(level.isEnum).toBe(true);
      expect(level.implements).toContain("Renderable");
      expect(level.enumCases).toEqual(["Low", "Medium", "High"]);
    });

    it("parses FinalReadonlyClass fixture", () => {
      const meta = parsePhpFile(fixture("FinalReadonlyClass.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Coordinate");
      expect(cls.isFinal).toBe(true);
      expect(cls.isReadonly).toBe(true);
      expect(cls.methods).toHaveLength(2);
    });

    it("parses Anchor with nullable param", () => {
      const meta = parsePhpFile(basic("Anchor.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Anchor");
      const hrefParam = cls.constructorParams.find((p) => p.name === "href")!;
      expect(hrefParam.nullable).toBe(true);
      expect(hrefParam.required).toBe(false);
    });

    it("parses Money as final readonly class", () => {
      const meta = parsePhpFile(advanced("Money.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Money");
      expect(cls.isFinal).toBe(true);
      expect(cls.isReadonly).toBe(true);
      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(staticMethods).toHaveLength(2);
      expect(staticMethods.map((m) => m.name).sort()).toEqual(["fromCents", "fromDollars"]);
    });

    it("parses Settings as readonly class", () => {
      const meta = parsePhpFile(advanced("Settings.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Settings");
      expect(cls.isReadonly).toBe(true);
      expect(cls.isFinal).toBe(false);
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams.map((p) => p.name)).toEqual(["theme", "fontSize", "animations"]);
    });

    it("parses StyledCard with object param and new default", () => {
      const meta = parsePhpFile(php81("StyledCard.php"));
      const cardStyle = meta.classes.find((c) => c.name === "CardStyle")!;
      expect(cardStyle.isReadonly).toBe(false);
      expect(cardStyle.constructorParams).toHaveLength(4);
      const styledCard = meta.classes.find((c) => c.name === "StyledCard")!;
      const styleParam = styledCard.constructorParams.find((p) => p.name === "style")!;
      expect(styleParam.type).toBe("CardStyle");
      expect(styleParam.required).toBe(false);
    });

    it("parses Checklist with variadic constructor and Generator return", () => {
      const meta = parsePhpFile(advanced("Checklist.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Checklist");
      const itemsParam = cls.constructorParams.find((p) => p.name === "items")!;
      expect(itemsParam.isVariadic).toBe(true);
      const renderMethod = cls.methods.find((m) => m.name === "render")!;
      expect(renderMethod.returnType).toBe("\\Generator");
    });
  });

  // -------------------------------------------------------------------------
  // UC72: Readonly class (non-final)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC72: Readonly class", () => {
    it("renders Settings with default args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Settings.php"),
        class: "App\\Components\\Settings",
        callable: "render",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("light");
      expect(result.html).toContain("14px");
      expect(result.html).toContain("enabled");
    });

    it("renders Settings with dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Settings.php"),
        class: "App\\Components\\Settings",
        callable: "render",
        args: { theme: "dark", fontSize: 18, animations: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dark");
      expect(result.html).toContain("18px");
      expect(result.html).toContain("disabled");
      expect(result.html).toContain("#1f2937");
    });
  });

  // -------------------------------------------------------------------------
  // UC73: Object params with new default expression
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC73: Object params with new default", () => {
    it("renders StyledCard with default CardStyle", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("StyledCard.php"),
        class: "App\\Components\\StyledCard",
        callable: "render",
        args: { title: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("styled-card");
    });

    it("renders StyledCard with body text", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("StyledCard.php"),
        class: "App\\Components\\StyledCard",
        callable: "render",
        args: { title: "Card", body: "Body text here" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Card");
      expect(result.html).toContain("Body text here");
    });
  });

  // -------------------------------------------------------------------------
  // UC74: Generator return
  // -------------------------------------------------------------------------
  describe("UC74: Generator return", () => {
    it("renders Checklist with items via yield", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Checklist.php"),
        class: "App\\Components\\Checklist",
        callable: "render",
        args: { title: "Tasks", items: ["A", "B", "C"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Tasks");
      expect(result.html).toContain("<li");
      expect(result.html).toContain("A");
      expect(result.html).toContain("B");
      expect(result.html).toContain("C");
    });

    it("renders Checklist as numbered list", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Checklist.php"),
        class: "App\\Components\\Checklist",
        callable: "render",
        args: { title: "Steps", items: ["First", "Second"], numbered: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<ol");
      expect(result.html).toContain("First");
    });

    it("renders empty Checklist", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Checklist.php"),
        class: "App\\Components\\Checklist",
        callable: "render",
        args: { title: "Empty" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No items");
    });
  });

  // -------------------------------------------------------------------------
  // UC75: Inventory template
  // -------------------------------------------------------------------------
  describe("UC75: Inventory template", () => {
    it("renders inventory with products", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/inventory.php"),
        class: null,
        callable: null,
        args: {
          products: [{ name: "Widget", price: 19.99, stock: 10 }],
          currency: "USD",
          showStock: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Widget");
      expect(result.html).toContain("19.99");
      expect(result.html).toContain("Stock");
    });

    it("renders inventory without stock column", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/inventory.php"),
        class: null,
        callable: null,
        args: {
          products: [{ name: "Item", price: 5.0 }],
          showStock: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Item");
      expect(result.html).not.toContain("Stock");
    });

    it("renders empty inventory", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/inventory.php"),
        class: null,
        callable: null,
        args: { products: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No products");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: new examples
  // -------------------------------------------------------------------------
  describe("Vite plugin: new example virtual modules", () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("generates virtual module for Settings.php@render", () => {
      const id = resolveId("./Settings.php@render", advanced("Settings.php"));
      expect(id).toContain("storybook-php:");
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const Settings");
    });

    it("generates virtual module for StyledCard.php@render", () => {
      const id = resolveId("./StyledCard.php@render", php81("StyledCard.php"));
      expect(id).toContain("storybook-php:");
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const StyledCard");
    });

    it("generates virtual module for Checklist.php@render", () => {
      const id = resolveId("./Checklist.php@render", advanced("Checklist.php"));
      expect(id).toContain("storybook-php:");
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const Checklist");
    });

    it("generates virtual module for AbstractShape.php@render (both subclasses)", () => {
      const id = resolveId("./AbstractShape.php@render", advanced("AbstractShape.php"));
      expect(id).toContain("storybook-php:");
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const Circle");
      expect(code).toContain("export const Square");
    });

    it("generates virtual module for FormField.php@render", () => {
      const id = resolveId("./FormField.php@render", advanced("FormField.php"));
      expect(id).toContain("storybook-php:");
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const FormField");
      expect(code).toContain("label:");
      expect(code).toContain("id:");
    });
  });

  // -------------------------------------------------------------------------
  // UC76: Abstract class with concrete subclasses
  // -------------------------------------------------------------------------
  describe("UC76: Abstract class with concrete subclasses", () => {
    it("renders Circle with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractShape.php"),
        class: "App\\Components\\Circle",
        callable: "render",
        args: { color: "#3b82f6", size: 80 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("shape-circle");
      expect(result.html).toContain("80px");
      expect(result.html).toContain("#3b82f6");
    });

    it("renders Square with border radius", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractShape.php"),
        class: "App\\Components\\Square",
        callable: "render",
        args: { color: "#f59e0b", size: 100, radius: 16 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("shape-square");
      expect(result.html).toContain("100px");
      expect(result.html).toContain("border-radius: 16px");
    });
  });

  // -------------------------------------------------------------------------
  // UC78: Mixed promoted/non-promoted constructor params
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC78: Mixed promoted/non-promoted params (FormField)", () => {
    it("renders FormField with auto-generated id", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FormField.php"),
        class: "App\\Components\\FormField",
        callable: "render",
        args: { label: "Email Address", type: "email", required: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("email-address");
      expect(result.html).toContain("Email Address");
      expect(result.html).toContain('type="email"');
      expect(result.html).toContain("required");
    });

    it("renders FormField with explicit id and placeholder", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FormField.php"),
        class: "App\\Components\\FormField",
        callable: "render",
        args: { label: "Phone", type: "tel", id: "user-phone", placeholder: "+1 555-0100" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("user-phone");
      expect(result.html).toContain("Phone");
      expect(result.html).toContain("+1 555-0100");
    });
  });

  // -------------------------------------------------------------------------
  // UC80: Contact form template
  // -------------------------------------------------------------------------
  describe("UC80: Contact template", () => {
    it("renders empty contact form", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/contact.php"),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("contact-form");
      expect(result.html).toContain("Contact Us");
      expect(result.html).toContain("Send Message");
    });

    it("renders prefilled contact form", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/contact.php"),
        class: null,
        callable: null,
        args: {
          name: "Alice",
          email: "alice@example.com",
          subject: "Support",
          message: "Need help",
          submitLabel: "Submit",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alice");
      expect(result.html).toContain("alice@example.com");
      expect(result.html).toContain("Support");
      expect(result.html).toContain("Need help");
      expect(result.html).toContain("Submit");
    });
  });

  // -------------------------------------------------------------------------
  // UC82: Class constants (StatusBanner)
  // -------------------------------------------------------------------------
  describe("UC82: Class constants", () => {
    it("renders info banner", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("StatusBanner.php"),
        class: "App\\Components\\StatusBanner",
        callable: "render",
        args: { message: "Test info", level: "info" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test info");
      expect(result.html).toContain("status-info");
    });

    it("renders error banner with dismiss", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("StatusBanner.php"),
        class: "App\\Components\\StatusBanner",
        callable: "render",
        args: { message: "Error occurred", level: "error", dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("status-error");
      expect(result.html).toContain("&times;");
    });

    it("renders success banner without icon", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("StatusBanner.php"),
        class: "App\\Components\\StatusBanner",
        callable: "render",
        args: { message: "Saved!", level: "success", showIcon: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Saved!");
      expect(result.html).toContain("status-success");
    });
  });

  // -------------------------------------------------------------------------
  // UC83: Interface implementation (Panel)
  // -------------------------------------------------------------------------
  describe("UC83: Interface implementation", () => {
    it("renders Panel with body", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Panel.php"),
        class: "App\\Components\\Panel",
        callable: "render",
        args: { heading: "Test Panel", body: "Body content" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Panel");
      expect(result.html).toContain("Body content");
      expect(result.html).toContain("panel");
    });

    it("renders collapsed Panel", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Panel.php"),
        class: "App\\Components\\Panel",
        callable: "render",
        args: { heading: "Collapsed", body: "Hidden", collapsible: true, collapsed: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("display: none;");
    });
  });

  // -------------------------------------------------------------------------
  // UC84: Readonly properties with mixed promotion (UserProfile)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC84: Readonly promoted properties", () => {
    it("renders UserProfile with initials", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("UserProfile.php"),
        class: "App\\Components\\UserProfile",
        callable: "render",
        args: { name: "Jane Doe", email: "jane@example.com" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jane Doe");
      expect(result.html).toContain("jane@example.com");
      expect(result.html).toContain("JD");
    });

    it("renders admin role badge", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("UserProfile.php"),
        class: "App\\Components\\UserProfile",
        callable: "render",
        args: { name: "Alice", email: "alice@test.com", role: "admin" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Admin");
    });
  });

  // -------------------------------------------------------------------------
  // UC85: Unit enum implementing interface (Weekday)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC85: Unit enum with interface", () => {
    it("renders Friday badge", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Weekday.php"),
        class: "App\\Components\\Weekday",
        callable: "badge",
        args: { _case: "Friday" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Friday");
      expect(result.html).toContain("Almost weekend!");
    });

    it("renders Saturday badge as weekend", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Weekday.php"),
        class: "App\\Components\\Weekday",
        callable: "badge",
        args: { _case: "Saturday" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Saturday");
      expect(result.html).toContain("Weekend");
    });
  });

  // -------------------------------------------------------------------------
  // UC86: Object params with new defaults (StyledText)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC86: Object param with new default", () => {
    it("renders with default TextStyle", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("StyledText.php"),
        class: "App\\Components\\StyledText",
        callable: "render",
        args: { text: "Hello world" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello world");
      expect(result.html).toContain("system-ui");
    });

    it("renders with custom style object", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("StyledText.php"),
        class: "App\\Components\\StyledText",
        callable: "render",
        args: {
          text: "Styled",
          tag: "h1",
          style: { fontFamily: "Georgia", fontSize: 32, color: "#7c3aed", fontWeight: "bold" },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Styled");
      expect(result.html).toContain("Georgia");
      expect(result.html).toContain("#7c3aed");
    });
  });

  // -------------------------------------------------------------------------
  // UC87: Inheritance (BaseCard / FeatureCard)
  // -------------------------------------------------------------------------
  describe("UC87: Class inheritance", () => {
    it("renders BaseCard", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FeatureCard.php"),
        class: "App\\Components\\BaseCard",
        callable: "render",
        args: { title: "Base Card", body: "Simple card." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Base Card");
      expect(result.html).toContain("base-card");
    });

    it("renders FeatureCard with icon and accent", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FeatureCard.php"),
        class: "App\\Components\\FeatureCard",
        callable: "render",
        args: { title: "Feature", body: "Description", icon: "⚡", accentColor: "#10b981" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Feature");
      expect(result.html).toContain("feature-card");
      expect(result.html).toContain("#10b981");
    });
  });

  // -------------------------------------------------------------------------
  // UC88: __toString return pattern (Duration)
  // -------------------------------------------------------------------------
  describe("UC88: __toString return", () => {
    it("renders Duration with hours, minutes, seconds", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Duration.php"),
        class: "App\\Components\\Duration",
        callable: "render",
        args: { hours: 2, minutes: 30, seconds: 15 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("2h");
      expect(result.html).toContain("30m");
      expect(result.html).toContain("15s");
    });

    it("renders zero duration", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Duration.php"),
        class: "App\\Components\\Duration",
        callable: "render",
        args: { hours: 0, minutes: 0, seconds: 0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("0s");
    });
  });

  // -------------------------------------------------------------------------
  // UC89: Testimonial template
  // -------------------------------------------------------------------------
  describe("UC89: Testimonial template", () => {
    it("renders card variant with rating", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/testimonial.php"),
        class: null,
        callable: null,
        args: { quote: "Amazing!", author: "Sarah", role: "Developer", rating: 5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Amazing!");
      expect(result.html).toContain("Sarah");
      expect(result.html).toContain("Developer");
      expect(result.html).toContain("testimonial");
    });

    it("renders minimal variant", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/testimonial.php"),
        class: null,
        callable: null,
        args: { quote: "Simple.", author: "Alex", variant: "minimal" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Simple.");
      expect(result.html).toContain("blockquote");
    });
  });

  // -------------------------------------------------------------------------
  // UC90: Notification template
  // -------------------------------------------------------------------------
  describe("UC90: Notification template", () => {
    it("renders unread info notification", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/notification.php"),
        class: null,
        callable: null,
        args: {
          title: "New comment",
          message: "Alice replied.",
          type: "info",
          time: "2 min ago",
          unread: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("New comment");
      expect(result.html).toContain("Alice replied.");
      expect(result.html).toContain("notification-item");
    });

    it("renders read notification without dot", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/notification.php"),
        class: null,
        callable: null,
        args: { title: "Old alert", type: "warning", time: "yesterday", unread: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Old alert");
      expect(result.html).toContain("background: white;");
    });
  });

  // -------------------------------------------------------------------------
  // UC91: Multiple classes in one file (PageHeader)
  // -------------------------------------------------------------------------
  describe("UC91: Multiple classes in one file (PageHeader)", () => {
    it("renders PageHeader with title and logo", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("PageSection.php"),
        class: "App\\Components\\PageHeader",
        callable: "render",
        args: { title: "Home", logo: "Acme" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Acme");
      expect(result.html).toContain("Home");
      expect(result.html).toContain("header");
    });

    it("renders sticky PageHeader", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("PageSection.php"),
        class: "App\\Components\\PageHeader",
        callable: "render",
        args: { title: "Dashboard", logo: "MyApp", sticky: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("sticky");
      expect(result.html).toContain("MyApp");
    });
  });

  // -------------------------------------------------------------------------
  // UC92: Multiple classes in one file (PageFooter)
  // -------------------------------------------------------------------------
  describe("UC92: Multiple classes in one file (PageFooter)", () => {
    it("renders dark PageFooter", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("PageSection.php"),
        class: "App\\Components\\PageFooter",
        callable: "render",
        args: { copyright: "Acme Inc", year: 2025 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Acme Inc");
      expect(result.html).toContain("2025");
      expect(result.html).toContain("footer");
    });

    it("renders light PageFooter", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("PageSection.php"),
        class: "App\\Components\\PageFooter",
        callable: "render",
        args: { copyright: "Test Corp", theme: "light" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Corp");
      expect(result.html).toContain("#f9fafb");
    });
  });

  // -------------------------------------------------------------------------
  // UC93: No-namespace class (SimpleBox)
  // -------------------------------------------------------------------------
  describe("UC93: No-namespace class (SimpleBox)", () => {
    it("renders SimpleBox with content", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("SimpleBox.php"),
        class: "SimpleBox",
        callable: "render",
        args: { content: "Hello Box" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello Box");
      expect(result.html).toContain("simple-box");
    });

    it("renders SimpleBox with custom style", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: basic("SimpleBox.php"),
        class: "SimpleBox",
        callable: "render",
        args: { content: "Styled", borderColor: "#3b82f6", padding: 24 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#3b82f6");
      expect(result.html).toContain("24px");
    });
  });

  // -------------------------------------------------------------------------
  // UC94: Sidebar template
  // -------------------------------------------------------------------------
  describe("UC94: Sidebar template", () => {
    it("renders sidebar with items and active state", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/sidebar.php"),
        class: null,
        callable: null,
        args: {
          title: "Navigation",
          items: ["Dashboard", "Projects", "Settings"],
          activeItem: "Dashboard",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Navigation");
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("Projects");
      expect(result.html).toContain("sidebar");
    });

    it("renders dark sidebar", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/sidebar.php"),
        class: null,
        callable: null,
        args: { title: "Menu", items: ["Home", "About"], theme: "dark" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Menu");
      expect(result.html).toContain("#1f2937");
    });
  });

  // -------------------------------------------------------------------------
  // UC95: Weather template
  // -------------------------------------------------------------------------
  describe("UC95: Weather template", () => {
    it("renders sunny weather card", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/weather.php"),
        class: null,
        callable: null,
        args: { city: "Tokyo", temperature: 28, condition: "sunny", humidity: 55, windSpeed: 8 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Tokyo");
      expect(result.html).toContain("28");
      expect(result.html).toContain("weather-card");
    });

    it("renders snowy weather card", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/weather.php"),
        class: null,
        callable: null,
        args: {
          city: "Helsinki",
          temperature: -5,
          condition: "snowy",
          humidity: 70,
          windSpeed: 15,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Helsinki");
      expect(result.html).toContain("-5");
      expect(result.html).toContain("#3b82f6");
    });

    it("renders with default values", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/weather.php"),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Tokyo");
      expect(result.html).toContain("22");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: UC81-UC90 virtual modules
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC81-UC90 virtual modules", () => {
    const plugin = storybookPhpPlugin({});
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("resolves StatusBanner.php@render", async () => {
      const id = await resolveId("./StatusBanner.php@render", advanced("StatusBanner.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("StatusBanner");
    });

    it("resolves Panel.php@render", async () => {
      const id = await resolveId("./Panel.php@render", advanced("Panel.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("Panel");
    });

    it("resolves UserProfile.php@render", async () => {
      const id = await resolveId("./UserProfile.php@render", advanced("UserProfile.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("UserProfile");
    });

    it("resolves Weekday.php@badge", async () => {
      const id = await resolveId("./Weekday.php@badge", php81("Weekday.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("Weekday");
    });

    it("resolves StyledText.php@render", async () => {
      const id = await resolveId("./StyledText.php@render", advanced("StyledText.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("StyledText");
    });

    it("resolves FeatureCard.php@render", async () => {
      const id = await resolveId("./FeatureCard.php@render", advanced("FeatureCard.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("FeatureCard");
    });

    it("resolves Duration.php@render", async () => {
      const id = await resolveId("./Duration.php@render", advanced("Duration.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("Duration");
    });

    it("resolves PageSection.php@render for PageHeader", async () => {
      const id = await resolveId(
        "./PageSection.php@render",
        advanced("PageSectionHeader.stories.ts"),
      );
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("PageHeader");
    });

    it("resolves PageSection.php@render for PageFooter", async () => {
      const id = await resolveId(
        "./PageSection.php@render",
        advanced("PageSectionFooter.stories.ts"),
      );
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("PageFooter");
    });

    it("resolves SimpleBox.php@render (no namespace)", async () => {
      const id = await resolveId("./SimpleBox.php@render", basic("SimpleBox.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("SimpleBox");
    });

    it("resolves sidebar.php template", async () => {
      const id = await resolveId("./sidebar.php", advanced("templates/sidebar.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("template");
    });

    it("resolves weather.php template", async () => {
      const id = await resolveId("./weather.php", advanced("templates/weather.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("template");
    });
  });

  // -------------------------------------------------------------------------
  // UC96: String-backed enum
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC96: String-backed enum", () => {
    it("renders Language::greeting for English", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Language.php"),
        class: "App\\Components\\Language",
        callable: "greeting",
        args: { _case: "en", name: "World" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello, World!");
      expect(result.html).toContain("en");
      expect(result.html).toContain("language-greeting");
    });

    it("renders Language::greeting for Japanese", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Language.php"),
        class: "App\\Components\\Language",
        callable: "greeting",
        args: { _case: "ja", name: "太郎" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("こんにちは");
      expect(result.html).toContain("太郎");
    });

    it("renders Language::flag for Japanese", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Language.php"),
        class: "App\\Components\\Language",
        callable: "flag",
        args: { _case: "ja" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("lang-flag");
    });

    it("renders Language::greeting for Spanish", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Language.php"),
        class: "App\\Components\\Language",
        callable: "greeting",
        args: { _case: "es", name: "Carlos" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("¡Hola, Carlos!");
    });
  });

  // -------------------------------------------------------------------------
  // UC97: Multi-trait with shared render method (trait method resolution)
  // -------------------------------------------------------------------------
  describe("UC97: Trait-based render method", () => {
    it("renders Twitter::shareLink via HasShareLink trait", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SocialShare.php"),
        class: "App\\Components\\Twitter",
        callable: "shareLink",
        args: { url: "https://example.com", label: "Tweet" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("share-link");
      expect(result.html).toContain("share-twitter");
      expect(result.html).toContain("Tweet");
      expect(result.html).toContain("https://example.com");
    });

    it("renders Facebook::shareLink via same HasShareLink trait", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SocialShare.php"),
        class: "App\\Components\\Facebook",
        callable: "shareLink",
        args: { url: "https://example.com/post", label: "Share" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("share-link");
      expect(result.html).toContain("share-facebook");
      expect(result.html).toContain("Share");
      expect(result.html).toContain("#1877F2");
    });
  });

  // -------------------------------------------------------------------------
  // UC98: Object parameter with `new` expression default
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC98: Object param with new default", () => {
    it("renders DateRange with default config", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DateRange.php"),
        class: "App\\Components\\DateRange",
        callable: "render",
        args: { start: "2025-01-01", end: "2025-12-31" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("date-range");
      expect(result.html).toContain("2025-01-01");
      expect(result.html).toContain("2025-12-31");
    });

    it("renders DateRange with custom config", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DateRange.php"),
        class: "App\\Components\\DateRange",
        callable: "render",
        args: {
          start: "2025-06-01",
          end: "2025-06-07",
          config: { format: "M j", separator: " ~ " },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jun 1");
      expect(result.html).toContain("Jun 7");
      expect(result.html).toContain(" ~ ");
    });
  });

  // -------------------------------------------------------------------------
  // UC99: Multiple classes implementing interface (multi-export)
  // -------------------------------------------------------------------------
  describe("UC99: Multi-export interface implementations", () => {
    it("renders InfoBox via render method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Renderable.php"),
        class: "App\\Components\\InfoBox",
        callable: "render",
        args: { title: "Information", message: "This is a test." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("info-box");
      expect(result.html).toContain("Information");
      expect(result.html).toContain("This is a test.");
    });

    it("renders InfoBox with custom icon", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Renderable.php"),
        class: "App\\Components\\InfoBox",
        callable: "render",
        args: { title: "Done", message: "All clear.", icon: "✅" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("✅");
    });

    it("renders WarningBox via same render method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Renderable.php"),
        class: "App\\Components\\WarningBox",
        callable: "render",
        args: { title: "Warning", message: "Be careful!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("warning-box");
      expect(result.html).toContain("Warning");
    });

    it("renders WarningBox with urgent flag", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Renderable.php"),
        class: "App\\Components\\WarningBox",
        callable: "render",
        args: { title: "Critical", message: "Immediate action required!", urgent: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("2px solid #f59e0b");
      expect(result.html).toContain("⚠️");
    });
  });

  // -------------------------------------------------------------------------
  // UC100: Blog template with tags and conditionals
  // -------------------------------------------------------------------------
  describe("UC100: Blog template", () => {
    it("renders blog post with tags", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/blog.php"),
        class: null,
        callable: null,
        args: {
          title: "Test Post",
          author: "Alice",
          body: "Hello world.",
          date: "March 15, 2025",
          tags: ["PHP", "Tutorial"],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("blog-post");
      expect(result.html).toContain("Test Post");
      expect(result.html).toContain("Alice");
      expect(result.html).toContain("PHP");
      expect(result.html).toContain("Tutorial");
    });

    it("renders blog post without tags", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/blog.php"),
        class: null,
        callable: null,
        args: { title: "Simple Post", author: "Bob", body: "No tags here." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Simple Post");
      expect(result.html).toContain("Bob");
      expect(result.html).not.toContain("blog-tags");
    });
  });

  // -------------------------------------------------------------------------
  // UC101: Gallery template with grid layout
  // -------------------------------------------------------------------------
  describe("UC101: Gallery template", () => {
    it("renders gallery grid with images", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/gallery.php"),
        class: null,
        callable: null,
        args: {
          images: [
            { emoji: "🌄", caption: "Sunrise" },
            { emoji: "🏔️", caption: "Mountain" },
          ],
          columns: 2,
          gap: "12px",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("gallery");
      expect(result.html).toContain("Sunrise");
      expect(result.html).toContain("Mountain");
      expect(result.html).toContain("repeat(2, 1fr)");
    });

    it("renders empty gallery", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/gallery.php"),
        class: null,
        callable: null,
        args: { columns: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No images to display");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: UC96-UC101 virtual modules
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC96-UC101 virtual modules", () => {
    const plugin = storybookPhpPlugin({});
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("resolves Language.php@greeting as enumMethod", async () => {
      const id = await resolveId("./Language.php@greeting", php81("Language.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("Language");
      expect(code).toContain("_case:");
      expect(code).toContain("name:");
    });

    it("resolves Language.php@flag as enumMethod", async () => {
      const id = await resolveId("./Language.php@flag", php81("LanguageFlag.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("__type: 'enumMethod'");
    });

    it("resolves SocialShare.php@shareLink for Twitter (trait method)", async () => {
      const id = await resolveId(
        "./SocialShare.php@shareLink",
        advanced("TwitterShare.stories.ts"),
      );
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("Twitter");
      expect(code).toContain("Facebook");
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("url:");
      expect(code).toContain("label:");
    });

    it("resolves DateRange.php@render with new expression default", async () => {
      const id = await resolveId("./DateRange.php@render", advanced("DateRange.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("DateRange");
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("start:");
      expect(code).toContain("end:");
      expect(code).toContain("config:");
    });

    it("resolves Renderable.php@render with multi-export (InfoBox + WarningBox)", async () => {
      const id = await resolveId("./Renderable.php@render", advanced("InfoBox.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("InfoBox");
      expect(code).toContain("WarningBox");
      expect(code).toContain("__type: 'classMethod'");
    });

    it("resolves blog.php template", async () => {
      const id = await resolveId("./blog.php", advanced("templates/blog.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("template");
    });

    it("resolves gallery.php template", async () => {
      const id = await resolveId("./gallery.php", advanced("templates/gallery.stories.ts"));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain("template");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: UC96-UC101 metadata
  // -------------------------------------------------------------------------
  describe("Parser: UC96-UC101 metadata", () => {
    it("parses Language.php as string-backed enum", () => {
      const meta = parsePhpFile(php81("Language.php"));
      expect(meta.classes).toHaveLength(1);
      const lang = meta.classes[0]!;
      expect(lang.name).toBe("Language");
      expect(lang.isEnum).toBe(true);
      expect(lang.enumBackingType).toBe("string");
      expect(lang.enumCases).toEqual(["English", "Japanese", "French", "Spanish", "German"]);
      expect(lang.methods.some((m) => m.name === "greeting")).toBe(true);
      expect(lang.methods.some((m) => m.name === "flag")).toBe(true);
    });

    it("parses SocialShare.php with traits and multiple classes", () => {
      const meta = parsePhpFile(advanced("SocialShare.php"));
      const classNames = meta.classes.map((c) => c.name);
      expect(classNames).toContain("Twitter");
      expect(classNames).toContain("Facebook");
      const twitter = meta.classes.find((c) => c.name === "Twitter")!;
      expect(twitter.traits).toContain("HasShareLink");
      expect(twitter.traits).toContain("HasIcon");
      const facebook = meta.classes.find((c) => c.name === "Facebook")!;
      expect(facebook.traits).toContain("HasShareLink");
      expect(facebook.traits).toContain("HasIcon");
    });

    it("parses DateRange.php with new expression default", () => {
      const meta = parsePhpFile(advanced("DateRange.php"));
      const dr = meta.classes.find((c) => c.name === "DateRange")!;
      expect(dr).toBeDefined();
      const configParam = dr.constructorParams.find((p) => p.name === "config");
      expect(configParam).toBeDefined();
      expect(configParam!.type).toBe("DateConfig");
      expect(configParam!.required).toBe(false);
    });

    it("parses Renderable.php with interface and multiple implementations", () => {
      const meta = parsePhpFile(advanced("Renderable.php"));
      const classNames = meta.classes.map((c) => c.name);
      expect(classNames).toContain("RenderableInterface");
      expect(classNames).toContain("InfoBox");
      expect(classNames).toContain("WarningBox");
      const infoBox = meta.classes.find((c) => c.name === "InfoBox")!;
      expect(infoBox.implements).toContain("RenderableInterface");
      const warningBox = meta.classes.find((c) => c.name === "WarningBox")!;
      expect(warningBox.implements).toContain("RenderableInterface");
    });
  });

  // -------------------------------------------------------------------------
  // UC102: No-constructor class with instance methods (Snippet)
  // -------------------------------------------------------------------------
  describe("UC102: No-constructor class with instance methods", () => {
    it("renders Snippet.render with all args going to method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Snippet.php"),
        class: "App\\Components\\Snippet",
        callable: "render",
        args: { code: 'echo "hi";', language: "php" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo");
      expect(result.html).toContain("snippet");
      expect(result.html).toContain("php");
    });

    it("renders Snippet.render with line numbers", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Snippet.php"),
        class: "App\\Components\\Snippet",
        callable: "render",
        args: { code: "line1\nline2", language: "javascript", lineNumbers: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("1");
      expect(result.html).toContain("2");
    });

    it("renders Snippet.inline", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Snippet.php"),
        class: "App\\Components\\Snippet",
        callable: "inline",
        args: { code: "$var" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("$var");
      expect(result.html).toContain("<code");
    });

    it("parses Snippet.php with no constructor", () => {
      const meta = parsePhpFile(advanced("Snippet.php"));
      const cls = meta.classes.find((c) => c.name === "Snippet")!;
      expect(cls.constructorParams).toHaveLength(0);
      expect(cls.methods.length).toBeGreaterThanOrEqual(2);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(3);
      const inline = cls.methods.find((m) => m.name === "inline")!;
      expect(inline.params).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // UC103: Callout with boolean flags
  // -------------------------------------------------------------------------
  describe("UC103: Callout with boolean flags", () => {
    it("renders default callout", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Callout.php"),
        class: "App\\Components\\Callout",
        callable: "render",
        args: { title: "Test", message: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test");
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("callout-info");
    });

    it("renders compact error callout with all flags", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("Callout.php"),
        class: "App\\Components\\Callout",
        callable: "render",
        args: {
          title: "Error",
          message: "Something went wrong",
          type: "error",
          showIcon: false,
          bordered: false,
          rounded: false,
          shadow: true,
          closable: true,
          compact: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("callout-error");
      expect(result.html).toContain("&times;");
      expect(result.html).toContain("box-shadow");
    });

    it("parses Callout.php constructor with many boolean params", () => {
      const meta = parsePhpFile(advanced("Callout.php"));
      const cls = meta.classes.find((c) => c.name === "Callout")!;
      const boolParams = cls.constructorParams.filter((p) => p.type === "bool");
      expect(boolParams.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // UC104: DateFormatter with multiple instance methods
  // -------------------------------------------------------------------------
  describe("UC104: DateFormatter with multiple instance methods", () => {
    it("renders format method with style", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DateFormatter.php"),
        class: "App\\Components\\DateFormatter",
        callable: "format",
        args: { date: "2025-03-15", style: "long" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("15");
      expect(result.html).toContain("2025");
      expect(result.html).toContain("<time");
    });

    it("renders format method with Japanese locale", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DateFormatter.php"),
        class: "App\\Components\\DateFormatter",
        callable: "format",
        args: { date: "2025-07-20", style: "medium", locale: "ja" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("20");
    });

    it("renders relative method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DateFormatter.php"),
        class: "App\\Components\\DateFormatter",
        callable: "relative",
        args: { date: "2020-01-01" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("day");
      expect(result.html).toContain("ago");
    });

    it("renders calendar method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DateFormatter.php"),
        class: "App\\Components\\DateFormatter",
        callable: "calendar",
        args: { date: "2025-03-15" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("March 2025");
      expect(result.html).toContain("15");
      expect(result.html).toContain("Su");
    });

    it("parses DateFormatter.php with constructor + 3 methods", () => {
      const meta = parsePhpFile(advanced("DateFormatter.php"));
      const cls = meta.classes.find((c) => c.name === "DateFormatter")!;
      expect(cls.constructorParams).toHaveLength(1);
      expect(cls.constructorParams[0]!.name).toBe("locale");
      const methodNames = cls.methods.map((m) => m.name);
      expect(methodNames).toContain("format");
      expect(methodNames).toContain("relative");
      expect(methodNames).toContain("calendar");
    });
  });

  // -------------------------------------------------------------------------
  // UC105: EnumTransition with multiple enum-typed params
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC105: EnumTransition with multiple enum-typed params", () => {
    it("renders forward transition", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumTransition.php"),
        class: "App\\Components\\EnumTransition",
        callable: "render",
        args: { from: "draft", to: "review", label: "Submit" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Draft");
      expect(result.html).toContain("Review");
      expect(result.html).toContain("Submit");
      expect(result.html).toContain("&#8594;");
    });

    it("renders backward transition", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumTransition.php"),
        class: "App\\Components\\EnumTransition",
        callable: "render",
        args: { from: "published", to: "draft" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Published");
      expect(result.html).toContain("Draft");
      expect(result.html).toContain("&#8592;");
    });

    it("renders same-state transition", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumTransition.php"),
        class: "App\\Components\\EnumTransition",
        callable: "render",
        args: { from: "review", to: "review" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("&#8596;");
    });

    it("parses EnumTransition.php with enum and class", () => {
      const meta = parsePhpFile(php81("EnumTransition.php"));
      const enumCls = meta.classes.find((c) => c.name === "Phase")!;
      expect(enumCls.isEnum).toBe(true);
      expect(enumCls.enumBackingType).toBe("string");
      expect(enumCls.enumCases).toEqual(["Draft", "Review", "Approved", "Published", "Archived"]);

      const cls = meta.classes.find((c) => c.name === "EnumTransition")!;
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[0]!.type).toBe("Phase");
      expect(cls.constructorParams[1]!.type).toBe("Phase");
    });
  });

  // -------------------------------------------------------------------------
  // UC106: Recipe template with arrays and conditionals
  // -------------------------------------------------------------------------
  describe("UC106: Recipe template", () => {
    it("renders full recipe", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/recipe.php"),
        class: null,
        callable: null,
        args: {
          title: "Pancakes",
          servings: 4,
          ingredients: ["Flour", "Eggs", "Milk"],
          steps: ["Mix dry ingredients.", "Add wet ingredients.", "Cook."],
          notes: "Let batter rest.",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Pancakes");
      expect(result.html).toContain("Serves 4");
      expect(result.html).toContain("Flour");
      expect(result.html).toContain("Eggs");
      expect(result.html).toContain("Mix dry ingredients.");
      expect(result.html).toContain("Let batter rest.");
    });

    it("renders recipe without optional fields", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/recipe.php"),
        class: null,
        callable: null,
        args: { title: "Toast", servings: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Toast");
      expect(result.html).toContain("Serves 1");
      expect(result.html).not.toContain("Ingredients");
      expect(result.html).not.toContain("Note:");
    });

    it("renders with empty args using defaults", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/recipe.php"),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Untitled Recipe");
    });
  });

  // -------------------------------------------------------------------------
  // UC108: Void/echo standalone functions
  // -------------------------------------------------------------------------
  describe("UC108: Echo-based standalone functions (renderHtml)", () => {
    it("renders banner with title only", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("renderHtml.php"),
        class: null,
        callable: "renderBanner",
        args: { title: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("banner");
    });

    it("renders banner with subtitle", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("renderHtml.php"),
        class: null,
        callable: "renderBanner",
        args: { title: "Sale", subtitle: "50% off", bg: "#dc2626" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Sale");
      expect(result.html).toContain("50% off");
      expect(result.html).toContain("#dc2626");
    });

    it("renders alert with default type", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("renderHtml.php"),
        class: null,
        callable: "renderAlert",
        args: { message: "Saved." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Saved.");
      expect(result.html).toContain("echo-alert");
    });

    it("renders alert with error type", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("renderHtml.php"),
        class: null,
        callable: "renderAlert",
        args: { message: "Connection lost.", type: "error" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Connection lost.");
      expect(result.html).toContain("#ef4444");
    });

    it("parses renderHtml.php as global void functions", () => {
      const meta = parsePhpFile(advanced("renderHtml.php"));
      expect(meta.namespace).toBeNull();
      expect(meta.functions).toHaveLength(2);
      const banner = meta.functions.find((f) => f.name === "renderBanner")!;
      expect(banner.params).toHaveLength(3);
      expect(banner.returnType).toBe("void");
      const alert = meta.functions.find((f) => f.name === "renderAlert")!;
      expect(alert.params).toHaveLength(2);
      expect(alert.returnType).toBe("void");
    });
  });

  // -------------------------------------------------------------------------
  // UC109: Variadic standalone functions
  // -------------------------------------------------------------------------
  describe("UC109: Variadic standalone functions (joinItems)", () => {
    it("joins items with separator", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("joinItems.php"),
        class: null,
        callable: "App\\Helpers\\joinItems",
        args: { separator: ", ", items: ["A", "B", "C"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("A");
      expect(result.html).toContain("B");
      expect(result.html).toContain("C");
      expect(result.html).toContain("join-items");
    });

    it("renders empty state", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("joinItems.php"),
        class: null,
        callable: "App\\Helpers\\joinItems",
        args: { separator: ", ", items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("join-empty");
      expect(result.html).toContain("No items");
    });

    it("wraps each item in a tag", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("joinItems.php"),
        class: null,
        callable: "App\\Helpers\\wrapEach",
        args: { tag: "li", className: "item", items: ["X", "Y"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<li class="item">X</li>');
      expect(result.html).toContain('<li class="item">Y</li>');
    });

    it("parses joinItems.php with variadic functions", () => {
      const meta = parsePhpFile(advanced("joinItems.php"));
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(2);
      const join = meta.functions.find((f) => f.name === "joinItems")!;
      expect(join.params[0]!.name).toBe("separator");
      expect(join.params[0]!.isVariadic).toBe(false);
      expect(join.params[1]!.name).toBe("items");
      expect(join.params[1]!.isVariadic).toBe(true);
      expect(join.params[1]!.type).toBe("string");
    });
  });

  // -------------------------------------------------------------------------
  // UC110: Union type parameters (string|int|null)
  // -------------------------------------------------------------------------
  describe("UC110: Union type params (FlexibleInput)", () => {
    it("renders with string value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexibleInput.php"),
        class: "App\\Components\\FlexibleInput",
        callable: "render",
        args: { name: "Email", value: "test@example.com", type: "email" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Email");
      expect(result.html).toContain("test@example.com");
      expect(result.html).toContain("flexible-input");
    });

    it("renders with integer value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexibleInput.php"),
        class: "App\\Components\\FlexibleInput",
        callable: "render",
        args: { name: "Age", value: 25, type: "number" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Age");
      expect(result.html).toContain("25");
    });

    it("renders with null value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexibleInput.php"),
        class: "App\\Components\\FlexibleInput",
        callable: "render",
        args: { name: "Optional", value: null },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Optional");
    });

    it("renders with maxLength and required", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FlexibleInput.php"),
        class: "App\\Components\\FlexibleInput",
        callable: "render",
        args: { name: "Bio", maxLength: 280, required: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('maxlength="280"');
      expect(result.html).toContain("required");
      expect(result.html).toContain("Max 280 characters");
    });

    it("parses FlexibleInput.php with union types", () => {
      const meta = parsePhpFile(advanced("FlexibleInput.php"));
      const cls = meta.classes.find((c) => c.name === "FlexibleInput")!;
      expect(cls.constructorParams).toHaveLength(5);
      const valueParam = cls.constructorParams.find((p) => p.name === "value")!;
      expect(valueParam.type).toBe("string|int|null");
      expect(valueParam.nullable).toBe(true);
      const maxParam = cls.constructorParams.find((p) => p.name === "maxLength")!;
      expect(maxParam.type).toBe("int|null");
      expect(maxParam.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC111: Changelog template
  // -------------------------------------------------------------------------
  describe("UC111: Changelog template", () => {
    it("renders changelog with entries", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/changelog.php"),
        class: null,
        callable: null,
        args: {
          version: "2.1.0",
          entries: [
            { type: "added", description: "Dark mode" },
            { type: "fixed", description: "Login bug" },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Changelog");
      expect(result.html).toContain("v2.1.0");
      expect(result.html).toContain("Added");
      expect(result.html).toContain("Dark mode");
      expect(result.html).toContain("Fixed");
      expect(result.html).toContain("Login bug");
    });

    it("renders compact changelog", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/changelog.php"),
        class: null,
        callable: null,
        args: {
          version: "1.0.1",
          compact: true,
          entries: [{ type: "fixed", description: "Crash on startup" }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("v1.0.1");
      expect(result.html).toContain("Crash on startup");
    });

    it("renders empty changelog", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/changelog.php"),
        class: null,
        callable: null,
        args: { version: "3.0.0", entries: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No changelog entries");
    });
  });

  // -------------------------------------------------------------------------
  // UC112: Float type parameters (FloatGauge)
  // -------------------------------------------------------------------------
  describe("UC112: Float type parameters", () => {
    it("renders gauge with float value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FloatGauge.php"),
        class: "App\\Components\\FloatGauge",
        callable: "render",
        args: { label: "Progress", value: 73.5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Progress");
      expect(result.html).toContain("73.5");
      expect(result.html).toContain("float-gauge");
    });

    it("renders gauge with custom unit and precision", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FloatGauge.php"),
        class: "App\\Components\\FloatGauge",
        callable: "render",
        args: { label: "CPU Temp", value: 67.3, min: 20.0, max: 105.0, unit: "°C", precision: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("CPU Temp");
      expect(result.html).toContain("67.3");
      expect(result.html).toContain("°C");
    });

    it("renders gauge with high precision", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FloatGauge.php"),
        class: "App\\Components\\FloatGauge",
        callable: "render",
        args: { label: "Accuracy", value: 99.847, precision: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("99.847");
    });

    it("clamps gauge percentage at boundaries", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FloatGauge.php"),
        class: "App\\Components\\FloatGauge",
        callable: "render",
        args: { label: "Over", value: 150.0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("150.0");
      expect(result.html).toContain("width: 100%");
    });

    it("parses FloatGauge.php with float params", () => {
      const meta = parsePhpFile(advanced("FloatGauge.php"));
      const cls = meta.classes.find((c) => c.name === "FloatGauge")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(6);
      const valueParam = cls.constructorParams.find((p) => p.name === "value")!;
      expect(valueParam.type).toBe("float");
      expect(valueParam.required).toBe(true);
      const minParam = cls.constructorParams.find((p) => p.name === "min")!;
      expect(minParam.type).toBe("float");
      expect(minParam.default).toBe("0.0");
      const precisionParam = cls.constructorParams.find((p) => p.name === "precision")!;
      expect(precisionParam.type).toBe("int");
    });
  });

  // -------------------------------------------------------------------------
  // UC113: Standalone readonly class (ReadonlyContact)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC113: Standalone readonly class", () => {
    it("renders contact card with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("ReadonlyContact.php"),
        class: "App\\Components\\ReadonlyContact",
        callable: "render",
        args: { name: "Jane Smith", email: "jane@example.com" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jane Smith");
      expect(result.html).toContain("jane@example.com");
      expect(result.html).toContain("Member");
      expect(result.html).toContain("contact-card");
    });

    it("renders contact card with role", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("ReadonlyContact.php"),
        class: "App\\Components\\ReadonlyContact",
        callable: "render",
        args: { name: "Alex Johnson", email: "alex@example.com", role: "Admin" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Admin");
    });

    it("renders initials when no avatar", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("ReadonlyContact.php"),
        class: "App\\Components\\ReadonlyContact",
        callable: "render",
        args: { name: "Jane Smith", email: "j@example.com" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("JS");
    });

    it("renders avatar image when provided", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("ReadonlyContact.php"),
        class: "App\\Components\\ReadonlyContact",
        callable: "render",
        args: { name: "Sam", email: "s@test.com", avatar: "https://example.com/photo.jpg" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<img");
      expect(result.html).toContain("https://example.com/photo.jpg");
    });

    it("parses ReadonlyContact as readonly class", () => {
      const meta = parsePhpFile(php82("ReadonlyContact.php"));
      const cls = meta.classes.find((c) => c.name === "ReadonlyContact")!;
      expect(cls).toBeDefined();
      expect(cls.isReadonly).toBe(true);
      expect(cls.constructorParams).toHaveLength(4);
      const avatarParam = cls.constructorParams.find((p) => p.name === "avatar")!;
      expect(avatarParam.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC114: Heredoc syntax (HeredocCard)
  // -------------------------------------------------------------------------
  describe("UC114: Heredoc syntax", () => {
    it("renders card with heredoc output", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("HeredocCard.php"),
        class: "App\\Components\\HeredocCard",
        callable: "render",
        args: { title: "Test Card", body: "Heredoc content here." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Card");
      expect(result.html).toContain("Heredoc content here.");
      expect(result.html).toContain("heredoc-card");
    });

    it("renders dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("HeredocCard.php"),
        class: "App\\Components\\HeredocCard",
        callable: "render",
        args: { title: "Dark", theme: "dark" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#1f2937");
    });

    it("renders with image block", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("HeredocCard.php"),
        class: "App\\Components\\HeredocCard",
        callable: "render",
        args: { title: "Featured", imageUrl: "https://example.com/img.jpg" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<img");
      expect(result.html).toContain("https://example.com/img.jpg");
    });

    it("parses HeredocCard.php correctly", () => {
      const meta = parsePhpFile(advanced("HeredocCard.php"));
      const cls = meta.classes.find((c) => c.name === "HeredocCard")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(4);
      const imageParam = cls.constructorParams.find((p) => p.name === "imageUrl")!;
      expect(imageParam.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC115: Enum with static method (EnumCompass)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC115: Enum with static and instance methods", () => {
    it("renders compass arrow via enum instance method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumCompass.php"),
        class: "App\\Components\\Compass",
        callable: "arrow",
        args: { _case: "N" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("compass");
      expect(result.html).toContain("North");
      expect(result.html).toContain("rotate(0deg)");
    });

    it("renders east compass arrow", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumCompass.php"),
        class: "App\\Components\\Compass",
        callable: "arrow",
        args: { _case: "E" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("East");
      expect(result.html).toContain("rotate(90deg)");
    });

    it("renders compass rose via static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("EnumCompass.php"),
        class: "App\\Components\\Compass",
        callable: "rose",
        args: { highlight: "E" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("compass-rose");
      expect(result.html).toContain("N");
      expect(result.html).toContain("E");
      expect(result.html).toContain("S");
      expect(result.html).toContain("W");
    });

    it("parses Compass enum with both static and instance methods", () => {
      const meta = parsePhpFile(php81("EnumCompass.php"));
      const cls = meta.classes.find((c) => c.name === "Compass")!;
      expect(cls).toBeDefined();
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["North", "East", "South", "West"]);
      const arrowMethod = cls.methods.find((m) => m.name === "arrow")!;
      expect(arrowMethod.isStatic).toBe(false);
      const roseMethod = cls.methods.find((m) => m.name === "rose")!;
      expect(roseMethod.isStatic).toBe(true);
      expect(roseMethod.params).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // UC116: Array type parameters (ArrayBadgeList)
  // -------------------------------------------------------------------------
  describe("UC116: Array type parameters", () => {
    it("renders badge list with items", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayBadgeList.php"),
        class: "App\\Components\\ArrayBadgeList",
        callable: "render",
        args: { items: ["PHP", "TypeScript", "Storybook"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("PHP");
      expect(result.html).toContain("TypeScript");
      expect(result.html).toContain("Storybook");
      expect(result.html).toContain("badge-list");
    });

    it("renders empty badge list", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayBadgeList.php"),
        class: "App\\Components\\ArrayBadgeList",
        callable: "render",
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No items");
    });

    it("renders with custom title and color", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayBadgeList.php"),
        class: "App\\Components\\ArrayBadgeList",
        callable: "render",
        args: { title: "Stack", items: ["Laravel", "React"], color: "#8b5cf6" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Stack");
      expect(result.html).toContain("#8b5cf6");
    });

    it("renders stacked layout", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ArrayBadgeList.php"),
        class: "App\\Components\\ArrayBadgeList",
        callable: "render",
        args: { items: ["A", "B"], inline: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("display: block");
    });

    it("parses ArrayBadgeList with array param", () => {
      const meta = parsePhpFile(advanced("ArrayBadgeList.php"));
      const cls = meta.classes.find((c) => c.name === "ArrayBadgeList")!;
      expect(cls).toBeDefined();
      const renderMethod = cls.methods.find((m) => m.name === "render")!;
      expect(renderMethod.params).toHaveLength(2);
      const itemsParam = renderMethod.params.find((p) => p.name === "items")!;
      expect(itemsParam.type).toBe("array");
    });
  });

  // -------------------------------------------------------------------------
  // UC118: Accordion template with iteration
  // -------------------------------------------------------------------------
  describe("UC118: Accordion template", () => {
    it("renders accordion with items", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/accordion.php"),
        class: null,
        callable: null,
        args: {
          items: [
            { title: "Question 1", content: "Answer 1" },
            { title: "Question 2", content: "Answer 2", open: true },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Question 1");
      expect(result.html).toContain("Answer 1");
      expect(result.html).toContain("Question 2");
      expect(result.html).toContain(" open");
    });

    it("renders bordered variant", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/accordion.php"),
        class: null,
        callable: null,
        args: {
          variant: "bordered",
          items: [{ title: "Features", content: "Many features." }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#3b82f6");
      expect(result.html).toContain("#eff6ff");
    });

    it("renders empty state", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/accordion.php"),
        class: null,
        callable: null,
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No items to display");
    });
  });

  // -------------------------------------------------------------------------
  // UC119: Steps template with numbered items
  // -------------------------------------------------------------------------
  describe("UC119: Steps template", () => {
    it("renders horizontal steps", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/steps.php"),
        class: null,
        callable: null,
        args: {
          current: 1,
          steps: [
            { label: "Account", description: "Create account" },
            { label: "Profile", description: "Set up profile" },
            { label: "Done" },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Account");
      expect(result.html).toContain("Profile");
      expect(result.html).toContain("Done");
      // First step should be done (green checkmark)
      expect(result.html).toContain("#22c55e");
      // Second step should be active (blue)
      expect(result.html).toContain("#3b82f6");
    });

    it("renders vertical steps", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/steps.php"),
        class: null,
        callable: null,
        args: {
          orientation: "vertical",
          current: 0,
          steps: [{ label: "First" }, { label: "Second" }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("flex-direction: column");
      expect(result.html).toContain("First");
      expect(result.html).toContain("Second");
    });

    it("renders all completed steps", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/steps.php"),
        class: null,
        callable: null,
        args: {
          current: 3,
          steps: [{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }],
        },
      });
      expect(result.error).toBeUndefined();
      // All should show checkmarks (green)
      expect(result.html).toContain("✓");
    });
  });

  // -------------------------------------------------------------------------
  // UC112-119: Vite plugin module generation
  // -------------------------------------------------------------------------
  describe("UC112-119: Vite plugin module generation", () => {
    const plugin = storybookPhpPlugin() as any;

    it("UC112: FloatGauge@render generates classMethod with float params", () => {
      const id = plugin.resolveId("./FloatGauge.php@render", advanced("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("type: 'float'");
    });

    it("UC113: ReadonlyContact@render generates classMethod for readonly class", () => {
      const id = plugin.resolveId("./ReadonlyContact.php@render", php82("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("ReadonlyContact");
    });

    it("UC114: HeredocCard@render generates classMethod", () => {
      const id = plugin.resolveId("./HeredocCard.php@render", advanced("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("HeredocCard");
    });

    it("UC115: EnumCompass@arrow generates enumMethod", () => {
      const id = plugin.resolveId("./EnumCompass.php@arrow", php81("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('__callable: "arrow"');
    });

    it("UC115: EnumCompass@rose generates staticMethod", () => {
      const id = plugin.resolveId("./EnumCompass.php@rose", php81("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('__callable: "rose"');
    });

    it("UC116: ArrayBadgeList@render generates classMethod with array param", () => {
      const id = plugin.resolveId("./ArrayBadgeList.php@render", advanced("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("type: 'array'");
    });

    it("UC118: ValueObject@render generates classMethod with readonly-no-visibility params", () => {
      const id = plugin.resolveId("./ValueObject.php@render", advanced("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("ValueObject");
      expect(code).toContain("id:");
      expect(code).toContain("value:");
      expect(code).toContain("unit:");
    });

    it("UC119: NewDefaults@render generates classMethod for new-expression default", () => {
      const id = plugin.resolveId("./NewDefaults.php@render", php81("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("StyledBox");
      expect(code).toContain("title:");
      expect(code).toContain("options:");
    });

    it("UC120: DnfParam@render generates classMethod for DNF type param", () => {
      const id = plugin.resolveId("./DnfParam.php@render", php82("Button.stories.ts"));
      const code = plugin.load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("DnfParam");
      expect(code).toContain("title:");
      expect(code).toContain("badge:");
      expect(code).toContain("compact:");
    });
  });

  // -------------------------------------------------------------------------
  // UC118: Readonly without visibility
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC118: Readonly without visibility", () => {
    it("renders ValueObject with all args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ValueObject.php"),
        class: "App\\Components\\ValueObject",
        callable: "render",
        args: { id: "temperature", value: 72, unit: "F" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("temperature");
      expect(result.html).toContain("72");
      expect(result.html).toContain("F");
    });

    it("renders ValueObject without optional unit", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ValueObject.php"),
        class: "App\\Components\\ValueObject",
        callable: "render",
        args: { id: "visitors", value: 1453 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("visitors");
      expect(result.html).toContain("1453");
    });

    it("parses ValueObject readonly-no-visibility params", () => {
      const meta = parsePhpFile(advanced("ValueObject.php"));
      const cls = meta.classes.find((c) => c.name === "ValueObject")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(3);
      const idParam = cls.constructorParams.find((p) => p.name === "id")!;
      expect(idParam.type).toBe("string");
      expect(idParam.isPromoted).toBe(true);
      expect(idParam.required).toBe(true);
      const unitParam = cls.constructorParams.find((p) => p.name === "unit")!;
      expect(unitParam.required).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // UC119: new expression in default parameter
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC119: New expression in default parameter", () => {
    it("renders StyledBox with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("NewDefaults.php"),
        class: "App\\Components\\StyledBox",
        callable: "render",
        args: { title: "Notice" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Notice");
      expect(result.html).toContain("#3b82f6");
      expect(result.html).toContain("styled-box");
    });

    it("renders StyledBox with content", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("NewDefaults.php"),
        class: "App\\Components\\StyledBox",
        callable: "render",
        args: { title: "Info", content: "Details here" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Info");
      expect(result.html).toContain("Details here");
    });

    it("parses StyledBox with new BoxOptions() default", () => {
      const meta = parsePhpFile(php81("NewDefaults.php"));
      const cls = meta.classes.find((c) => c.name === "StyledBox")!;
      expect(cls).toBeDefined();
      const optionsParam = cls.constructorParams.find((p) => p.name === "options")!;
      expect(optionsParam.type).toBe("BoxOptions");
      expect(optionsParam.required).toBe(false);
      expect(optionsParam.default).toContain("new BoxOptions()");
    });
  });

  // -------------------------------------------------------------------------
  // UC120: DNF (Disjunctive Normal Form) type parameters
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC120: DNF type parameters", () => {
    it("renders DnfParam with string badge", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("DnfParam.php"),
        class: "App\\Components\\DnfParam",
        callable: "render",
        args: { title: "Feature", badge: "new" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Feature");
      expect(result.html).toContain("new");
    });

    it("renders DnfParam with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("DnfParam.php"),
        class: "App\\Components\\DnfParam",
        callable: "render",
        args: { title: "DNF Types" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("DNF Types");
      expect(result.html).toContain("default");
    });

    it("renders DnfParam in compact mode", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("DnfParam.php"),
        class: "App\\Components\\DnfParam",
        callable: "render",
        args: { title: "Compact", badge: "beta", compact: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Compact");
      expect(result.html).toContain("beta");
      expect(result.html).toContain("font-size: 13px");
    });

    it("parses DnfParam with DNF type", () => {
      const meta = parsePhpFile(php82("DnfParam.php"));
      const cls = meta.classes.find((c) => c.name === "DnfParam")!;
      expect(cls).toBeDefined();
      const badgeParam = cls.constructorParams.find((p) => p.name === "badge")!;
      expect(badgeParam).toBeDefined();
      expect(badgeParam.required).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // UC121: Enum with constants
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC121: Enum with constants", () => {
    it("renders EnumConstant badge via enum instance method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumConstant.php"),
        class: "App\\Components\\EnumConstant",
        callable: "badge",
        args: { _case: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Success");
      expect(result.html).toContain("#22c55e");
    });

    it("renders EnumConstant warning badge", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumConstant.php"),
        class: "App\\Components\\EnumConstant",
        callable: "badge",
        args: { _case: "warning" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Warning");
      expect(result.html).toContain("#f59e0b");
    });

    it("renders EnumConstant danger badge", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumConstant.php"),
        class: "App\\Components\\EnumConstant",
        callable: "badge",
        args: { _case: "danger" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Danger");
      expect(result.html).toContain("#ef4444");
    });

    it("renders EnumConstant::all static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("EnumConstant.php"),
        class: "App\\Components\\EnumConstant",
        callable: "all",
        args: { separator: " " },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Success");
      expect(result.html).toContain("Warning");
      expect(result.html).toContain("Danger");
    });

    it("parses EnumConstant metadata", () => {
      const meta = parsePhpFile(php81("EnumConstant.php"));
      const cls = meta.classes.find((c) => c.name === "EnumConstant")!;
      expect(cls).toBeDefined();
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Success", "Warning", "Danger"]);
      expect(cls.methods).toHaveLength(2);
      const badge = cls.methods.find((m) => m.name === "badge")!;
      expect(badge.isStatic).toBe(false);
      const all = cls.methods.find((m) => m.name === "all")!;
      expect(all.isStatic).toBe(true);
      expect(all.params).toHaveLength(1);
    });

    it("generates virtual module for enum instance method", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./EnumConstant.php@badge", php81("EnumConstant.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("EnumConstant");
      expect(code).toContain("_case");
    });

    it("generates virtual module for enum static method", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./EnumConstant.php@all", php81("EnumConstantAll.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("EnumConstant");
    });
  });

  // -------------------------------------------------------------------------
  // UC122: Deep inheritance (3 levels)
  // -------------------------------------------------------------------------
  describe("UC122: Deep inheritance (3 levels)", () => {
    it("renders DetailWidget (deepest child)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DeepInheritance.php"),
        class: "App\\Components\\DetailWidget",
        callable: "render",
        args: { title: "Deep", message: "Three levels", footer: "Footer text" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Deep");
      expect(result.html).toContain("Three levels");
      expect(result.html).toContain("Footer text");
    });

    it("renders DetailWidget with dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DeepInheritance.php"),
        class: "App\\Components\\DetailWidget",
        callable: "render",
        args: { title: "Dark", theme: "dark", message: "Themed" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dark");
      expect(result.html).toContain("#1f2937");
    });

    it("renders InfoWidget (middle child)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DeepInheritance.php"),
        class: "App\\Components\\InfoWidget",
        callable: "render",
        args: { title: "Info", message: "Mid-level" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Info");
      expect(result.html).toContain("Mid-level");
    });

    it("parses deep inheritance hierarchy", () => {
      const meta = parsePhpFile(advanced("DeepInheritance.php"));
      expect(meta.classes).toHaveLength(3);

      const base = meta.classes.find((c) => c.name === "BaseWidget")!;
      expect(base.isAbstract).toBe(true);
      expect(base.constructorParams).toHaveLength(2);

      const info = meta.classes.find((c) => c.name === "InfoWidget")!;
      expect(info.extends).toBe("BaseWidget");
      expect(info.constructorParams).toHaveLength(3);

      const detail = meta.classes.find((c) => c.name === "DetailWidget")!;
      expect(detail.extends).toBe("InfoWidget");
      expect(detail.constructorParams).toHaveLength(4);
    });

    it("generates virtual modules for both concrete classes", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./DeepInheritance.php@render", advanced("DeepInheritance.stories.ts"));
      const code = load(id);
      expect(code).toContain("InfoWidget");
      expect(code).toContain("DetailWidget");
      // Should NOT contain BaseWidget (abstract)
      expect(code).not.toContain("export const BaseWidget");
    });
  });

  // -------------------------------------------------------------------------
  // UC123: Generator standalone functions
  // -------------------------------------------------------------------------
  describe("UC123: Generator standalone functions", () => {
    it("renders generateList function", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("generatorFunc.php"),
        class: null,
        callable: "App\\Helpers\\generateList",
        args: { title: "Shopping", count: 3, marker: "disc" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Shopping");
      expect(result.html).toContain("Item 1");
      expect(result.html).toContain("Item 2");
      expect(result.html).toContain("Item 3");
    });

    it("renders generateTable function", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("generatorFunc.php"),
        class: null,
        callable: "App\\Helpers\\generateTable",
        args: { rows: 2, cols: 2 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("R1C1");
      expect(result.html).toContain("R2C2");
    });

    it("parses generator functions", () => {
      const meta = parsePhpFile(advanced("generatorFunc.php"));
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(2);

      const genList = meta.functions.find((f) => f.name === "generateList")!;
      expect(genList).toBeDefined();
      expect(genList.params).toHaveLength(3);
      expect(genList.returnType).toBe("\\Generator");

      const genTable = meta.functions.find((f) => f.name === "generateTable")!;
      expect(genTable).toBeDefined();
      expect(genTable.params).toHaveLength(2);
      expect(genTable.returnType).toBe("\\Generator");
    });

    it("generates virtual modules for generator functions", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const listId = resolveId(
        "./generatorFunc.php@generateList",
        advanced("generatorFunc.stories.ts"),
      );
      const listCode = load(listId);
      expect(listCode).toContain("__type: 'function'");
      expect(listCode).toContain("generateList");

      const tableId = resolveId(
        "./generatorFunc.php@generateTable",
        advanced("generatorTable.stories.ts"),
      );
      const tableCode = load(tableId);
      expect(tableCode).toContain("__type: 'function'");
      expect(tableCode).toContain("generateTable");
    });
  });

  // -------------------------------------------------------------------------
  // UC124: Nowdoc syntax
  // -------------------------------------------------------------------------
  describe("UC124: Nowdoc syntax", () => {
    it("renders NowdocCard with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NowdocCard.php"),
        class: "App\\Components\\NowdocCard",
        callable: "render",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Card");
      expect(result.html).toContain("Content goes here.");
    });

    it("renders NowdocCard with custom values", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NowdocCard.php"),
        class: "App\\Components\\NowdocCard",
        callable: "render",
        args: { title: "Nowdoc", body: "Uses nowdoc syntax.", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Nowdoc");
      expect(result.html).toContain("Uses nowdoc syntax.");
      expect(result.html).toContain("#3b82f6");
    });

    it("parses NowdocCard correctly despite nowdoc syntax", () => {
      const meta = parsePhpFile(advanced("NowdocCard.php"));
      const cls = meta.classes.find((c) => c.name === "NowdocCard")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
    });
  });

  // -------------------------------------------------------------------------
  // UC125: Private constructor with static factories
  // -------------------------------------------------------------------------
  describe("UC125: Private constructor with static factories", () => {
    it("renders PrivateConstruct::success", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("PrivateConstruct.php"),
        class: "App\\Components\\PrivateConstruct",
        callable: "success",
        args: { message: "File saved." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("File saved.");
      expect(result.html).toContain("notice-success");
    });

    it("renders PrivateConstruct::error", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("PrivateConstruct.php"),
        class: "App\\Components\\PrivateConstruct",
        callable: "error",
        args: { message: "Connection lost." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Connection lost.");
      expect(result.html).toContain("notice-error");
    });

    it("renders PrivateConstruct::info with default", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("PrivateConstruct.php"),
        class: "App\\Components\\PrivateConstruct",
        callable: "info",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("notice-info");
    });

    it("parses PrivateConstruct with private constructor", () => {
      const meta = parsePhpFile(advanced("PrivateConstruct.php"));
      const cls = meta.classes.find((c) => c.name === "PrivateConstruct")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(3);
      // Static methods
      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(staticMethods).toHaveLength(3);
      expect(staticMethods.map((m) => m.name).sort()).toEqual(["error", "info", "success"]);
    });

    it("generates virtual modules for static factories", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const successId = resolveId(
        "./PrivateConstruct.php@success",
        advanced("PrivateConstruct.stories.ts"),
      );
      const successCode = load(successId);
      expect(successCode).toContain("__type: 'staticMethod'");

      const errorId = resolveId(
        "./PrivateConstruct.php@error",
        advanced("PrivateConstructError.stories.ts"),
      );
      const errorCode = load(errorId);
      expect(errorCode).toContain("__type: 'staticMethod'");

      const infoId = resolveId(
        "./PrivateConstruct.php@info",
        advanced("PrivateConstructInfo.stories.ts"),
      );
      const infoCode = load(infoId);
      expect(infoCode).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC126: Multiple enums in one file
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC126: Multiple enums in one file", () => {
    it("renders TextAlign preview", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("MultiEnum.php"),
        class: "App\\Components\\TextAlign",
        callable: "preview",
        args: { _case: "center", text: "Centered text" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("text-align: center");
      expect(result.html).toContain("Centered text");
    });

    it("renders FontWeight preview", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("MultiEnum.php"),
        class: "App\\Components\\FontWeight",
        callable: "preview",
        args: { _case: "700", text: "Bold text" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("font-weight: 700");
      expect(result.html).toContain("Bold text");
    });

    it("parses multiple enums from one file", () => {
      const meta = parsePhpFile(php81("MultiEnum.php"));
      expect(meta.classes).toHaveLength(2);

      const textAlign = meta.classes.find((c) => c.name === "TextAlign")!;
      expect(textAlign.isEnum).toBe(true);
      expect(textAlign.enumBackingType).toBe("string");
      expect(textAlign.enumCases).toEqual(["Left", "Center", "Right"]);

      const fontWeight = meta.classes.find((c) => c.name === "FontWeight")!;
      expect(fontWeight.isEnum).toBe(true);
      expect(fontWeight.enumBackingType).toBe("string");
      expect(fontWeight.enumCases).toEqual(["Light", "Normal", "Bold", "Black"]);
    });

    it("generates virtual module with both enums for shared method name", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./MultiEnum.php@preview", php81("MultiEnum.stories.ts"));
      const code = load(id);
      expect(code).toContain("TextAlign");
      expect(code).toContain("FontWeight");
      expect(code).toContain("__type: 'enumMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC127: Breadcrumb template (nested arrays)
  // -------------------------------------------------------------------------
  describe("UC127: Breadcrumb template", () => {
    it("renders breadcrumb with array items", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/breadcrumb.php"),
        class: null,
        callable: null,
        args: {
          items: [
            { label: "Home", url: "/" },
            { label: "Products", url: "/products" },
            { label: "Widget" },
          ],
          separator: "/",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Home");
      expect(result.html).toContain("Products");
      expect(result.html).toContain("Widget");
      expect(result.html).toContain("/");
    });

    it("renders breadcrumb with arrow separator", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/breadcrumb.php"),
        class: null,
        callable: null,
        args: {
          items: [{ label: "Dashboard", url: "/dash" }, { label: "Profile" }],
          separator: ">",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("Profile");
      expect(result.html).toContain("&gt;");
    });
  });

  // -------------------------------------------------------------------------
  // UC128: Modal template (boolean flags, match expression)
  // -------------------------------------------------------------------------
  describe("UC128: Modal template", () => {
    it("renders modal with all options", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/modal.php"),
        class: null,
        callable: null,
        args: {
          title: "Confirm",
          body: "Are you sure?",
          size: "medium",
          showClose: true,
          showFooter: true,
          confirmLabel: "Yes",
          cancelLabel: "No",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Confirm");
      expect(result.html).toContain("Are you sure?");
      expect(result.html).toContain("Yes");
      expect(result.html).toContain("No");
      expect(result.html).toContain("480px");
    });

    it("renders small modal without footer", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/modal.php"),
        class: null,
        callable: null,
        args: {
          title: "Note",
          body: "Small dialog.",
          size: "small",
          showClose: true,
          showFooter: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Note");
      expect(result.html).toContain("320px");
      // Footer should not be present
      expect(result.html).not.toContain("modal-footer");
    });

    it("renders large modal without close button", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/modal.php"),
        class: null,
        callable: null,
        args: {
          title: "Delete",
          body: "This is permanent.",
          size: "large",
          showClose: false,
          showFooter: true,
          confirmLabel: "Delete",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("640px");
      expect(result.html).toContain("Delete");
    });
  });

  // -------------------------------------------------------------------------
  // UC121-128: Vite plugin virtual module generation
  // -------------------------------------------------------------------------
  describe("Vite plugin: UC121-UC128 virtual modules", () => {
    const plugin = storybookPhpPlugin({});
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it("generates template module for breadcrumb template", () => {
      const id = resolveId(
        "../templates/breadcrumb.php",
        resolve(advancedDir, "templates/breadcrumb.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'template'");
    });

    it("generates template module for modal template", () => {
      const id = resolveId(
        "../templates/modal.php",
        resolve(advancedDir, "templates/modal.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'template'");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: new fixture metadata
  // -------------------------------------------------------------------------
  describe("Parser: UC121-UC128 fixture metadata", () => {
    it("parses EnumConstant fixture", () => {
      const meta = parsePhpFile(fixture("EnumConstant.php"));
      const cls = meta.classes.find((c) => c.name === "EnumConstant")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumCases).toEqual(["Success", "Warning", "Danger"]);
      const badge = cls.methods.find((m) => m.name === "badge")!;
      expect(badge.isStatic).toBe(false);
      const all = cls.methods.find((m) => m.name === "all")!;
      expect(all.isStatic).toBe(true);
    });

    it("parses DeepInheritance fixture", () => {
      const meta = parsePhpFile(fixture("DeepInheritance.php"));
      expect(meta.classes).toHaveLength(3);
      const base = meta.classes.find((c) => c.name === "BaseWidget")!;
      expect(base.isAbstract).toBe(true);
      const detail = meta.classes.find((c) => c.name === "DetailWidget")!;
      expect(detail.extends).toBe("InfoWidget");
      expect(detail.constructorParams).toHaveLength(4);
    });

    it("parses GeneratorFunc fixture", () => {
      const meta = parsePhpFile(fixture("GeneratorFunc.php"));
      expect(meta.functions).toHaveLength(2);
      expect(meta.functions[0]!.name).toBe("generateList");
      expect(meta.functions[0]!.returnType).toBe("\\Generator");
      expect(meta.functions[1]!.name).toBe("generateTable");
      expect(meta.functions[1]!.returnType).toBe("\\Generator");
    });

    it("parses NowdocCard fixture", () => {
      const meta = parsePhpFile(fixture("NowdocCard.php"));
      const cls = meta.classes.find((c) => c.name === "NowdocCard")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.methods[0]!.name).toBe("render");
    });

    it("parses PrivateConstruct fixture", () => {
      const meta = parsePhpFile(fixture("PrivateConstruct.php"));
      const cls = meta.classes.find((c) => c.name === "PrivateConstruct")!;
      expect(cls.constructorParams).toHaveLength(3);
      // private constructor params
      const typeParam = cls.constructorParams.find((p) => p.name === "type")!;
      expect(typeParam.visibility).toBe("private");
      // Static methods only (private html() excluded since it's private but still extracted)
      const publicStatic = cls.methods.filter((m) => m.isStatic && m.visibility === "public");
      expect(publicStatic).toHaveLength(3);
    });

    it("parses MultiEnum fixture with two enums", () => {
      const meta = parsePhpFile(fixture("MultiEnum.php"));
      expect(meta.classes).toHaveLength(2);

      const textAlign = meta.classes.find((c) => c.name === "TextAlign")!;
      expect(textAlign.isEnum).toBe(true);
      expect(textAlign.enumCases).toEqual(["Left", "Center", "Right"]);

      const fontWeight = meta.classes.find((c) => c.name === "FontWeight")!;
      expect(fontWeight.isEnum).toBe(true);
      expect(fontWeight.enumCases).toEqual(["Light", "Normal", "Bold", "Black"]);
    });

    it("parses AbstractFactory fixture", () => {
      const meta = parsePhpFile(fixture("AbstractFactory.php"));
      expect(meta.classes).toHaveLength(2);

      const abstract = meta.classes.find((c) => c.name === "AbstractFactory")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.constructorParams).toHaveLength(2);
      const staticMethods = abstract.methods.filter((m) => m.isStatic);
      expect(staticMethods).toHaveLength(2);
      expect(staticMethods.map((m) => m.name).sort()).toEqual(["outline", "pill"]);

      const concrete = meta.classes.find((c) => c.name === "ConcreteBadge")!;
      expect(concrete.isAbstract).toBe(false);
      expect(concrete.extends).toBe("AbstractFactory");
    });
  });

  // -------------------------------------------------------------------------
  // UC129: Abstract class with static factory methods
  // -------------------------------------------------------------------------
  describe("UC129: Abstract class with static factory methods", () => {
    it("renders AbstractFactory::pill (static on abstract class)", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("AbstractFactory.php"),
        class: "App\\Components\\AbstractFactory",
        callable: "pill",
        args: { label: "Active", color: "#22c55e" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Active");
      expect(result.html).toContain("pill");
    });

    it("renders AbstractFactory::outline (static on abstract class)", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("AbstractFactory.php"),
        class: "App\\Components\\AbstractFactory",
        callable: "outline",
        args: { label: "Draft" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Draft");
      expect(result.html).toContain("outline");
    });

    it("renders ConcreteBadge (subclass instance method)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractFactory.php"),
        class: "App\\Components\\ConcreteBadge",
        callable: "render",
        args: { label: "Online", color: "#22c55e" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Online");
      expect(result.html).toContain("concrete-badge");
    });

    it("generates virtual module for abstract static method (pill)", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./AbstractFactory.php@pill", advanced("AbstractFactory.stories.ts"));
      const code = load(id);
      // Should contain AbstractFactory for the static method
      expect(code).toContain("AbstractFactory");
      expect(code).toContain("__type: 'staticMethod'");
      // Should NOT contain ConcreteBadge (pill is not on ConcreteBadge)
      expect(code).not.toContain("ConcreteBadge");
    });

    it("generates virtual module for render (only concrete subclass)", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(
        "./AbstractFactory.php@render",
        advanced("AbstractFactoryBadge.stories.ts"),
      );
      const code = load(id);
      // Should contain ConcreteBadge for the instance method
      expect(code).toContain("ConcreteBadge");
      expect(code).toContain("__type: 'classMethod'");
      // Should NOT export AbstractFactory as classMethod (it's abstract)
      expect(code).not.toContain("export const AbstractFactory");
    });
  });

  // -------------------------------------------------------------------------
  // UC130: Mixed visibility constructor (public + private + protected promoted)
  // -------------------------------------------------------------------------
  describe("UC130: Mixed visibility constructor", () => {
    it("renders MixedVisibility with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MixedVisibility.php"),
        class: "App\\Components\\MixedVisibility",
        callable: "render",
        args: { label: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mixed-vis");
      expect(result.html).toContain("Hello");
    });

    it("renders MixedVisibility with truncation", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MixedVisibility.php"),
        class: "App\\Components\\MixedVisibility",
        callable: "render",
        args: {
          label: "This is a very long label that exceeds the max length",
          truncate: true,
          maxLength: 20,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("...");
    });

    it("renders MixedVisibility with private variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MixedVisibility.php"),
        class: "App\\Components\\MixedVisibility",
        callable: "render",
        args: { label: "Test", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mixed-vis-primary");
    });

    it("parses MixedVisibility with mixed visibility params", () => {
      const meta = parsePhpFile(advanced("MixedVisibility.php"));
      const cls = meta.classes.find((c) => c.name === "MixedVisibility")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(4);

      const label = cls.constructorParams.find((p) => p.name === "label")!;
      expect(label.visibility).toBe("public");
      expect(label.isPromoted).toBe(true);

      const variant = cls.constructorParams.find((p) => p.name === "variant")!;
      expect(variant.visibility).toBe("private");
      expect(variant.isPromoted).toBe(true);

      const maxLength = cls.constructorParams.find((p) => p.name === "maxLength")!;
      expect(maxLength.visibility).toBe("protected");
      expect(maxLength.isPromoted).toBe(true);

      const truncate = cls.constructorParams.find((p) => p.name === "truncate")!;
      expect(truncate.visibility).toBe("public");
    });

    it("generates virtual module for MixedVisibility", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./MixedVisibility.php@render", advanced("MixedVisibility.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("variant:");
      expect(code).toContain("maxLength:");
      expect(code).toContain("truncate:");
    });
  });

  // -------------------------------------------------------------------------
  // UC131: No-parameter render method (constructor-only args)
  // -------------------------------------------------------------------------
  describe("UC131: No-parameter render method", () => {
    it("renders NoParamClock with default timezone", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NoParamClock.php"),
        class: "App\\Components\\NoParamClock",
        callable: "render",
        args: { timezone: "UTC" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("clock");
      expect(result.html).toContain("UTC");
    });

    it("renders NoParamClock with custom timezone", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NoParamClock.php"),
        class: "App\\Components\\NoParamClock",
        callable: "render",
        args: { timezone: "Asia/Tokyo", format: "Y-m-d H:i" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("clock");
      expect(result.html).toContain("Asia/Tokyo");
    });

    it("parses NoParamClock render method with no params", () => {
      const meta = parsePhpFile(advanced("NoParamClock.php"));
      const cls = meta.classes.find((c) => c.name === "NoParamClock")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(2);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render).toBeDefined();
      expect(render.params).toHaveLength(0);
    });

    it("generates virtual module with empty callableArgs", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./NoParamClock.php@render", advanced("NoParamClock.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("timezone:"); // ctor arg
      expect(code).toContain("format:"); // ctor arg
      expect(code).toContain("__callableArgs: {}"); // no method args
    });
  });

  // -------------------------------------------------------------------------
  // UC132: Complex array default values in standalone function
  // -------------------------------------------------------------------------
  describe("UC132: Complex array defaults in function", () => {
    it("renders complexList with default items", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("complexList.php"),
        class: null,
        callable: "App\\Helpers\\complexList",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("complex-list");
      expect(result.html).toContain("Item 1");
      expect(result.html).toContain("Item 2");
      expect(result.html).toContain("Item 3");
    });

    it("renders complexList with custom items", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("complexList.php"),
        class: null,
        callable: "App\\Helpers\\complexList",
        args: { items: ["Alpha", "Beta"], style: "decimal" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alpha");
      expect(result.html).toContain("Beta");
      expect(result.html).toContain("decimal");
    });

    it("parses complexList function with array default", () => {
      const meta = parsePhpFile(advanced("complexList.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("complexList");
      expect(fn.fqn).toBe("App\\Helpers\\complexList");
      expect(fn.params).toHaveLength(3);

      const items = fn.params.find((p) => p.name === "items")!;
      expect(items.type).toBe("array");
      expect(items.required).toBe(false);
      expect(items.default).toBeDefined();
    });

    it("generates virtual module for complexList", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./complexList.php@complexList", advanced("complexList.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("App\\\\Helpers\\\\complexList");
      expect(code).toContain("items:");
      expect(code).toContain("style:");
      expect(code).toContain("compact:");
    });
  });

  // -------------------------------------------------------------------------
  // UC133: Enum implementing multiple interfaces
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC133: Enum implementing multiple interfaces", () => {
    it("renders EnumMultiInterface::menuItem for Home", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumMultiInterface.php"),
        class: "App\\Components\\EnumMultiInterface",
        callable: "menuItem",
        args: { _case: "home" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("menu-item-home");
      expect(result.html).toContain("Home");
    });

    it("renders EnumMultiInterface::menuItem for Logout", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumMultiInterface.php"),
        class: "App\\Components\\EnumMultiInterface",
        callable: "menuItem",
        args: { _case: "logout" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("menu-item-logout");
      expect(result.html).toContain("Log Out");
    });

    it("renders EnumMultiInterface::icon for Settings", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumMultiInterface.php"),
        class: "App\\Components\\EnumMultiInterface",
        callable: "icon",
        args: { _case: "settings" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("enum-icon-settings");
    });

    it("parses EnumMultiInterface with multiple implements", () => {
      const meta = parsePhpFile(php81("EnumMultiInterface.php"));
      const cls = meta.classes.find((c) => c.name === "EnumMultiInterface")!;
      expect(cls).toBeDefined();
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.implements).toContain("HasLabel");
      expect(cls.implements).toContain("HasIcon");
      expect(cls.enumCases).toEqual(["Home", "Settings", "Profile", "Logout"]);
      expect(cls.methods).toHaveLength(3);
    });

    it("generates virtual module for enum instance method", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(
        "./EnumMultiInterface.php@menuItem",
        php81("EnumMultiInterface.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
    });
  });

  // -------------------------------------------------------------------------
  // UC134: Nested template (template including sub-template)
  // -------------------------------------------------------------------------
  describe("UC134: Nested template with include", () => {
    it("renders nested template with badge partial", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/nested.php"),
        class: null,
        callable: null,
        args: {
          heading: "Features",
          badgeText: "New",
          badgeColor: "#22c55e",
          content: "Nested content here",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("nested-template");
      expect(result.html).toContain("Features");
      expect(result.html).toContain("partial-badge");
      expect(result.html).toContain("New");
      expect(result.html).toContain("Nested content here");
    });

    it("renders nested template without badge", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/nested.php"),
        class: null,
        callable: null,
        args: { heading: "Simple", content: "No badge" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("nested-template");
      expect(result.html).toContain("Simple");
      expect(result.html).not.toContain("partial-badge");
    });
  });

  // -------------------------------------------------------------------------
  // UC135: Class with both static factory AND instance methods
  // -------------------------------------------------------------------------
  describe("UC135: Static factory + instance method on same class", () => {
    it("renders StaticInstance via instance render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("StaticInstance.php"),
        class: "App\\Components\\StaticInstance",
        callable: "render",
        args: { content: "Instance card", type: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("si-card-success");
      expect(result.html).toContain("Instance card");
    });

    it("renders StaticInstance via static fromMarkdown()", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("StaticInstance.php"),
        class: "App\\Components\\StaticInstance",
        callable: "fromMarkdown",
        args: { text: "Static content" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("si-markdown");
      expect(result.html).toContain("Static content");
    });

    it("renders StaticInstance via static fromMarkdown() with bold", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("StaticInstance.php"),
        class: "App\\Components\\StaticInstance",
        callable: "fromMarkdown",
        args: { text: "Bold text", bold: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<strong>Bold text</strong>");
    });

    it("generates classMethod module for render()", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./StaticInstance.php@render", advanced("StaticInstance.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("content:");
      expect(code).toContain("type:");
    });

    it("generates staticMethod module for fromMarkdown()", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(
        "./StaticInstance.php@fromMarkdown",
        advanced("StaticInstanceMarkdown.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("text:");
      expect(code).toContain("bold:");
    });

    it("parses StaticInstance with both method types", () => {
      const meta = parsePhpFile(advanced("StaticInstance.php"));
      const cls = meta.classes.find((c) => c.name === "StaticInstance")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.methods).toHaveLength(2);

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);

      const fromMarkdown = cls.methods.find((m) => m.name === "fromMarkdown")!;
      expect(fromMarkdown.isStatic).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Parser: fixture metadata for new patterns
  // -------------------------------------------------------------------------
  describe("Parser: UC130-UC135 fixture metadata", () => {
    it("parses MixedVisibility fixture", () => {
      const meta = parsePhpFile(fixture("MixedVisibility.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MixedVisibility");
      expect(cls.constructorParams).toHaveLength(4);
      expect(cls.constructorParams[0]!.visibility).toBe("public");
      expect(cls.constructorParams[1]!.visibility).toBe("private");
      expect(cls.constructorParams[2]!.visibility).toBe("protected");
      expect(cls.constructorParams[3]!.visibility).toBe("public");
    });

    it("parses NoParamClock fixture", () => {
      const meta = parsePhpFile(fixture("NoParamClock.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("NoParamClock");
      expect(cls.constructorParams).toHaveLength(2);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(0);
    });

    it("parses ComplexDefaults fixture", () => {
      const meta = parsePhpFile(fixture("ComplexDefaults.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("complexList");
      expect(fn.params).toHaveLength(3);
      expect(fn.params[0]!.type).toBe("array");
      expect(fn.params[0]!.required).toBe(false);
    });

    it("parses EnumMultiInterface fixture", () => {
      const meta = parsePhpFile(fixture("EnumMultiInterface.php"));
      const cls = meta.classes.find((c) => c.name === "EnumMultiInterface")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.implements).toContain("HasLabel");
      expect(cls.implements).toContain("HasIcon");
      expect(cls.enumCases).toEqual(["Home", "Settings", "Profile", "Logout"]);
    });

    it("parses StaticInstance fixture", () => {
      const meta = parsePhpFile(fixture("StaticInstance.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StaticInstance");
      const instanceMethods = cls.methods.filter((m) => !m.isStatic);
      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(instanceMethods).toHaveLength(1);
      expect(staticMethods).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // UC136: Pure enum with method params (Suit)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC136: Pure enum with method params", () => {
    it("renders Suit card with rank param", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Suit.php"),
        class: "App\\Components\\Suit",
        callable: "card",
        args: { _case: "Spades", rank: "A" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("A");
      expect(result.html).toContain("playing-card");
    });

    it("renders pure enum without backing value (name-based matching)", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Suit.php"),
        class: "App\\Components\\Suit",
        callable: "card",
        args: { _case: "Hearts", rank: "Q" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Q");
      expect(result.html).toContain("#ef4444");
    });

    it("renders with default rank param", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Suit.php"),
        class: "App\\Components\\Suit",
        callable: "card",
        args: { _case: "Diamonds" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("A");
    });

    it("parses Suit pure enum", () => {
      const meta = parsePhpFile(php81("Suit.php"));
      const cls = meta.classes.find((c) => c.name === "Suit")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBeNull();
      expect(cls.enumCases).toEqual(["Hearts", "Diamonds", "Clubs", "Spades"]);
      const cardMethod = cls.methods.find((m) => m.name === "card")!;
      expect(cardMethod.params).toHaveLength(1);
      expect(cardMethod.params[0]!.name).toBe("rank");
    });

    it("generates enumMethod module for Suit", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./Suit.php@card", php81("Suit.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("rank:");
      expect(code).toContain("_case:");
    });
  });

  // -------------------------------------------------------------------------
  // UC137: PHP 8.2 standalone types (true, false, null)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC137: PHP 8.2 standalone types", () => {
    it("renders StandaloneTypes with true/false params", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("StandaloneTypes.php"),
        class: "App\\Components\\StandaloneTypes",
        callable: "render",
        args: { label: "Test Button", variant: "primary", visible: true, disabled: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Button");
      expect(result.html).toContain("btn-primary");
    });

    it("renders with defaults for standalone types", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("StandaloneTypes.php"),
        class: "App\\Components\\StandaloneTypes",
        callable: "render",
        args: { label: "Default", variant: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Default");
      expect(result.html).toContain("btn-success");
    });

    it("parses standalone types from fixture", () => {
      const meta = parsePhpFile(fixture("StandaloneTypes.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StandaloneTypes");
      const params = cls.constructorParams;
      expect(params).toHaveLength(3);
      expect(params[0]!.type).toBe("string");
      expect(params[1]!.type).toBe("true");
      expect(params[2]!.type).toBe("false");
    });

    it("parses standalone types from example", () => {
      const meta = parsePhpFile(php82("StandaloneTypes.php"));
      const cls = meta.classes[0]!;
      expect(cls.constructorParams).toHaveLength(4);
      const visible = cls.constructorParams.find((p) => p.name === "visible")!;
      expect(visible.type).toBe("true");
      expect(visible.required).toBe(false);
      const disabled = cls.constructorParams.find((p) => p.name === "disabled")!;
      expect(disabled.type).toBe("false");
      expect(disabled.required).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // UC138: Deeply nested namespace
  // -------------------------------------------------------------------------
  describe("UC138: Deeply nested namespace", () => {
    it("renders TextInput from nested namespace", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NestedNamespace.php"),
        class: "App\\UI\\Components\\Form\\TextInput",
        callable: "render",
        args: { name: "email", label: "Email", placeholder: "you@example.com" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Email");
      expect(result.html).toContain("you@example.com");
      expect(result.html).toContain("form-field");
    });

    it("renders with required flag", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NestedNamespace.php"),
        class: "App\\UI\\Components\\Form\\TextInput",
        callable: "render",
        args: { name: "password", required: true, helpText: "Min 8 characters" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("*");
      expect(result.html).toContain("Min 8 characters");
    });

    it("parses deeply nested namespace", () => {
      const meta = parsePhpFile(fixture("NestedNamespace.php"));
      expect(meta.namespace).toBe("App\\UI\\Components\\Form");
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("TextInput");
      expect(cls.fqn).toBe("App\\UI\\Components\\Form\\TextInput");
    });

    it("generates module with nested namespace FQN", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./NestedNamespace.php@render", advanced("NestedNamespace.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("App\\\\UI\\\\Components\\\\Form\\\\TextInput");
    });
  });

  // -------------------------------------------------------------------------
  // UC139: Multiple render methods on same class
  // -------------------------------------------------------------------------
  describe("UC139: Multiple render methods", () => {
    it("renders via render() method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MultiRender.php"),
        class: "App\\Components\\MultiRender",
        callable: "render",
        args: { title: "Feature", description: "A great feature", icon: "🚀" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("multi-default");
      expect(result.html).toContain("Feature");
      expect(result.html).toContain("🚀");
    });

    it("renders via renderCard() method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MultiRender.php"),
        class: "App\\Components\\MultiRender",
        callable: "renderCard",
        args: { title: "Dashboard", description: "Analytics", footer: "Updated 5m ago" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("multi-card");
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("Updated 5m ago");
    });

    it("renders via renderRow() method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MultiRender.php"),
        class: "App\\Components\\MultiRender",
        callable: "renderRow",
        args: { title: "Users", description: "1,234 active", striped: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Users");
      expect(result.html).toContain("1,234 active");
      expect(result.html).toContain("#f9fafb");
    });

    it("parses MultiRender with 3 public methods", () => {
      const meta = parsePhpFile(advanced("MultiRender.php"));
      const cls = meta.classes.find((c) => c.name === "MultiRender")!;
      expect(cls).toBeDefined();
      expect(cls.methods).toHaveLength(3);
      expect(cls.methods.map((m) => m.name).sort()).toEqual(["render", "renderCard", "renderRow"]);
    });

    it("generates separate modules per method", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const idRender = resolveId("./MultiRender.php@render", advanced("MultiRender.stories.ts"));
      const codeRender = load(idRender);
      expect(codeRender).toContain('__callable: "render"');

      const idCard = resolveId(
        "./MultiRender.php@renderCard",
        advanced("MultiRenderCard.stories.ts"),
      );
      const codeCard = load(idCard);
      expect(codeCard).toContain('__callable: "renderCard"');
      expect(codeCard).toContain("footer:");

      const idRow = resolveId("./MultiRender.php@renderRow", advanced("MultiRenderRow.stories.ts"));
      const codeRow = load(idRow);
      expect(codeRow).toContain('__callable: "renderRow"');
      expect(codeRow).toContain("striped:");
    });
  });

  // -------------------------------------------------------------------------
  // UC140: Enum with both static + instance methods
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC140: Enum with static + instance methods", () => {
    it("renders badge via enum instance method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumStaticInstance.php"),
        class: "App\\Components\\EnumStaticInstance",
        callable: "badge",
        args: { _case: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("esi-badge-success");
      expect(result.html).toContain("Success");
    });

    it("renders alert via enum instance method with params", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumStaticInstance.php"),
        class: "App\\Components\\EnumStaticInstance",
        callable: "render",
        args: { _case: "error", message: "Something went wrong!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("esi-alert-error");
      expect(result.html).toContain("Something went wrong!");
    });

    it("renders all badges via static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("EnumStaticInstance.php"),
        class: "App\\Components\\EnumStaticInstance",
        callable: "all",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("esi-all");
      expect(result.html).toContain("esi-badge-info");
      expect(result.html).toContain("esi-badge-error");
    });

    it("parses enum with both method types", () => {
      const meta = parsePhpFile(php81("EnumStaticInstance.php"));
      const cls = meta.classes.find((c) => c.name === "EnumStaticInstance")!;
      expect(cls.isEnum).toBe(true);
      const instanceMethods = cls.methods.filter((m) => !m.isStatic);
      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(instanceMethods).toHaveLength(2);
      expect(staticMethods).toHaveLength(1);
    });

    it("generates enumMethod module for badge", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(
        "./EnumStaticInstance.php@badge",
        php81("EnumStaticInstance.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
    });

    it("generates staticMethod module for all", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(
        "./EnumStaticInstance.php@all",
        php81("EnumStaticInstanceAll.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC141: Class with enum-typed constructor parameter
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC141: Enum-typed constructor parameter", () => {
    it("renders with default theme (Light)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumTypedConstructor.php"),
        class: "App\\Components\\EnumTypedConstructor",
        callable: "render",
        args: { content: "Hello world" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello world");
      expect(result.html).toContain("themed-light");
      expect(result.html).toContain("#ffffff");
    });

    it("renders with dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumTypedConstructor.php"),
        class: "App\\Components\\EnumTypedConstructor",
        callable: "render",
        args: { content: "Dark mode", theme: "dark", size: "lg" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dark mode");
      expect(result.html).toContain("themed-dark");
      expect(result.html).toContain("#1f2937");
    });

    it("renders with system theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumTypedConstructor.php"),
        class: "App\\Components\\EnumTypedConstructor",
        callable: "render",
        args: { content: "System theme", theme: "system" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("themed-system");
    });

    it("parses EnumTypedConstructor with enum param", () => {
      const meta = parsePhpFile(php81("EnumTypedConstructor.php"));
      const cls = meta.classes.find((c) => c.name === "EnumTypedConstructor")!;
      expect(cls).toBeDefined();
      const themeParam = cls.constructorParams.find((p) => p.name === "theme")!;
      expect(themeParam.type).toBe("Theme");
      expect(themeParam.required).toBe(false);
    });

    it("parses Theme enum in same file", () => {
      const meta = parsePhpFile(php81("EnumTypedConstructor.php"));
      const enumCls = meta.classes.find((c) => c.name === "Theme")!;
      expect(enumCls.isEnum).toBe(true);
      expect(enumCls.enumBackingType).toBe("string");
      expect(enumCls.enumCases).toEqual(["Light", "Dark", "System"]);
    });
  });

  // -------------------------------------------------------------------------
  // Parser: UC136-UC141 fixture metadata
  // -------------------------------------------------------------------------
  describe("Parser: UC136-UC141 fixture metadata", () => {
    it("parses StandaloneTypes fixture", () => {
      const meta = parsePhpFile(fixture("StandaloneTypes.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StandaloneTypes");
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[1]!.type).toBe("true");
      expect(cls.constructorParams[2]!.type).toBe("false");
    });

    it("parses NestedNamespace fixture", () => {
      const meta = parsePhpFile(fixture("NestedNamespace.php"));
      expect(meta.namespace).toBe("App\\UI\\Components\\Form");
      const cls = meta.classes[0]!;
      expect(cls.fqn).toBe("App\\UI\\Components\\Form\\TextInput");
      expect(cls.constructorParams).toHaveLength(4);
    });

    it("parses MultiRender fixture", () => {
      const meta = parsePhpFile(fixture("MultiRender.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MultiRender");
      expect(cls.methods).toHaveLength(3);
      expect(cls.methods.map((m) => m.name).sort()).toEqual([
        "render",
        "renderCompact",
        "renderDetailed",
      ]);
      const detailed = cls.methods.find((m) => m.name === "renderDetailed")!;
      expect(detailed.params).toHaveLength(1);
      expect(detailed.params[0]!.name).toBe("footer");
    });

    it("parses EnumStaticInstance fixture", () => {
      const meta = parsePhpFile(fixture("EnumStaticInstance.php"));
      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumCases).toEqual(["Info", "Warning", "Error"]);
      const statics = cls.methods.filter((m) => m.isStatic);
      const instances = cls.methods.filter((m) => !m.isStatic);
      expect(statics).toHaveLength(1);
      expect(instances).toHaveLength(1);
    });

    it("parses EnumTypedConstructor fixture", () => {
      const meta = parsePhpFile(fixture("EnumTypedConstructor.php"));
      const enumCls = meta.classes.find((c) => c.name === "Theme")!;
      expect(enumCls.isEnum).toBe(true);
      expect(enumCls.enumCases).toEqual(["Light", "Dark", "System"]);

      const cls = meta.classes.find((c) => c.name === "EnumTypedConstructor")!;
      expect(cls.constructorParams).toHaveLength(2);
      const themeParam = cls.constructorParams.find((p) => p.name === "theme")!;
      expect(themeParam.type).toBe("Theme");
    });
  });

  // -------------------------------------------------------------------------
  // UC142: Echo-based enum method (void return)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC142: Echo-based enum method", () => {
    it("renders echo-based enum alert for success", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EchoEnum.php"),
        class: "App\\Components\\EchoEnum",
        callable: "alert",
        args: { _case: "success", message: "Done!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-enum-success");
      expect(result.html).toContain("Done!");
      expect(result.html).toContain("Success");
    });

    it("renders echo-based enum alert with dismissible flag", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EchoEnum.php"),
        class: "App\\Components\\EchoEnum",
        callable: "alert",
        args: { _case: "error", message: "Something failed.", dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-enum-error");
      expect(result.html).toContain("Something failed.");
      expect(result.html).toContain("&times;");
    });

    it("renders without dismissible button by default", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EchoEnum.php"),
        class: "App\\Components\\EchoEnum",
        callable: "alert",
        args: { _case: "warning", message: "Check this." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-enum-warning");
      expect(result.html).not.toContain("&times;");
    });

    it("parses EchoEnum with void method", () => {
      const meta = parsePhpFile(php81("EchoEnum.php"));
      const cls = meta.classes.find((c) => c.name === "EchoEnum")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Success", "Error", "Warning", "Info"]);
      const alertMethod = cls.methods.find((m) => m.name === "alert")!;
      expect(alertMethod.params).toHaveLength(2);
      expect(alertMethod.returnType).toBe("void");
    });

    it("generates enumMethod module for EchoEnum", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./EchoEnum.php@alert", php81("EchoEnum.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("message:");
      expect(code).toContain("dismissible:");
    });
  });

  // -------------------------------------------------------------------------
  // UC143: Invocable class with echo (void __invoke)
  // -------------------------------------------------------------------------
  describe("UC143: Invocable echo class", () => {
    it("renders invocable echo with defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("InvocableEcho.php"),
        class: "App\\Components\\InvocableEcho",
        callable: "__invoke",
        args: { message: "Hello world" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("invocable-echo-info");
      expect(result.html).toContain("Note:");
      expect(result.html).toContain("Hello world");
    });

    it("renders invocable echo with custom prefix and variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("InvocableEcho.php"),
        class: "App\\Components\\InvocableEcho",
        callable: "__invoke",
        args: { prefix: "Alert", variant: "error", message: "Oops!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("invocable-echo-error");
      expect(result.html).toContain("Alert:");
      expect(result.html).toContain("Oops!");
    });

    it("renders invocable echo without icon", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("InvocableEcho.php"),
        class: "App\\Components\\InvocableEcho",
        callable: "__invoke",
        args: { message: "Plain text", showIcon: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Plain text");
      expect(result.html).toContain("Note:");
    });

    it("parses InvocableEcho with __invoke void", () => {
      const meta = parsePhpFile(advanced("InvocableEcho.php"));
      const cls = meta.classes.find((c) => c.name === "InvocableEcho")!;
      expect(cls).toBeDefined();
      expect(cls.constructorParams).toHaveLength(2);
      const invoke = cls.methods.find((m) => m.name === "__invoke")!;
      expect(invoke).toBeDefined();
      expect(invoke.params).toHaveLength(2);
      expect(invoke.returnType).toBe("void");
    });

    it("generates classMethod module for __invoke", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./InvocableEcho.php@__invoke", advanced("InvocableEcho.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("prefix:");
      expect(code).toContain("message:");
      expect(code).toContain("showIcon:");
    });
  });

  // -------------------------------------------------------------------------
  // UC144: Non-string scalar return (int, float)
  // -------------------------------------------------------------------------
  describe("UC144: Scalar return values", () => {
    it("renders percent as integer", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ScalarReturn.php"),
        class: "App\\Components\\ScalarReturn",
        callable: "renderPercent",
        args: { current: 75, total: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("75");
    });

    it("renders zero percent for empty", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ScalarReturn.php"),
        class: "App\\Components\\ScalarReturn",
        callable: "renderPercent",
        args: { current: 0, total: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("0");
    });

    it("renders ratio as float", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ScalarReturn.php"),
        class: "App\\Components\\ScalarReturn",
        callable: "renderRatio",
        args: { current: 33, total: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("0.33");
    });

    it("renders full progress bar via render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ScalarReturn.php"),
        class: "App\\Components\\ScalarReturn",
        callable: "render",
        args: { current: 65, total: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("scalar-return");
      expect(result.html).toContain("65%");
      expect(result.html).toContain("65/100");
    });

    it("parses ScalarReturn with multiple methods", () => {
      const meta = parsePhpFile(advanced("ScalarReturn.php"));
      const cls = meta.classes.find((c) => c.name === "ScalarReturn")!;
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.methods).toHaveLength(3);
      const pct = cls.methods.find((m) => m.name === "renderPercent")!;
      expect(pct.returnType).toBe("int");
      const ratio = cls.methods.find((m) => m.name === "renderRatio")!;
      expect(ratio.returnType).toBe("float");
    });
  });

  // -------------------------------------------------------------------------
  // UC145: Functions with array defaults
  // -------------------------------------------------------------------------
  describe("UC145: Functions with array defaults", () => {
    it("renders nav with default items", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("FunctionArrayDefault.php"),
        class: null,
        callable: "App\\Helpers\\renderNav",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("fn-nav");
      expect(result.html).toContain("Home");
      expect(result.html).toContain("About");
      expect(result.html).toContain("Contact");
    });

    it("renders nav with custom items", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("FunctionArrayDefault.php"),
        class: null,
        callable: "App\\Helpers\\renderNav",
        args: { items: ["Dashboard", "Settings"], separator: " > " },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("Settings");
      expect(result.html).toContain(" > ");
    });

    it("renders tag list with defaults", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("FunctionArrayDefault.php"),
        class: null,
        callable: "App\\Helpers\\renderTagList",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("fn-tags");
      expect(result.html).toContain("php");
      expect(result.html).toContain("storybook");
      expect(result.html).toContain("vite");
    });

    it("renders tag list with custom tags and color", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("FunctionArrayDefault.php"),
        class: null,
        callable: "App\\Helpers\\renderTagList",
        args: { tags: ["react", "vue"], color: "#ec4899" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("react");
      expect(result.html).toContain("vue");
      expect(result.html).toContain("#ec4899");
    });

    it("parses FunctionArrayDefault with two functions", () => {
      const meta = parsePhpFile(advanced("FunctionArrayDefault.php"));
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(2);
      const nav = meta.functions.find((f) => f.name === "renderNav")!;
      expect(nav.params).toHaveLength(3);
      expect(nav.params[0]!.type).toBe("array");
      expect(nav.params[0]!.required).toBe(false);
      const tags = meta.functions.find((f) => f.name === "renderTagList")!;
      expect(tags.params).toHaveLength(2);
      expect(tags.params[0]!.type).toBe("array");
    });

    it("generates function modules for each function", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const idNav = resolveId(
        "./FunctionArrayDefault.php@renderNav",
        advanced("FunctionArrayDefault.stories.ts"),
      );
      const codeNav = load(idNav);
      expect(codeNav).toContain("__type: 'function'");
      expect(codeNav).toContain("items:");
      expect(codeNav).toContain("separator:");

      const idTags = resolveId(
        "./FunctionArrayDefault.php@renderTagList",
        advanced("FunctionArrayDefaultTags.stories.ts"),
      );
      const codeTags = load(idTags);
      expect(codeTags).toContain("__type: 'function'");
      expect(codeTags).toContain("tags:");
    });
  });

  // -------------------------------------------------------------------------
  // UC146: Enum with multiple typed method parameters
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC146: Enum with multiple typed method params", () => {
    it("renders badge variant with label", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumMethodParams.php"),
        class: "App\\Components\\EnumMethodParams",
        callable: "render",
        args: { _case: "badge", label: "New" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("emp-badge");
      expect(result.html).toContain("New");
    });

    it("renders pill with custom color and size", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumMethodParams.php"),
        class: "App\\Components\\EnumMethodParams",
        callable: "render",
        args: { _case: "pill", label: "Active", color: "#22c55e", size: 16 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("emp-pill");
      expect(result.html).toContain("Active");
      expect(result.html).toContain("#22c55e");
      expect(result.html).toContain("16px");
    });

    it("renders tag with rounded=false", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumMethodParams.php"),
        class: "App\\Components\\EnumMethodParams",
        callable: "render",
        args: { _case: "tag", label: "v2.0", rounded: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("emp-tag");
      expect(result.html).toContain("v2.0");
      expect(result.html).toContain("4px");
    });

    it("renders showcase via static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("EnumMethodParams.php"),
        class: "App\\Components\\EnumMethodParams",
        callable: "showcase",
        args: { label: "Test" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("emp-showcase");
      expect(result.html).toContain("emp-badge");
      expect(result.html).toContain("emp-pill");
      expect(result.html).toContain("emp-tag");
      expect(result.html).toContain("Test");
    });

    it("parses EnumMethodParams with multi-param method", () => {
      const meta = parsePhpFile(php81("EnumMethodParams.php"));
      const cls = meta.classes.find((c) => c.name === "EnumMethodParams")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumCases).toEqual(["Badge", "Pill", "Tag"]);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(4);
      expect(render.params.map((p) => p.name)).toEqual(["label", "color", "size", "rounded"]);
      expect(render.params[2]!.type).toBe("int");
      expect(render.params[3]!.type).toBe("bool");
      const showcase = cls.methods.find((m) => m.name === "showcase")!;
      expect(showcase.isStatic).toBe(true);
    });

    it("generates enumMethod for instance and staticMethod for static", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const idRender = resolveId(
        "./EnumMethodParams.php@render",
        php81("EnumMethodParams.stories.ts"),
      );
      const codeRender = load(idRender);
      expect(codeRender).toContain("__type: 'enumMethod'");

      const idShowcase = resolveId(
        "./EnumMethodParams.php@showcase",
        php81("EnumMethodParamsShowcase.stories.ts"),
      );
      const codeShowcase = load(idShowcase);
      expect(codeShowcase).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // Parser: UC142-UC146 fixture metadata
  // -------------------------------------------------------------------------
  describe("Parser: UC142-UC146 fixture metadata", () => {
    it("parses EchoEnum fixture", () => {
      const meta = parsePhpFile(fixture("EchoEnum.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("EchoEnum");
      expect(cls.isEnum).toBe(true);
      expect(cls.enumCases).toEqual(["Success", "Error", "Warning"]);
      const alert = cls.methods.find((m) => m.name === "alert")!;
      expect(alert.params).toHaveLength(2);
      expect(alert.returnType).toBe("void");
    });

    it("parses InvocableEcho fixture", () => {
      const meta = parsePhpFile(fixture("InvocableEcho.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("InvocableEcho");
      expect(cls.constructorParams).toHaveLength(1);
      const invoke = cls.methods.find((m) => m.name === "__invoke")!;
      expect(invoke).toBeDefined();
      expect(invoke.params).toHaveLength(2);
      expect(invoke.returnType).toBe("void");
    });

    it("parses ScalarReturn fixture", () => {
      const meta = parsePhpFile(fixture("ScalarReturn.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ScalarReturn");
      expect(cls.methods).toHaveLength(3);
      const pct = cls.methods.find((m) => m.name === "renderPercent")!;
      expect(pct.returnType).toBe("int");
      const ratio = cls.methods.find((m) => m.name === "renderRatio")!;
      expect(ratio.returnType).toBe("float");
    });

    it("parses FunctionArrayDefault fixture", () => {
      const meta = parsePhpFile(fixture("FunctionArrayDefault.php"));
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(2);
      expect(meta.functions[0]!.name).toBe("renderNav");
      expect(meta.functions[0]!.params[0]!.type).toBe("array");
      expect(meta.functions[0]!.params[0]!.required).toBe(false);
      expect(meta.functions[1]!.name).toBe("renderTagList");
    });

    it("parses EnumMethodParams fixture", () => {
      const meta = parsePhpFile(fixture("EnumMethodParams.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("EnumMethodParams");
      expect(cls.isEnum).toBe(true);
      expect(cls.enumCases).toEqual(["Badge", "Pill", "Tag"]);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(4);
      const showcase = cls.methods.find((m) => m.name === "showcase")!;
      expect(showcase.isStatic).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC147: Enum with trait
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC147: Enum with trait", () => {
    it("renders TaskPriority badge via trait method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumWithTrait.php"),
        class: "App\\Components\\TaskPriority",
        callable: "badge",
        args: { _case: "high", size: "md" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("enum-badge");
      expect(result.html).toContain("High");
    });

    it("renders TaskPriority with small size", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumWithTrait.php"),
        class: "App\\Components\\TaskPriority",
        callable: "badge",
        args: { _case: "low", size: "sm" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Low");
      expect(result.html).toContain("4px 6px");
    });

    it("renders TaskPriority critical with default size", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumWithTrait.php"),
        class: "App\\Components\\TaskPriority",
        callable: "badge",
        args: { _case: "critical" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Critical");
      expect(result.html).toContain("#991b1b");
    });

    it("parses EnumWithTrait with trait usage on enum", () => {
      const meta = parsePhpFile(fixture("EnumWithTrait.php"));

      // Should have traits
      const hasBadge = meta.classes.find((c) => c.name === "HasBadge");
      expect(hasBadge).toBeDefined();
      expect(hasBadge!.methods).toHaveLength(1);
      expect(hasBadge!.methods[0]!.name).toBe("badge");

      // Priority enum should have trait listed
      const priority = meta.classes.find((c) => c.name === "Priority");
      expect(priority).toBeDefined();
      expect(priority!.isEnum).toBe(true);
      expect(priority!.traits).toContain("HasBadge");
      expect(priority!.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);

      // Severity enum should have two traits
      const severity = meta.classes.find((c) => c.name === "Severity");
      expect(severity).toBeDefined();
      expect(severity!.isEnum).toBe(true);
      expect(severity!.traits).toContain("HasBadge");
      expect(severity!.traits).toContain("HasIcon");
    });

    it("generates enumMethod module for trait method on enum", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId(fixture("EnumWithTrait.php") + "@badge");
      const code = load(id);
      expect(code).toBeTruthy();
      // Both Priority and Severity have badge via trait
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const Priority");
      expect(code).toContain("export const Severity");
      expect(code).toContain('__callable: "badge"');
    });

    it("generates enumMethod module for icon (only on Severity)", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);

      const id = resolveId(fixture("EnumWithTrait.php") + "@icon");
      const code = load(id);
      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const Severity");
      // Priority doesn't use HasIcon
      expect(code).not.toContain("export const Priority");
    });
  });

  // -------------------------------------------------------------------------
  // UC148: Promoted readonly union type parameters
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC148: Promoted readonly union types", () => {
    it("renders PromotedReadonlyUnion with string id", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("PromotedReadonlyUnion.php"),
        class: "App\\Components\\PromotedReadonlyUnion",
        callable: "render",
        args: { id: "SKU-001", label: "Widget", amount: 29.99 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("SKU-001");
      expect(result.html).toContain("Widget");
      expect(result.html).toContain("29.99");
    });

    it("renders PromotedReadonlyUnion with int id", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("PromotedReadonlyUnion.php"),
        class: "App\\Components\\PromotedReadonlyUnion",
        callable: "render",
        args: { id: 42, label: "Gadget", amount: 199 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("42");
      expect(result.html).toContain("Gadget");
    });

    it("renders PromotedReadonlyUnion with default amount", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("PromotedReadonlyUnion.php"),
        class: "App\\Components\\PromotedReadonlyUnion",
        callable: "render",
        args: { id: "FREE", label: "Sample" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("FREE");
      expect(result.html).toContain("Sample");
    });

    it("parses PromotedReadonlyUnion fixture", () => {
      const meta = parsePhpFile(fixture("PromotedReadonlyUnion.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("PromotedReadonlyUnion");
      expect(cls.constructorParams).toHaveLength(3);

      const idParam = cls.constructorParams[0]!;
      expect(idParam.name).toBe("id");
      expect(idParam.type).toBe("string|int");
      expect(idParam.isPromoted).toBe(true);
      expect(idParam.visibility).toBe("public");

      const amountParam = cls.constructorParams[2]!;
      expect(amountParam.name).toBe("amount");
      expect(amountParam.type).toBe("int|float");
      expect(amountParam.isPromoted).toBe(true);
      expect(amountParam.visibility).toBe("private");
      expect(amountParam.default).toBe("0");
    });

    it("generates classMethod module for PromotedReadonlyUnion", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(fixture("PromotedReadonlyUnion.php") + "@render");
      const code = load(id);
      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const PromotedReadonlyUnion");
      expect(code).toContain("id:");
      expect(code).toContain("label:");
      expect(code).toContain("amount:");
    });
  });

  // -------------------------------------------------------------------------
  // UC149: Method parameters with class constant defaults
  // -------------------------------------------------------------------------
  describe("UC149: Method constant defaults", () => {
    it("renders MethodConstantDefault with HTML format", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MethodConstantDefault.php"),
        class: "App\\Components\\MethodConstantDefault",
        callable: "render",
        args: { content: "Hello world", title: "Test" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mcd");
      expect(result.html).toContain("Test");
      expect(result.html).toContain("Hello world");
    });

    it("renders MethodConstantDefault with text format", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MethodConstantDefault.php"),
        class: "App\\Components\\MethodConstantDefault",
        callable: "render",
        args: { content: "<b>Bold</b> text", title: "Plain", format: "text" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).not.toContain("<b>");
      expect(result.html).toContain("Plain");
    });

    it("renders MethodConstantDefault with truncation", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("MethodConstantDefault.php"),
        class: "App\\Components\\MethodConstantDefault",
        callable: "render",
        args: {
          content: "A very long text that should be truncated",
          title: "Long",
          maxLength: 10,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("...");
    });

    it("parses MethodConstantDefault fixture", () => {
      const meta = parsePhpFile(fixture("MethodConstantDefault.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MethodConstantDefault");

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render).toBeDefined();
      expect(render.params).toHaveLength(2);

      const formatParam = render.params[0]!;
      expect(formatParam.name).toBe("format");
      expect(formatParam.type).toBe("string");
      expect(formatParam.default).toBe("self::FORMAT_HTML");
      expect(formatParam.required).toBe(false);

      const maxLenParam = render.params[1]!;
      expect(maxLenParam.name).toBe("maxLength");
      expect(maxLenParam.type).toBe("int");
      expect(maxLenParam.default).toBe("self::MAX_LENGTH");
    });

    it("generates classMethod module for MethodConstantDefault", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(fixture("MethodConstantDefault.php") + "@render");
      const code = load(id);
      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("format:");
      expect(code).toContain("maxLength:");
      expect(code).toContain("content:");
    });
  });

  // -------------------------------------------------------------------------
  // UC150: Functions with union return types
  // -------------------------------------------------------------------------
  describe("UC150: Function union return types", () => {
    it("renders formatValue as text", async () => {
      const result = await executor.execute({
        type: "function",
        file: php80("FunctionUnionReturn.php"),
        class: null,
        callable: "App\\Helpers\\formatValue",
        args: { value: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("formatted-value");
    });

    it("renders formatValue as number (scalar return)", async () => {
      const result = await executor.execute({
        type: "function",
        file: php80("FunctionUnionReturn.php"),
        class: null,
        callable: "App\\Helpers\\formatValue",
        args: { value: "42", format: "number" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toBe("42");
    });

    it("renders renderStatus with icon", async () => {
      const result = await executor.execute({
        type: "function",
        file: php80("FunctionUnionReturn.php"),
        class: null,
        callable: "App\\Helpers\\renderStatus",
        args: { status: "active" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("status-indicator");
      expect(result.html).toContain("active");
    });

    it("parses FunctionUnionReturn fixture", () => {
      const meta = parsePhpFile(fixture("FunctionUnionReturn.php"));
      expect(meta.functions).toHaveLength(2);

      const formatValue = meta.functions.find((f) => f.name === "formatValue")!;
      expect(formatValue).toBeDefined();
      expect(formatValue.returnType).toBe("string|int");
      expect(formatValue.params).toHaveLength(2);

      const renderStatus = meta.functions.find((f) => f.name === "renderStatus")!;
      expect(renderStatus).toBeDefined();
      expect(renderStatus.returnType).toBe("string|bool");
      expect(renderStatus.params).toHaveLength(2);
    });

    it("generates function module for formatValue", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(fixture("FunctionUnionReturn.php") + "@formatValue");
      const code = load(id);
      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const formatValue");
      expect(code).toContain("value:");
      expect(code).toContain("format:");
    });
  });

  // -------------------------------------------------------------------------
  // UC151: Template stories (dashboard, error, form, login, pricing)
  // -------------------------------------------------------------------------
  describe("UC151: Dashboard template", () => {
    it("renders dashboard with stats", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: {
          title: "My Dashboard",
          stats: [
            { label: "Users", value: "100", change: 12 },
            { label: "Revenue", value: "$50K", change: -5 },
          ],
          showChart: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("My Dashboard");
      expect(result.html).toContain("Users");
      expect(result.html).toContain("100");
      expect(result.html).toContain("+12%");
      expect(result.html).toContain("negative");
    });

    it("renders empty dashboard", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: { title: "Empty", stats: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dashboard-empty");
    });

    it("renders dashboard with chart placeholder", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/dashboard.php"),
        class: null,
        callable: null,
        args: { title: "Analytics", stats: [], showChart: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dashboard-chart");
      expect(result.html).toContain("Chart placeholder");
    });
  });

  describe("UC151: Error template", () => {
    it("renders 404 error page", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 404, showHome: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("404");
      expect(result.html).toContain("Not Found");
      expect(result.html).toContain("error-home");
    });

    it("renders 500 error page without home link", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 500, showHome: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("500");
      expect(result.html).toContain("Internal Server Error");
      expect(result.html).not.toContain("error-home");
    });

    it("renders error with custom message", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/error.php"),
        class: null,
        callable: null,
        args: { code: 403, message: "Access denied to this resource.", showHome: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Access denied to this resource.");
    });
  });

  describe("UC151: Form template", () => {
    it("renders form with fields", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/form.php"),
        class: null,
        callable: null,
        args: {
          action: "/submit",
          method: "POST",
          submitLabel: "Send",
          fields: [
            { label: "Name", name: "name", type: "text", placeholder: "Your name" },
            { label: "Message", name: "msg", type: "textarea", placeholder: "Write here" },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("/submit");
      expect(result.html).toContain("POST");
      expect(result.html).toContain("Name");
      expect(result.html).toContain("textarea");
      expect(result.html).toContain("Send");
    });
  });

  describe("UC151: Login template", () => {
    it("renders login form with error", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/login.php"),
        class: null,
        callable: null,
        args: {
          title: "Sign In",
          error: "Invalid credentials.",
          showRemember: true,
          showForgot: true,
          buttonText: "Sign In",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Sign In");
      expect(result.html).toContain("login-error");
      expect(result.html).toContain("Invalid credentials.");
      expect(result.html).toContain("Remember me");
      expect(result.html).toContain("Forgot password?");
    });

    it("renders minimal login form", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/login.php"),
        class: null,
        callable: null,
        args: {
          title: "Welcome",
          showRemember: false,
          showForgot: false,
          buttonText: "Log In",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Welcome");
      expect(result.html).toContain("Log In");
      expect(result.html).not.toContain("Remember me");
    });
  });

  describe("UC151: Pricing template", () => {
    it("renders pricing plans", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/pricing.php"),
        class: null,
        callable: null,
        args: {
          plans: [
            { name: "Free", price: 0, features: ["Basic"] },
            { name: "Pro", price: 29, features: ["Advanced", "Support"] },
          ],
          currency: "USD",
          period: "month",
          highlighted: "Pro",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Free");
      expect(result.html).toContain("Pro");
      expect(result.html).toContain("$29.00");
      expect(result.html).toContain("pricing-highlighted");
      expect(result.html).toContain("Popular");
    });

    it("renders empty pricing", async () => {
      const result = await executor.execute({
        type: "template",
        file: advanced("templates/pricing.php"),
        class: null,
        callable: null,
        args: { plans: [], currency: "USD" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pricing-empty");
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin + Parser: UC147-UC150 metadata
  // -------------------------------------------------------------------------
  describe("Parser: UC147-UC150 fixture metadata", () => {
    it("parses EnumWithTrait fixture: traits on enums", () => {
      const meta = parsePhpFile(fixture("EnumWithTrait.php"));

      const priority = meta.classes.find((c) => c.name === "Priority")!;
      expect(priority.isEnum).toBe(true);
      expect(priority.traits).toContain("HasBadge");
      expect(priority.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);

      const severity = meta.classes.find((c) => c.name === "Severity")!;
      expect(severity.isEnum).toBe(true);
      expect(severity.traits).toContain("HasBadge");
      expect(severity.traits).toContain("HasIcon");
      expect(severity.enumCases).toEqual(["Info", "Warning", "Error"]);
    });

    it("parses PromotedReadonlyUnion fixture: readonly + union + promoted", () => {
      const meta = parsePhpFile(fixture("PromotedReadonlyUnion.php"));
      const cls = meta.classes[0]!;
      expect(cls.constructorParams).toHaveLength(3);

      const id = cls.constructorParams[0]!;
      expect(id.type).toBe("string|int");
      expect(id.isPromoted).toBe(true);

      const amount = cls.constructorParams[2]!;
      expect(amount.type).toBe("int|float");
      expect(amount.required).toBe(false);
    });

    it("parses FunctionUnionReturn fixture: union return types", () => {
      const meta = parsePhpFile(fixture("FunctionUnionReturn.php"));
      expect(meta.functions).toHaveLength(2);

      const fv = meta.functions.find((f) => f.name === "formatValue")!;
      expect(fv.returnType).toBe("string|int");

      const rs = meta.functions.find((f) => f.name === "renderStatus")!;
      expect(rs.returnType).toBe("string|bool");
    });

    it("parses MethodConstantDefault fixture: self:: defaults in method", () => {
      const meta = parsePhpFile(fixture("MethodConstantDefault.php"));
      const cls = meta.classes[0]!;
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params[0]!.default).toBe("self::FORMAT_HTML");
      expect(render.params[1]!.default).toBe("self::MAX_LENGTH");
    });
  });

  // -------------------------------------------------------------------------
  // UC152: PHP 8 attributes on constructor params and methods
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp83)("UC152: PHP 8 attributes (AttributeCard)", () => {
    it("renders AttributeCard with attributes stripped", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php83("AttributeCard.php"),
        class: "App\\Components\\AttributeCard",
        callable: "render",
        args: { title: "Attribute Test", body: "Attributes stripped", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Attribute Test");
      expect(result.html).toContain("Attributes stripped");
      expect(result.html).toContain("attr-card-primary");
    });

    it("renders with default args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php83("AttributeCard.php"),
        class: "App\\Components\\AttributeCard",
        callable: "render",
        args: { title: "Minimal" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Minimal");
      expect(result.html).toContain("attr-card-default");
    });

    it("renders with elevated flag", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php83("AttributeCard.php"),
        class: "App\\Components\\AttributeCard",
        callable: "render",
        args: { title: "Elevated", elevated: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("box-shadow");
    });

    it("parses AttributeCard correctly (attributes stripped)", () => {
      const meta = parsePhpFile(php83("AttributeCard.php"));
      // CardStyle is an attribute class, AttributeCard is the main class
      const cls = meta.classes.find((c) => c.name === "AttributeCard");
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(4);

      const title = cls!.constructorParams.find((p) => p.name === "title")!;
      expect(title.type).toBe("string");
      expect(title.required).toBe(true);

      const variant = cls!.constructorParams.find((p) => p.name === "variant")!;
      expect(variant.default).toBeDefined();

      const render = cls!.methods.find((m) => m.name === "render");
      expect(render).toBeDefined();
      expect(render!.returnType).toBe("string");
    });

    it("parses AttributeClass fixture: attributes on params and methods", () => {
      const meta = parsePhpFile(fixture("AttributeClass.php"));
      const cls = meta.classes.find((c) => c.name === "AttributeClass");
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(2);
      expect(cls!.constructorParams[0]!.name).toBe("title");
      expect(cls!.constructorParams[1]!.name).toBe("body");
      expect(cls!.methods).toHaveLength(1);
      expect(cls!.methods[0]!.name).toBe("render");
    });

    it("generates virtual module for AttributeCard", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./AttributeCard.php@render", php83("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("export const AttributeCard");
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("title");
      expect(code).toContain("variant");
    });
  });

  // -------------------------------------------------------------------------
  // UC153: Stringable return from class method (EnumToString)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC153: Stringable return from class method (EnumToString)", () => {
    it("renders Mood enum via render method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumToString.php"),
        class: "App\\Components\\Mood",
        callable: "render",
        args: { _case: "happy" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mood");
      expect(result.html).toContain("Happy");
    });

    it("renders MoodCard with enum param", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumToString.php"),
        class: "App\\Components\\MoodCard",
        callable: "render",
        args: { mood: "excited", message: "Woohoo!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mood-card");
      expect(result.html).toContain("Excited");
      expect(result.html).toContain("Woohoo!");
    });

    it("renders MoodCard badge method (returns Stringable object)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("EnumToString.php"),
        class: "App\\Components\\MoodCard",
        callable: "badge",
        args: { mood: "sad" },
      });
      expect(result.error).toBeUndefined();
      // badge() returns a MoodBadge (Stringable), runner converts via __toString
      expect(result.html).toContain("Sad");
    });

    it("parses Mood enum and MoodCard class", () => {
      const meta = parsePhpFile(php81("EnumToString.php"));
      const mood = meta.classes.find((c) => c.name === "Mood");
      expect(mood).toBeDefined();
      expect(mood!.isEnum).toBe(true);
      expect(mood!.enumBackingType).toBe("string");
      expect(mood!.enumCases).toEqual(["Happy", "Sad", "Neutral", "Excited"]);

      const moodBadge = meta.classes.find((c) => c.name === "MoodBadge");
      expect(moodBadge).toBeDefined();
      expect(moodBadge!.implements).toContain("\\Stringable");

      const moodCard = meta.classes.find((c) => c.name === "MoodCard");
      expect(moodCard).toBeDefined();
      expect(moodCard!.constructorParams).toHaveLength(2);
      expect(moodCard!.methods).toHaveLength(2);
    });

    it("parses EnumStringable fixture", () => {
      const meta = parsePhpFile(fixture("EnumStringable.php"));
      const wrapper = meta.classes.find((c) => c.name === "StringableWrapper");
      expect(wrapper).toBeDefined();
      expect(wrapper!.implements).toContain("\\Stringable");

      const badge = meta.classes.find((c) => c.name === "Badge");
      expect(badge).toBeDefined();
      expect(badge!.isEnum).toBe(true);

      const holder = meta.classes.find((c) => c.name === "BadgeHolder");
      expect(holder).toBeDefined();
      expect(holder!.constructorParams[0]!.type).toBe("Badge");
    });

    it("generates enumMethod module for Mood and classMethod for MoodCard", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./EnumToString.php@render", php81("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("export const Mood");
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const MoodCard");
      expect(code).toContain("__type: 'classMethod'");
      // MoodBadge is a Stringable value object, not a component — should not be exported
      // (it has no render method matching 'render' since its constructor takes 3 required args)
    });
  });

  // -------------------------------------------------------------------------
  // UC154: Enum with trait providing static method
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC154: Enum with trait static method (TraitStaticEnum)", () => {
    it("renders Palette swatch via enum instance method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: advanced("TraitStaticEnum.php"),
        class: "App\\Components\\Palette",
        callable: "swatch",
        args: { _case: "#f43f5e" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("swatch");
      expect(result.html).toContain("Rose");
    });

    it("renders Palette showcase via trait static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("TraitStaticEnum.php"),
        class: "App\\Components\\Palette",
        callable: "showcase",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("showcase");
      expect(result.html).toContain("Rose");
      expect(result.html).toContain("Emerald");
    });

    it("parses Palette enum and HasShowcase trait", () => {
      const meta = parsePhpFile(advanced("TraitStaticEnum.php"));
      const trait = meta.classes.find((c) => c.name === "HasShowcase");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.methods).toHaveLength(1);
      expect(trait!.methods[0]!.name).toBe("showcase");
      expect(trait!.methods[0]!.isStatic).toBe(true);

      const palette = meta.classes.find((c) => c.name === "Palette");
      expect(palette).toBeDefined();
      expect(palette!.isEnum).toBe(true);
      expect(palette!.traits).toContain("HasShowcase");
      expect(palette!.enumCases).toEqual(["Rose", "Sky", "Amber", "Emerald", "Violet"]);
    });

    it("parses TraitStaticEnum fixture", () => {
      const meta = parsePhpFile(fixture("TraitStaticEnum.php"));
      const trait = meta.classes.find((c) => c.name === "HasShowcase");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);

      const swatch = meta.classes.find((c) => c.name === "Swatch");
      expect(swatch).toBeDefined();
      expect(swatch!.traits).toContain("HasShowcase");
    });

    it("generates staticMethod module for showcase (from trait)", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./TraitStaticEnum.php@showcase", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("export const Palette");
      expect(code).toContain("__type: 'staticMethod'");
      // Trait should NOT be exported
      expect(code).not.toContain("export const HasShowcase");
    });
  });

  // -------------------------------------------------------------------------
  // UC155: PHP constant expression defaults
  // -------------------------------------------------------------------------
  describe("UC155: Constant expression defaults (ConstExprDefaults)", () => {
    it("renders ConstExprDefaults with PHP constant defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ConstExprDefaults.php"),
        class: "App\\Components\\ConstExprDefaults",
        callable: "render",
        args: { title: "Config Display" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Config Display");
      expect(result.html).toContain("const-defaults");
    });

    it("renders with custom separator", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ConstExprDefaults.php"),
        class: "App\\Components\\ConstExprDefaults",
        callable: "render",
        args: { title: "Custom", separator: ", " },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("comma-space");
    });

    it("parses PHP constant defaults correctly", () => {
      const meta = parsePhpFile(advanced("ConstExprDefaults.php"));
      const cls = meta.classes.find((c) => c.name === "ConstExprDefaults")!;
      expect(cls.constructorParams).toHaveLength(5);

      const separator = cls.constructorParams.find((p) => p.name === "separator")!;
      expect(separator.default).toBe("PHP_EOL");
      expect(separator.required).toBe(false);

      const maxItems = cls.constructorParams.find((p) => p.name === "maxItems")!;
      expect(maxItems.default).toBe("PHP_INT_SIZE");
      expect(maxItems.type).toBe("int");

      const version = cls.constructorParams.find((p) => p.name === "version")!;
      expect(version.default).toBe("PHP_VERSION");
      expect(version.type).toBe("string");
    });

    it("parses ConstExprDefaults fixture", () => {
      const meta = parsePhpFile(fixture("ConstExprDefaults.php"));
      const cls = meta.classes[0]!;
      expect(cls.constructorParams[1]!.default).toBe("PHP_EOL");
      expect(cls.constructorParams[2]!.default).toBe("PHP_INT_SIZE");
      expect(cls.constructorParams[3]!.default).toBe("PHP_VERSION");
    });
  });

  // -------------------------------------------------------------------------
  // UC156: Abstract parent with trait, concrete child inherits method
  // -------------------------------------------------------------------------
  describe("UC156: Abstract parent with trait method (AbstractTraitChild)", () => {
    it("renders ArticleCard (inherits render from trait via abstract parent)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractTraitChild.php"),
        class: "App\\Components\\ArticleCard",
        callable: "render",
        args: { title: "Test Article", excerpt: "An excerpt.", author: "Alice" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("layout-card");
      expect(result.html).toContain("Test Article");
      expect(result.html).toContain("An excerpt.");
      expect(result.html).toContain("By Alice");
    });

    it("renders QuoteCard (another child of same abstract+trait)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractTraitChild.php"),
        class: "App\\Components\\QuoteCard",
        callable: "render",
        args: { title: "Quote", quote: "To be or not to be.", source: "Shakespeare" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("layout-card");
      expect(result.html).toContain("To be or not to be.");
      expect(result.html).toContain("Shakespeare");
    });

    it("parses AbstractTraitChild with trait, abstract, and concrete classes", () => {
      const meta = parsePhpFile(advanced("AbstractTraitChild.php"));

      const trait = meta.classes.find((c) => c.name === "HasCardLayout");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.methods.some((m) => m.name === "render")).toBe(true);

      const abstract = meta.classes.find((c) => c.name === "AbstractLayoutCard");
      expect(abstract).toBeDefined();
      expect(abstract!.isAbstract).toBe(true);
      expect(abstract!.traits).toContain("HasCardLayout");

      const article = meta.classes.find((c) => c.name === "ArticleCard");
      expect(article).toBeDefined();
      expect(article!.extends).toBe("AbstractLayoutCard");
      expect(article!.constructorParams).toHaveLength(3);

      const quote = meta.classes.find((c) => c.name === "QuoteCard");
      expect(quote).toBeDefined();
      expect(quote!.extends).toBe("AbstractLayoutCard");
      expect(quote!.constructorParams).toHaveLength(3);
    });

    it("generates classMethod modules for concrete children (not trait or abstract)", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./AbstractTraitChild.php@render", advanced("Button.stories.ts"));
      const code = load(id);

      // Concrete children should be exported
      expect(code).toContain("export const ArticleCard");
      expect(code).toContain("export const QuoteCard");

      // Trait and abstract class should NOT be exported
      expect(code).not.toContain("export const HasCardLayout");
      expect(code).not.toContain("export const AbstractLayoutCard");
    });

    it("parses TraitInterface fixture: trait, interface, abstract, concrete", () => {
      const meta = parsePhpFile(fixture("TraitInterface.php"));

      const iface = meta.classes.find((c) => c.name === "Displayable");
      expect(iface).toBeDefined();
      expect(iface!.isInterface).toBe(true);

      const trait = meta.classes.find((c) => c.name === "HasRender");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.methods).toHaveLength(2);

      const abstract = meta.classes.find((c) => c.name === "AbstractWidget");
      expect(abstract).toBeDefined();
      expect(abstract!.isAbstract).toBe(true);
      expect(abstract!.traits).toContain("HasRender");

      const concrete = meta.classes.find((c) => c.name === "ConcreteWidget");
      expect(concrete).toBeDefined();
      expect(concrete!.extends).toBe("AbstractWidget");
      expect(concrete!.implements).toContain("Displayable");
    });

    it("skips trait and interface in virtual module generation", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId(fixture("TraitInterface.php") + "@render", undefined);
      const code = load(id.replace(fixture("TraitInterface.php"), fixture("TraitInterface.php")));

      // Should NOT contain trait or interface exports
      expect(code).not.toContain("export const HasRender");
      expect(code).not.toContain("export const Displayable");
      // Should contain concrete class
      expect(code).toContain("export const ConcreteWidget");
    });
  });

  // -------------------------------------------------------------------------
  // UC157: Intersection type parameters (updated Intersection.php)
  // -------------------------------------------------------------------------
  describe("UC157: Intersection type parameters (Intersection)", () => {
    it.skipIf(!hasPhp81)("renders IntersectionBadge with string args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("Intersection.php"),
        class: "App\\Components\\IntersectionBadge",
        callable: "render",
        args: { label: "TypeSafe", color: "#3b82f6" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("TypeSafe");
      expect(result.html).toContain("#3b82f6");
    });

    it.skipIf(!hasPhp81)("renders with default values", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("Intersection.php"),
        class: "App\\Components\\IntersectionBadge",
        callable: "render",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("default");
    });

    it("parses render method params", () => {
      const meta = parsePhpFile(php81("Intersection.php"));
      const cls = meta.classes.find((c) => c.name === "IntersectionBadge")!;
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(2);

      const label = render.params[0]!;
      expect(label.name).toBe("label");
      expect(label.type).toBe("string");
    });
  });

  // -------------------------------------------------------------------------
  // UC152-157: Parser isTrait and isInterface flags
  // -------------------------------------------------------------------------
  describe("UC152-157: Parser isTrait and isInterface", () => {
    it("marks traits with isTrait=true", () => {
      const meta = parsePhpFile(advanced("TraitAccordion.php"));
      const trait = meta.classes.find((c) => c.name === "HasToggle");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.isInterface).toBe(false);
      expect(trait!.isEnum).toBe(false);

      const cls = meta.classes.find((c) => c.name === "AccordionPanel");
      expect(cls).toBeDefined();
      expect(cls!.isTrait).toBe(false);
    });

    it("marks interfaces with isInterface=true", () => {
      const meta = parsePhpFile(advanced("Renderable.php"));
      const iface = meta.classes.find((c) => c.name === "RenderableInterface");
      expect(iface).toBeDefined();
      expect(iface!.isInterface).toBe(true);
      expect(iface!.isTrait).toBe(false);
    });

    it("skips trait exports in vite plugin", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./TraitAccordion.php@toggle", advanced("Button.stories.ts"));
      const code = load(id);

      // Traits should not appear as exports
      expect(code).not.toContain("export const HasToggle");
      expect(code).not.toContain("export const HasTooltip");

      // Classes using the trait should be exported
      expect(code).toContain("export const AccordionPanel");
      expect(code).toContain("export const RichWidget");
    });

    it("skips interface exports in vite plugin", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./Renderable.php@render", advanced("Button.stories.ts"));
      const code = load(id);

      // Interface should not appear
      expect(code).not.toContain("export const RenderableInterface");

      // Implementing classes should be exported
      expect(code).toContain("export const InfoBox");
      expect(code).toContain("export const WarningBox");
    });

    it("marks EnumWithTrait trait correctly", () => {
      const meta = parsePhpFile(php81("EnumWithTrait.php"));
      const trait = meta.classes.find((c) => c.name === "HasStatusBadge");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);

      const enumCls = meta.classes.find((c) => c.name === "TaskPriority");
      expect(enumCls).toBeDefined();
      expect(enumCls!.isEnum).toBe(true);
      expect(enumCls!.isTrait).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // UC158: Standalone function with nullable parameters
  // -------------------------------------------------------------------------
  describe("UC158: Nullable function params", () => {
    it("renders nullableLabel with text only", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("nullableLabel.php"),
        class: null,
        callable: "App\\Helpers\\nullableLabel",
        args: { text: "Status" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Status");
      expect(result.html).toContain("nullable-label");
    });

    it("renders nullableLabel with all params", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("nullableLabel.php"),
        class: null,
        callable: "App\\Helpers\\nullableLabel",
        args: { text: "Alert", icon: "!", color: "#ef4444", subtitle: "Important" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alert");
      expect(result.html).toContain("!");
      expect(result.html).toContain("#ef4444");
      expect(result.html).toContain("Important");
    });

    it("renders nullableLabel with null icon", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("nullableLabel.php"),
        class: null,
        callable: "App\\Helpers\\nullableLabel",
        args: { text: "Test", icon: null },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test");
      expect(result.html).not.toContain('<span style="margin-right');
    });

    it("parses nullable function params", () => {
      const meta = parsePhpFile(advanced("nullableLabel.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("nullableLabel");
      expect(fn.params).toHaveLength(4);

      const textParam = fn.params[0]!;
      expect(textParam.name).toBe("text");
      expect(textParam.type).toBe("string");
      expect(textParam.required).toBe(true);
      expect(textParam.nullable).toBe(false);

      const iconParam = fn.params[1]!;
      expect(iconParam.name).toBe("icon");
      expect(iconParam.nullable).toBe(true);
      expect(iconParam.required).toBe(false);

      const colorParam = fn.params[2]!;
      expect(colorParam.name).toBe("color");
      expect(colorParam.nullable).toBe(true);

      const subtitleParam = fn.params[3]!;
      expect(subtitleParam.name).toBe("subtitle");
      expect(subtitleParam.nullable).toBe(true);
    });

    it("generates function module for nullableLabel", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./nullableLabel.php@nullableLabel", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("nullableLabel");
      expect(code).toContain("text:");
      expect(code).toContain("icon:");
    });

    it("parses NullableFunction fixture", () => {
      const meta = parsePhpFile(fixture("NullableFunction.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.params).toHaveLength(4);
      expect(fn.params[1]!.nullable).toBe(true);
      expect(fn.params[2]!.nullable).toBe(true);
      expect(fn.params[3]!.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC159: Echo-based standalone function (void return)
  // -------------------------------------------------------------------------
  describe("UC159: Echo-based standalone function", () => {
    it("renders echoGreet with banner style", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("echoGreet.php"),
        class: null,
        callable: "App\\Helpers\\echoGreet",
        args: { name: "World", style: "banner" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello, <strong>World</strong>!");
      expect(result.html).toContain("echo-greet-banner");
    });

    it("renders echoGreet with toast style", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("echoGreet.php"),
        class: null,
        callable: "App\\Helpers\\echoGreet",
        args: { name: "Dev", style: "toast" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-greet-toast");
      expect(result.html).toContain("Dev");
    });

    it("parses echoGreet function with void return", () => {
      const meta = parsePhpFile(advanced("echoGreet.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("echoGreet");
      expect(fn.returnType).toBe("void");
      expect(fn.params).toHaveLength(2);
    });

    it("generates function module for echoGreet", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./echoGreet.php@echoGreet", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("echoGreet");
    });

    it("parses EchoFunction fixture", () => {
      const meta = parsePhpFile(fixture("EchoFunction.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("echoGreet");
      expect(fn.returnType).toBe("void");
    });
  });

  // -------------------------------------------------------------------------
  // UC160: Variadic string constructor params
  // -------------------------------------------------------------------------
  describe("UC160: Variadic string constructor", () => {
    it("renders VariadicCrumb with segments", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicCrumb.php"),
        class: "App\\Components\\VariadicCrumb",
        callable: "render",
        args: { segments: ["Home", "Products", "Widget"], separator: " / " },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Home");
      expect(result.html).toContain("Products");
      expect(result.html).toContain("Widget");
    });

    it("renders VariadicCrumb with empty segments", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicCrumb.php"),
        class: "App\\Components\\VariadicCrumb",
        callable: "render",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No breadcrumbs");
    });

    it("renders VariadicCrumb with single segment", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VariadicCrumb.php"),
        class: "App\\Components\\VariadicCrumb",
        callable: "render",
        args: { segments: ["Home"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Home");
    });

    it("parses VariadicCrumb with variadic string param", () => {
      const meta = parsePhpFile(advanced("VariadicCrumb.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("VariadicCrumb");
      expect(cls.constructorParams).toHaveLength(2);

      const sep = cls.constructorParams[0]!;
      expect(sep.name).toBe("separator");
      expect(sep.isVariadic).toBe(false);

      const segments = cls.constructorParams[1]!;
      expect(segments.name).toBe("segments");
      expect(segments.isVariadic).toBe(true);
      expect(segments.type).toBe("string");
    });

    it("generates classMethod module for VariadicCrumb", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./VariadicCrumb.php@render", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("VariadicCrumb");
    });

    it("parses VariadicCrumb fixture", () => {
      const meta = parsePhpFile(fixture("VariadicCrumb.php"));
      const cls = meta.classes[0]!;
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[1]!.isVariadic).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC161: Enum returning array with 'html' key
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC161: Enum array return", () => {
    it("renders EnumArrayReturn success card", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumArrayReturn.php"),
        class: "App\\Components\\EnumArrayReturn",
        callable: "card",
        args: { _case: "success", message: "Saved!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Saved!");
      expect(result.html).toContain("enum-card-success");
    });

    it("renders EnumArrayReturn error card", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumArrayReturn.php"),
        class: "App\\Components\\EnumArrayReturn",
        callable: "card",
        args: { _case: "error", message: "Failed!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Failed!");
      expect(result.html).toContain("enum-card-error");
    });

    it("renders EnumArrayReturn with default message", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumArrayReturn.php"),
        class: "App\\Components\\EnumArrayReturn",
        callable: "card",
        args: { _case: "warning" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("warning notification");
    });

    it("parses EnumArrayReturn", () => {
      const meta = parsePhpFile(php81("EnumArrayReturn.php"));
      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Success", "Warning", "Error"]);
      const card = cls.methods.find((m) => m.name === "card")!;
      expect(card.returnType).toBe("array");
      expect(card.params).toHaveLength(1);
    });

    it("generates enumMethod module for EnumArrayReturn", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./EnumArrayReturn.php@card", php81("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("EnumArrayReturn");
    });

    it("parses EnumArrayReturn fixture", () => {
      const meta = parsePhpFile(fixture("EnumArrayReturn.php"));
      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      const card = cls.methods.find((m) => m.name === "card")!;
      expect(card.returnType).toBe("array");
    });
  });

  // -------------------------------------------------------------------------
  // UC162: Class with match expression rendering
  // -------------------------------------------------------------------------
  describe("UC162: Match expression rendering", () => {
    it("renders MatchPanel with default variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MatchPanel.php"),
        class: "App\\Components\\MatchPanel",
        callable: "render",
        args: { variant: "default", title: "Test", content: "Body" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test");
      expect(result.html).toContain("Body");
      expect(result.html).toContain("match-panel");
    });

    it("renders MatchPanel with card variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MatchPanel.php"),
        class: "App\\Components\\MatchPanel",
        callable: "render",
        args: { variant: "card", title: "Card", content: "Content" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("match-card");
    });

    it("renders MatchPanel with banner variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MatchPanel.php"),
        class: "App\\Components\\MatchPanel",
        callable: "render",
        args: { variant: "banner", title: "Banner", content: "Announcement" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("match-banner");
    });

    it("renders MatchPanel with minimal variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MatchPanel.php"),
        class: "App\\Components\\MatchPanel",
        callable: "render",
        args: { variant: "minimal", title: "Compact", content: "Inline" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("match-minimal");
    });

    it("parses MatchPanel class", () => {
      const meta = parsePhpFile(php80("MatchPanel.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MatchPanel");
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[0]!.name).toBe("variant");
    });

    it("generates classMethod module for MatchPanel", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./MatchPanel.php@render", php80("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("MatchPanel");
    });

    it("parses MatchPanel fixture", () => {
      const meta = parsePhpFile(fixture("MatchPanel.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MatchPanel");
      expect(cls.constructorParams).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // UC163: Multiple functions in one file
  // -------------------------------------------------------------------------
  describe("UC163: Multiple functions in one file", () => {
    it("renders calcDiscount", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("scalarFunc.php"),
        class: null,
        callable: "App\\Helpers\\calcDiscount",
        args: { price: 100, percent: 20 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("calc-discount");
      expect(result.html).toContain("80");
    });

    it("renders formatBytes", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("scalarFunc.php"),
        class: null,
        callable: "App\\Helpers\\formatBytes",
        args: { bytes: 2048, precision: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("KB");
    });

    it("parses multiple functions in scalarFunc", () => {
      const meta = parsePhpFile(advanced("scalarFunc.php"));
      expect(meta.functions).toHaveLength(2);
      expect(meta.functions.map((f) => f.name).sort()).toEqual(["calcDiscount", "formatBytes"]);
    });

    it("generates function module for calcDiscount", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./scalarFunc.php@calcDiscount", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("calcDiscount");
    });

    it("generates function module for formatBytes", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./scalarFunc.php@formatBytes", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("formatBytes");
    });

    it("parses MultiFunctionFile fixture", () => {
      const meta = parsePhpFile(fixture("MultiFunctionFile.php"));
      expect(meta.functions).toHaveLength(2);
      expect(meta.functions.map((f) => f.name).sort()).toEqual(["calcDiscount", "formatBytes"]);
    });
  });

  // -------------------------------------------------------------------------
  // UC164: Portfolio template with loops and arrays
  // -------------------------------------------------------------------------
  describe("UC164: Portfolio template", () => {
    it("renders portfolio with all params", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/portfolio.php"),
        class: null,
        callable: null,
        args: {
          name: "Jane",
          role: "Dev",
          skills: ["PHP", "TS"],
          projects: ["App"],
          showContact: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jane");
      expect(result.html).toContain("Dev");
      expect(result.html).toContain("PHP");
      expect(result.html).toContain("TS");
      expect(result.html).toContain("App");
      expect(result.html).toContain("Get in touch");
    });

    it("renders portfolio without contact", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/portfolio.php"),
        class: null,
        callable: null,
        args: { name: "Alex", showContact: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alex");
      expect(result.html).not.toContain("Get in touch");
    });

    it("renders portfolio with defaults", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/portfolio.php"),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jane Developer");
      expect(result.html).toContain("Full-Stack Engineer");
    });
  });

  // -------------------------------------------------------------------------
  // UC165: `static` return type (FluentElement)
  // -------------------------------------------------------------------------
  describe("UC165: static return type (FluentElement)", () => {
    it("renders FluentElement with default args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FluentElement.php"),
        class: "App\\Components\\FluentElement",
        callable: "render",
        args: { tag: "div", content: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("<div");
    });

    it("renders FluentElement as section", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("FluentElement.php"),
        class: "App\\Components\\FluentElement",
        callable: "render",
        args: { tag: "section", content: "Section content" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<section");
      expect(result.html).toContain("Section content");
    });

    it("parses FluentElement with static return type methods", () => {
      const meta = parsePhpFile(advanced("FluentElement.php"));
      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("FluentElement");
      const addClassMethod = cls.methods.find((m) => m.name === "addClass");
      expect(addClassMethod).toBeDefined();
      expect(addClassMethod!.returnType).toBe("static");
      const addStyleMethod = cls.methods.find((m) => m.name === "addStyle");
      expect(addStyleMethod).toBeDefined();
      expect(addStyleMethod!.returnType).toBe("static");
    });

    it("parses StaticReturnType fixture", () => {
      const meta = parsePhpFile(fixture("StaticReturnType.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StaticReturnType");
      const addClass = cls.methods.find((m) => m.name === "addClass");
      expect(addClass!.returnType).toBe("static");
      const setText = cls.methods.find((m) => m.name === "setText");
      expect(setText!.returnType).toBe("static");
      const render = cls.methods.find((m) => m.name === "render");
      expect(render!.returnType).toBe("string");
    });

    it("generates classMethod module for FluentElement", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./FluentElement.php@render", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("FluentElement");
    });
  });

  // -------------------------------------------------------------------------
  // UC166: callable/Closure type parameters (CallableLabel)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC166: callable/Closure params (CallableLabel)", () => {
    it("renders CallableLabel with just label", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("CallableLabel.php"),
        class: "App\\Components\\CallableLabel",
        callable: "render",
        args: { label: "Test Label" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Label");
      expect(result.html).toContain("callable-label");
    });

    it("renders CallableLabel with prefix", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("CallableLabel.php"),
        class: "App\\Components\\CallableLabel",
        callable: "render",
        args: { label: "Done", prefix: "Status" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Status: Done");
    });

    it("renders CallableLabel with prefix and suffix", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("CallableLabel.php"),
        class: "App\\Components\\CallableLabel",
        callable: "render",
        args: { label: "Task", prefix: "TODO", suffix: "(urgent)" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("TODO: Task (urgent)");
    });

    it("parses callable and Closure types in CallableLabel", () => {
      const meta = parsePhpFile(php81("CallableLabel.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("CallableLabel");
      const transformerParam = cls.constructorParams.find((p) => p.name === "transformer");
      expect(transformerParam).toBeDefined();
      expect(transformerParam!.type).toBe("callable");
      expect(transformerParam!.nullable).toBe(true);
    });

    it("parses CallableParam fixture with Closure type", () => {
      const meta = parsePhpFile(fixture("CallableParam.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("CallableParam");
      const ctorCallable = cls.constructorParams.find((p) => p.name === "transformer");
      expect(ctorCallable!.type).toBe("callable");
      expect(ctorCallable!.nullable).toBe(true);
      const renderMethod = cls.methods.find((m) => m.name === "render");
      const wrapperParam = renderMethod!.params.find((p) => p.name === "wrapper");
      expect(wrapperParam).toBeDefined();
      expect(wrapperParam!.type).toBe("Closure");
      expect(wrapperParam!.nullable).toBe(true);
    });

    it("generates classMethod module for CallableLabel", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./CallableLabel.php@render", php81("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("CallableLabel");
      expect(code).toContain("callable");
    });
  });

  // -------------------------------------------------------------------------
  // UC167: object and iterable type parameters (ObjectInspector)
  // -------------------------------------------------------------------------
  describe("UC167: object and iterable params (ObjectInspector)", () => {
    it("renders iterable list", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ObjectInspector.php"),
        class: "App\\Components\\ObjectInspector",
        callable: "renderIterable",
        args: { title: "Tags", items: ["PHP", "TypeScript", "Go"], separator: " | " },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("PHP");
      expect(result.html).toContain("TypeScript");
      expect(result.html).toContain("Go");
      expect(result.html).toContain("iterable-list");
    });

    it("renders object data", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ObjectInspector.php"),
        class: "App\\Components\\ObjectInspector",
        callable: "renderObject",
        args: { title: "Config", data: { host: "localhost", port: "3000" }, variant: "default" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("object-inspector");
      expect(result.html).toContain("Config");
      expect(result.html).toContain("host");
      expect(result.html).toContain("localhost");
    });

    it("parses object and iterable types", () => {
      const meta = parsePhpFile(advanced("ObjectInspector.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ObjectInspector");
      const renderObj = cls.methods.find((m) => m.name === "renderObject");
      expect(renderObj).toBeDefined();
      expect(renderObj!.params[0]!.type).toBe("object");
      const renderIter = cls.methods.find((m) => m.name === "renderIterable");
      expect(renderIter).toBeDefined();
      expect(renderIter!.params[0]!.type).toBe("iterable");
    });

    it("parses ObjectTypeParam fixture", () => {
      const meta = parsePhpFile(fixture("ObjectTypeParam.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ObjectTypeParam");
      const renderObj = cls.methods.find((m) => m.name === "renderObject");
      expect(renderObj!.params[0]!.type).toBe("object");
      const renderIter = cls.methods.find((m) => m.name === "renderIterable");
      expect(renderIter!.params[0]!.type).toBe("iterable");
    });

    it("generates classMethod module for renderIterable", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./ObjectInspector.php@renderIterable", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("ObjectInspector");
    });

    it("generates classMethod module for renderObject", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./ObjectInspector.php@renderObject", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("object");
    });
  });

  // -------------------------------------------------------------------------
  // UC168: Nested array defaults (nestedGrid)
  // -------------------------------------------------------------------------
  describe("UC168: Nested array defaults (nestedGrid)", () => {
    it("renders grid with default nested arrays", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("nestedGrid.php"),
        class: null,
        callable: "App\\Helpers\\renderGrid",
        args: { title: "Test Grid" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Grid");
      expect(result.html).toContain("A1");
      expect(result.html).toContain("B3");
      expect(result.html).toContain("nested-grid");
    });

    it("renders grid with custom rows", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("nestedGrid.php"),
        class: null,
        callable: "App\\Helpers\\renderGrid",
        args: {
          title: "Custom",
          rows: [
            ["X", "Y"],
            ["1", "2"],
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Custom");
      expect(result.html).toContain("X");
      expect(result.html).toContain("Y");
    });

    it("renders matrix with defaults", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("nestedGrid.php"),
        class: null,
        callable: "App\\Helpers\\renderMatrix",
        args: { label: "Identity" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Identity");
      expect(result.html).toContain("matrix");
    });

    it("parses nested default arrays in functions", () => {
      const meta = parsePhpFile(advanced("nestedGrid.php"));
      expect(meta.functions).toHaveLength(2);
      const gridFn = meta.functions.find((f) => f.name === "renderGrid");
      expect(gridFn).toBeDefined();
      const rowsParam = gridFn!.params.find((p) => p.name === "rows");
      expect(rowsParam).toBeDefined();
      expect(rowsParam!.default).toBeDefined();
      // The default should contain the nested array representation
      expect(rowsParam!.default).toContain("[");
      const configParam = gridFn!.params.find((p) => p.name === "config");
      expect(configParam).toBeDefined();
      expect(configParam!.default).toBeDefined();
    });

    it("parses NestedDefaults fixture", () => {
      const meta = parsePhpFile(fixture("NestedDefaults.php"));
      expect(meta.functions).toHaveLength(2);
      const gridFn = meta.functions.find((f) => f.name === "renderGrid");
      expect(gridFn).toBeDefined();
      expect(gridFn!.params).toHaveLength(3);
      const matrixFn = meta.functions.find((f) => f.name === "renderMatrix");
      expect(matrixFn).toBeDefined();
      expect(matrixFn!.params).toHaveLength(2);
    });

    it("generates function module for renderGrid", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./nestedGrid.php@renderGrid", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("renderGrid");
    });

    it("generates function module for renderMatrix", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./nestedGrid.php@renderMatrix", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("renderMatrix");
    });
  });

  // -------------------------------------------------------------------------
  // UC169: Enum with static factory methods (SeverityEnum)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC169: Enum static factory (SeverityEnum)", () => {
    it("renders badge for Low case", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("SeverityEnum.php"),
        class: "App\\Components\\SeverityEnum",
        callable: "badge",
        args: { _case: "low" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("severity-badge");
      expect(result.html).toContain("Low");
    });

    it("renders badge for Critical case", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("SeverityEnum.php"),
        class: "App\\Components\\SeverityEnum",
        callable: "badge",
        args: { _case: "critical" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Critical");
    });

    it("renders all severities via static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("SeverityEnum.php"),
        class: "App\\Components\\SeverityEnum",
        callable: "all",
        args: { separator: " " },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("severity-list");
      expect(result.html).toContain("Low");
      expect(result.html).toContain("Critical");
    });

    it("renders ofLevel static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("SeverityEnum.php"),
        class: "App\\Components\\SeverityEnum",
        callable: "ofLevel",
        args: { level: 95, prefix: "Alert:" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Critical");
      expect(result.html).toContain("Alert:");
    });

    it("renders low level via ofLevel", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("SeverityEnum.php"),
        class: "App\\Components\\SeverityEnum",
        callable: "ofLevel",
        args: { level: 10 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Low");
    });

    it("parses SeverityEnum with instance + static methods", () => {
      const meta = parsePhpFile(php81("SeverityEnum.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("SeverityEnum");
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);
      const badge = cls.methods.find((m) => m.name === "badge");
      expect(badge).toBeDefined();
      expect(badge!.isStatic).toBe(false);
      const all = cls.methods.find((m) => m.name === "all");
      expect(all).toBeDefined();
      expect(all!.isStatic).toBe(true);
      const ofLevel = cls.methods.find((m) => m.name === "ofLevel");
      expect(ofLevel).toBeDefined();
      expect(ofLevel!.isStatic).toBe(true);
      expect(ofLevel!.params[0]!.type).toBe("int");
    });

    it("parses EnumStaticFactory fixture", () => {
      const meta = parsePhpFile(fixture("EnumStaticFactory.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Severity");
      expect(cls.isEnum).toBe(true);
      expect(cls.methods.find((m) => m.name === "badge")).toBeDefined();
      expect(cls.methods.find((m) => m.name === "all")!.isStatic).toBe(true);
      expect(cls.methods.find((m) => m.name === "ofLevel")!.isStatic).toBe(true);
    });

    it("generates enumMethod module for badge", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./SeverityEnum.php@badge", php81("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("SeverityEnum");
    });

    it("generates staticMethod module for all", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./SeverityEnum.php@all", php81("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("SeverityEnum");
    });

    it("generates staticMethod module for ofLevel", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./SeverityEnum.php@ofLevel", php81("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("level");
    });
  });

  // -------------------------------------------------------------------------
  // UC170: string|false return type (SearchResult)
  // -------------------------------------------------------------------------
  describe("UC170: string|false return type (SearchResult)", () => {
    it("renders found result", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("SearchResult.php"),
        class: "App\\Components\\SearchResult",
        callable: "render",
        args: { haystack: "Hello world, welcome!", needle: "world" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Found");
      expect(result.html).toContain("world");
    });

    it("renders not-found result", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("SearchResult.php"),
        class: "App\\Components\\SearchResult",
        callable: "render",
        args: { haystack: "Hello world", needle: "missing" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Not found");
      expect(result.html).toContain("missing");
    });

    it("parses string|false return type", () => {
      const meta = parsePhpFile(php80("SearchResult.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("SearchResult");
      const findFirst = cls.methods.find((m) => m.name === "findFirst");
      expect(findFirst).toBeDefined();
      expect(findFirst!.returnType).toBe("string|false");
    });

    it("parses StringFalseReturn fixture", () => {
      const meta = parsePhpFile(fixture("StringFalseReturn.php"));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StringFalseReturn");
      const findFirst = cls.methods.find((m) => m.name === "findFirst");
      expect(findFirst!.returnType).toBe("string|false");
    });

    it("generates classMethod module for SearchResult", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./SearchResult.php@render", php80("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("SearchResult");
    });
  });

  // -------------------------------------------------------------------------
  // UC171: Multiple interface implementation (ItemCollection)
  // -------------------------------------------------------------------------
  describe("UC171: Multiple interface implementation (ItemCollection)", () => {
    it("renders collection with items", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ItemCollection.php"),
        class: "App\\Components\\ItemCollection",
        callable: "render",
        args: { name: "Frameworks", items: ["Laravel", "Symfony", "CodeIgniter"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Frameworks");
      expect(result.html).toContain("(3)");
      expect(result.html).toContain("Laravel");
      expect(result.html).toContain("Symfony");
    });

    it("renders empty collection", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ItemCollection.php"),
        class: "App\\Components\\ItemCollection",
        callable: "render",
        args: { name: "Empty", items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Empty");
      expect(result.html).toContain("(0)");
      expect(result.html).toContain("No items");
    });

    it("renders compact variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ItemCollection.php"),
        class: "App\\Components\\ItemCollection",
        callable: "render",
        args: { name: "Tags", items: ["php", "vite"], variant: "compact" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("item-collection");
      expect(result.html).toContain("Tags");
    });

    it("parses class implementing 3 interfaces", () => {
      const meta = parsePhpFile(advanced("ItemCollection.php"));
      // Interfaces + the class
      const cls = meta.classes.find((c) => c.name === "ItemCollection");
      expect(cls).toBeDefined();
      expect(cls!.implements).toEqual(["HasTitle", "HasCount", "HasSummary"]);
      expect(cls!.methods.map((m) => m.name).sort()).toEqual([
        "getCount",
        "getTitle",
        "render",
        "summarize",
      ]);
    });

    it("parses MultiInterfaceClass fixture", () => {
      const meta = parsePhpFile(fixture("MultiInterfaceClass.php"));
      const cls = meta.classes.find((c) => c.name === "MultiInterfaceClass");
      expect(cls).toBeDefined();
      expect(cls!.implements).toEqual(["Renderable", "Countable2", "Describable"]);
    });

    it("generates classMethod module for ItemCollection", () => {
      const plugin = storybookPhpPlugin({});
      const resolveId = (plugin as any).resolveId.bind(plugin);
      const load = (plugin as any).load.bind(plugin);
      const id = resolveId("./ItemCollection.php@render", advanced("Button.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("ItemCollection");
    });
  });

  // -------------------------------------------------------------------------
  // UC172: Kanban template (nested columns with cards)
  // -------------------------------------------------------------------------
  describe("UC172: Kanban template", () => {
    it("renders kanban with default columns", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/kanban.php"),
        class: null,
        callable: null,
        args: { boardTitle: "Sprint Board" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Sprint Board");
      expect(result.html).toContain("To Do");
      expect(result.html).toContain("In Progress");
      expect(result.html).toContain("Done");
      expect(result.html).toContain("Design header");
    });

    it("renders kanban with custom columns", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/kanban.php"),
        class: null,
        callable: null,
        args: {
          boardTitle: "Custom",
          columns: [
            { title: "Backlog", cards: ["Task A"] },
            { title: "Active", cards: ["Task B", "Task C"] },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Custom");
      expect(result.html).toContain("Backlog");
      expect(result.html).toContain("Task A");
      expect(result.html).toContain("Task B");
    });

    it("renders kanban without counts", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/kanban.php"),
        class: null,
        callable: null,
        args: { boardTitle: "Minimal", showCounts: false, compact: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Minimal");
      expect(result.html).toContain("kanban-board");
    });
  });

  // -------------------------------------------------------------------------
  // UC173: Settings template (grouped key-value pairs)
  // -------------------------------------------------------------------------
  describe("UC173: Settings template", () => {
    it("renders settings with defaults", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/settings.php"),
        class: null,
        callable: null,
        args: { title: "App Settings" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("App Settings");
      expect(result.html).toContain("General");
      expect(result.html).toContain("Database");
      expect(result.html).toContain("MyApp");
      expect(result.html).toContain("localhost");
    });

    it("renders custom settings sections", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/settings.php"),
        class: null,
        callable: null,
        args: {
          title: "Server",
          sections: [{ heading: "Network", settings: { Port: "8080", Host: "0.0.0.0" } }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Server");
      expect(result.html).toContain("Network");
      expect(result.html).toContain("8080");
    });

    it("renders readonly settings", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/settings.php"),
        class: null,
        callable: null,
        args: { title: "Read Only", readonly: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Read Only");
      expect(result.html).toContain("settings-panel");
    });
  });

  // -------------------------------------------------------------------------
  // UC174: Nested trait chain (TraitChain)
  // -------------------------------------------------------------------------
  describe("UC174: Nested trait chain (TraitChain)", () => {
    it("renders TraitChain.render using method from own class", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitChain.php"),
        class: "App\\Components\\TraitChain",
        callable: "render",
        args: { title: "Info", key: "Status", value: "Active" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Info");
      expect(result.html).toContain("Status");
      expect(result.html).toContain("Active");
    });

    it("renders TraitChain.row from middle trait (HasLayout)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitChain.php"),
        class: "App\\Components\\TraitChain",
        callable: "row",
        args: { left: "Label", right: "Value" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Label");
      expect(result.html).toContain("Value");
    });

    it("renders TraitChain.styled from deepest trait (HasStyle)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitChain.php"),
        class: "App\\Components\\TraitChain",
        callable: "styled",
        args: { text: "Deep trait", color: "#ef4444" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Deep trait");
      expect(result.html).toContain("#ef4444");
    });

    it("renders TraitChain.container from direct trait (HasContainer)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitChain.php"),
        class: "App\\Components\\TraitChain",
        callable: "container",
        args: { title: "Box", content: "<p>Inside</p>" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Box");
      expect(result.html).toContain("Inside");
    });

    it("parses TraitChain with nested trait usage", () => {
      const meta = parsePhpFile(advanced("TraitChain.php"));
      const hasStyle = meta.classes.find((c) => c.name === "HasStyle")!;
      expect(hasStyle.isTrait).toBe(true);
      expect(hasStyle.methods).toHaveLength(1);
      expect(hasStyle.methods[0]!.name).toBe("styled");

      const hasLayout = meta.classes.find((c) => c.name === "HasLayout")!;
      expect(hasLayout.isTrait).toBe(true);
      expect(hasLayout.traits).toContain("HasStyle");
      expect(hasLayout.methods[0]!.name).toBe("row");

      const hasContainer = meta.classes.find((c) => c.name === "HasContainer")!;
      expect(hasContainer.isTrait).toBe(true);
      expect(hasContainer.traits).toContain("HasLayout");

      const cls = meta.classes.find((c) => c.name === "TraitChain")!;
      expect(cls.traits).toContain("HasContainer");
    });

    it("vite plugin resolves nested trait methods", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      // styled is 3 levels deep: TraitChain -> HasContainer -> HasLayout -> HasStyle
      const styledId = resolveId("./TraitChain.php@styled", advanced("TraitChain.stories.ts"));
      expect(styledId).toBeTruthy();
      const styledCode = load(styledId);
      expect(styledCode).toContain("export const TraitChain");
      expect(styledCode).toContain("__type: 'classMethod'");
      expect(styledCode).toContain("text");

      // row is 2 levels deep: TraitChain -> HasContainer -> HasLayout
      const rowId = resolveId("./TraitChain.php@row", advanced("TraitChain.stories.ts"));
      const rowCode = load(rowId);
      expect(rowCode).toContain("export const TraitChain");
      expect(rowCode).toContain("left");
    });

    it("parses NestedTrait fixture", () => {
      const meta = parsePhpFile(fixture("NestedTrait.php"));
      const hasBorder = meta.classes.find((c) => c.name === "HasBorder")!;
      expect(hasBorder.isTrait).toBe(true);

      const hasCard = meta.classes.find((c) => c.name === "HasCard")!;
      expect(hasCard.isTrait).toBe(true);
      expect(hasCard.traits).toContain("HasBorder");

      const widget = meta.classes.find((c) => c.name === "NestedTraitWidget")!;
      expect(widget.traits).toContain("HasCard");
    });
  });

  // -------------------------------------------------------------------------
  // UC175: Unit enum with static method (Season)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC175: Unit enum with static method (Season)", () => {
    it("renders Season.render instance method", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: basic("Season.php"),
        class: "App\\Components\\Season",
        callable: "render",
        args: { _case: "Spring", description: "Flowers bloom" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Spring");
      expect(result.html).toContain("Flowers bloom");
    });

    it("renders Season.render for Winter", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: basic("Season.php"),
        class: "App\\Components\\Season",
        callable: "render",
        args: { _case: "Winter" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Winter");
      expect(result.html).toContain("&#x2744;");
    });

    it("renders Season::grid static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Season.php"),
        class: "App\\Components\\Season",
        callable: "grid",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("season-grid");
      expect(result.html).toContain("Spring");
      expect(result.html).toContain("Summer");
      expect(result.html).toContain("Autumn");
      expect(result.html).toContain("Winter");
    });

    it("renders Season::current static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: basic("Season.php"),
        class: "App\\Components\\Season",
        callable: "current",
        args: { hemisphere: "north" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("season");
      expect(result.html).toContain("northern hemisphere");
    });

    it("parses Season as unit enum with static and instance methods", () => {
      const meta = parsePhpFile(basic("Season.php"));
      const cls = meta.classes.find((c) => c.name === "Season")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBeNull();
      expect(cls.enumCases).toEqual(["Spring", "Summer", "Autumn", "Winter"]);

      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(staticMethods.map((m) => m.name)).toContain("grid");
      expect(staticMethods.map((m) => m.name)).toContain("current");

      const instanceMethods = cls.methods.filter((m) => !m.isStatic);
      expect(instanceMethods.map((m) => m.name)).toContain("render");
      expect(instanceMethods.map((m) => m.name)).toContain("emoji");
      expect(instanceMethods.map((m) => m.name)).toContain("label");
    });

    it("vite plugin generates enumMethod for instance and staticMethod for static", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const renderId = resolveId("./Season.php@render", basic("Season.stories.ts"));
      const renderCode = load(renderId);
      expect(renderCode).toContain("__type: 'enumMethod'");
      expect(renderCode).toContain("_case");

      const gridId = resolveId("./Season.php@grid", basic("SeasonGrid.stories.ts"));
      const gridCode = load(gridId);
      expect(gridCode).toContain("__type: 'staticMethod'");

      const currentId = resolveId("./Season.php@current", basic("SeasonCurrent.stories.ts"));
      const currentCode = load(currentId);
      expect(currentCode).toContain("__type: 'staticMethod'");
    });

    it("parses UnitEnumStatic fixture", () => {
      const meta = parsePhpFile(fixture("UnitEnumStatic.php"));
      const cls = meta.classes.find((c) => c.name === "Direction")!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBeNull();
      expect(cls.enumCases).toEqual(["North", "South", "East", "West"]);
      expect(cls.methods.find((m) => m.name === "arrow")).toBeTruthy();
      expect(cls.methods.find((m) => m.name === "compass")!.isStatic).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC176: Class composition — same-file class as typed constructor param (ComposedCard)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC176: Class composition (ComposedCard)", () => {
    it("renders ComposedCard with Author object", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ComposedCard.php"),
        class: "App\\Components\\ComposedCard",
        callable: "render",
        args: {
          title: "Test Post",
          author: { name: "Alice", role: "Admin" },
          body: "Post body text.",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Post");
      expect(result.html).toContain("Alice");
      expect(result.html).toContain("Admin");
      expect(result.html).toContain("Post body text.");
    });

    it("renders ComposedCard with date", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ComposedCard.php"),
        class: "App\\Components\\ComposedCard",
        callable: "render",
        args: {
          title: "Release",
          author: { name: "Bob" },
          date: "2025-03-01",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Release");
      expect(result.html).toContain("Bob");
      expect(result.html).toContain("Contributor");
      expect(result.html).toContain("2025-03-01");
    });

    it("parses ComposedCard with Author class in same file", () => {
      const meta = parsePhpFile(advanced("ComposedCard.php"));
      const author = meta.classes.find((c) => c.name === "Author")!;
      expect(author.constructorParams).toHaveLength(3);
      expect(author.constructorParams[0]!.name).toBe("name");

      const card = meta.classes.find((c) => c.name === "ComposedCard")!;
      expect(card.constructorParams).toHaveLength(4);
      const authorParam = card.constructorParams.find((p) => p.name === "author")!;
      expect(authorParam.type).toBe("Author");
    });

    it("parses ComposedClass fixture", () => {
      const meta = parsePhpFile(fixture("ComposedClass.php"));
      const address = meta.classes.find((c) => c.name === "Address")!;
      expect(address.constructorParams).toHaveLength(2);

      const contact = meta.classes.find((c) => c.name === "Contact")!;
      const addrParam = contact.constructorParams.find((p) => p.name === "address")!;
      expect(addrParam.type).toBe("Address");
    });

    it("renders ComposedClass fixture with recursive instantiation", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ComposedClass.php"),
        class: "App\\Components\\Contact",
        callable: "render",
        args: {
          name: "Taro",
          address: { city: "Osaka", country: "Japan" },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Taro");
      expect(result.html).toContain("Osaka");
      expect(result.html).toContain("Japan");
    });

    it("renders ComposedClass with default address", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ComposedClass.php"),
        class: "App\\Components\\Contact",
        callable: "render",
        args: { name: "Default User" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Default User");
      expect(result.html).toContain("Tokyo");
    });
  });

  // -------------------------------------------------------------------------
  // UC177: Abstract class + interface + concrete children (AbstractWidget)
  // -------------------------------------------------------------------------
  describe("UC177: Abstract class + interface + concrete children (AbstractWidget)", () => {
    it("renders InfoWidget.display", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractWidget.php"),
        class: "App\\Components\\InfoWidget",
        callable: "display",
        args: { title: "Notice", message: "Test message", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Notice");
      expect(result.html).toContain("Test message");
      expect(result.html).toContain("widget-primary");
    });

    it("renders CounterWidget.display", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("AbstractWidget.php"),
        class: "App\\Components\\CounterWidget",
        callable: "display",
        args: { title: "Progress", count: 75, max: 100, variant: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Progress");
      expect(result.html).toContain("75/100");
      expect(result.html).toContain("75%");
      expect(result.html).toContain("widget-success");
    });

    it("renders BaseWidget::availableVariants static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("AbstractWidget.php"),
        class: "App\\Components\\BaseWidget",
        callable: "availableVariants",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("default");
      expect(result.html).toContain("primary");
      expect(result.html).toContain("success");
      expect(result.html).toContain("danger");
    });

    it("parses AbstractWidget with interface and abstract class", () => {
      const meta = parsePhpFile(advanced("AbstractWidget.php"));

      const iface = meta.classes.find((c) => c.name === "Displayable")!;
      expect(iface.isInterface).toBe(true);

      const abstract = meta.classes.find((c) => c.name === "BaseWidget")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.implements).toContain("Displayable");

      const info = meta.classes.find((c) => c.name === "InfoWidget")!;
      expect(info.isAbstract).toBe(false);
      expect(info.extends).toBe("BaseWidget");

      const counter = meta.classes.find((c) => c.name === "CounterWidget")!;
      expect(counter.extends).toBe("BaseWidget");
    });

    it("vite plugin generates classMethod for concrete children, staticMethod for abstract", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      // display is inherited from BaseWidget, but exported for InfoWidget and CounterWidget
      const displayId = resolveId(
        "./AbstractWidget.php@display",
        advanced("AbstractWidget.stories.ts"),
      );
      const displayCode = load(displayId);
      expect(displayCode).toContain("export const InfoWidget");
      expect(displayCode).toContain("export const CounterWidget");
      expect(displayCode).toContain("__type: 'classMethod'");
      // Abstract class should NOT be exported as classMethod
      expect(displayCode).not.toContain("export const BaseWidget");

      // availableVariants is a static method on the abstract class
      const variantsId = resolveId(
        "./AbstractWidget.php@availableVariants",
        advanced("AbstractWidgetVariants.stories.ts"),
      );
      const variantsCode = load(variantsId);
      expect(variantsCode).toContain("export const BaseWidget");
      expect(variantsCode).toContain("__type: 'staticMethod'");
    });

    it("parses AbstractInterface fixture", () => {
      const meta = parsePhpFile(fixture("AbstractInterface.php"));

      const iface = meta.classes.find((c) => c.name === "Renderable")!;
      expect(iface.isInterface).toBe(true);

      const abstract = meta.classes.find((c) => c.name === "AbstractPanel")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.implements).toContain("Renderable");

      const info = meta.classes.find((c) => c.name === "InfoPanel")!;
      expect(info.extends).toBe("AbstractPanel");
    });
  });

  // -------------------------------------------------------------------------
  // UC178: Static method with void/echo return
  // -------------------------------------------------------------------------
  describe("UC178: Static echo method", () => {
    it("renders StaticEcho::banner via echo", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("StaticEcho.php"),
        class: "App\\Components\\StaticEcho",
        callable: "banner",
        args: { title: "Hello" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("static-banner");
      expect(result.html).toContain("Hello");
    });

    it("renders StaticEcho::banner with custom color", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("StaticEcho.php"),
        class: "App\\Components\\StaticEcho",
        callable: "banner",
        args: { title: "Alert", color: "#ef4444" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#ef4444");
      expect(result.html).toContain("Alert");
    });

    it("renders StaticEcho::notice with type", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("StaticEcho.php"),
        class: "App\\Components\\StaticEcho",
        callable: "notice",
        args: { message: "Test message", type: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("static-notice-success");
      expect(result.html).toContain("Test message");
      expect(result.html).toContain("Success:");
    });

    it("renders StaticEcho::notice with default type", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: advanced("StaticEcho.php"),
        class: "App\\Components\\StaticEcho",
        callable: "notice",
        args: { message: "Default notice" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("static-notice-info");
      expect(result.html).toContain("Info:");
    });

    it("parses StaticEcho correctly", () => {
      const meta = parsePhpFile(advanced("StaticEcho.php"));
      const cls = meta.classes.find((c) => c.name === "StaticEcho");
      expect(cls).toBeDefined();
      expect(cls!.methods).toHaveLength(2);

      const banner = cls!.methods.find((m) => m.name === "banner");
      expect(banner).toBeDefined();
      expect(banner!.isStatic).toBe(true);
      expect(banner!.returnType).toBe("void");
      expect(banner!.params).toHaveLength(2);
      expect(banner!.params[0]!.name).toBe("title");
      expect(banner!.params[1]!.name).toBe("color");
      expect(banner!.params[1]!.required).toBe(false);

      const notice = cls!.methods.find((m) => m.name === "notice");
      expect(notice).toBeDefined();
      expect(notice!.isStatic).toBe(true);
      expect(notice!.returnType).toBe("void");
    });

    it("parses StaticEcho fixture", () => {
      const meta = parsePhpFile(fixture("StaticEcho.php"));
      const cls = meta.classes.find((c) => c.name === "StaticEcho");
      expect(cls).toBeDefined();
      expect(cls!.methods).toHaveLength(2);
      expect(cls!.methods.every((m) => m.isStatic)).toBe(true);
      expect(cls!.methods.every((m) => m.returnType === "void")).toBe(true);
    });

    it("generates static method module via vite plugin", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const bannerId = resolveId("./StaticEcho.php@banner", advanced("StaticEcho.stories.ts"));
      expect(bannerId).toContain("StaticEcho.php");
      const bannerCode = load(bannerId);
      expect(bannerCode).toContain("__type: 'staticMethod'");
      expect(bannerCode).toContain("StaticEcho");
      expect(bannerCode).toContain("title");

      const noticeId = resolveId(
        "./StaticEcho.php@notice",
        advanced("StaticEchoNotice.stories.ts"),
      );
      const noticeCode = load(noticeId);
      expect(noticeCode).toContain("__type: 'staticMethod'");
      expect(noticeCode).toContain("message");
    });
  });

  // -------------------------------------------------------------------------
  // UC179: Trait template method pattern (abstract hooks in trait)
  // -------------------------------------------------------------------------
  describe("UC179: Trait template method pattern", () => {
    it("renders InfoSection via trait render method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitTemplate.php"),
        class: "App\\Components\\InfoSection",
        callable: "render",
        args: { title: "Overview", content: "This is the body." },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("section-card");
      expect(result.html).toContain("Overview");
      expect(result.html).toContain("This is the body.");
    });

    it("renders with optional footer note", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitTemplate.php"),
        class: "App\\Components\\InfoSection",
        callable: "render",
        args: { title: "Note", content: "Details here.", note: "Updated recently" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Updated recently");
    });

    it("omits footer when note is null", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitTemplate.php"),
        class: "App\\Components\\InfoSection",
        callable: "render",
        args: { title: "Test", content: "Body" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("section-card");
      expect(result.html).not.toContain("<footer");
    });

    it("parses trait with abstract methods and class", () => {
      const meta = parsePhpFile(advanced("TraitTemplate.php"));

      const trait = meta.classes.find((c) => c.name === "HasSection");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      // The trait has render() and footer() as concrete methods,
      // plus heading() and body() as abstract methods (all extracted by parser)
      expect(trait!.methods.some((m) => m.name === "render")).toBe(true);
      expect(trait!.methods.some((m) => m.name === "footer")).toBe(true);

      const cls = meta.classes.find((c) => c.name === "InfoSection");
      expect(cls).toBeDefined();
      expect(cls!.traits).toContain("HasSection");
      expect(cls!.constructorParams).toHaveLength(3);
      expect(cls!.constructorParams[0]!.name).toBe("title");
      expect(cls!.constructorParams[1]!.name).toBe("content");
      expect(cls!.constructorParams[2]!.name).toBe("note");
      expect(cls!.constructorParams[2]!.nullable).toBe(true);
    });

    it("parses TraitTemplate fixture", () => {
      const meta = parsePhpFile(fixture("TraitTemplate.php"));
      const trait = meta.classes.find((c) => c.name === "HasSection");
      expect(trait?.isTrait).toBe(true);
      expect(trait!.methods.some((m) => m.name === "render")).toBe(true);

      const cls = meta.classes.find((c) => c.name === "InfoSection");
      expect(cls).toBeDefined();
      expect(cls!.traits).toContain("HasSection");
    });

    it("generates classMethod module resolving render from trait", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const resolved = resolveId(
        "./TraitTemplate.php@render",
        advanced("TraitTemplate.stories.ts"),
      );
      expect(resolved).toContain("TraitTemplate.php");
      const code = load(resolved);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("InfoSection");
      // Should NOT export the trait itself
      expect(code).not.toContain("export const HasSection");
    });
  });

  // -------------------------------------------------------------------------
  // UC180: Function returning ['html' => '...'] array
  // -------------------------------------------------------------------------
  describe("UC180: Function returning html array", () => {
    it("renders statusCard via array return", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("funcHtmlArray.php"),
        class: null,
        callable: "statusCard",
        args: { title: "Users", status: "active", count: 42 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("status-card");
      expect(result.html).toContain("Users");
      expect(result.html).toContain("42");
      expect(result.html).toContain("active");
    });

    it("uses default status and count", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("funcHtmlArray.php"),
        class: null,
        callable: "statusCard",
        args: { title: "Items" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Items");
      expect(result.html).toContain("active");
    });

    it("renders with pending status", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("funcHtmlArray.php"),
        class: null,
        callable: "statusCard",
        args: { title: "Orders", status: "pending", count: 7 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("pending");
      expect(result.html).toContain("#f59e0b");
    });

    it("parses function correctly", () => {
      const meta = parsePhpFile(advanced("funcHtmlArray.php"));
      expect(meta.functions).toHaveLength(1);
      expect(meta.functions[0]!.name).toBe("statusCard");
      expect(meta.functions[0]!.params).toHaveLength(3);
      expect(meta.functions[0]!.params[0]!.name).toBe("title");
      expect(meta.functions[0]!.params[0]!.type).toBe("string");
      expect(meta.functions[0]!.params[0]!.required).toBe(true);
      expect(meta.functions[0]!.params[1]!.name).toBe("status");
      expect(meta.functions[0]!.params[1]!.required).toBe(false);
      expect(meta.functions[0]!.params[2]!.name).toBe("count");
      expect(meta.functions[0]!.params[2]!.type).toBe("int");
      expect(meta.functions[0]!.returnType).toBe("array");
    });

    it("parses FuncHtmlArray fixture", () => {
      const meta = parsePhpFile(fixture("FuncHtmlArray.php"));
      expect(meta.functions).toHaveLength(1);
      expect(meta.functions[0]!.name).toBe("statusCard");
      expect(meta.functions[0]!.returnType).toBe("array");
    });

    it("generates function module via vite plugin", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const resolved = resolveId(
        "./funcHtmlArray.php@statusCard",
        advanced("funcHtmlArray.stories.ts"),
      );
      expect(resolved).toContain("funcHtmlArray.php");
      const code = load(resolved);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("statusCard");
      expect(code).toContain("title");
    });
  });

  // -------------------------------------------------------------------------
  // UC181: Enum with interface AND trait combined
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC181: Enum with interface and trait", () => {
    it("renders Palette::swatch for red", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumInterfaceTrait.php"),
        class: "App\\Components\\Palette",
        callable: "swatch",
        args: { _case: "red" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("palette-swatch");
      expect(result.html).toContain("#ef4444");
      expect(result.html).toContain("Red");
    });

    it("renders swatch with custom size", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumInterfaceTrait.php"),
        class: "App\\Components\\Palette",
        callable: "swatch",
        args: { _case: "blue", size: "64px" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("64px");
      expect(result.html).toContain("#3b82f6");
    });

    it("renders yellow swatch", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumInterfaceTrait.php"),
        class: "App\\Components\\Palette",
        callable: "swatch",
        args: { _case: "yellow", size: "32px" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#f59e0b");
      expect(result.html).toContain("Yellow");
    });

    it("parses enum with interface and trait", () => {
      const meta = parsePhpFile(php81("EnumInterfaceTrait.php"));

      const iface = meta.classes.find((c) => c.name === "Describable");
      expect(iface).toBeDefined();
      expect(iface!.isInterface).toBe(true);

      const trait = meta.classes.find((c) => c.name === "HasColorCode");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.methods.some((m) => m.name === "colorCode")).toBe(true);

      const enumCls = meta.classes.find((c) => c.name === "Palette");
      expect(enumCls).toBeDefined();
      expect(enumCls!.isEnum).toBe(true);
      expect(enumCls!.enumBackingType).toBe("string");
      expect(enumCls!.implements).toContain("Describable");
      expect(enumCls!.traits).toContain("HasColorCode");
      expect(enumCls!.enumCases).toEqual(["Red", "Green", "Blue", "Yellow"]);
      expect(enumCls!.methods.some((m) => m.name === "describe")).toBe(true);
      expect(enumCls!.methods.some((m) => m.name === "swatch")).toBe(true);
    });

    it("parses EnumInterfaceTrait fixture", () => {
      const meta = parsePhpFile(fixture("EnumInterfaceTrait.php"));
      const enumCls = meta.classes.find((c) => c.name === "Palette");
      expect(enumCls?.isEnum).toBe(true);
      expect(enumCls?.implements).toContain("Describable");
      expect(enumCls?.traits).toContain("HasColorCode");
    });

    it("generates enum method module via vite plugin", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const swatchId = resolveId(
        "./EnumInterfaceTrait.php@swatch",
        php81("EnumInterfaceTrait.stories.ts"),
      );
      expect(swatchId).toContain("EnumInterfaceTrait.php");
      const swatchCode = load(swatchId);
      expect(swatchCode).toContain("__type: 'enumMethod'");
      expect(swatchCode).toContain("Palette");
      // Should NOT export the interface or trait
      expect(swatchCode).not.toContain("export const Describable");
      expect(swatchCode).not.toContain("export const HasColorCode");
    });

    it("resolves colorCode from trait for enum", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      // colorCode comes from the HasColorCode trait
      const colorCodeId = resolveId(
        "./EnumInterfaceTrait.php@colorCode",
        php81("EnumInterfaceTrait.stories.ts"),
      );
      const colorCodeCode = load(colorCodeId);
      expect(colorCodeCode).toContain("__type: 'enumMethod'");
      expect(colorCodeCode).toContain("Palette");
    });
  });

  // -------------------------------------------------------------------------
  // UC182: Class overriding trait method
  // -------------------------------------------------------------------------
  describe("UC182: Class overriding trait method", () => {
    it("uses class render() over trait render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("OverrideTrait.php"),
        class: "App\\Components\\OverrideTrait",
        callable: "render",
        args: { title: "Custom" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("override-card");
      expect(result.html).toContain("Custom");
      // Should NOT contain default render from trait
      expect(result.html).not.toContain("Default render from trait");
    });

    it("renders with secondary variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("OverrideTrait.php"),
        class: "App\\Components\\OverrideTrait",
        callable: "render",
        args: { title: "Fallback", variant: "secondary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#6b7280");
      expect(result.html).toContain("Fallback");
    });

    it("still uses trait badge() method via render", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("OverrideTrait.php"),
        class: "App\\Components\\OverrideTrait",
        callable: "render",
        args: { title: "Test" },
      });
      expect(result.error).toBeUndefined();
      // The class render() calls $this->badge() which comes from the trait
      expect(result.html).toContain("default-badge");
    });

    it("can call trait badge() directly", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("OverrideTrait.php"),
        class: "App\\Components\\OverrideTrait",
        callable: "badge",
        args: { title: "Test" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("default-badge");
      expect(result.html).toContain("default");
    });

    it("parses class with overridden trait method", () => {
      const meta = parsePhpFile(advanced("OverrideTrait.php"));

      const trait = meta.classes.find((c) => c.name === "HasDefaultRender");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.methods.some((m) => m.name === "render")).toBe(true);
      expect(trait!.methods.some((m) => m.name === "badge")).toBe(true);

      const cls = meta.classes.find((c) => c.name === "OverrideTrait");
      expect(cls).toBeDefined();
      expect(cls!.traits).toContain("HasDefaultRender");
      // The class defines its own render() method
      expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
      // badge() is only in the trait, not in the class directly
      expect(cls!.methods.some((m) => m.name === "badge")).toBe(false);
      expect(cls!.constructorParams).toHaveLength(2);
    });

    it("parses OverrideTrait fixture", () => {
      const meta = parsePhpFile(fixture("OverrideTrait.php"));
      const cls = meta.classes.find((c) => c.name === "OverrideTrait");
      expect(cls).toBeDefined();
      expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
      expect(cls!.traits).toContain("HasDefaultRender");
    });

    it("generates classMethod module using class render (not trait render)", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const renderId = resolveId(
        "./OverrideTrait.php@render",
        advanced("OverrideTrait.stories.ts"),
      );
      const renderCode = load(renderId);
      expect(renderCode).toContain("__type: 'classMethod'");
      expect(renderCode).toContain("OverrideTrait");
      // Should NOT export the trait
      expect(renderCode).not.toContain("export const HasDefaultRender");
    });

    it("generates classMethod module for trait badge via class", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const badgeId = resolveId(
        "./OverrideTrait.php@badge",
        advanced("OverrideTraitBadge.stories.ts"),
      );
      const badgeCode = load(badgeId);
      expect(badgeCode).toContain("__type: 'classMethod'");
      expect(badgeCode).toContain("OverrideTrait");
    });
  });

  // -------------------------------------------------------------------------
  // UC183: Trait with abstract method (template method pattern)
  // -------------------------------------------------------------------------
  describe("UC183: Trait with abstract method", () => {
    it("renders TraitAbstract with title only", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitAbstract.php"),
        class: "App\\Components\\TraitAbstract",
        callable: "render",
        args: { title: "Template Pattern" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("layout-wrap");
      expect(result.html).toContain("Template Pattern");
    });

    it("renders TraitAbstract with title and body", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitAbstract.php"),
        class: "App\\Components\\TraitAbstract",
        callable: "render",
        args: { title: "Hello", body: "World" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("World");
      expect(result.html).toContain("layout-wrap");
    });

    it("parses trait with abstract and concrete methods", () => {
      const meta = parsePhpFile(advanced("TraitAbstract.php"));
      const trait = meta.classes.find((c) => c.name === "HasLayout");
      expect(trait).toBeDefined();
      expect(trait!.isTrait).toBe(true);
      expect(trait!.methods.some((m) => m.name === "render")).toBe(true);
      expect(trait!.methods.some((m) => m.name === "content")).toBe(true);

      const cls = meta.classes.find((c) => c.name === "TraitAbstract");
      expect(cls).toBeDefined();
      expect(cls!.traits).toContain("HasLayout");
    });

    it("generates classMethod module resolving render from trait", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId("./TraitAbstract.php@render", advanced("TraitAbstract.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const TraitAbstract");
      expect(code).not.toContain("export const HasLayout");
    });
  });

  // -------------------------------------------------------------------------
  // UC184: Dual callable class (__invoke + render)
  // -------------------------------------------------------------------------
  describe("UC184: Dual callable class", () => {
    it("renders DualCallable via render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DualCallable.php"),
        class: "App\\Components\\DualCallable",
        callable: "render",
        args: { label: "Test Card" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dual-card");
      expect(result.html).toContain("Test Card");
    });

    it("renders DualCallable via __invoke()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DualCallable.php"),
        class: "App\\Components\\DualCallable",
        callable: "__invoke",
        args: { label: "Badge", wrapper: "div" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<div");
      expect(result.html).toContain("Badge");
    });

    it("renders DualCallable with primary variant via render", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("DualCallable.php"),
        class: "App\\Components\\DualCallable",
        callable: "render",
        args: { label: "Primary", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#3b82f6");
    });

    it("generates different modules for @render and @__invoke", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const renderId = resolveId("./DualCallable.php@render", advanced("DualCallable.stories.ts"));
      const renderCode = load(renderId);
      expect(renderCode).toContain('__callable: "render"');

      const invokeId = resolveId(
        "./DualCallable.php@__invoke",
        advanced("DualCallableInvoke.stories.ts"),
      );
      const invokeCode = load(invokeId);
      expect(invokeCode).toContain('__callable: "__invoke"');
      expect(invokeCode).toContain("wrapper:");
    });
  });

  // -------------------------------------------------------------------------
  // UC185: Backed enum implementing Stringable
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC185: Backed enum implementing Stringable", () => {
    it("renders Currency::format for USD", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Currency.php"),
        class: "App\\Components\\Currency",
        callable: "format",
        args: { _case: "USD", amount: 1234.56 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("currency");
      expect(result.html).toContain("1,234.56");
      expect(result.html).toContain("USD");
    });

    it("renders Currency::format for JPY with 0 decimals", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Currency.php"),
        class: "App\\Components\\Currency",
        callable: "format",
        args: { _case: "JPY", amount: 15000, decimals: 0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("15,000");
    });

    it("renders Currency::table static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("Currency.php"),
        class: "App\\Components\\Currency",
        callable: "table",
        args: { amount: 50 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<table");
      expect(result.html).toContain("USD");
      expect(result.html).toContain("EUR");
      expect(result.html).toContain("GBP");
      expect(result.html).toContain("JPY");
    });

    it("parses enum with multiple methods", () => {
      const meta = parsePhpFile(php81("Currency.php"));
      const cls = meta.classes.find((c) => c.name === "Currency");
      expect(cls).toBeDefined();
      expect(cls!.isEnum).toBe(true);
      expect(cls!.enumBackingType).toBe("string");
      expect(cls!.methods.some((m) => m.name === "label")).toBe(true);
      expect(cls!.methods.some((m) => m.name === "format")).toBe(true);
      expect(cls!.methods.find((m) => m.name === "table")!.isStatic).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC186: Function with enum-typed param and default
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC186: Function with enum-typed param and default", () => {
    it("renders alignedBox with default alignment", async () => {
      const result = await executor.execute({
        type: "function",
        file: php81("EnumDefaultFunc.php"),
        class: null,
        callable: "App\\Components\\alignedBox",
        args: { content: "Left aligned" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("text-align: left");
      expect(result.html).toContain("Left aligned");
    });

    it("renders alignedBox with center alignment", async () => {
      const result = await executor.execute({
        type: "function",
        file: php81("EnumDefaultFunc.php"),
        class: null,
        callable: "App\\Components\\alignedBox",
        args: { content: "Centered", align: "center" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("text-align: center");
    });

    it("renders alignedBox with right alignment and custom bg", async () => {
      const result = await executor.execute({
        type: "function",
        file: php81("EnumDefaultFunc.php"),
        class: null,
        callable: "App\\Components\\alignedBox",
        args: { content: "Right", align: "right", bg: "#dbeafe" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("text-align: right");
      expect(result.html).toContain("#dbeafe");
    });

    it("parses function with enum-typed param", () => {
      const meta = parsePhpFile(php81("EnumDefaultFunc.php"));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("alignedBox");
      expect(fn.params[1]!.type).toBe("Align");
      expect(fn.params[1]!.default).toBe("Align::Left");
    });

    it("generates function module for alignedBox", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId("./EnumDefaultFunc.php@alignedBox", php81("EnumDefaultFunc.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const alignedBox");
    });
  });

  // -------------------------------------------------------------------------
  // UC187: Class with multiple named render methods
  // -------------------------------------------------------------------------
  describe("UC187: Class with multiple named render methods", () => {
    it("renders SplitView via renderFull", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SplitView.php"),
        class: "App\\Components\\SplitView",
        callable: "renderFull",
        args: { title: "Full View", description: "Detailed content" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("split-full");
      expect(result.html).toContain("Full View");
      expect(result.html).toContain("Detailed content");
    });

    it("renders SplitView via renderCompact", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SplitView.php"),
        class: "App\\Components\\SplitView",
        callable: "renderCompact",
        args: { title: "Compact View" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("split-compact");
      expect(result.html).toContain("Compact View");
    });

    it("renders SplitView full with dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("SplitView.php"),
        class: "App\\Components\\SplitView",
        callable: "renderFull",
        args: { title: "Dark", theme: "dark" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#1f2937");
    });

    it("generates classMethod for renderFull and renderCompact independently", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const fullId = resolveId("./SplitView.php@renderFull", advanced("SplitView.stories.ts"));
      const fullCode = load(fullId);
      expect(fullCode).toContain('__callable: "renderFull"');

      const compactId = resolveId(
        "./SplitView.php@renderCompact",
        advanced("SplitViewCompact.stories.ts"),
      );
      const compactCode = load(compactId);
      expect(compactCode).toContain('__callable: "renderCompact"');
    });
  });

  // -------------------------------------------------------------------------
  // UC188: Class with echo (void) and return methods
  // -------------------------------------------------------------------------
  describe("UC188: Class with echo and return methods", () => {
    it("renders MixedOutput via render() (return)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MixedOutput.php"),
        class: "App\\Components\\MixedOutput",
        callable: "render",
        args: { title: "Info", content: "Return-based output" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mixed-return");
      expect(result.html).toContain("Info");
      expect(result.html).toContain("Return-based output");
    });

    it("renders MixedOutput via renderEcho() (void/echo)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MixedOutput.php"),
        class: "App\\Components\\MixedOutput",
        callable: "renderEcho",
        args: { title: "Echo Notice", content: "Echo-based output" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("mixed-echo");
      expect(result.html).toContain("Echo Notice");
      expect(result.html).toContain("Echo-based output");
    });

    it("renders MixedOutput echo without content", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MixedOutput.php"),
        class: "App\\Components\\MixedOutput",
        callable: "renderEcho",
        args: { title: "Title Only" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Title Only");
      expect(result.html).not.toContain("<p>");
    });

    it("renders MixedOutput with variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php80("MixedOutput.php"),
        class: "App\\Components\\MixedOutput",
        callable: "render",
        args: { title: "Warning", variant: "warning" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#f59e0b");
    });

    it("generates classMethod for both render and renderEcho", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const renderId = resolveId("./MixedOutput.php@render", php80("MixedOutput.stories.ts"));
      const renderCode = load(renderId);
      expect(renderCode).toContain('__callable: "render"');
      expect(renderCode).toContain("__type: 'classMethod'");

      const echoId = resolveId("./MixedOutput.php@renderEcho", php80("MixedOutputEcho.stories.ts"));
      const echoCode = load(echoId);
      expect(echoCode).toContain('__callable: "renderEcho"');
      expect(echoCode).toContain("__type: 'classMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC189: Interface + Trait + Abstract + Concrete hierarchy (ConcreteWidget)
  // -------------------------------------------------------------------------
  describe("UC189: Interface + Trait + Abstract + Concrete hierarchy", () => {
    it("renders ConcreteWidget with default variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ConcreteWidget.php"),
        class: "App\\Components\\ConcreteWidget",
        callable: "render",
        args: { title: "Test Widget", content: "Hello from hierarchy" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Widget");
      expect(result.html).toContain("Hello from hierarchy");
      expect(result.html).toContain("widget-container");
    });

    it("renders ConcreteWidget with primary variant", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ConcreteWidget.php"),
        class: "App\\Components\\ConcreteWidget",
        callable: "render",
        args: { title: "Primary", variant: "primary", content: "Blue variant", icon: "🔵" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("#3b82f6");
      expect(result.html).toContain("Primary");
    });

    it("renders ConcreteWidget via display() interface method", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ConcreteWidget.php"),
        class: "App\\Components\\ConcreteWidget",
        callable: "display",
        args: { title: "Display Test", content: "Via interface" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Display Test");
      expect(result.html).toContain("Via interface");
    });

    it("parses all 4 class-like declarations", () => {
      const meta = parsePhpFile(advanced("ConcreteWidget.php"));
      expect(meta.classes).toHaveLength(4);

      const iface = meta.classes.find((c) => c.name === "Displayable")!;
      expect(iface.isInterface).toBe(true);

      const trait = meta.classes.find((c) => c.name === "HasContainer")!;
      expect(trait.isTrait).toBe(true);

      const abstract = meta.classes.find((c) => c.name === "BaseElement")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.traits).toContain("HasContainer");

      const concrete = meta.classes.find((c) => c.name === "ConcreteWidget")!;
      expect(concrete.extends).toBe("BaseElement");
      expect(concrete.implements).toContain("Displayable");
    });

    it("generates classMethod module resolving render through hierarchy", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId("./ConcreteWidget.php@render", advanced("ConcreteWidget.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("ConcreteWidget");
    });
  });

  // -------------------------------------------------------------------------
  // UC190: Class implementing 3 interfaces (ExpandableList)
  // -------------------------------------------------------------------------
  describe("UC190: Class implementing 3 interfaces", () => {
    it("renders ExpandableList via expand()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ExpandableList.php"),
        class: "App\\Components\\ExpandableList",
        callable: "expand",
        args: { title: "Tasks", items: ["Write tests", "Deploy"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("expandable-list");
      expect(result.html).toContain("Write tests");
      expect(result.html).toContain("Deploy");
    });

    it("renders ExpandableList via filter()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ExpandableList.php"),
        class: "App\\Components\\ExpandableList",
        callable: "filter",
        args: { title: "Languages", items: ["TypeScript", "Python", "PHP"], query: "P" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("filterable-list");
      // str_ireplace highlights 'P' with <mark>, so check for highlighted versions
      expect(result.html).toContain("ython");
      expect(result.html).toContain("<mark>");
      expect(result.html).toContain("3/3"); // all 3 items contain 'P' (case-insensitive)
    });

    it("renders ExpandableList via sort()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ExpandableList.php"),
        class: "App\\Components\\ExpandableList",
        callable: "sort",
        args: { title: "Items", items: ["Cherry", "Apple", "Banana"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("sortable-list");
      // Sorted ascending: Apple before Banana before Cherry
      const applePos = result.html.indexOf("Apple");
      const bananaPos = result.html.indexOf("Banana");
      expect(applePos).toBeLessThan(bananaPos);
    });

    it("renders ExpandableList sort descending", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ExpandableList.php"),
        class: "App\\Components\\ExpandableList",
        callable: "sort",
        args: { title: "Items", items: ["Cherry", "Apple", "Banana"], direction: "desc" },
      });
      expect(result.error).toBeUndefined();
      // Sorted descending: Cherry before Banana before Apple
      const cherryPos = result.html.indexOf("Cherry");
      const applePos = result.html.indexOf("Apple");
      expect(cherryPos).toBeLessThan(applePos);
    });

    it("generates separate modules for each interface method", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const expandId = resolveId(
        "./ExpandableList.php@expand",
        advanced("ExpandableList.stories.ts"),
      );
      const expandCode = load(expandId);
      expect(expandCode).toContain('__callable: "expand"');
      expect(expandCode).toContain("__type: 'classMethod'");

      const filterId = resolveId(
        "./ExpandableList.php@filter",
        advanced("ExpandableListFilter.stories.ts"),
      );
      const filterCode = load(filterId);
      expect(filterCode).toContain('__callable: "filter"');

      const sortId = resolveId(
        "./ExpandableList.php@sort",
        advanced("ExpandableListSort.stories.ts"),
      );
      const sortCode = load(sortId);
      expect(sortCode).toContain('__callable: "sort"');
    });
  });

  // -------------------------------------------------------------------------
  // UC191: Multiple standalone functions (utilFormat)
  // -------------------------------------------------------------------------
  describe("UC191: Multiple standalone functions", () => {
    it("renders formatCurrency with defaults", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("utilFormat.php"),
        class: null,
        callable: "App\\Helpers\\formatCurrency",
        args: { amount: 99.99 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("$99.99");
    });

    it("renders formatCurrency with EUR", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("utilFormat.php"),
        class: null,
        callable: "App\\Helpers\\formatCurrency",
        args: { amount: 1234.5, currency: "EUR", decimals: 2 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("€");
      expect(result.html).toContain("1,234.50");
    });

    it("renders formatDate with long format", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("utilFormat.php"),
        class: null,
        callable: "App\\Helpers\\formatDate",
        args: { date: "2024-12-25" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("December");
      expect(result.html).toContain("2024");
    });

    it("renders formatDate with short format", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("utilFormat.php"),
        class: null,
        callable: "App\\Helpers\\formatDate",
        args: { date: "2024-06-15", format: "short" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("06/15/24");
    });

    it("renders formatFileSize for megabytes", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("utilFormat.php"),
        class: null,
        callable: "App\\Helpers\\formatFileSize",
        args: { bytes: 8388608 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("MB");
    });

    it("renders formatFileSize for kilobytes", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("utilFormat.php"),
        class: null,
        callable: "App\\Helpers\\formatFileSize",
        args: { bytes: 153600, precision: 2 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("KB");
    });

    it("parses all 3 functions", () => {
      const meta = parsePhpFile(advanced("utilFormat.php"));
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(3);
      expect(meta.functions.map((f) => f.name).sort()).toEqual([
        "formatCurrency",
        "formatDate",
        "formatFileSize",
      ]);
    });

    it("generates separate function modules for each function", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const currId = resolveId(
        "./utilFormat.php@formatCurrency",
        advanced("utilFormat.stories.ts"),
      );
      const currCode = load(currId);
      expect(currCode).toContain("__type: 'function'");
      expect(currCode).toContain("formatCurrency");

      const dateId = resolveId(
        "./utilFormat.php@formatDate",
        advanced("utilFormatDate.stories.ts"),
      );
      const dateCode = load(dateId);
      expect(dateCode).toContain("formatDate");

      const sizeId = resolveId(
        "./utilFormat.php@formatFileSize",
        advanced("utilFormatFileSize.stories.ts"),
      );
      const sizeCode = load(sizeId);
      expect(sizeCode).toContain("formatFileSize");
    });
  });

  // -------------------------------------------------------------------------
  // UC192: Enum with permission hierarchy (EnumPermission)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC192: Enum with permission hierarchy", () => {
    it("renders Permission::badge for read", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumPermission.php"),
        class: "App\\Components\\Permission",
        callable: "badge",
        args: { _case: "read" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("perm-badge");
      expect(result.html).toContain("Read");
    });

    it("renders Permission::badge for admin", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumPermission.php"),
        class: "App\\Components\\Permission",
        callable: "badge",
        args: { _case: "admin" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Admin");
      expect(result.html).toContain("#7e22ce");
    });

    it("renders Permission::includes showing allowed", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumPermission.php"),
        class: "App\\Components\\Permission",
        callable: "includes",
        args: { _case: "admin", action: "delete" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Allowed");
    });

    it("renders Permission::includes showing denied", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumPermission.php"),
        class: "App\\Components\\Permission",
        callable: "includes",
        args: { _case: "read", action: "write" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Denied");
    });

    it("renders Permission::matrix static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("EnumPermission.php"),
        class: "App\\Components\\Permission",
        callable: "matrix",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("perm-matrix");
      expect(result.html).toContain("Read");
      expect(result.html).toContain("Admin");
    });

    it("generates enumMethod and staticMethod modules", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const badgeId = resolveId("./EnumPermission.php@badge", php81("EnumPermission.stories.ts"));
      const badgeCode = load(badgeId);
      expect(badgeCode).toContain("__type: 'enumMethod'");
      expect(badgeCode).toContain('__callable: "badge"');

      const includesId = resolveId(
        "./EnumPermission.php@includes",
        php81("EnumPermissionCheck.stories.ts"),
      );
      const includesCode = load(includesId);
      expect(includesCode).toContain("__type: 'enumMethod'");
      expect(includesCode).toContain("action");

      const matrixId = resolveId(
        "./EnumPermission.php@matrix",
        php81("EnumPermissionMatrix.stories.ts"),
      );
      const matrixCode = load(matrixId);
      expect(matrixCode).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC193: 3-level deep object composition (NestedCompose)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC193: 3-level deep object composition", () => {
    it("renders NestedCompose with nested object args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NestedCompose.php"),
        class: "App\\Components\\NestedCompose",
        callable: "render",
        args: {
          name: "Jane Smith",
          address: {
            street: "123 Main St",
            city: "San Francisco",
            country: { code: "US", name: "United States" },
          },
          phone: "+1 555-0123",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jane Smith");
      expect(result.html).toContain("123 Main St");
      expect(result.html).toContain("San Francisco");
      expect(result.html).toContain("United States");
      expect(result.html).toContain("+1 555-0123");
    });

    it("renders NestedCompose with default country", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NestedCompose.php"),
        class: "App\\Components\\NestedCompose",
        callable: "render",
        args: {
          name: "John Doe",
          address: {
            street: "10 Downing St",
            city: "London",
            country: { code: "GB", name: "United Kingdom" },
          },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("John Doe");
      expect(result.html).toContain("United Kingdom");
    });

    it("parses 3 classes including 2 readonly", () => {
      const meta = parsePhpFile(advanced("NestedCompose.php"));
      expect(meta.classes).toHaveLength(3);

      const country = meta.classes.find((c) => c.name === "Country")!;
      expect(country.isReadonly).toBe(true);

      const address = meta.classes.find((c) => c.name === "Address")!;
      expect(address.isReadonly).toBe(true);
      expect(address.constructorParams[2]!.type).toBe("Country");

      const compose = meta.classes.find((c) => c.name === "NestedCompose")!;
      expect(compose.constructorParams[1]!.type).toBe("Address");
    });

    it("generates classMethod module for NestedCompose only (skips readonly helpers)", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId("./NestedCompose.php@render", advanced("NestedCompose.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("NestedCompose");
      expect(code).toContain('__callable: "render"');
    });
  });

  // -------------------------------------------------------------------------
  // UC221: Autoloaded 3-level nested classes (ContactCard via Composer PSR-4)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82 || !hasAdvancedVendor)("UC221: Autoloaded nested classes", () => {
    const autoloadExecutor = new PhpExecutor({ timeout: 10000, bootstrap: advancedBootstrap });

    it("renders ContactCard with autoloaded Address and Country", async () => {
      const result = await autoloadExecutor.execute({
        type: "classMethod",
        file: advanced("Autoload/ContactCard.php"),
        class: "App\\Components\\Autoload\\ContactCard",
        callable: "render",
        args: {
          name: "Jane Smith",
          address: {
            street: "123 Main St",
            city: "San Francisco",
            country: { code: "US", name: "United States" },
          },
          phone: "+1 555-0123",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Jane Smith");
      expect(result.html).toContain("123 Main St");
      expect(result.html).toContain("San Francisco");
      expect(result.html).toContain("United States");
      expect(result.html).toContain("+1 555-0123");
    });

    it("renders ContactCard with default country via autoload", async () => {
      const result = await autoloadExecutor.execute({
        type: "classMethod",
        file: advanced("Autoload/ContactCard.php"),
        class: "App\\Components\\Autoload\\ContactCard",
        callable: "render",
        args: {
          name: "John Doe",
          address: { street: "10 Downing St", city: "London" },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("John Doe");
      expect(result.html).toContain("United States");
    });

    it("parses ContactCard as the only class in its file", () => {
      const meta = parsePhpFile(advanced("Autoload/ContactCard.php"));
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe("ContactCard");
      expect(meta.classes[0]!.constructorParams[1]!.type).toBe("Address");
    });
  });

  // -------------------------------------------------------------------------
  // UC194: Enum state machine with transitions (EnumWorkflow)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC194: Enum state machine with transitions", () => {
    it("renders WorkflowState::badge for draft", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumWorkflow.php"),
        class: "App\\Components\\WorkflowState",
        callable: "badge",
        args: { _case: "draft" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("wf-badge");
      expect(result.html).toContain("Draft");
    });

    it("renders WorkflowState::transitions for review (multiple next states)", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumWorkflow.php"),
        class: "App\\Components\\WorkflowState",
        callable: "transitions",
        args: { _case: "review" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("wf-transitions");
      expect(result.html).toContain("Approved");
      expect(result.html).toContain("Draft");
    });

    it("renders WorkflowState::transitions for archived (no transitions)", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("EnumWorkflow.php"),
        class: "App\\Components\\WorkflowState",
        callable: "transitions",
        args: { _case: "archived" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No transitions");
    });

    it("renders WorkflowState::diagram static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("EnumWorkflow.php"),
        class: "App\\Components\\WorkflowState",
        callable: "diagram",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("wf-diagram");
      expect(result.html).toContain("Draft");
      expect(result.html).toContain("Published");
      expect(result.html).toContain("Archived");
    });

    it("generates enumMethod and staticMethod for workflow", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const badgeId = resolveId("./EnumWorkflow.php@badge", php81("EnumWorkflow.stories.ts"));
      const badgeCode = load(badgeId);
      expect(badgeCode).toContain("__type: 'enumMethod'");

      const transId = resolveId(
        "./EnumWorkflow.php@transitions",
        php81("EnumWorkflowTransitions.stories.ts"),
      );
      const transCode = load(transId);
      expect(transCode).toContain("__type: 'enumMethod'");

      const diagId = resolveId(
        "./EnumWorkflow.php@diagram",
        php81("EnumWorkflowDiagram.stories.ts"),
      );
      const diagCode = load(diagId);
      expect(diagCode).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC195: Team template with complex PHP expressions
  // -------------------------------------------------------------------------
  describe("UC195: Team template with complex PHP expressions", () => {
    it("renders team grid in card variant", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/team.php"),
        class: null,
        callable: null,
        args: {
          title: "Dev Team",
          members: [
            { name: "Alice", role: "Engineer", status: "active" },
            { name: "Bob", role: "Designer", status: "away" },
          ],
          columns: 2,
          showStatus: true,
          variant: "card",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("team-grid");
      expect(result.html).toContain("Dev Team");
      expect(result.html).toContain("Alice");
      expect(result.html).toContain("Bob");
      expect(result.html).toContain("#22c55e"); // active status color
      expect(result.html).toContain("#f59e0b"); // away status color
    });

    it("renders team grid in list variant", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/team.php"),
        class: null,
        callable: null,
        args: {
          title: "Design Team",
          members: [{ name: "Eva Green", role: "Designer", status: "active" }],
          columns: 1,
          variant: "list",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("team-member-row");
      expect(result.html).toContain("Eva Green");
    });

    it("renders team grid with status hidden", async () => {
      const result = await executor.execute({
        type: "template",
        file: resolve(advancedDir, "templates/team.php"),
        class: null,
        callable: null,
        args: {
          title: "Team",
          members: [{ name: "Charlie", role: "PM", status: "offline" }],
          showStatus: false,
          variant: "card",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Charlie");
      // Status should not be shown
      expect(result.html).not.toContain("#d1d5db");
    });
  });

  // -------------------------------------------------------------------------
  // UC196: PHP 8.2 standalone true/false/null types
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC196: Standalone bool types", () => {
    it("renders BoolToggle enabled state", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("BoolToggle.php"),
        class: "App\\Components\\BoolToggle",
        callable: "renderEnabled",
        args: { label: "Dark Mode" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dark Mode");
      expect(result.html).toContain("Enabled");
    });

    it("renders BoolToggle disabled state", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php82("BoolToggle.php"),
        class: "App\\Components\\BoolToggle",
        callable: "renderDisabled",
        args: { label: "Legacy Feature" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Legacy Feature");
      expect(result.html).toContain("Disabled");
    });

    it("renders BoolToggle null state via static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php82("BoolToggle.php"),
        class: "App\\Components\\BoolToggle",
        callable: "renderNull",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No value provided");
    });

    it("generates correct module types for standalone bool types", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const enabledId = resolveId("./BoolToggle.php@renderEnabled", php82("BoolToggle.stories.ts"));
      const enabledCode = load(enabledId);
      expect(enabledCode).toContain("__type: 'classMethod'");
      expect(enabledCode).toContain("type: 'true'");

      const nullId = resolveId("./BoolToggle.php@renderNull", php82("BoolToggleNull.stories.ts"));
      const nullCode = load(nullId);
      expect(nullCode).toContain("__type: 'staticMethod'");
      expect(nullCode).toContain("type: 'null'");
    });
  });

  // -------------------------------------------------------------------------
  // UC197: Trait conflict resolution with insteadof/as
  // -------------------------------------------------------------------------
  describe("UC197: Trait conflict resolution", () => {
    it("renders TraitConflict with HTML format (insteadof winner)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitConflict.php"),
        class: "App\\Components\\TraitConflict",
        callable: "render",
        args: { content: "Test content", mode: "html" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test content");
      expect(result.html).toContain("html-output");
    });

    it("renders TraitConflict with plain format (as alias)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitConflict.php"),
        class: "App\\Components\\TraitConflict",
        callable: "render",
        args: { content: "Code here", mode: "plain" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Code here");
      expect(result.html).toContain("plain-output");
    });

    it("renders TraitConflict format method directly (from winning trait)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("TraitConflict.php"),
        class: "App\\Components\\TraitConflict",
        callable: "format",
        args: { text: "Direct format call" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Direct format call");
      expect(result.html).toContain("html-output");
    });
  });

  // -------------------------------------------------------------------------
  // UC198: Enum with array-typed method parameters
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC198: Enum array param", () => {
    it("renders ListStyle bullet list", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("ListStyle.php"),
        class: "App\\Components\\ListStyle",
        callable: "renderList",
        args: { _case: "disc", items: ["Alpha", "Beta", "Gamma"], title: "Letters" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Alpha");
      expect(result.html).toContain("Beta");
      expect(result.html).toContain("Letters");
      expect(result.html).toContain("list-style: disc");
    });

    it("renders ListStyle numbered list", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("ListStyle.php"),
        class: "App\\Components\\ListStyle",
        callable: "renderList",
        args: { _case: "decimal", items: ["Step 1", "Step 2"], title: "Steps" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<ol");
      expect(result.html).toContain("Step 1");
    });

    it("renders ListStyle preview with all styles", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("ListStyle.php"),
        class: "App\\Components\\ListStyle",
        callable: "preview",
        args: { items: ["A", "B", "C"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Bullet");
      expect(result.html).toContain("Number");
      expect(result.html).toContain("Dash");
      expect(result.html).toContain("None");
    });
  });

  // -------------------------------------------------------------------------
  // UC199: Abstract class with multiple concrete children
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC199: Abstract multi child panels", () => {
    it("renders InfoPanel", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("PanelVariant.php"),
        class: "App\\Components\\InfoPanel",
        callable: "render",
        args: { title: "Info", content: "Information message" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("panel-info");
      expect(result.html).toContain("Information message");
    });

    it("renders WarningPanel with icon", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("PanelVariant.php"),
        class: "App\\Components\\WarningPanel",
        callable: "render",
        args: { title: "Caution", content: "Be careful", icon: "!" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("panel-warning");
      expect(result.html).toContain("! Caution");
    });

    it("renders ErrorPanel with code block", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: php81("PanelVariant.php"),
        class: "App\\Components\\ErrorPanel",
        callable: "render",
        args: { title: "Error", content: "Something failed", code: "ERR_404" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("panel-error");
      expect(result.html).toContain("ERR_404");
    });

    it("generates multiple exports for all concrete children", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId("./PanelVariant.php@render", php81("PanelVariant.stories.ts"));
      const code = load(id);
      expect(code).toContain("export const InfoPanel");
      expect(code).toContain("export const WarningPanel");
      expect(code).toContain("export const ErrorPanel");
      expect(code).not.toContain("export const AbstractPanel");
    });
  });

  // -------------------------------------------------------------------------
  // UC200: Self/static return types (ChainBuilder)
  // -------------------------------------------------------------------------
  describe("UC200: Self and static return types", () => {
    it("renders ChainBuilder", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ChainBuilder.php"),
        class: "App\\Components\\ChainBuilder",
        callable: "render",
        args: { tag: "ul", title: "Items" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<ul");
      expect(result.html).toContain("Items");
    });

    it("generates module with constructor args", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId("./ChainBuilder.php@render", advanced("ChainBuilder.stories.ts"));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("tag:");
      expect(code).toContain("className:");
      expect(code).toContain("title:");
    });
  });

  // -------------------------------------------------------------------------
  // UC201: Void/never return types
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC201: Void and never return types", () => {
    it("renders VoidEchoCard via echo (void return)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VoidEchoCard.php"),
        class: "App\\Components\\VoidEchoCard",
        callable: "renderEcho",
        args: { title: "Echo Card", body: "From echo", variant: "primary" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-card");
      expect(result.html).toContain("Echo Card");
      expect(result.html).toContain("From echo");
    });

    it("renders VoidEchoCard via string return", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VoidEchoCard.php"),
        class: "App\\Components\\VoidEchoCard",
        callable: "render",
        args: { title: "Return Card", body: "From return", variant: "success" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("echo-card");
      expect(result.html).toContain("Return Card");
    });

    it("VoidEchoCard fail method (never) returns error", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("VoidEchoCard.php"),
        class: "App\\Components\\VoidEchoCard",
        callable: "fail",
        args: { title: "Broken" },
      });
      expect(result.error).toBeTruthy();
      expect(result.error).toContain("fatal error");
    });
  });

  // -------------------------------------------------------------------------
  // UC202: Standalone function with intersection type
  // -------------------------------------------------------------------------
  describe("UC202: Function with intersection type param", () => {
    it("generates function module for renderIntersectionTag", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId(
        "./tagIntersection.php@renderIntersectionTag",
        php81("tagIntersection.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const renderIntersectionTag");
      expect(code).toContain("type: 'string'");
    });

    it("generates function module for renderIntersectionTagFromItem with intersection param", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId(
        "./tagIntersection.php@renderIntersectionTagFromItem",
        php81("tagIntersection.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const renderIntersectionTagFromItem");
      expect(code).toContain("Labeled&Colored");
    });
  });

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // UC204: Int-backed enum with methods
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC204: Int-backed enum", () => {
    it("renders HttpPort Https case", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("HttpPort.php"),
        class: "App\\Components\\HttpPort",
        callable: "render",
        args: { _case: "Https" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Https");
      expect(result.html).toContain(":443");
    });

    it("renders HttpPort Http case", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("HttpPort.php"),
        class: "App\\Components\\HttpPort",
        callable: "render",
        args: { _case: "Http" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Http");
      expect(result.html).toContain(":80");
    });

    it("renders HttpPort static table", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: php81("HttpPort.php"),
        class: "App\\Components\\HttpPort",
        callable: "table",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("port-table");
      expect(result.html).toContain("80");
      expect(result.html).toContain("443");
      expect(result.html).toContain("Secure");
      expect(result.html).toContain("Standard");
    });
  });

  // -------------------------------------------------------------------------
  // UC205: Iterable type param
  // -------------------------------------------------------------------------
  describe("UC205: Iterable type parameter", () => {
    it("renders ItemGrid as list", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ItemGrid.php"),
        class: "App\\Components\\ItemGrid",
        callable: "render",
        args: { title: "Tools", items: ["Hammer", "Wrench", "Drill"], style: "list" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Tools");
      expect(result.html).toContain("Hammer");
      expect(result.html).toContain("Wrench");
      expect(result.html).toContain("item-list");
    });

    it("renders ItemGrid as grid", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ItemGrid.php"),
        class: "App\\Components\\ItemGrid",
        callable: "render",
        args: { title: "Colors", items: ["Red", "Green", "Blue"], style: "grid" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("item-grid");
      expect(result.html).toContain("Red");
    });

    it("renders ItemGrid empty state", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ItemGrid.php"),
        class: "App\\Components\\ItemGrid",
        callable: "render",
        args: { items: [], emptyMessage: "Nothing here" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Nothing here");
    });
  });

  // -------------------------------------------------------------------------
  // UC206: Stringable enum with interfaces
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC206: Stringable enum", () => {
    it("renders Planet Earth with description", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Planet.php"),
        class: "App\\Components\\Planet",
        callable: "render",
        args: { _case: "Earth", showDescription: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Earth");
      expect(result.html).toContain("Our home");
      expect(result.html).toContain("planet-card");
    });

    it("renders Planet Mars without description", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: php81("Planet.php"),
        class: "App\\Components\\Planet",
        callable: "render",
        args: { _case: "Mars", showDescription: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Mars");
      expect(result.html).not.toContain("The red planet");
    });
  });

  // -------------------------------------------------------------------------
  // UC207: Abstract template method pattern
  // -------------------------------------------------------------------------
  describe("UC207: Abstract template method pattern", () => {
    it("renders EmailNotification via inherited render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NotificationChannel.php"),
        class: "App\\Components\\EmailNotification",
        callable: "render",
        args: { message: "Your order shipped!", recipient: "alice@example.com" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("email notification");
      expect(result.html).toContain("alice@example.com");
      expect(result.html).toContain("Your order shipped!");
    });

    it("renders SmsNotification via inherited render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NotificationChannel.php"),
        class: "App\\Components\\SmsNotification",
        callable: "render",
        args: { message: "Code: 4829", recipient: "+1 555-0123" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("sms notification");
      expect(result.html).toContain("Code: 4829");
    });

    it("renders PushNotification via inherited render()", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("NotificationChannel.php"),
        class: "App\\Components\\PushNotification",
        callable: "render",
        args: { message: "New comment", recipient: "Mobile Device" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("push notification");
      expect(result.html).toContain("New comment");
    });

    it("generates multiple exports for concrete children", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = (source: string, importer: string) =>
        (plugin.resolveId as Function)(source, importer);
      const load = (id: string) => (plugin.load as Function)(id);

      const id = resolveId(
        "./NotificationChannel.php@render",
        advanced("NotificationChannel.stories.ts"),
      );
      const code = load(id);
      expect(code).toContain("export const EmailNotification");
      expect(code).toContain("export const SmsNotification");
      expect(code).toContain("export const PushNotification");
      expect(code).not.toContain("export const AbstractNotification");
    });
  });

  // -------------------------------------------------------------------------
  // UC208: Variadic function
  // -------------------------------------------------------------------------
  describe("UC208: Variadic function", () => {
    it("renders breadcrumbTrail with segments", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("breadcrumbTrail.php"),
        class: null,
        callable: "App\\Helpers\\breadcrumbTrail",
        args: { separator: " / ", segments: ["Home", "Products", "Phones"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Home");
      expect(result.html).toContain("Products");
      expect(result.html).toContain("Phones");
      expect(result.html).toContain("breadcrumb");
    });

    it("renders breadcrumbTrail with custom separator", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("breadcrumbTrail.php"),
        class: null,
        callable: "App\\Helpers\\breadcrumbTrail",
        args: { separator: " > ", segments: ["A", "B"] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("&gt;");
      expect(result.html).toContain("A");
      expect(result.html).toContain("B");
    });

    it("renders breadcrumbTrail empty", async () => {
      const result = await executor.execute({
        type: "function",
        file: advanced("breadcrumbTrail.php"),
        class: null,
        callable: "App\\Helpers\\breadcrumbTrail",
        args: { separator: "/" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No path");
    });
  });

  // -------------------------------------------------------------------------
  // UC209: Mixed defaults showcase
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC209: Mixed defaults showcase", () => {
    it("renders ThemeShowcase with all args", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ThemeShowcase.php"),
        class: "App\\Components\\ThemeShowcase",
        callable: "render",
        args: {
          title: "Dashboard",
          subtitle: "Preview",
          theme: "dark",
          tags: ["ui", "dark"],
          visible: true,
          opacity: 0.9,
          maxItems: 5,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Dashboard");
      expect(result.html).toContain("Preview");
      expect(result.html).toContain("theme-showcase");
    });

    it("renders ThemeShowcase with all defaults", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ThemeShowcase.php"),
        class: "App\\Components\\ThemeShowcase",
        callable: "render",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Untitled");
      expect(result.html).toContain("Max items: 10");
      expect(result.html).toContain("general");
    });

    it("renders ThemeShowcase dark theme", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ThemeShowcase.php"),
        class: "App\\Components\\ThemeShowcase",
        callable: "render",
        args: { theme: "dark", title: "Night Mode" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Night Mode");
      expect(result.html).toContain("#1f2937");
    });
  });

  // -------------------------------------------------------------------------
  // UC210: Final readonly class (FinalReadonlyPoint)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC210: Final readonly class (Point)", () => {
    it("renders Point with coordinates", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("FinalReadonlyPoint.php"),
        class: "App\\Components\\Point",
        callable: "render",
        args: { x: 3.14, y: 2.71, label: "P1" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("3.14");
      expect(result.html).toContain("2.71");
      expect(result.html).toContain("P1");
    });

    it("renders Point without label", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("FinalReadonlyPoint.php"),
        class: "App\\Components\\Point",
        callable: "render",
        args: { x: 0, y: 0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("point");
      expect(result.html).not.toContain("(origin)");
    });

    it("renders Point::origin static method", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: fixture("FinalReadonlyPoint.php"),
        class: "App\\Components\\Point",
        callable: "origin",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("origin");
      expect(result.html).toContain("0");
    });

    it("generates classMethod module for Point@render", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("FinalReadonlyPoint.php")}?callable=render`);
      expect(code).toContain("export const Point");
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("x:");
      expect(code).toContain("y:");
      expect(code).toContain("label:");
    });

    it("generates staticMethod module for Point@origin", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("FinalReadonlyPoint.php")}?callable=origin`);
      expect(code).toContain("export const Point");
      expect(code).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC211: Int-backed enum with category logic (HttpStatusCode)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC211: Int-backed enum with category (HttpStatusCode)", () => {
    it("renders OK badge", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: fixture("HttpStatusCode.php"),
        class: "App\\Components\\HttpStatusCode",
        callable: "badge",
        args: { _case: 200 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("200");
      expect(result.html).toContain("OK");
      expect(result.html).toContain("Success");
    });

    it("renders NotFound badge", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: fixture("HttpStatusCode.php"),
        class: "App\\Components\\HttpStatusCode",
        callable: "badge",
        args: { _case: 404 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("404");
      expect(result.html).toContain("NotFound");
      expect(result.html).toContain("Client Error");
    });

    it("renders InternalServerError badge", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: fixture("HttpStatusCode.php"),
        class: "App\\Components\\HttpStatusCode",
        callable: "badge",
        args: { _case: 500 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("500");
      expect(result.html).toContain("Server Error");
    });

    it("renders static table of all codes", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: fixture("HttpStatusCode.php"),
        class: "App\\Components\\HttpStatusCode",
        callable: "table",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<table>");
      expect(result.html).toContain("200");
      expect(result.html).toContain("404");
      expect(result.html).toContain("500");
    });

    it("generates enumMethod module for badge", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("HttpStatusCode.php")}?callable=badge`);
      expect(code).toContain("export const HttpStatusCode");
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("_case:");
    });

    it("generates staticMethod module for table", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("HttpStatusCode.php")}?callable=table`);
      expect(code).toContain("export const HttpStatusCode");
      expect(code).toContain("__type: 'staticMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC212: Enum implementing multiple interfaces (MenuAction)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC212: Enum implementing multiple interfaces (MenuAction)", () => {
    it("renders Copy menu item", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: fixture("MenuAction.php"),
        class: "App\\Components\\MenuAction",
        callable: "menuItem",
        args: { _case: "copy" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Copy");
      expect(result.html).toContain("Ctrl+C");
    });

    it("renders Undo menu item", async () => {
      const result = await executor.execute({
        type: "enumMethod",
        file: fixture("MenuAction.php"),
        class: "App\\Components\\MenuAction",
        callable: "menuItem",
        args: { _case: "undo" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Undo");
      expect(result.html).toContain("Ctrl+Z");
    });

    it("renders palette with all items", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: fixture("MenuAction.php"),
        class: "App\\Components\\MenuAction",
        callable: "palette",
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("palette");
      expect(result.html).toContain("Copy");
      expect(result.html).toContain("Paste");
      expect(result.html).toContain("Cut");
      expect(result.html).toContain("Undo");
    });

    it("generates enumMethod module for menuItem", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("MenuAction.php")}?callable=menuItem`);
      expect(code).toContain("export const MenuAction");
      expect(code).toContain("__type: 'enumMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC213: Class with multiple render methods (UserAvatar)
  // -------------------------------------------------------------------------
  describe("UC213: Multiple render methods (UserAvatar)", () => {
    it("renders circle avatar", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("UserAvatar.php"),
        class: "App\\Components\\UserAvatar",
        callable: "circle",
        args: { name: "Alice", size: "md" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("avatar");
      expect(result.html).toContain("A");
    });

    it("renders card avatar", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("UserAvatar.php"),
        class: "App\\Components\\UserAvatar",
        callable: "card",
        args: { name: "Bob", email: "bob@test.com" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("avatar-card");
      expect(result.html).toContain("Bob");
    });

    it("renders badge avatar", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("UserAvatar.php"),
        class: "App\\Components\\UserAvatar",
        callable: "badge",
        args: { name: "Charlie" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("avatar-badge");
      expect(result.html).toContain("Charlie");
    });

    it("generates classMethod module for circle", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("UserAvatar.php")}?callable=circle`);
      expect(code).toContain("export const UserAvatar");
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("name:");
    });

    it("generates classMethod module for card", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("UserAvatar.php")}?callable=card`);
      expect(code).toContain("export const UserAvatar");
      expect(code).toContain('__callable: "card"');
    });

    it("generates classMethod module for badge", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("UserAvatar.php")}?callable=badge`);
      expect(code).toContain("export const UserAvatar");
      expect(code).toContain('__callable: "badge"');
    });
  });

  // -------------------------------------------------------------------------
  // UC214: 3-level deep inheritance (ThreeLevel)
  // -------------------------------------------------------------------------
  describe("UC214: 3-level deep inheritance (ThreeLevel)", () => {
    it("renders InteractiveButton", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ThreeLevel.php"),
        class: "App\\Components\\InteractiveButton",
        callable: "render",
        args: { text: "Click", color: "white", size: "lg" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("button");
      expect(result.html).toContain("Click");
      expect(result.html).toContain("btn-lg");
    });

    it("renders InteractiveButton disabled", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ThreeLevel.php"),
        class: "App\\Components\\InteractiveButton",
        callable: "render",
        args: { text: "Disabled", disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("disabled");
    });

    it("renders StyledElement (mid-level)", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ThreeLevel.php"),
        class: "App\\Components\\StyledElement",
        callable: "render",
        args: { text: "Hello", tag: "span", color: "#ff0000" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<span");
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("#ff0000");
    });

    it("generates module for InteractiveButton with inherited params", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("ThreeLevel.php")}?callable=render`);
      expect(code).toContain("export const InteractiveButton");
      expect(code).toContain("export const StyledElement");
      expect(code).toContain("__type: 'classMethod'");
      // InteractiveButton constructor params
      expect(code).toContain("text:");
      expect(code).toContain("size:");
      expect(code).toContain("disabled:");
    });
  });

  // -------------------------------------------------------------------------
  // UC215: DNF type parameter (DnfConfig)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC215: DNF type parameter (DnfConfig)", () => {
    it("renders DnfConfig with string source", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("DnfConfig.php"),
        class: "App\\Components\\DnfConfig",
        callable: "render",
        args: { name: "app.config", source: "env" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("app.config");
      expect(result.html).toContain("env");
    });

    it("renders DnfConfig with debug flag", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("DnfConfig.php"),
        class: "App\\Components\\DnfConfig",
        callable: "render",
        args: { name: "dev.config", debug: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("dev.config");
      expect(result.html).toContain("[DEBUG]");
    });

    it("generates module with DNF type param", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("DnfConfig.php")}?callable=render`);
      expect(code).toContain("export const DnfConfig");
      expect(code).toContain("name:");
      expect(code).toContain("source:");
      expect(code).toContain("debug:");
    });
  });

  // -------------------------------------------------------------------------
  // UC216: Invocable class (RuleEngine)
  // -------------------------------------------------------------------------
  describe("UC216: Invocable class (RuleEngine)", () => {
    it("renders RuleEngine passing rule", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("RuleEngine.php"),
        class: "App\\Components\\RuleEngine",
        callable: "__invoke",
        args: { name: "EmailCheck", rule: "format", value: "test@example.com", passed: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("EmailCheck");
      expect(result.html).toContain("format");
      expect(result.html).toContain("test@example.com");
    });

    it("renders RuleEngine failing rule", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("RuleEngine.php"),
        class: "App\\Components\\RuleEngine",
        callable: "__invoke",
        args: {
          name: "PasswordCheck",
          variant: "danger",
          rule: "length",
          value: "abc",
          passed: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("PasswordCheck");
      expect(result.html).toContain("rule-danger");
    });

    it("generates classMethod module for __invoke", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("RuleEngine.php")}?callable=__invoke`);
      expect(code).toContain("export const RuleEngine");
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "__invoke"');
      expect(code).toContain("rule:");
      expect(code).toContain("value:");
    });
  });

  // -------------------------------------------------------------------------
  // UC217: Generator function (DefinitionList)
  // -------------------------------------------------------------------------
  describe("UC217: Generator function (definitionList)", () => {
    it("renders definition list with items", async () => {
      const result = await executor.execute({
        type: "function",
        file: fixture("DefinitionList.php"),
        class: null,
        callable: "App\\Components\\definitionList",
        args: { items: { Name: "John", Role: "Admin" } },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<dl>");
      expect(result.html).toContain("Name");
      expect(result.html).toContain("John");
      expect(result.html).toContain("Admin");
    });

    it("renders definition list empty", async () => {
      const result = await executor.execute({
        type: "function",
        file: fixture("DefinitionList.php"),
        class: null,
        callable: "App\\Components\\definitionList",
        args: { items: {} },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<dl>");
      expect(result.html).toContain("</dl>");
    });

    it("generates function module for definitionList", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("DefinitionList.php")}?callable=definitionList`);
      expect(code).toContain("export const definitionList");
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("items:");
      expect(code).toContain("variant:");
    });
  });

  // -------------------------------------------------------------------------
  // UC218: No-constructor static-only class (FileSize)
  // -------------------------------------------------------------------------
  describe("UC218: No-constructor static class (FileSize)", () => {
    it("renders FileSize badge for small file", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: fixture("FileSize.php"),
        class: "App\\Components\\FileSize",
        callable: "badge",
        args: { bytes: 1024, variant: "default" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("1.0 KB");
    });

    it("renders FileSize badge for large file", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: fixture("FileSize.php"),
        class: "App\\Components\\FileSize",
        callable: "badge",
        args: { bytes: 1073741824 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("1.0 GB");
    });

    it("renders FileSize bar", async () => {
      const result = await executor.execute({
        type: "staticMethod",
        file: fixture("FileSize.php"),
        class: "App\\Components\\FileSize",
        callable: "bar",
        args: { used: 500, total: 1000, label: "Disk" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Disk");
      expect(result.html).toContain("50");
    });

    it("generates staticMethod module for badge", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("FileSize.php")}?callable=badge`);
      expect(code).toContain("export const FileSize");
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("bytes:");
    });

    it("generates staticMethod module for bar", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("FileSize.php")}?callable=bar`);
      expect(code).toContain("export const FileSize");
      expect(code).toContain('__callable: "bar"');
      expect(code).toContain("used:");
      expect(code).toContain("total:");
    });
  });

  // -------------------------------------------------------------------------
  // UC219: Multiple classes from one file (Sections)
  // -------------------------------------------------------------------------
  describe("UC219: Multiple classes (Sections)", () => {
    it("renders SectionHeader", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("Sections.php"),
        class: "App\\Components\\SectionHeader",
        callable: "render",
        args: { title: "My Page", level: "h2" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<h2>");
      expect(result.html).toContain("My Page");
    });

    it("renders SectionFooter", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("Sections.php"),
        class: "App\\Components\\SectionFooter",
        callable: "render",
        args: { copyright: "Acme Inc.", year: 2025 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("footer");
      expect(result.html).toContain("2025");
      expect(result.html).toContain("Acme Inc.");
    });

    it("generates both exports from one file", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("Sections.php")}?callable=render`);
      expect(code).toContain("export const SectionHeader");
      expect(code).toContain("export const SectionFooter");
    });
  });

  // -------------------------------------------------------------------------
  // UC220: Trait with abstract method + multiple trait users (SocialShare)
  // -------------------------------------------------------------------------
  describe("UC220: Multiple trait users (SocialShare)", () => {
    it("renders Twitter share link", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("SocialShare.php"),
        class: "App\\Components\\TwitterShare",
        callable: "shareLink",
        args: { url: "https://example.com", label: "Tweet" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("share-link");
      expect(result.html).toContain("https://example.com");
      expect(result.html).toContain("Tweet");
    });

    it("renders Facebook share link", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("SocialShare.php"),
        class: "App\\Components\\FacebookShare",
        callable: "shareLink",
        args: { url: "https://example.com/post", label: "Share" },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("share-link");
      expect(result.html).toContain("https://example.com/post");
    });

    it("generates both class exports from trait method", () => {
      const plugin = storybookPhpPlugin();
      const load = (plugin as any).load as (id: string) => string | null;
      const code = load(`\0storybook-php:${fixture("SocialShare.php")}?callable=shareLink`);
      expect(code).toContain("export const TwitterShare");
      expect(code).toContain("export const FacebookShare");
      expect(code).toContain("__type: 'classMethod'");
    });
  });

  // -------------------------------------------------------------------------
  // UC210-220: Parser metadata for new fixtures
  // -------------------------------------------------------------------------
  describe("Parser: UC210-220 fixture metadata", () => {
    it("parses FinalReadonlyPoint as final readonly class", () => {
      const meta = parsePhpFile(fixture("FinalReadonlyPoint.php"));
      const cls = meta.classes.find((c) => c.name === "Point");
      expect(cls).toBeDefined();
      expect(cls!.isFinal).toBe(true);
      expect(cls!.isReadonly).toBe(true);
      expect(cls!.constructorParams).toHaveLength(3);
      expect(cls!.constructorParams[0]!.name).toBe("x");
      expect(cls!.constructorParams[0]!.type).toBe("float");
      expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
      expect(cls!.methods.some((m) => m.name === "origin" && m.isStatic)).toBe(true);
    });

    it("parses HttpStatusCode as int-backed enum", () => {
      const meta = parsePhpFile(fixture("HttpStatusCode.php"));
      const cls = meta.classes.find((c) => c.name === "HttpStatusCode");
      expect(cls).toBeDefined();
      expect(cls!.isEnum).toBe(true);
      expect((cls as any).enumBackingType).toBe("int");
      expect((cls as any).enumCases).toContain("OK");
      expect((cls as any).enumCases).toContain("NotFound");
      expect((cls as any).enumCases).toContain("InternalServerError");
      expect(cls!.methods.some((m) => m.name === "badge")).toBe(true);
      expect(cls!.methods.some((m) => m.name === "table" && m.isStatic)).toBe(true);
    });

    it("parses MenuAction as enum with multiple interfaces", () => {
      const meta = parsePhpFile(fixture("MenuAction.php"));
      const cls = meta.classes.find((c) => c.name === "MenuAction");
      expect(cls).toBeDefined();
      expect(cls!.isEnum).toBe(true);
      expect(cls!.implements).toContain("Displayable");
      expect(cls!.implements).toContain("Accessible");
      expect(cls!.methods.some((m) => m.name === "menuItem")).toBe(true);
      expect(cls!.methods.some((m) => m.name === "palette" && m.isStatic)).toBe(true);
    });

    it("parses UserAvatar with multiple methods", () => {
      const meta = parsePhpFile(fixture("UserAvatar.php"));
      const cls = meta.classes.find((c) => c.name === "UserAvatar");
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(3);
      expect(cls!.methods.some((m) => m.name === "circle")).toBe(true);
      expect(cls!.methods.some((m) => m.name === "card")).toBe(true);
      expect(cls!.methods.some((m) => m.name === "badge")).toBe(true);
    });

    it("parses ThreeLevel with abstract + concrete classes", () => {
      const meta = parsePhpFile(fixture("ThreeLevel.php"));
      const base = meta.classes.find((c) => c.name === "BaseElement");
      expect(base).toBeDefined();
      expect(base!.isAbstract).toBe(true);

      const styled = meta.classes.find((c) => c.name === "StyledElement");
      expect(styled).toBeDefined();
      expect(styled!.extends).toBe("BaseElement");

      const btn = meta.classes.find((c) => c.name === "InteractiveButton");
      expect(btn).toBeDefined();
      expect(btn!.extends).toBe("StyledElement");
      expect(btn!.constructorParams.some((p) => p.name === "disabled")).toBe(true);
    });

    it("parses DnfConfig with DNF type parameter", () => {
      const meta = parsePhpFile(fixture("DnfConfig.php"));
      const cls = meta.classes.find((c) => c.name === "DnfConfig");
      expect(cls).toBeDefined();
      const source = cls!.constructorParams.find((p) => p.name === "source");
      expect(source).toBeDefined();
      expect(source!.type).toContain("|");
    });

    it("parses RuleEngine with __invoke method", () => {
      const meta = parsePhpFile(fixture("RuleEngine.php"));
      const cls = meta.classes.find((c) => c.name === "RuleEngine");
      expect(cls).toBeDefined();
      expect(cls!.methods.some((m) => m.name === "__invoke")).toBe(true);
      const invoke = cls!.methods.find((m) => m.name === "__invoke");
      expect(invoke!.params).toHaveLength(3);
    });

    it("parses DefinitionList as standalone generator function", () => {
      const meta = parsePhpFile(fixture("DefinitionList.php"));
      expect(meta.functions).toHaveLength(1);
      expect(meta.functions[0]!.name).toBe("definitionList");
      expect(meta.functions[0]!.params).toHaveLength(2);
    });

    it("parses FileSize with two static methods", () => {
      const meta = parsePhpFile(fixture("FileSize.php"));
      const cls = meta.classes.find((c) => c.name === "FileSize");
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(0);
      expect(cls!.methods.some((m) => m.name === "badge" && m.isStatic)).toBe(true);
      expect(cls!.methods.some((m) => m.name === "bar" && m.isStatic)).toBe(true);
    });

    it("parses Sections with two independent classes", () => {
      const meta = parsePhpFile(fixture("Sections.php"));
      expect(meta.classes.some((c) => c.name === "SectionHeader")).toBe(true);
      expect(meta.classes.some((c) => c.name === "SectionFooter")).toBe(true);
    });

    it("parses SocialShare with traits and classes", () => {
      const meta = parsePhpFile(fixture("SocialShare.php"));
      const twitter = meta.classes.find((c) => c.name === "TwitterShare");
      expect(twitter).toBeDefined();
      expect(twitter!.traits).toContain("HasShareLink");
      expect(twitter!.traits).toContain("HasSocialIcon");

      const facebook = meta.classes.find((c) => c.name === "FacebookShare");
      expect(facebook).toBeDefined();
      expect(facebook!.traits).toContain("HasShareLink");
    });
  });

  // -------------------------------------------------------------------------
  // UC222: PHPDoc array-of-class casting (@phpstan-param / @param)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp81)("UC222: PHPDoc array-of-class casting", () => {
    it("casts list<Tag> via @phpstan-param", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ArrayOfObjects.php"),
        class: "App\\Fixtures\\TagCloud",
        callable: "render",
        args: {
          tags: [
            { name: "PHP", color: "blue" },
            { name: "JS", color: "yellow" },
          ],
          title: "Languages",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Languages");
      expect(result.html).toContain('<span class="tag" style="color: blue;">PHP</span>');
      expect(result.html).toContain('<span class="tag" style="color: yellow;">JS</span>');
    });

    it("casts list<Tag> with default color", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ArrayOfObjects.php"),
        class: "App\\Fixtures\\TagCloud",
        callable: "render",
        args: {
          tags: [{ name: "Rust" }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<span class="tag" style="color: gray;">Rust</span>');
    });

    it("handles empty array", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ArrayOfObjects.php"),
        class: "App\\Fixtures\\TagCloud",
        callable: "render",
        args: {
          tags: [],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No tags");
    });

    it("casts Tag[] via @param syntax", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ArrayOfObjects.php"),
        class: "App\\Fixtures\\TagList",
        callable: "render",
        args: {
          tags: [{ name: "Alpha" }, { name: "Beta" }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<li>Alpha</li>");
      expect(result.html).toContain("<li>Beta</li>");
    });

    it("casts nested list<list<Tag>> recursively", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("ArrayOfObjects.php"),
        class: "App\\Fixtures\\TagBoard",
        callable: "render",
        args: {
          groups: [[{ name: "A" }, { name: "B" }], [{ name: "C" }]],
          title: "Nested",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Nested");
      expect(result.html).toContain('<span class="tag">A</span>');
      expect(result.html).toContain('<span class="tag">B</span>');
      expect(result.html).toContain('<span class="tag">C</span>');
      expect(result.html).toContain('data-group="0"');
      expect(result.html).toContain('data-group="1"');
    });

    it("parser reads type as 'array' (docblock does not affect parser)", () => {
      const meta = parsePhpFile(fixture("ArrayOfObjects.php"));
      const tagCloud = meta.classes.find((c) => c.name === "TagCloud");
      expect(tagCloud).toBeDefined();
      const tagsParam = tagCloud!.constructorParams.find((p) => p.name === "tags");
      expect(tagsParam).toBeDefined();
      expect(tagsParam!.type).toBe("array");
    });
  });

  // -------------------------------------------------------------------------
  // UC223: Complex nested PHPDoc array casting (ProjectBoard)
  //   4 levels deep: ProjectBoard → Member[] → Skill[] → SkillLevel (enum)
  //                  ProjectBoard → Milestone[] → Task[] → TaskStatus (enum)
  // -------------------------------------------------------------------------
  describe.skipIf(!hasPhp82)("UC223: Complex nested PHPDoc array casting (ProjectBoard)", () => {
    it("renders full project with members, skills, milestones, and tasks", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProjectBoard.php"),
        class: "App\\Components\\ProjectBoard",
        callable: "render",
        args: {
          name: "Storybook PHP",
          description: "A renderer for PHP components",
          members: [
            {
              name: "Alice",
              role: "Lead",
              skills: [
                { name: "PHP", level: "expert" },
                { name: "TypeScript", level: "intermediate" },
              ],
            },
            {
              name: "Bob",
              role: "Developer",
              skills: [
                { name: "PHP", level: "intermediate" },
                { name: "CSS", level: "expert" },
              ],
            },
          ],
          milestones: [
            {
              name: "v1.0 Release",
              tasks: [
                { title: "Parser", status: "done", assignee: "Alice" },
                { title: "Runner", status: "done", assignee: "Bob" },
                { title: "Docs", status: "in_progress", assignee: "Alice" },
              ],
            },
            {
              name: "v2.0 Planning",
              tasks: [
                { title: "Array casting", status: "in_progress", assignee: "Alice" },
                { title: "Collection support", status: "todo" },
              ],
            },
          ],
        },
      });
      expect(result.error).toBeUndefined();

      // Top-level
      expect(result.html).toContain("Storybook PHP");
      expect(result.html).toContain("A renderer for PHP components");

      // Members rendered (proves list<Member> casting)
      expect(result.html).toContain("<strong>Alice</strong>");
      expect(result.html).toContain("<strong>Bob</strong>");
      expect(result.html).toContain('<span class="role">Lead</span>');
      expect(result.html).toContain('<span class="role">Developer</span>');

      // Skills rendered (proves nested list<Skill> + enum SkillLevel casting)
      expect(result.html).toContain('<span class="skill skill-expert">PHP</span>');
      expect(result.html).toContain('<span class="skill skill-intermediate">TypeScript</span>');
      expect(result.html).toContain('<span class="skill skill-expert">CSS</span>');

      // Milestones rendered (proves list<Milestone> casting)
      expect(result.html).toContain("<h4>v1.0 Release</h4>");
      expect(result.html).toContain("<h4>v2.0 Planning</h4>");

      // Tasks rendered (proves nested list<Task> + enum TaskStatus casting)
      expect(result.html).toContain(
        '<li class="task-done">Parser <span class="assignee">(Alice)</span></li>',
      );
      expect(result.html).toContain(
        '<li class="task-done">Runner <span class="assignee">(Bob)</span></li>',
      );
      expect(result.html).toContain(
        '<li class="task-in_progress">Docs <span class="assignee">(Alice)</span></li>',
      );
      expect(result.html).toContain(
        '<li class="task-in_progress">Array casting <span class="assignee">(Alice)</span></li>',
      );
      expect(result.html).toContain('<li class="task-todo">Collection support</li>');
    });

    it("renders with members but no milestones", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProjectBoard.php"),
        class: "App\\Components\\ProjectBoard",
        callable: "render",
        args: {
          name: "Quick Prototype",
          members: [{ name: "Charlie", role: "Solo Developer" }],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Quick Prototype");
      expect(result.html).toContain("<strong>Charlie</strong>");
      // No milestones section content
      expect(result.html).not.toContain("<h4>");
    });

    it("renders with empty members and milestones", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProjectBoard.php"),
        class: "App\\Components\\ProjectBoard",
        callable: "render",
        args: {
          name: "Empty Board",
          members: [],
          milestones: [],
          description: "Nothing here yet",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Empty Board");
      expect(result.html).toContain("Nothing here yet");
      // No member or task content
      expect(result.html).not.toContain('<div class="member">');
      expect(result.html).not.toContain('<div class="milestone">');
    });

    it("renders member with skills using default enum value", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProjectBoard.php"),
        class: "App\\Components\\ProjectBoard",
        callable: "render",
        args: {
          name: "Defaults Test",
          members: [
            {
              name: "Dave",
              role: "Intern",
              skills: [{ name: "HTML" }],
            },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      // Skill uses default SkillLevel::Beginner
      expect(result.html).toContain('<span class="skill skill-beginner">HTML</span>');
    });

    it("renders task with default status and no assignee", async () => {
      const result = await executor.execute({
        type: "classMethod",
        file: advanced("ProjectBoard.php"),
        class: "App\\Components\\ProjectBoard",
        callable: "render",
        args: {
          name: "Defaults Test",
          members: [],
          milestones: [
            {
              name: "Backlog",
              tasks: [{ title: "Unassigned task" }],
            },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      // Task uses default TaskStatus::Todo, no assignee
      expect(result.html).toContain('<li class="task-todo">Unassigned task</li>');
      expect(result.html).not.toContain("assignee");
    });

    it("parser detects ProjectBoard classes and array params", () => {
      const meta = parsePhpFile(advanced("ProjectBoard.php"));

      const board = meta.classes.find((c) => c.name === "ProjectBoard");
      expect(board).toBeDefined();
      const membersParam = board!.constructorParams.find((p) => p.name === "members");
      expect(membersParam).toBeDefined();
      expect(membersParam!.type).toBe("array");
      const milestonesParam = board!.constructorParams.find((p) => p.name === "milestones");
      expect(milestonesParam).toBeDefined();
      expect(milestonesParam!.type).toBe("array");

      const member = meta.classes.find((c) => c.name === "Member");
      expect(member).toBeDefined();
      const skillsParam = member!.constructorParams.find((p) => p.name === "skills");
      expect(skillsParam).toBeDefined();
      expect(skillsParam!.type).toBe("array");

      const milestone = meta.classes.find((c) => c.name === "Milestone");
      expect(milestone).toBeDefined();
      const tasksParam = milestone!.constructorParams.find((p) => p.name === "tasks");
      expect(tasksParam).toBeDefined();
      expect(tasksParam!.type).toBe("array");
    });
  });

  // -------------------------------------------------------------------------
  // typeMap: runtime bindings and args overrides
  // -------------------------------------------------------------------------
  describe("typeMap runtime", () => {
    it("resolves interface to concrete class via typeMap.bindings", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
          },
        },
      });
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapBindingTarget.php"),
        class: "App\\Components\\PageWithInterface",
        callable: "render",
        args: {
          title: "Test Page",
          content: { content: "Hello from binding", tag: "p" },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Test Page");
      expect(result.html).toContain("<p>Hello from binding</p>");
    });

    it("applies typeMap.args elementType for array casting", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          args: {
            "App\\Components\\TagRenderer::$items": {
              elementType: "string",
            },
          },
        },
      });
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapElementType.php"),
        class: "App\\Components\\TagRenderer",
        callable: "render",
        args: {
          items: ["PHP", "Storybook"],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<b>PHP</b>");
      expect(result.html).toContain("<b>Storybook</b>");
    });

    it("resolves interface in list<> doc type via typeMap.bindings", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
          },
        },
      });
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapBindingTarget.php"),
        class: "App\\Components\\PageWithItems",
        callable: "render",
        args: {
          title: "Items Page",
          items: [
            { content: "First", tag: "p" },
            { content: "Second", tag: "span" },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Items Page");
      expect(result.html).toContain("<p>First</p>");
      expect(result.html).toContain("<span>Second</span>");
    });

    it("applies typeMap.args string shorthand as type override", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          args: {
            "App\\Components\\TagRenderer::$items": "array",
          },
        },
      });
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapElementType.php"),
        class: "App\\Components\\TagRenderer",
        callable: "render",
        args: {
          items: ["A", "B"],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<b>A</b>");
    });
  });

  describe("per-story typeMap override", () => {
    it("per-request bindings override global bindings", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
          },
        },
      });
      // Per-request override: bind to PlainTextBlock instead
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapBindingTarget.php"),
        class: "App\\Components\\PageWithInterface",
        callable: "render",
        args: {
          title: "Override Test",
          content: { content: "plain text", tag: "span" },
        },
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\PlainTextBlock",
          },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Override Test");
      // PlainTextBlock wraps content with htmlspecialchars and no HTML tag
      expect(result.html).toContain("plain text");
    });

    it("per-request args override global args", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          args: {
            "App\\Components\\TagRenderer::$items": "array",
          },
        },
      });
      // Per-request override: use elementType for proper casting
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapElementType.php"),
        class: "App\\Components\\TagRenderer",
        callable: "render",
        args: {
          items: ["X", "Y"],
        },
        typeMap: {
          args: {
            "App\\Components\\TagRenderer::$items": {
              elementType: "string",
            },
          },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<b>X</b>");
      expect(result.html).toContain("<b>Y</b>");
    });

    it("per-request typeMap works when no global typeMap exists", async () => {
      const executor = new PhpExecutor({ timeout: 10000 });
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapElementType.php"),
        class: "App\\Components\\TagRenderer",
        callable: "render",
        args: {
          items: ["A", "B"],
        },
        typeMap: {
          args: {
            "App\\Components\\TagRenderer::$items": {
              elementType: "string",
            },
          },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("<b>A</b>");
      expect(result.html).toContain("<b>B</b>");
    });

    it("per-request bindings resolve interface in list<> doc type", async () => {
      const executor = new PhpExecutor({
        timeout: 10000,
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
          },
        },
      });
      // Per-request override: bind to PlainTextBlock instead of HtmlBlock
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapBindingTarget.php"),
        class: "App\\Components\\PageWithItems",
        callable: "render",
        args: {
          title: "Override Items",
          items: [{ content: "plain text", tag: "div" }],
        },
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\PlainTextBlock",
          },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("Override Items");
      // PlainTextBlock uses htmlspecialchars, no HTML tag wrapping
      expect(result.html).toContain("plain text");
      expect(result.html).not.toContain("<div>");
    });

    it("per-request bindings for list<> work when no global typeMap exists", async () => {
      const executor = new PhpExecutor({ timeout: 10000 });
      const result = await executor.execute({
        type: "classMethod",
        file: fixture("TypeMapBindingTarget.php"),
        class: "App\\Components\\PageWithItems",
        callable: "render",
        args: {
          title: "No Global",
          items: [{ content: "Hello", tag: "p" }],
        },
        typeMap: {
          bindings: {
            "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
          },
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain("No Global");
      expect(result.html).toContain("<p>Hello</p>");
    });
  });
});
