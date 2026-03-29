import { describe, it, expect } from "vite-plus/test";
import { createPhpResolver } from "../ts-plugin/resolver.js";
import { resolve } from "node:path";
import type ts from "typescript";

const mockTs = {} as typeof ts;
const fixturesDir = resolve(__dirname, "fixtures");
const fixturePath = (name: string) => resolve(fixturesDir, name);

// A fake "containing file" in the fixtures directory so relative resolution works
const containingFile = resolve(fixturesDir, "story.ts");

describe("PhpResolver", () => {
  // -------------------------------------------------------------------------
  // isPhpImport
  // -------------------------------------------------------------------------
  describe("isPhpImport", () => {
    it("returns true for .php", () => {
      const resolver = createPhpResolver(mockTs);
      expect(resolver.isPhpImport("./SimpleComponent.php")).toBe(true);
    });

    it("returns true for .php@render", () => {
      const resolver = createPhpResolver(mockTs);
      expect(resolver.isPhpImport("./SimpleComponent.php@render")).toBe(true);
    });

    it("returns true for .php@badge", () => {
      const resolver = createPhpResolver(mockTs);
      expect(resolver.isPhpImport("./StandaloneFunctions.php@badge")).toBe(true);
    });

    it("returns false for .ts", () => {
      const resolver = createPhpResolver(mockTs);
      expect(resolver.isPhpImport("./foo.ts")).toBe(false);
    });

    it("returns false for .js", () => {
      const resolver = createPhpResolver(mockTs);
      expect(resolver.isPhpImport("./foo.js")).toBe(false);
    });

    it("returns false for .php.ts", () => {
      const resolver = createPhpResolver(mockTs);
      expect(resolver.isPhpImport("./foo.php.ts")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // resolvePhpImport
  // -------------------------------------------------------------------------
  describe("resolvePhpImport", () => {
    it("generates declaration with class name and args for SimpleComponent.php@render", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./SimpleComponent.php@render", containingFile);

      expect(result).not.toBeNull();
      expect(result).toContain("import type { PhpComponent } from 'storybook-php';");
      expect(result).toContain("interface SimpleComponent_render_Args");
      expect(result).toContain("name: string;");
      expect(result).toContain("age?: number;");
      expect(result).toContain(
        "export declare const SimpleComponent: PhpComponent<SimpleComponent_render_Args>;",
      );
    });

    it("generates static method declaration (no constructor args) for StaticMethods.php@danger", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./StaticMethods.php@danger", containingFile);

      expect(result).not.toBeNull();
      expect(result).toContain("interface Alert_danger_Args");
      expect(result).toContain("message: string;");
      expect(result).toContain("dismissible?: boolean;");
      expect(result).toContain("export declare const Alert: PhpComponent<Alert_danger_Args>;");

      // Static method should NOT include constructor params -- Alert has none anyway,
      // but verify it doesn't have unexpected content
      expect(result).not.toContain("__construct");
    });

    it("generates function declaration for StandaloneFunctions.php@badge", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./StandaloneFunctions.php@badge", containingFile);

      expect(result).not.toBeNull();
      expect(result).toContain("interface badge_Args");
      expect(result).toContain("label: string;");
      expect(result).toContain("color?: string;");
      expect(result).toContain("export declare const badge: PhpComponent<badge_Args>;");
    });

    it("generates enum declaration with _case for EnumComponent.php@badge", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./EnumComponent.php@badge", containingFile);

      expect(result).not.toBeNull();
      expect(result).toContain("interface Color_badge_Args");
      expect(result).toContain("_case: string;");
      expect(result).toContain("export declare const Color: PhpComponent<Color_badge_Args>;");
    });

    it("generates default export for template (no callable)", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./TemplateFile.php", containingFile);

      expect(result).not.toBeNull();
      expect(result).toContain("import type { PhpComponent } from 'storybook-php';");
      expect(result).toContain("declare const _default: PhpComponent<Record<string, unknown>>;");
      expect(result).toContain("export default _default;");
    });

    it("returns null for nonexistent file", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./DoesNotExist.php@render", containingFile);

      expect(result).toBeNull();
    });

    it("returns empty string for unknown callable", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./SimpleComponent.php@nonexistent", containingFile);

      expect(result).toBe("");
    });

    it("returns null for non-PHP specifier", () => {
      const resolver = createPhpResolver(mockTs);
      const result = resolver.resolvePhpImport("./foo.ts", containingFile);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getPhpMeta
  // -------------------------------------------------------------------------
  describe("getPhpMeta", () => {
    it("returns parsed metadata for fixture files", () => {
      const resolver = createPhpResolver(mockTs);
      const meta = resolver.getPhpMeta(fixturePath("SimpleComponent.php"));

      expect(meta).not.toBeNull();
      expect(meta!.classes).toHaveLength(1);
      expect(meta!.classes[0]!.name).toBe("SimpleComponent");
      expect(meta!.classes[0]!.constructorParams).toHaveLength(2);
      expect(meta!.classes[0]!.methods).toHaveLength(1);
      expect(meta!.classes[0]!.methods[0]!.name).toBe("render");
    });

    it("caches results (second call returns same object)", () => {
      const resolver = createPhpResolver(mockTs);
      const meta1 = resolver.getPhpMeta(fixturePath("SimpleComponent.php"));
      const meta2 = resolver.getPhpMeta(fixturePath("SimpleComponent.php"));

      expect(meta1).not.toBeNull();
      expect(meta1).toBe(meta2); // Same reference = cached
    });

    it("returns null for nonexistent file", () => {
      const resolver = createPhpResolver(mockTs);
      const meta = resolver.getPhpMeta(fixturePath("NonExistent.php"));

      expect(meta).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Default method
  // -------------------------------------------------------------------------
  describe("defaultMethod", () => {
    it('resolver with defaultMethod="render" resolves .php without @method', () => {
      const resolver = createPhpResolver(mockTs, "render");
      const result = resolver.resolvePhpImport("./SimpleComponent.php", containingFile);

      // Should use 'render' as the callable instead of template mode
      expect(result).not.toBeNull();
      expect(result).toContain("interface SimpleComponent_render_Args");
      expect(result).toContain("name: string;");
      expect(result).toContain("age?: number;");
      expect(result).toContain(
        "export declare const SimpleComponent: PhpComponent<SimpleComponent_render_Args>;",
      );
    });

    it("explicit @method overrides defaultMethod", () => {
      const resolver = createPhpResolver(mockTs, "render");
      const result = resolver.resolvePhpImport("./StaticMethods.php@danger", containingFile);

      // Should use 'danger', not 'render'
      expect(result).not.toBeNull();
      expect(result).toContain("interface Alert_danger_Args");
      expect(result).toContain("message: string;");
    });

    it("keeps bare imports on the bare virtual declaration path", () => {
      const resolver = createPhpResolver(mockTs, "render");
      const result = resolver.getVirtualDeclarationPath("./SimpleComponent.php", containingFile);

      expect(result).toBe(`${fixturePath("SimpleComponent.php")}.d.ts`);
    });

    it("keeps explicit callables on the suffixed virtual declaration path", () => {
      const resolver = createPhpResolver(mockTs, "render");
      const result = resolver.getVirtualDeclarationPath(
        "./SimpleComponent.php@render",
        containingFile,
      );

      expect(result).toBe(`${fixturePath("SimpleComponent.php")}@render.d.ts`);
    });

    it("serves bare-path virtual declarations with defaultMethod content", () => {
      const resolver = createPhpResolver(mockTs, "render");
      const result = resolver.getVirtualDeclaration(`${fixturePath("SimpleComponent.php")}.d.ts`);

      expect(result).not.toBeNull();
      expect(result).toContain("interface SimpleComponent_render_Args");
      expect(result).toContain("name: string;");
    });

    it("returns a stable version string for bare-path virtual declarations", () => {
      const resolver = createPhpResolver(mockTs, "render");
      const fileName = `${fixturePath("SimpleComponent.php")}.d.ts`;

      expect(resolver.getVirtualDeclarationVersion(fileName)).toBeTruthy();
      expect(resolver.getVirtualDeclarationVersion(fileName)).toBe(
        resolver.getVirtualDeclarationVersion(fileName),
      );
    });

    it("does not expose a bare-path declaration when defaultMethod is missing", () => {
      const resolver = createPhpResolver(mockTs, "missingMethod");
      const result = resolver.getVirtualDeclaration(`${fixturePath("SimpleComponent.php")}.d.ts`);

      expect(result).toBeNull();
    });
  });

  describe("full resolver config", () => {
    it("supports typeMap-backed inline args with configDir", () => {
      const resolver = createPhpResolver(mockTs, {
        configDir: fixturesDir,
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

      const result = resolver.resolvePhpImport("./TypeMapInlineTarget.blade.php", containingFile);

      expect(result).not.toBeNull();
      expect(result).toContain("title: string;");
      expect(result).toContain("featured?: boolean;");
    });
  });
});
