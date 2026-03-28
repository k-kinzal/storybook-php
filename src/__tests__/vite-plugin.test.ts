import { describe, it, expect, vi } from "vite-plus/test";
import { storybookPhpPlugin, VIRTUAL_PREFIX, resolveAdapterMap } from "../vite-plugin.js";
import { resolve } from "node:path";

const FIXTURES = resolve(__dirname, "fixtures");

// Helper to call resolveId on the plugin
function getResolveId(plugin: ReturnType<typeof storybookPhpPlugin>) {
  return (plugin as any).resolveId as (source: string, importer?: string) => string | null;
}

// Helper to call load on the plugin
function getLoad(plugin: ReturnType<typeof storybookPhpPlugin>) {
  return (plugin as any).load as (id: string) => string | null;
}

describe("Vite Plugin", () => {
  // -----------------------------------------------------------------------
  // resolveId tests
  // -----------------------------------------------------------------------
  describe("resolveId", () => {
    it("resolves .php@render with importer to virtual ID", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const result = resolveId("./SimpleComponent.php@render", resolve(FIXTURES, "some-story.ts"));

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain("SimpleComponent.php");
      expect(result).toContain("callable=render");
    });

    it("uses defaultMethod from options when @method is omitted", () => {
      const plugin = storybookPhpPlugin({ defaultMethod: "render" });
      const resolveId = getResolveId(plugin);

      const result = resolveId("./SimpleComponent.php", resolve(FIXTURES, "some-story.ts"));

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain("callable=render");
    });

    it("resolves to template mode when no @method and no defaultMethod", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const result = resolveId("./TemplateFile.php", resolve(FIXTURES, "some-story.ts"));

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain("callable=");
      // The callable should be empty (template mode)
      expect(result).toMatch(/callable=$/);
    });

    it("returns null for non-PHP files", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      expect(resolveId("./Component.tsx", "/some/importer.ts")).toBeNull();
      expect(resolveId("./styles.css", "/some/importer.ts")).toBeNull();
      expect(resolveId("react", "/some/importer.ts")).toBeNull();
    });

    it("resolves absolute PHP path", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const absPath = resolve(FIXTURES, "SimpleComponent.php");
      const result = resolveId(`${absPath}@render`);

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain(absPath);
      expect(result).toContain("callable=render");
    });

    it("returns null for relative PHP path without importer", () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const result = resolveId("./SimpleComponent.php@render");
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // load tests
  // -----------------------------------------------------------------------
  describe("load", () => {
    it("returns null for non-virtual IDs", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      expect(load("/some/regular/file.ts")).toBeNull();
      expect(load("react")).toBeNull();
    });

    it("generates classMethod module for SimpleComponent@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "SimpleComponent.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain(`__file: ${JSON.stringify(filePath)}`);
      expect(code).toContain('__class: "App\\\\Components\\\\SimpleComponent"');
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("__constructorArgs:");
      expect(code).toContain("__callableArgs:");
      expect(code).toContain("__allArgs:");
      // Constructor params
      expect(code).toContain("name:");
      expect(code).toContain("age:");
      expect(code).toContain("export const SimpleComponent");
    });

    it("generates staticMethod module for Alert@danger", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StaticMethods.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=danger`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('__class: "App\\\\Components\\\\Alert"');
      expect(code).toContain('__callable: "danger"');
      expect(code).toContain("__constructorArgs: {}");
      // Static method params in callableArgs
      expect(code).toContain("message:");
      expect(code).toContain("dismissible:");
      expect(code).toContain("export const Alert");
    });

    it("generates function module for StandaloneFunctions@badge", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StandaloneFunctions.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=badge`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("__class: null");
      expect(code).toContain('__callable: "badge"');
      expect(code).toContain("__constructorArgs: {}");
      // Function params
      expect(code).toContain("label:");
      expect(code).toContain("color:");
      expect(code).toContain("export const badge");
    });

    it("generates enumMethod module for EnumComponent@badge", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumComponent.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=badge`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('__class: "App\\\\Components\\\\Color"');
      expect(code).toContain('__callable: "badge"');
      // Should have _case in allArgs
      expect(code).toContain("_case:");
      expect(code).toContain("export const Color");
    });

    it("generates template module when callable is empty", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "TemplateFile.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'template'");
      expect(code).toContain("__class: null");
      expect(code).toContain("__callable: null");
      expect(code).toContain("__constructorArgs: {}");
      expect(code).toContain("__callableArgs: {}");
      expect(code).toContain("__allArgs: {}");
      expect(code).toContain("export default");
    });

    it("generates error module when callable not found", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "SimpleComponent.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=nonExistent`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("throw new Error");
      expect(code).toContain("nonExistent");
    });

    it("includes default value in arg map when present", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "SimpleComponent.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId)!;

      // The age param has a default of '25'
      expect(code).toContain('default: "25"');
      // The name param should be required, no default
      expect(code).toContain(
        "name: { type: 'string', required: true, position: 0, nullable: false }",
      );
    });

    it("generates enumMethod module for EnumInterface@badge", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumInterface.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=badge`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('__class: "App\\\\Components\\\\LogLevel"');
      expect(code).toContain('__callable: "badge"');
      expect(code).toContain("_case:");
      expect(code).toContain("export const LogLevel");
    });

    it("generates classMethod module for MultiTraitClass@icon (trait method)", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MultiTraitClass.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=icon`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__class: "App\\\\Components\\\\Widget"');
      expect(code).toContain('__callable: "icon"');
      expect(code).toContain("name:");
      expect(code).toContain("size:");
      expect(code).toContain("export const Widget");
    });

    it("generates classMethod module for MultiTraitClass@badge (second trait)", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MultiTraitClass.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=badge`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "badge"');
      expect(code).toContain("text:");
      expect(code).toContain("color:");
    });

    it("generates staticMethod for each MultiStaticMethods method", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MultiStaticMethods.php");

      const buttonCode = load(`${VIRTUAL_PREFIX}${filePath}?callable=button`);
      expect(buttonCode).toContain("__type: 'staticMethod'");
      expect(buttonCode).toContain("label:");
      expect(buttonCode).toContain("variant:");

      const linkCode = load(`${VIRTUAL_PREFIX}${filePath}?callable=link`);
      expect(linkCode).toContain("__type: 'staticMethod'");
      expect(linkCode).toContain("text:");
      expect(linkCode).toContain("href:");
      expect(linkCode).toContain("external:");

      const imageCode = load(`${VIRTUAL_PREFIX}${filePath}?callable=image`);
      expect(imageCode).toContain("__type: 'staticMethod'");
      expect(imageCode).toContain("alt:");
      expect(imageCode).toContain("width:");
    });

    it("generates classMethod module for ArrayReturn@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "ArrayReturn.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("label:");
      expect(code).toContain("value:");
    });

    it("generates classMethod module for StringableReturn@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StringableReturn.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      // Should generate for FragmentBuilder (the one with render method)
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("heading:");
    });

    it("generates classMethod module for IntersectionType Collection@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "IntersectionType.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("source:");
      expect(code).toContain("title:");
      expect(code).toContain("export const Collection");
    });

    it("generates classMethod module for MixedPromotion FormField@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MixedPromotion.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("label:");
      expect(code).toContain("id:");
      expect(code).toContain("export const FormField");
    });

    it("generates classMethod module for DnfType Serializer@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "DnfType.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("data:");
      expect(code).toContain("format:");
      expect(code).toContain("export const Serializer");
    });

    it("generates classMethod module for no-namespace class", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "NoNamespaceClass.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__class: "NoNamespaceButton"');
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("label:");
      expect(code).toContain("variant:");
      expect(code).toContain("disabled:");
      expect(code).toContain("export const NoNamespaceButton");
    });

    it("generates classMethod module for ConstantDefaults@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "ConstantDefaults.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("message:");
      expect(code).toContain("level:");
      expect(code).toContain("timeout:");
      expect(code).toContain("export const ConstantDefaults");
    });

    it("generates multiple exports from MultiExportClasses@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MultiExportClasses.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      // All three classes have a render method
      expect(code).toContain("export const PageHeader");
      expect(code).toContain("export const PageFooter");
      expect(code).toContain("export const PageSidebar");
      // All should be classMethod type
      expect(code!.match(/__type: 'classMethod'/g)).toHaveLength(3);
    });

    it("generates staticMethod from MultiExportClasses@collapsed", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MultiExportClasses.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=collapsed`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("export const PageSidebar");
      expect(code).toContain("icon:");
    });

    it("generates classMethod for NullableParams@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "NullableParams.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("message:");
      expect(code).toContain("title:");
      expect(code).toContain("icon:");
      expect(code).toContain("timeout:");
      expect(code).toContain("footer:");
      expect(code).toContain("export const NullableParams");
    });

    it("generates classMethod for StringableReturn2 StringableWrapper@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StringableReturn2.php");
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const StringableWrapper");
      expect(code).toContain("text:");
      expect(code).toContain("tag:");
      // HtmlElement has __toString, not render — should not appear
      expect(code).not.toContain("export const HtmlElement");
    });
  });

  // -----------------------------------------------------------------------
  // configureServer test
  // -----------------------------------------------------------------------
  describe("configureServer", () => {
    it("adds middleware to server", () => {
      const plugin = storybookPhpPlugin();
      const configureServer = (plugin as any).configureServer as (server: any) => void;

      const mockUse = vi.fn();
      const mockServer = {
        middlewares: {
          use: mockUse,
        },
      };

      configureServer(mockServer);
      expect(mockUse).toHaveBeenCalledTimes(1);
      expect(typeof mockUse.mock.calls[0][0]).toBe("function");
    });
  });

  // -----------------------------------------------------------------------
  // Enum with trait (UC147)
  // -----------------------------------------------------------------------
  describe("enum with trait", () => {
    it("resolves trait method on enum via findEnumMethod", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumWithTrait.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=badge`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      // Both Priority and Severity use HasBadge
      expect(code).toContain("export const Priority");
      expect(code).toContain("export const Severity");
      expect(code).toContain("_case:");
      expect(code).toContain("size:");
    });

    it("resolves icon method only on Severity (not Priority)", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumWithTrait.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=icon`);

      expect(code).toBeTruthy();
      expect(code).toContain("export const Severity");
      expect(code).not.toContain("export const Priority");
    });
  });

  // -----------------------------------------------------------------------
  // Promoted readonly union (UC148)
  // -----------------------------------------------------------------------
  describe("promoted readonly union", () => {
    it("generates classMethod for PromotedReadonlyUnion@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "PromotedReadonlyUnion.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const PromotedReadonlyUnion");
      expect(code).toContain("id:");
      expect(code).toContain("label:");
      expect(code).toContain("amount:");
    });
  });

  // -----------------------------------------------------------------------
  // Function with union return type (UC150)
  // -----------------------------------------------------------------------
  describe("function union return", () => {
    it("generates function module for formatValue", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "FunctionUnionReturn.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=formatValue`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const formatValue");
    });

    it("generates function module for renderStatus", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "FunctionUnionReturn.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderStatus`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const renderStatus");
    });
  });

  // -----------------------------------------------------------------------
  // Method constant defaults (UC149)
  // -----------------------------------------------------------------------
  describe("method constant defaults", () => {
    it("generates classMethod with constant defaults in method args", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MethodConstantDefault.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("format:");
      expect(code).toContain("maxLength:");
      expect(code).toContain("content:");
    });
  });

  // -----------------------------------------------------------------------
  // TraitAbstract: trait with abstract method + class implementing it
  // -----------------------------------------------------------------------
  describe("trait with abstract method", () => {
    it("resolves render() from trait on TraitAbstract class", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "TraitAbstract.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const TraitAbstract");
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("title:");
      expect(code).toContain("body:");
      // Should NOT export the trait itself
      expect(code).not.toContain("export const HasLayout");
    });
  });

  // -----------------------------------------------------------------------
  // DualCallable: class with both __invoke and render
  // -----------------------------------------------------------------------
  describe("dual callable class", () => {
    it("generates classMethod for DualCallable@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "DualCallable.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const DualCallable");
      expect(code).toContain('__callable: "render"');
      expect(code).toContain("label:");
    });

    it("generates classMethod for DualCallable@__invoke", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "DualCallable.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=__invoke`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const DualCallable");
      expect(code).toContain('__callable: "__invoke"');
      expect(code).toContain("wrapper:");
    });
  });

  // -----------------------------------------------------------------------
  // CurrencyEnum: backed enum implementing Stringable
  // -----------------------------------------------------------------------
  describe("currency enum", () => {
    it("generates enumMethod for Currency@format", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "CurrencyEnum.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=format`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const Currency");
      expect(code).toContain("_case:");
      expect(code).toContain("amount:");
      expect(code).toContain("decimals:");
    });

    it("generates staticMethod for Currency@table", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "CurrencyEnum.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=table`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("export const Currency");
      expect(code).toContain("amount:");
    });
  });

  // -----------------------------------------------------------------------
  // EnumDefaultFunc: function with enum-typed param and default
  // -----------------------------------------------------------------------
  describe("function with enum default", () => {
    it("generates function module for alignedBox", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumDefaultFunc.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=alignedBox`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const alignedBox");
      expect(code).toContain("content:");
      expect(code).toContain("align:");
      expect(code).toContain("bg:");
    });
  });

  // -----------------------------------------------------------------------
  // SplitView: class with multiple named render methods
  // -----------------------------------------------------------------------
  describe("split view multiple methods", () => {
    it("generates classMethod for SplitView@renderFull", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "SplitView.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderFull`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const SplitView");
      expect(code).toContain('__callable: "renderFull"');
      expect(code).toContain("title:");
    });

    it("generates classMethod for SplitView@renderCompact", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "SplitView.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderCompact`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const SplitView");
      expect(code).toContain('__callable: "renderCompact"');
    });
  });

  // -----------------------------------------------------------------------
  // MixedOutput: class with echo (void) and return methods
  // -----------------------------------------------------------------------
  describe("mixed output methods", () => {
    it("generates classMethod for MixedOutput@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MixedOutput.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const MixedOutput");
      expect(code).toContain("title:");
    });

    it("generates classMethod for MixedOutput@renderEcho", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MixedOutput.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderEcho`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const MixedOutput");
      expect(code).toContain('__callable: "renderEcho"');
    });
  });

  // -----------------------------------------------------------------------
  // StandaloneBoolType: true/false/null standalone types
  // -----------------------------------------------------------------------
  describe("standalone bool types", () => {
    it("generates classMethod for renderEnabled with true type", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StandaloneBoolType.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderEnabled`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const StandaloneBoolType");
      expect(code).toContain("type: 'true'");
    });

    it("generates staticMethod for renderNull with null type", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StandaloneBoolType.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderNull`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("type: 'null'");
    });
  });

  // -----------------------------------------------------------------------
  // TraitConflict: insteadof/as conflict resolution
  // -----------------------------------------------------------------------
  describe("trait conflict resolution", () => {
    it("resolves render method from trait chain with insteadof", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "TraitConflict.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const TraitConflict");
      expect(code).toContain("text:");
    });
  });

  // -----------------------------------------------------------------------
  // EnumArrayParam: enum method with array param
  // -----------------------------------------------------------------------
  describe("enum array param", () => {
    it("generates enumMethod for renderList with array param", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumArrayParam.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderList`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const ListStyle");
      expect(code).toContain("type: 'array'");
    });

    it("generates staticMethod for preview", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "EnumArrayParam.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=preview`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("type: 'array'");
    });
  });

  // -----------------------------------------------------------------------
  // AbstractMultiChild: multiple exports from abstract hierarchy
  // -----------------------------------------------------------------------
  describe("abstract multi child", () => {
    it("generates classMethod exports for all 3 concrete children", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "AbstractMultiChild.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("export const InfoPanel");
      expect(code).toContain("export const WarningPanel");
      expect(code).toContain("export const ErrorPanel");
      // Abstract class should NOT be exported as classMethod
      expect(code).not.toContain("export const AbstractPanel");
    });
  });

  // -----------------------------------------------------------------------
  // SelfStaticReturn: self/static return types
  // -----------------------------------------------------------------------
  describe("self/static return types", () => {
    it("generates classMethod for render (methods with self/static return exist)", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "SelfStaticReturn.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const SelfStaticReturn");
    });
  });

  // -----------------------------------------------------------------------
  // FunctionIntersectionParam: function with intersection type
  // -----------------------------------------------------------------------
  describe("function intersection param", () => {
    it("generates function module with intersection type param", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "FunctionIntersectionParam.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderTagged`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const renderTagged");
      expect(code).toContain("type: 'HasLabel&HasColor'");
    });
  });

  // -----------------------------------------------------------------------
  // VoidNeverReturn: void/never return types
  // -----------------------------------------------------------------------
  describe("void/never return types", () => {
    it("generates classMethod for renderEcho (void return)", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "VoidNeverReturn.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=renderEcho`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const VoidNeverReturn");
    });

    it("generates classMethod for fail (never return)", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "VoidNeverReturn.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=fail`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('__callable: "fail"');
    });
  });

  // -----------------------------------------------------------------------
  // ReadonlyClassDto: PHP 8.2 readonly class
  // -----------------------------------------------------------------------
  describe("readonly class", () => {
    it("generates classMethod for ReadonlyClassDto@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "ReadonlyClassDto.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const ReadonlyClassDto");
      expect(code).toContain("name:");
      expect(code).toContain("email:");
      expect(code).toContain("age:");
      expect(code).toContain("role:");
    });
  });

  // -----------------------------------------------------------------------
  // IntEnumCalc: int-backed enum with methods
  // -----------------------------------------------------------------------
  describe("int-backed enum", () => {
    it("generates enumMethod for HttpPort@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "IntEnumCalc.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const HttpPort");
      expect(code).toContain("_case:");
    });

    it("generates staticMethod for HttpPort@table", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "IntEnumCalc.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=table`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("export const HttpPort");
    });
  });

  // -----------------------------------------------------------------------
  // IterableParam: iterable type hint
  // -----------------------------------------------------------------------
  describe("iterable type param", () => {
    it("generates classMethod for IterableParam@render with iterable param", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "IterableParam.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const IterableParam");
      expect(code).toContain("items:");
      expect(code).toContain("type: 'iterable'");
      expect(code).toContain("style:");
    });
  });

  // -----------------------------------------------------------------------
  // StringableEnum: enum with Stringable + custom interface
  // -----------------------------------------------------------------------
  describe("stringable enum", () => {
    it("generates enumMethod for Planet@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "StringableEnum.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain("export const Planet");
      expect(code).toContain("_case:");
      expect(code).toContain("showDescription:");
    });
  });

  // -----------------------------------------------------------------------
  // AbstractTemplateMethod: abstract + concrete subclasses
  // -----------------------------------------------------------------------
  describe("abstract template method", () => {
    it("generates exports for all 3 concrete children but not abstract", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "AbstractTemplateMethod.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("export const EmailNotification");
      expect(code).toContain("export const SmsNotification");
      expect(code).toContain("export const PushNotification");
      expect(code).not.toContain("export const AbstractNotification");
      expect(code).toContain("message:");
      expect(code).toContain("recipient:");
    });
  });

  // -----------------------------------------------------------------------
  // VariadicFunc: standalone function with variadic params
  // -----------------------------------------------------------------------
  describe("variadic function", () => {
    it("generates function module for breadcrumbTrail", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "VariadicFunc.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=breadcrumbTrail`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const breadcrumbTrail");
      expect(code).toContain("separator:");
      expect(code).toContain("segments:");
    });

    it("generates function module for joinParagraphs", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "VariadicFunc.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=joinParagraphs`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain("export const joinParagraphs");
    });
  });

  // -----------------------------------------------------------------------
  // MixedDefaultsShowcase: diverse default value types
  // -----------------------------------------------------------------------
  describe("mixed defaults showcase", () => {
    it("generates classMethod for MixedDefaultsShowcase@render", () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, "MixedDefaultsShowcase.php");
      const code = load(`${VIRTUAL_PREFIX}${filePath}?callable=render`);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const MixedDefaultsShowcase");
      expect(code).toContain("title:");
      expect(code).toContain("maxItems:");
      expect(code).toContain("opacity:");
      expect(code).toContain("visible:");
      expect(code).toContain("subtitle:");
      expect(code).toContain("tags:");
      expect(code).toContain("theme:");
    });
  });

  // -----------------------------------------------------------------------
  // typeMap tests
  // -----------------------------------------------------------------------
  describe("typeMap", () => {
    describe("typeMap.files with inline args", () => {
      it("resolves a non-PHP file mapped via typeMap.files", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "TypeMapInlineTarget.blade.php": {
                args: {
                  title: "string",
                  message: "?string",
                },
              },
            },
          },
        });
        const resolveId = getResolveId(plugin);
        const result = resolveId(
          "./TypeMapInlineTarget.blade.php",
          resolve(FIXTURES, "some-story.ts"),
        );
        expect(result).toContain(VIRTUAL_PREFIX);
        expect(result).toContain("mapped=1");
      });

      it("generates template module with inline args", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "TypeMapInlineTarget.blade.php": {
                args: {
                  title: "string",
                  message: { type: "string", nullable: true, default: "hello" },
                  count: { type: "int", required: true },
                },
              },
            },
          },
        });
        const load = getLoad(plugin);
        const bladeFile = resolve(FIXTURES, "TypeMapInlineTarget.blade.php");
        const code = load(`${VIRTUAL_PREFIX}${bladeFile}?callable=&mapped=1`);

        expect(code).toBeTruthy();
        expect(code).toContain("__type: 'template'");
        expect(code).toContain("title:");
        expect(code).toContain("type: 'string'");
        expect(code).toContain("message:");
        expect(code).toContain("count:");
        expect(code).toContain("type: 'int'");
      });
    });

    describe("typeMap.files with phpFile redirect", () => {
      it("generates module from referenced PHP file", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "TypeMapInlineTarget.blade.php": {
                phpFile: "SimpleComponent.php",
                callable: "render",
              },
            },
          },
        });
        const load = getLoad(plugin);
        const bladeFile = resolve(FIXTURES, "TypeMapInlineTarget.blade.php");
        const code = load(`${VIRTUAL_PREFIX}${bladeFile}?callable=render&mapped=1`);

        expect(code).toBeTruthy();
        expect(code).toContain("__type: 'classMethod'");
        expect(code).toContain("SimpleComponent");
      });
    });

    describe("typeMap.files with includes", () => {
      it("resolves cross-file parent class constructor params", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "TypeMapChildClass.php": {
                includes: ["TypeMapBaseClass.php"],
              },
            },
          },
        });
        const load = getLoad(plugin);
        const childFile = resolve(FIXTURES, "TypeMapChildClass.php");
        const code = load(`${VIRTUAL_PREFIX}${childFile}?callable=render`);

        expect(code).toBeTruthy();
        expect(code).toContain("__type: 'classMethod'");
        expect(code).toContain("export const TypeMapChild");
        expect(code).toContain('__callable: "render"');
      });
    });

    describe("typeMap.args overrides", () => {
      it("applies options override to constructor param", () => {
        const plugin = storybookPhpPlugin({
          typeMap: {
            args: {
              "App\\Components\\SimpleComponent::$name": {
                options: ["Alice", "Bob", "Charlie"],
              },
            },
          },
        });
        const load = getLoad(plugin);
        const file = resolve(FIXTURES, "SimpleComponent.php");
        const code = load(`${VIRTUAL_PREFIX}${file}?callable=render`);

        expect(code).toBeTruthy();
        expect(code).toContain('options: ["Alice","Bob","Charlie"]');
      });

      it("applies type override to constructor param", () => {
        const plugin = storybookPhpPlugin({
          typeMap: {
            args: {
              "App\\Components\\SimpleComponent::$name": "App\\Enums\\NameEnum",
            },
          },
        });
        const load = getLoad(plugin);
        const file = resolve(FIXTURES, "SimpleComponent.php");
        const code = load(`${VIRTUAL_PREFIX}${file}?callable=render`);

        expect(code).toBeTruthy();
        // Backslashes should be escaped in the generated JS
        expect(code).toContain("type: 'App\\\\Enums\\\\NameEnum'");
      });
    });

    describe("type escaping", () => {
      it("escapes backslashes in FQCN types for inline args", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "TypeMapInlineTarget.blade.php": {
                args: {
                  obj: "App\\Models\\User",
                },
              },
            },
          },
        });
        const load = getLoad(plugin);
        const bladeFile = resolve(FIXTURES, "TypeMapInlineTarget.blade.php");
        const code = load(`${VIRTUAL_PREFIX}${bladeFile}?callable=&mapped=1`);

        expect(code).toBeTruthy();
        // Backslashes should be escaped
        expect(code).toContain("type: 'App\\\\Models\\\\User'");
      });
    });

    // -----------------------------------------------------------------
    // typeMap.files glob pattern matching
    // -----------------------------------------------------------------
    describe("typeMap.files glob patterns", () => {
      it("resolves a file matching a glob pattern (*.blade.php)", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "*.blade.php": {
                adapter: "./blade-adapter.php",
              },
            },
          },
        });
        const resolveId = getResolveId(plugin);
        const result = resolveId(
          "./TypeMapInlineTarget.blade.php",
          resolve(FIXTURES, "some-story.ts"),
        );
        expect(result).toContain(VIRTUAL_PREFIX);
        expect(result).toContain("mapped=1");
      });

      it("generates template module with empty args for pattern-only match", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "*.blade.php": {
                adapter: "./blade-adapter.php",
              },
            },
          },
        });
        const load = getLoad(plugin);
        const bladeFile = resolve(FIXTURES, "TypeMapInlineTarget.blade.php");
        const code = load(`${VIRTUAL_PREFIX}${bladeFile}?callable=&mapped=1`);

        expect(code).toBeTruthy();
        expect(code).toContain("__type: 'template'");
        expect(code).toContain("__allArgs: {}");
      });

      it("merges pattern adapter with exact-match args", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "*.blade.php": {
                adapter: "./blade-adapter.php",
              },
              "TypeMapInlineTarget.blade.php": {
                args: {
                  title: "string",
                  message: "?string",
                },
              },
            },
          },
        });
        const resolveId = getResolveId(plugin);
        const result = resolveId(
          "./TypeMapInlineTarget.blade.php",
          resolve(FIXTURES, "some-story.ts"),
        );
        expect(result).toContain("mapped=1");

        const load = getLoad(plugin);
        const bladeFile = resolve(FIXTURES, "TypeMapInlineTarget.blade.php");
        const code = load(`${VIRTUAL_PREFIX}${bladeFile}?callable=&mapped=1`);

        // Should have args from exact match
        expect(code).toContain("title:");
        expect(code).toContain("message:");
        expect(code).toContain("__type: 'template'");
      });

      it("does not match a non-matching pattern", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "*.twig": {
                adapter: "./twig-adapter.php",
              },
            },
          },
        });
        const resolveId = getResolveId(plugin);
        const result = resolveId(
          "./TypeMapInlineTarget.blade.php",
          resolve(FIXTURES, "some-story.ts"),
        );
        // .blade.php does not match *.twig, but does match PHP_RE
        expect(result).not.toContain("mapped=1");
      });

      it("exact match overrides pattern match fields", () => {
        const plugin = storybookPhpPlugin({
          _configDir: FIXTURES,
          typeMap: {
            files: {
              "*.blade.php": {
                adapter: "./blade-adapter.php",
                args: { defaultArg: "string" },
              },
              "TypeMapInlineTarget.blade.php": {
                args: { title: "string" },
              },
            },
          },
        });
        const load = getLoad(plugin);
        const bladeFile = resolve(FIXTURES, "TypeMapInlineTarget.blade.php");
        const code = load(`${VIRTUAL_PREFIX}${bladeFile}?callable=&mapped=1`);

        expect(code).toBeTruthy();
        // Exact match args override pattern args
        expect(code).toContain("title:");
        expect(code).not.toContain("defaultArg:");
      });
    });

    // -----------------------------------------------------------------
    // resolveAdapterMap
    // -----------------------------------------------------------------
    describe("resolveAdapterMap", () => {
      it("extracts pattern and exact file adapters", () => {
        const map = resolveAdapterMap(
          {
            "*.blade.php": { adapter: "./blade-adapter.php" },
            "../src/special.php": { adapter: "./special-adapter.php" },
            "../src/no-adapter.php": { args: { x: "string" } },
          },
          FIXTURES,
        );

        expect(map).toBeDefined();
        expect(map!.patterns).toHaveLength(1);
        expect(map!.patterns[0]!.suffix).toBe(".blade.php");
        expect(map!.patterns[0]!.adapter).toContain("blade-adapter.php");
        expect(Object.keys(map!.files)).toHaveLength(1);
        const fileKey = Object.keys(map!.files)[0]!;
        expect(fileKey).toContain("special.php");
        expect(map!.files[fileKey]).toContain("special-adapter.php");
      });

      it("returns undefined when no adapters are configured", () => {
        const map = resolveAdapterMap({ "../src/file.php": { args: { x: "string" } } }, FIXTURES);
        expect(map).toBeUndefined();
      });

      it("returns undefined for undefined fileMap", () => {
        const map = resolveAdapterMap(undefined, FIXTURES);
        expect(map).toBeUndefined();
      });
    });
  });
});
