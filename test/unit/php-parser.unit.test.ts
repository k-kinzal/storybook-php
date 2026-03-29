import { describe, it, expect } from "vite-plus/test";
import { parsePhpFile, parsePhpSource } from "../../src/core/analysis/php-parser.js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const fixture = (name: string) =>
  readFileSync(resolve(import.meta.dirname!, "../fixtures", name), "utf-8");
const fixturesDir = resolve(import.meta.dirname!, "../fixtures");
const basicDir = resolve(import.meta.dirname!, "../../examples/basic/src");
const advancedPatternsDir = resolve(import.meta.dirname!, "../../examples/advanced-patterns/src");
const advancedComponentsDir = resolve(
  import.meta.dirname!,
  "../../examples/advanced-components/src",
);
const advancedCallablesDir = resolve(import.meta.dirname!, "../../examples/advanced-callables/src");
const advancedTemplatesDir = resolve(import.meta.dirname!, "../../examples/advanced-templates/src");
const php80Dir = resolve(import.meta.dirname!, "../../examples/php80/src");
const php81Dir = resolve(import.meta.dirname!, "../../examples/php81/src");
const php82Dir = resolve(import.meta.dirname!, "../../examples/php82/src");
const php83Dir = resolve(import.meta.dirname!, "../../examples/php83/src");
const advancedDirs = [
  advancedPatternsDir,
  advancedComponentsDir,
  advancedCallablesDir,
  advancedTemplatesDir,
];
const resolveAdvancedFile = (name: string) => {
  for (const dir of advancedDirs) {
    const candidate = resolve(dir, name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return resolve(advancedPatternsDir, name);
};
const fixturePath = (name: string) => resolve(fixturesDir, name);
const basic = (name: string) => resolve(basicDir, name);
const advanced = (name: string) => resolveAdvancedFile(name);
const php80 = (name: string) => resolve(php80Dir, name);
const php81 = (name: string) => resolve(php81Dir, name);
const php82 = (name: string) => resolve(php82Dir, name);
const php83 = (name: string) => resolve(php83Dir, name);

describe("PHP Parser", () => {
  // -----------------------------------------------------------------------
  // 1. SimpleComponent
  // -----------------------------------------------------------------------
  describe("SimpleComponent", () => {
    it("parses namespace, class name, constructor params, and render method", () => {
      const meta = parsePhpSource(fixture("SimpleComponent.php"), "SimpleComponent.php");

      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("SimpleComponent");
      expect(cls.fqn).toBe("App\\Components\\SimpleComponent");
      expect(cls.isAbstract).toBe(false);
      expect(cls.isFinal).toBe(false);
      expect(cls.isReadonly).toBe(false);

      // Constructor params
      expect(cls.constructorParams).toHaveLength(2);

      const nameParam = cls.constructorParams[0]!;
      expect(nameParam.name).toBe("name");
      expect(nameParam.type).toBe("string");
      expect(nameParam.required).toBe(true);
      expect(nameParam.isPromoted).toBe(true);
      expect(nameParam.visibility).toBe("private");
      expect(nameParam.position).toBe(0);

      const ageParam = cls.constructorParams[1]!;
      expect(ageParam.name).toBe("age");
      expect(ageParam.type).toBe("int");
      expect(ageParam.required).toBe(false);
      expect(ageParam.default).toBe("25");
      expect(ageParam.isPromoted).toBe(true);
      expect(ageParam.visibility).toBe("private");
      expect(ageParam.position).toBe(1);

      // Methods
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
      expect(cls.methods[0]!.returnType).toBe("string");
      expect(cls.methods[0]!.isStatic).toBe(false);
      expect(cls.methods[0]!.visibility).toBe("public");
    });
  });

  // -----------------------------------------------------------------------
  // 2. ComplexComponent
  // -----------------------------------------------------------------------
  describe("ComplexComponent", () => {
    it("parses nullable params, bool/array defaults, trailing comma, multiple methods", () => {
      const meta = parsePhpSource(fixture("ComplexComponent.php"), "ComplexComponent.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ComplexComponent");
      expect(cls.constructorParams).toHaveLength(4);

      const title = cls.constructorParams[0]!;
      expect(title.name).toBe("title");
      expect(title.type).toBe("string");
      expect(title.required).toBe(true);

      const subtitle = cls.constructorParams[1]!;
      expect(subtitle.name).toBe("subtitle");
      expect(subtitle.type).toBe("string");
      expect(subtitle.nullable).toBe(true);
      expect(subtitle.required).toBe(false);
      expect(subtitle.default).toBe("null");

      const featured = cls.constructorParams[2]!;
      expect(featured.name).toBe("featured");
      expect(featured.type).toBe("bool");
      expect(featured.default).toBe("false");

      const items = cls.constructorParams[3]!;
      expect(items.name).toBe("items");
      expect(items.type).toBe("array");
      expect(items.default).toBe("[]");

      // Two methods: render and renderCard
      expect(cls.methods).toHaveLength(2);
      expect(cls.methods[0]!.name).toBe("render");
      expect(cls.methods[1]!.name).toBe("renderCard");

      // renderCard has a param
      expect(cls.methods[1]!.params).toHaveLength(1);
      expect(cls.methods[1]!.params[0]!.name).toBe("extra");
      expect(cls.methods[1]!.params[0]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // 3. StaticMethods
  // -----------------------------------------------------------------------
  describe("StaticMethods", () => {
    it("parses static vs instance methods with correct isStatic flag", () => {
      const meta = parsePhpSource(fixture("StaticMethods.php"), "StaticMethods.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Alert");
      expect(cls.methods).toHaveLength(3);

      const danger = cls.methods.find((m) => m.name === "danger")!;
      expect(danger.isStatic).toBe(true);
      expect(danger.visibility).toBe("public");
      expect(danger.params).toHaveLength(2);
      expect(danger.params[0]!.name).toBe("message");
      expect(danger.params[1]!.name).toBe("dismissible");
      expect(danger.params[1]!.default).toBe("false");

      const success = cls.methods.find((m) => m.name === "success")!;
      expect(success.isStatic).toBe(true);

      const instance = cls.methods.find((m) => m.name === "instanceMethod")!;
      expect(instance.isStatic).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 4. StandaloneFunctions
  // -----------------------------------------------------------------------
  describe("StandaloneFunctions", () => {
    it("parses global functions with no class", () => {
      const meta = parsePhpSource(fixture("StandaloneFunctions.php"), "StandaloneFunctions.php");

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(2);

      const badge = meta.functions.find((f) => f.name === "badge")!;
      expect(badge.fqn).toBe("badge");
      expect(badge.returnType).toBe("string");
      expect(badge.params).toHaveLength(2);
      expect(badge.params[0]!.name).toBe("label");
      expect(badge.params[0]!.type).toBe("string");
      expect(badge.params[1]!.name).toBe("color");
      expect(badge.params[1]!.default).toBe("'__PLACEHOLDER__'");

      const icon = meta.functions.find((f) => f.name === "icon")!;
      expect(icon.fqn).toBe("icon");
      expect(icon.params[0]!.name).toBe("name");
      expect(icon.params[1]!.name).toBe("size");
      expect(icon.params[1]!.default).toBe("16");
    });
  });

  // -----------------------------------------------------------------------
  // 5. PromotedProps
  // -----------------------------------------------------------------------
  describe("PromotedProps", () => {
    it("parses readonly class with promoted properties", () => {
      const meta = parsePhpSource(fixture("PromotedProps.php"), "PromotedProps.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ProductCard");
      expect(cls.isReadonly).toBe(true);

      expect(cls.constructorParams).toHaveLength(4);

      const nameParam = cls.constructorParams[0]!;
      expect(nameParam.name).toBe("name");
      expect(nameParam.isPromoted).toBe(true);
      expect(nameParam.visibility).toBe("public");
      expect(nameParam.type).toBe("string");
      expect(nameParam.required).toBe(true);

      const priceParam = cls.constructorParams[1]!;
      expect(priceParam.name).toBe("price");
      expect(priceParam.isPromoted).toBe(true);
      expect(priceParam.visibility).toBe("public");
      expect(priceParam.type).toBe("float");

      const currencyParam = cls.constructorParams[2]!;
      expect(currencyParam.name).toBe("currency");
      expect(currencyParam.default).toBe("'__PLACEHOLDER__'");
      expect(currencyParam.visibility).toBe("public");

      const decimalsParam = cls.constructorParams[3]!;
      expect(decimalsParam.name).toBe("decimals");
      expect(decimalsParam.visibility).toBe("private");
      expect(decimalsParam.default).toBe("2");
    });
  });

  // -----------------------------------------------------------------------
  // 6. EnumComponent
  // -----------------------------------------------------------------------
  describe("EnumComponent", () => {
    it("parses backed enum with string type, cases, and methods", () => {
      const meta = parsePhpSource(fixture("EnumComponent.php"), "EnumComponent.php");

      expect(meta.classes).toHaveLength(2);

      const color = meta.classes.find((c) => c.name === "Color")!;
      expect(color.isEnum).toBe(true);
      expect(color.enumBackingType).toBe("string");
      expect(color.enumCases).toEqual(["Red", "Blue", "Green"]);
      expect(color.fqn).toBe("App\\Components\\Color");

      // Enum methods
      expect(color.methods).toHaveLength(2);
      expect(color.methods[0]!.name).toBe("badge");
      expect(color.methods[1]!.name).toBe("label");
      expect(color.methods[1]!.params).toHaveLength(1);
      expect(color.methods[1]!.params[0]!.name).toBe("prefix");

      // Unit enum
      const size = meta.classes.find((c) => c.name === "Size")!;
      expect(size.isEnum).toBe(true);
      expect(size.enumBackingType).toBeNull();
      expect(size.enumCases).toEqual(["Small", "Medium", "Large"]);
    });
  });

  // -----------------------------------------------------------------------
  // 7. TemplateFile
  // -----------------------------------------------------------------------
  describe("TemplateFile", () => {
    it("returns empty result for file with no classes or functions", () => {
      const meta = parsePhpSource(fixture("TemplateFile.php"), "TemplateFile.php");

      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(0);
      expect(meta.namespace).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // 8. MultipleClasses
  // -----------------------------------------------------------------------
  describe("MultipleClasses", () => {
    it("parses two classes in one file", () => {
      const meta = parsePhpSource(fixture("MultipleClasses.php"), "MultipleClasses.php");

      expect(meta.classes).toHaveLength(2);

      const header = meta.classes.find((c) => c.name === "Header")!;
      expect(header.constructorParams).toHaveLength(1);
      expect(header.constructorParams[0]!.name).toBe("title");
      expect(header.methods).toHaveLength(1);
      expect(header.methods[0]!.name).toBe("render");

      const footer = meta.classes.find((c) => c.name === "Footer")!;
      expect(footer.constructorParams).toHaveLength(1);
      expect(footer.constructorParams[0]!.name).toBe("copyright");
      expect(footer.methods).toHaveLength(1);
    });
  });

  // -----------------------------------------------------------------------
  // 9. NoNamespace
  // -----------------------------------------------------------------------
  describe("NoNamespace", () => {
    it("class without namespace has fqn equal to class name", () => {
      const meta = parsePhpSource(fixture("NoNamespace.php"), "NoNamespace.php");

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("SimpleWidget");
      expect(cls.fqn).toBe("SimpleWidget");
    });
  });

  // -----------------------------------------------------------------------
  // 10. EchoComponent
  // -----------------------------------------------------------------------
  describe("EchoComponent", () => {
    it("parses void return type", () => {
      const meta = parsePhpSource(fixture("EchoComponent.php"), "EchoComponent.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Layout");

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.returnType).toBe("void");
    });
  });

  // -----------------------------------------------------------------------
  // 11. InvocableClass
  // -----------------------------------------------------------------------
  describe("InvocableClass", () => {
    it("detects __invoke method", () => {
      const meta = parsePhpSource(fixture("InvocableClass.php"), "InvocableClass.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Greeting");
      expect(cls.constructorParams).toHaveLength(1);
      expect(cls.constructorParams[0]!.name).toBe("locale");
      expect(cls.constructorParams[0]!.default).toBe("'__PLACEHOLDER__'");

      const invoke = cls.methods.find((m) => m.name === "__invoke")!;
      expect(invoke).toBeDefined();
      expect(invoke.returnType).toBe("string");
      expect(invoke.params).toHaveLength(1);
      expect(invoke.params[0]!.name).toBe("name");
    });
  });

  // -----------------------------------------------------------------------
  // 12. NamespacedFunctions
  // -----------------------------------------------------------------------
  describe("NamespacedFunctions", () => {
    it("parses namespaced standalone functions with correct fqn", () => {
      const meta = parsePhpSource(fixture("NamespacedFunctions.php"), "NamespacedFunctions.php");

      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(2);

      const pill = meta.functions.find((f) => f.name === "pill")!;
      expect(pill.fqn).toBe("App\\Helpers\\pill");
      expect(pill.params).toHaveLength(2);
      expect(pill.params[0]!.name).toBe("text");
      expect(pill.params[1]!.name).toBe("outline");
      expect(pill.params[1]!.default).toBe("false");

      const tag = meta.functions.find((f) => f.name === "tag")!;
      expect(tag.fqn).toBe("App\\Helpers\\tag");
    });
  });

  // -----------------------------------------------------------------------
  // 13. InheritedMethods
  // -----------------------------------------------------------------------
  describe("InheritedMethods", () => {
    it("parses base class, extending class, and abstract class", () => {
      const meta = parsePhpSource(fixture("InheritedMethods.php"), "InheritedMethods.php");

      expect(meta.classes).toHaveLength(3);

      const base = meta.classes.find((c) => c.name === "BaseComponent")!;
      expect(base.isAbstract).toBe(false);
      expect(base.methods).toHaveLength(2);
      expect(base.methods[0]!.name).toBe("render");
      expect(base.methods[0]!.visibility).toBe("public");
      expect(base.methods[1]!.name).toBe("helper");
      expect(base.methods[1]!.visibility).toBe("protected");

      const card = meta.classes.find((c) => c.name === "Card")!;
      expect(card.extends).toBe("BaseComponent");
      expect(card.constructorParams).toHaveLength(1);

      const abstractWidget = meta.classes.find((c) => c.name === "AbstractWidget")!;
      expect(abstractWidget.isAbstract).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 14. ObjectParams
  // -----------------------------------------------------------------------
  describe("ObjectParams", () => {
    it("parses class-typed params, enum-typed params, and new ClassName() defaults", () => {
      const meta = parsePhpSource(fixture("ObjectParams.php"), "ObjectParams.php");

      const productDisplay = meta.classes.find((c) => c.name === "ProductDisplay")!;
      expect(productDisplay.isReadonly).toBe(true);
      expect(productDisplay.constructorParams).toHaveLength(4);

      const name = productDisplay.constructorParams[0]!;
      expect(name.name).toBe("name");
      expect(name.type).toBe("string");

      const price = productDisplay.constructorParams[1]!;
      expect(price.name).toBe("price");
      expect(price.type).toBe("float");

      const config = productDisplay.constructorParams[2]!;
      expect(config.name).toBe("config");
      expect(config.type).toBe("ProductConfig");
      expect(config.default).toBe("new ProductConfig()");

      const status = productDisplay.constructorParams[3]!;
      expect(status.name).toBe("status");
      expect(status.type).toBe("ProductStatus");
      expect(status.default).toBe("ProductStatus::Draft");

      // Also check the enum and config class
      const productStatus = meta.classes.find((c) => c.name === "ProductStatus")!;
      expect(productStatus.isEnum).toBe(true);
      expect(productStatus.enumBackingType).toBe("string");

      const productConfig = meta.classes.find((c) => c.name === "ProductConfig")!;
      expect(productConfig.isReadonly).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 15. Comment stripping
  // -----------------------------------------------------------------------
  describe("Comment stripping", () => {
    it("inline comments do not break parsing", () => {
      const source = `<?php
namespace App\\Test;

class MyClass {
    // This is a comment
    public function __construct(
        private string $name, // the name
        private int $count = 10 /* default count */
    ) {}

    /* A multi-line
       comment */
    public function render(): string {
        return "hello";
    }
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.constructorParams).toHaveLength(2);
      expect(meta.classes[0]!.constructorParams[0]!.name).toBe("name");
      expect(meta.classes[0]!.constructorParams[1]!.name).toBe("count");
      expect(meta.classes[0]!.methods).toHaveLength(1);
    });

    it("hash comments (not attributes) are stripped", () => {
      const source = `<?php
# This is a hash comment
class Foo {
    public function bar(): void {}
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe("Foo");
    });
  });

  // -----------------------------------------------------------------------
  // 16. String literal handling
  // -----------------------------------------------------------------------
  describe("String literal handling", () => {
    it("PHP strings containing class/function keywords do not cause false matches", () => {
      const source = `<?php
namespace App\\Test;

class RealClass {
    public function __construct(private string $label) {}

    public function render(): string {
        $x = "class FakeClass { function fakeMethod() {} }";
        $y = 'function another() {}';
        return $x . $y;
    }
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe("RealClass");
      expect(meta.functions).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // 17. Union types
  // -----------------------------------------------------------------------
  describe("Union types", () => {
    it("parses string|int union type correctly", () => {
      const source = `<?php
class UnionTest {
    public function __construct(
        private string|int $id,
        private string|null $label = null,
    ) {}
}
`;
      const meta = parsePhpSource(source, "test.php");
      const params = meta.classes[0]!.constructorParams;

      expect(params[0]!.name).toBe("id");
      expect(params[0]!.type).toBe("string|int");
      expect(params[0]!.required).toBe(true);

      expect(params[1]!.name).toBe("label");
      expect(params[1]!.type).toBe("string|null");
      expect(params[1]!.nullable).toBe(true);
      expect(params[1]!.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 18. Nullable types
  // -----------------------------------------------------------------------
  describe("Nullable types", () => {
    it("parses ?string as nullable", () => {
      const source = `<?php
class NullableTest {
    public function __construct(
        private ?string $name,
        private ?int $age = null,
    ) {}
}
`;
      const meta = parsePhpSource(source, "test.php");
      const params = meta.classes[0]!.constructorParams;

      expect(params[0]!.name).toBe("name");
      expect(params[0]!.type).toBe("string");
      expect(params[0]!.nullable).toBe(true);
      // ?string with no default means it's not required since it's nullable
      expect(params[0]!.required).toBe(false);

      expect(params[1]!.name).toBe("age");
      expect(params[1]!.type).toBe("int");
      expect(params[1]!.nullable).toBe(true);
      expect(params[1]!.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 19. Variadic params
  // -----------------------------------------------------------------------
  describe("Variadic params", () => {
    it("parses ...$items with isVariadic=true", () => {
      const source = `<?php
function merge(string ...$items): string {
    return implode(', ', $items);
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.functions).toHaveLength(1);

      const param = meta.functions[0]!.params[0]!;
      expect(param.name).toBe("items");
      expect(param.type).toBe("string");
      expect(param.isVariadic).toBe(true);
      expect(param.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 20. Default values
  // -----------------------------------------------------------------------
  describe("Default values", () => {
    it("handles scalar, null, array, and class constant default patterns", () => {
      const source = `<?php
class Defaults {
    public function __construct(
        private string $a = 'hello',
        private int $b = 42,
        private float $c = 3.14,
        private bool $d = true,
        private ?string $e = null,
        private array $f = [1, 2, 3],
        private string $g = self::DEFAULT_VALUE,
    ) {}
}
`;
      const meta = parsePhpSource(source, "test.php");
      const params = meta.classes[0]!.constructorParams;

      expect(params).toHaveLength(7);
      expect(params[0]!.default).toBe("'__PLACEHOLDER__'");
      expect(params[1]!.default).toBe("42");
      expect(params[2]!.default).toBe("3.14");
      expect(params[3]!.default).toBe("true");
      expect(params[4]!.default).toBe("null");
      expect(params[5]!.default).toBe("[1, 2, 3]");
      expect(params[6]!.default).toBe("self::DEFAULT_VALUE");
    });
  });

  // -----------------------------------------------------------------------
  // Additional edge cases
  // -----------------------------------------------------------------------
  describe("PHP 8 attributes", () => {
    it("strips attributes without affecting parsing", () => {
      const source = `<?php
namespace App\\Test;

#[Route('/api')]
class Controller {
    #[Inject]
    public function __construct(
        #[FromQuery] private string $query,
    ) {}

    #[Get('/list')]
    public function list(): array {
        return [];
    }
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe("Controller");
      expect(meta.classes[0]!.constructorParams).toHaveLength(1);
      expect(meta.classes[0]!.constructorParams[0]!.name).toBe("query");
      expect(meta.classes[0]!.methods).toHaveLength(1);
      expect(meta.classes[0]!.methods[0]!.name).toBe("list");
    });
  });

  describe("Intersection types", () => {
    it("parses A&B intersection type", () => {
      const source = `<?php
class IntersectionTest {
    public function handle(Countable&Iterator $collection): void {}
}
`;
      const meta = parsePhpSource(source, "test.php");
      const method = meta.classes[0]!.methods[0]!;
      expect(method.params[0]!.type).toBe("Countable&Iterator");
      expect(method.params[0]!.name).toBe("collection");
    });
  });

  describe("Trait and interface detection", () => {
    it("detects traits and interfaces", () => {
      const source = `<?php
namespace App\\Contracts;

interface Renderable {
    public function render(): string;
}

trait HasSlug {
    public function slug(): string {
        return "slug";
    }
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(2);

      const renderable = meta.classes.find((c) => c.name === "Renderable")!;
      expect(renderable).toBeDefined();
      expect(renderable.methods).toHaveLength(1);
      expect(renderable.isInterface).toBe(true);
      expect(renderable.isTrait).toBe(false);

      const hasSlug = meta.classes.find((c) => c.name === "HasSlug")!;
      expect(hasSlug).toBeDefined();
      expect(hasSlug.methods).toHaveLength(1);
      expect(hasSlug.methods[0]!.name).toBe("slug");
      expect(hasSlug.isTrait).toBe(true);
      expect(hasSlug.isInterface).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Trait usage
  // -----------------------------------------------------------------------
  describe("Trait usage", () => {
    it("parses use TraitName in class body", () => {
      const meta = parsePhpSource(fixture("TraitUsage.php"), "TraitUsage.php");

      const accordion = meta.classes.find((c) => c.name === "Accordion")!;
      expect(accordion).toBeDefined();
      expect(accordion.traits).toEqual(["HasToggle"]);
      expect(accordion.constructorParams).toHaveLength(1);
      expect(accordion.constructorParams[0]!.name).toBe("label");

      const richWidget = meta.classes.find((c) => c.name === "RichWidget")!;
      expect(richWidget).toBeDefined();
      expect(richWidget.traits).toEqual(["HasToggle", "HasTooltip"]);
    });

    it("traits have their methods parsed", () => {
      const meta = parsePhpSource(fixture("TraitUsage.php"), "TraitUsage.php");

      const hasToggle = meta.classes.find((c) => c.name === "HasToggle")!;
      expect(hasToggle).toBeDefined();
      expect(hasToggle.methods).toHaveLength(1);
      expect(hasToggle.methods[0]!.name).toBe("toggle");
      expect(hasToggle.methods[0]!.params).toHaveLength(2);
      expect(hasToggle.methods[0]!.params[0]!.name).toBe("content");
      expect(hasToggle.methods[0]!.params[1]!.name).toBe("open");
    });

    it("classes using traits have empty traits when none declared", () => {
      const meta = parsePhpSource(
        '<?php class Simple { public function render(): string { return ""; } }',
        "test.php",
      );
      expect(meta.classes[0]!.traits).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // Enum implementing interface
  // -----------------------------------------------------------------------
  describe("Enum implementing interface", () => {
    it("parses enum with implements", () => {
      const source = `<?php
namespace App\\Components;

interface Renderable {
    public function render(): string;
}

enum Direction: string implements Renderable {
    case Up = 'up';
    case Down = 'down';

    public function render(): string {
        return "<span>{$this->name}</span>";
    }
}
`;
      const meta = parsePhpSource(source, "test.php");
      const dir = meta.classes.find((c) => c.name === "Direction")!;
      expect(dir.isEnum).toBe(true);
      expect(dir.enumBackingType).toBe("string");
      expect(dir.implements).toContain("Renderable");
      expect(dir.enumCases).toEqual(["Up", "Down"]);
      expect(dir.methods).toHaveLength(1);
      expect(dir.methods[0]!.name).toBe("render");
    });
  });

  // -----------------------------------------------------------------------
  // Multiple classes in one file
  // -----------------------------------------------------------------------
  describe("Multiple classes with different constructors", () => {
    it("parses two classes from same file independently", () => {
      const source = `<?php
namespace App\\Components;

class SectionHeader {
    public function __construct(private string $title, private string $level = 'h1') {}
    public function render(): string { return "<h1>{$this->title}</h1>"; }
}

class SectionFooter {
    public function __construct(private string $copyright, private int $year = 2025) {}
    public function render(): string { return "<footer>&copy; {$this->year} {$this->copyright}</footer>"; }
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(2);

      const header = meta.classes.find((c) => c.name === "SectionHeader")!;
      expect(header.constructorParams).toHaveLength(2);
      expect(header.constructorParams[0]!.name).toBe("title");
      expect(header.constructorParams[1]!.name).toBe("level");

      const footer = meta.classes.find((c) => c.name === "SectionFooter")!;
      expect(footer.constructorParams).toHaveLength(2);
      expect(footer.constructorParams[0]!.name).toBe("copyright");
      expect(footer.constructorParams[1]!.name).toBe("year");
    });
  });

  // -----------------------------------------------------------------------
  // __toString / Stringable return type
  // -----------------------------------------------------------------------
  describe("Stringable class", () => {
    it("parses class implementing Stringable", () => {
      const source = `<?php
namespace App\\Components;

class HtmlFragment implements \\Stringable {
    public function __construct(private string $html) {}
    public function __toString(): string { return $this->html; }
}

class Tooltip {
    public function __construct(private string $text) {}
    public function render(string $position = 'top'): HtmlFragment {
        return new HtmlFragment("<span>{$this->text}</span>");
    }
}
`;
      const meta = parsePhpSource(source, "test.php");
      expect(meta.classes).toHaveLength(2);

      const tooltip = meta.classes.find((c) => c.name === "Tooltip")!;
      expect(tooltip.methods).toHaveLength(1);
      expect(tooltip.methods[0]!.name).toBe("render");
      expect(tooltip.methods[0]!.returnType).toBe("HtmlFragment");
      expect(tooltip.methods[0]!.params).toHaveLength(1);
      expect(tooltip.methods[0]!.params[0]!.name).toBe("position");
      expect(tooltip.methods[0]!.params[0]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  describe("filePath is passed through", () => {
    it("returns the filePath in the result", () => {
      const meta = parsePhpSource("<?php class A {}", "/path/to/file.php");
      expect(meta.filePath).toBe("/path/to/file.php");
    });
  });

  // -----------------------------------------------------------------------
  // Final class
  // -----------------------------------------------------------------------
  describe("FinalClass", () => {
    it("parses final class with isFinal=true", () => {
      const meta = parsePhpSource(fixture("FinalClass.php"), "FinalClass.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Avatar");
      expect(cls.isFinal).toBe(true);
      expect(cls.isAbstract).toBe(false);
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[0]!.name).toBe("name");
      expect(cls.constructorParams[0]!.type).toBe("string");
      expect(cls.constructorParams[1]!.name).toBe("size");
      expect(cls.constructorParams[1]!.type).toBe("int");
      expect(cls.constructorParams[1]!.default).toBe("48");
      expect(cls.constructorParams[2]!.name).toBe("imageUrl");
      expect(cls.constructorParams[2]!.nullable).toBe(true);
      expect(cls.constructorParams[2]!.default).toBe("null");
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
    });
  });

  // -----------------------------------------------------------------------
  // Abstract class with concrete subclasses
  // -----------------------------------------------------------------------
  describe("AbstractClass", () => {
    it("parses abstract class and concrete subclasses", () => {
      const meta = parsePhpSource(fixture("AbstractClass.php"), "AbstractClass.php");

      expect(meta.classes).toHaveLength(3);

      const base = meta.classes.find((c) => c.name === "BaseChip")!;
      expect(base.isAbstract).toBe(true);
      expect(base.constructorParams).toHaveLength(2);
      expect(base.constructorParams[0]!.name).toBe("label");
      expect(base.constructorParams[0]!.visibility).toBe("protected");
      expect(base.constructorParams[1]!.name).toBe("removable");
      expect(base.constructorParams[1]!.type).toBe("bool");
      expect(base.constructorParams[1]!.default).toBe("false");
      // abstract method + concrete method
      expect(base.methods).toHaveLength(2);
      const abstractMethod = base.methods.find((m) => m.name === "cssClass")!;
      expect(abstractMethod).toBeDefined();
      const renderMethod = base.methods.find((m) => m.name === "render")!;
      expect(renderMethod).toBeDefined();

      const info = meta.classes.find((c) => c.name === "InfoChip")!;
      expect(info.extends).toBe("BaseChip");
      expect(info.isAbstract).toBe(false);

      const success = meta.classes.find((c) => c.name === "SuccessChip")!;
      expect(success.extends).toBe("BaseChip");
    });
  });

  // -----------------------------------------------------------------------
  // Int-backed enum
  // -----------------------------------------------------------------------
  describe("IntBackedEnum", () => {
    it("parses int-backed enum with cases and methods", () => {
      const meta = parsePhpSource(fixture("IntBackedEnum.php"), "IntBackedEnum.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Priority");
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("int");
      expect(cls.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);
      expect(cls.methods).toHaveLength(2);
      expect(cls.methods[0]!.name).toBe("badge");
      expect(cls.methods[0]!.returnType).toBe("string");
      expect(cls.methods[1]!.name).toBe("icon");
    });
  });

  // -----------------------------------------------------------------------
  // Interface with implementing class
  // -----------------------------------------------------------------------
  describe("InterfaceImpl", () => {
    it("parses interface and implementing class", () => {
      const meta = parsePhpSource(fixture("InterfaceImpl.php"), "InterfaceImpl.php");

      expect(meta.classes).toHaveLength(2);

      const iface = meta.classes.find((c) => c.name === "StepRenderer")!;
      expect(iface).toBeDefined();
      expect(iface.methods).toHaveLength(1);
      expect(iface.methods[0]!.name).toBe("renderStep");
      expect(iface.methods[0]!.params).toHaveLength(3);

      const stepper = meta.classes.find((c) => c.name === "Stepper")!;
      expect(stepper.implements).toContain("StepRenderer");
      expect(stepper.constructorParams).toHaveLength(2);
      expect(stepper.constructorParams[0]!.name).toBe("current");
      expect(stepper.constructorParams[0]!.type).toBe("int");
      expect(stepper.constructorParams[1]!.name).toBe("steps");
      expect(stepper.constructorParams[1]!.type).toBe("array");
      expect(stepper.methods).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // Static factory methods
  // -----------------------------------------------------------------------
  describe("StaticFactory", () => {
    it("parses class with both static and instance methods", () => {
      const meta = parsePhpSource(fixture("StaticFactory.php"), "StaticFactory.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Button");
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[0]!.name).toBe("label");
      expect(cls.constructorParams[1]!.name).toBe("variant");
      expect(cls.constructorParams[2]!.name).toBe("disabled");

      expect(cls.methods).toHaveLength(3);

      const primary = cls.methods.find((m) => m.name === "primary")!;
      expect(primary.isStatic).toBe(true);
      expect(primary.params).toHaveLength(2);
      expect(primary.params[0]!.name).toBe("label");
      expect(primary.params[1]!.name).toBe("disabled");
      expect(primary.params[1]!.default).toBe("false");

      const secondary = cls.methods.find((m) => m.name === "secondary")!;
      expect(secondary.isStatic).toBe(true);

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Multi-trait usage
  // -----------------------------------------------------------------------
  describe("MultiTrait", () => {
    it("parses class using multiple traits", () => {
      const meta = parsePhpSource(fixture("MultiTrait.php"), "MultiTrait.php");

      // Two traits + one class
      expect(meta.classes).toHaveLength(3);

      const modal = meta.classes.find((c) => c.name === "Modal")!;
      expect(modal).toBeDefined();
      expect(modal.traits).toEqual(["HasAnimation", "HasOverlay"]);
      expect(modal.constructorParams).toHaveLength(3);
      expect(modal.constructorParams[0]!.name).toBe("title");
      expect(modal.constructorParams[1]!.name).toBe("body");
      expect(modal.constructorParams[1]!.nullable).toBe(true);
      expect(modal.constructorParams[2]!.name).toBe("size");
      expect(modal.constructorParams[2]!.default).toBe("'__PLACEHOLDER__'");

      const anim = meta.classes.find((c) => c.name === "HasAnimation")!;
      expect(anim).toBeDefined();
      expect(anim.methods).toHaveLength(1);
      expect(anim.methods[0]!.name).toBe("animate");
      expect(anim.methods[0]!.params).toHaveLength(3);
      expect(anim.methods[0]!.params[0]!.name).toBe("content");
      expect(anim.methods[0]!.params[1]!.name).toBe("effect");
      expect(anim.methods[0]!.params[2]!.name).toBe("duration");

      const overlay = meta.classes.find((c) => c.name === "HasOverlay")!;
      expect(overlay).toBeDefined();
      expect(overlay.methods).toHaveLength(1);
      expect(overlay.methods[0]!.name).toBe("overlay");
      expect(overlay.methods[0]!.params).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // Class constants as defaults
  // -----------------------------------------------------------------------
  describe("ClassConstants", () => {
    it("parses class with self::CONSTANT defaults", () => {
      const meta = parsePhpSource(fixture("ClassConstants.php"), "ClassConstants.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Notification");
      expect(cls.constructorParams).toHaveLength(4);

      const message = cls.constructorParams[0]!;
      expect(message.name).toBe("message");
      expect(message.type).toBe("string");
      expect(message.required).toBe(true);

      const type = cls.constructorParams[1]!;
      expect(type.name).toBe("type");
      expect(type.type).toBe("string");
      expect(type.default).toBe("self::TYPE_INFO");

      const metadata = cls.constructorParams[2]!;
      expect(metadata.name).toBe("metadata");
      expect(metadata.type).toBe("mixed");
      expect(metadata.default).toBe("null");

      const timeout = cls.constructorParams[3]!;
      expect(timeout.name).toBe("timeout");
      expect(timeout.type).toBe("int");
      expect(timeout.default).toBe("5000");
    });
  });

  // -----------------------------------------------------------------------
  // Readonly without visibility keyword
  // -----------------------------------------------------------------------
  describe("ReadonlyNoVisibility", () => {
    it("parses readonly without explicit visibility as promoted", () => {
      const meta = parsePhpSource(fixture("ReadonlyNoVisibility.php"), "ReadonlyNoVisibility.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ValueObject");
      expect(cls.constructorParams).toHaveLength(3);

      const id = cls.constructorParams[0]!;
      expect(id.name).toBe("id");
      expect(id.type).toBe("string");
      expect(id.isPromoted).toBe(true);
      expect(id.required).toBe(true);
      // No explicit visibility
      expect(id.visibility).toBeUndefined();

      const value = cls.constructorParams[1]!;
      expect(value.name).toBe("value");
      expect(value.type).toBe("int");
      expect(value.isPromoted).toBe(true);

      const secret = cls.constructorParams[2]!;
      expect(secret.name).toBe("secret");
      expect(secret.type).toBe("string");
      expect(secret.isPromoted).toBe(true);
      expect(secret.visibility).toBe("private");
      expect(secret.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // Mixed, iterable, callable types
  // -----------------------------------------------------------------------
  describe("MixedTypes", () => {
    it("parses mixed, iterable, and callable type params", () => {
      const meta = parsePhpSource(fixture("MixedTypes.php"), "MixedTypes.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("DataRenderer");
      expect(cls.constructorParams).toHaveLength(3);

      const data = cls.constructorParams[0]!;
      expect(data.name).toBe("data");
      expect(data.type).toBe("mixed");
      expect(data.required).toBe(true);

      const items = cls.constructorParams[1]!;
      expect(items.name).toBe("items");
      expect(items.type).toBe("iterable");
      expect(items.default).toBe("[]");

      const formatter = cls.constructorParams[2]!;
      expect(formatter.name).toBe("formatter");
      expect(formatter.type).toBe("callable");
      expect(formatter.nullable).toBe(true);
      expect(formatter.default).toBe("null");

      // Also check static method
      expect(cls.methods).toHaveLength(2);
      const fromArray = cls.methods.find((m) => m.name === "fromArray")!;
      expect(fromArray.isStatic).toBe(true);
      expect(fromArray.params).toHaveLength(2);
      expect(fromArray.params[0]!.type).toBe("array");
      expect(fromArray.params[1]!.name).toBe("format");
      expect(fromArray.params[1]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // Static + instance method combo
  // -----------------------------------------------------------------------
  describe("StaticAndInstance", () => {
    it("parses class with both static and instance methods", () => {
      const meta = parsePhpSource(fixture("StaticAndInstance.php"), "StaticAndInstance.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Pagination");
      expect(cls.constructorParams).toHaveLength(3);

      expect(cls.constructorParams[0]!.name).toBe("total");
      expect(cls.constructorParams[0]!.type).toBe("int");
      expect(cls.constructorParams[0]!.required).toBe(true);

      expect(cls.constructorParams[1]!.name).toBe("perPage");
      expect(cls.constructorParams[1]!.default).toBe("10");

      expect(cls.constructorParams[2]!.name).toBe("current");
      expect(cls.constructorParams[2]!.default).toBe("1");

      expect(cls.methods).toHaveLength(2);

      const simple = cls.methods.find((m) => m.name === "simple")!;
      expect(simple.isStatic).toBe(true);
      expect(simple.params).toHaveLength(2);
      expect(simple.params[0]!.name).toBe("total");
      expect(simple.params[1]!.name).toBe("current");
      expect(simple.params[1]!.default).toBe("1");

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);
      expect(render.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // UnionTypeParams
  // -----------------------------------------------------------------------
  describe("UnionTypeParams", () => {
    it("parses int|float union type constructor params", () => {
      const meta = parsePhpSource(fixture("UnionTypeParams.php"), "UnionTypeParams.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Meter");
      expect(cls.constructorParams).toHaveLength(4);

      const value = cls.constructorParams[0]!;
      expect(value.name).toBe("value");
      expect(value.type).toBe("int|float");
      expect(value.required).toBe(true);

      const min = cls.constructorParams[1]!;
      expect(min.name).toBe("min");
      expect(min.type).toBe("int|float");
      expect(min.required).toBe(false);
      expect(min.default).toBe("0");

      const max = cls.constructorParams[2]!;
      expect(max.name).toBe("max");
      expect(max.type).toBe("int|float");
      expect(max.default).toBe("100");

      const render = cls.methods[0]!;
      expect(render.name).toBe("render");
      expect(render.params[0]!.name).toBe("color");
      expect(render.params[0]!.nullable).toBe(true);
      expect(render.params[0]!.type).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // MultipleInterfaces
  // -----------------------------------------------------------------------
  describe("MultipleInterfaces", () => {
    it("parses class implementing multiple interfaces", () => {
      const meta = parsePhpSource(fixture("MultipleInterfaces.php"), "MultipleInterfaces.php");

      // Interfaces + class
      const dropdown = meta.classes.find((c) => c.name === "Dropdown");
      expect(dropdown).toBeDefined();
      expect(dropdown!.implements).toContain("Togglable");
      expect(dropdown!.implements).toContain("Searchable");
      expect(dropdown!.implements).toHaveLength(2);

      expect(dropdown!.constructorParams).toHaveLength(3);
      expect(dropdown!.constructorParams[0]!.name).toBe("label");
      expect(dropdown!.constructorParams[2]!.name).toBe("placeholder");
      expect(dropdown!.constructorParams[2]!.nullable).toBe(true);

      expect(dropdown!.methods).toHaveLength(2);
      const methodNames = dropdown!.methods.map((m) => m.name).sort();
      expect(methodNames).toEqual(["search", "toggle"]);
    });

    it("parses interface declarations", () => {
      const meta = parsePhpSource(fixture("MultipleInterfaces.php"), "MultipleInterfaces.php");

      const togglable = meta.classes.find((c) => c.name === "Togglable");
      expect(togglable).toBeDefined();

      const searchable = meta.classes.find((c) => c.name === "Searchable");
      expect(searchable).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // GlobalFunctions (no namespace)
  // -----------------------------------------------------------------------
  describe("GlobalFunctions", () => {
    it("parses multiple functions without namespace", () => {
      const meta = parsePhpSource(fixture("GlobalFunctions.php"), "GlobalFunctions.php");

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(3);

      const truncate = meta.functions.find((f) => f.name === "truncate")!;
      expect(truncate.fqn).toBe("truncate");
      expect(truncate.params).toHaveLength(3);
      expect(truncate.params[0]!.type).toBe("string");
      expect(truncate.params[0]!.required).toBe(true);
      expect(truncate.params[1]!.type).toBe("int");
      expect(truncate.params[1]!.default).toBe("50");
      expect(truncate.params[2]!.type).toBe("string");
      expect(truncate.returnType).toBe("string");

      const highlight = meta.functions.find((f) => f.name === "highlight")!;
      expect(highlight.fqn).toBe("highlight");
      expect(highlight.params).toHaveLength(3);
      expect(highlight.params[1]!.name).toBe("term");
      expect(highlight.params[1]!.required).toBe(true);

      const slugify = meta.functions.find((f) => f.name === "slugify")!;
      expect(slugify.fqn).toBe("slugify");
      expect(slugify.params).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // VariadicConstructor
  // -----------------------------------------------------------------------
  describe("VariadicConstructor", () => {
    it("parses class with variadic constructor param", () => {
      const meta = parsePhpSource(fixture("VariadicConstructor.php"), "VariadicConstructor.php");

      const carousel = meta.classes.find((c) => c.name === "Carousel")!;
      expect(carousel).toBeDefined();
      expect(carousel.constructorParams).toHaveLength(3);

      const activeIndex = carousel.constructorParams[0]!;
      expect(activeIndex.name).toBe("activeIndex");
      expect(activeIndex.type).toBe("int");
      expect(activeIndex.isVariadic).toBe(false);

      const slides = carousel.constructorParams[2]!;
      expect(slides.name).toBe("slides");
      expect(slides.type).toBe("Slide");
      expect(slides.isVariadic).toBe(true);

      const render = carousel.methods.find((m) => m.name === "render")!;
      expect(render).toBeDefined();
      const items = render.params[0]!;
      expect(items.name).toBe("items");
      expect(items.type).toBe("string");
      expect(items.isVariadic).toBe(true);
    });

    it("parses Slide class with __toString", () => {
      const meta = parsePhpSource(fixture("VariadicConstructor.php"), "VariadicConstructor.php");

      const slide = meta.classes.find((c) => c.name === "Slide")!;
      expect(slide).toBeDefined();
      expect(slide.constructorParams).toHaveLength(2);
      expect(slide.constructorParams[0]!.name).toBe("content");
      expect(slide.constructorParams[0]!.isPromoted).toBe(true);
      expect(slide.methods.some((m) => m.name === "__toString")).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // EnumInterface
  // -----------------------------------------------------------------------
  describe("EnumInterface", () => {
    it("parses enum implementing interface", () => {
      const meta = parsePhpSource(fixture("EnumInterface.php"), "EnumInterface.php");

      // Should find the interface and the enum
      expect(meta.classes.length).toBeGreaterThanOrEqual(2);

      const iface = meta.classes.find((c) => c.name === "HasLabel")!;
      expect(iface).toBeDefined();

      const logLevel = meta.classes.find((c) => c.name === "LogLevel")!;
      expect(logLevel).toBeDefined();
      expect(logLevel.isEnum).toBe(true);
      expect(logLevel.enumBackingType).toBe("string");
      expect(logLevel.implements).toContain("HasLabel");
      expect(logLevel.enumCases).toEqual(["Debug", "Info", "Warning", "Error"]);
    });

    it("parses enum methods including interface method", () => {
      const meta = parsePhpSource(fixture("EnumInterface.php"), "EnumInterface.php");
      const logLevel = meta.classes.find((c) => c.name === "LogLevel")!;

      const label = logLevel.methods.find((m) => m.name === "label")!;
      expect(label).toBeDefined();
      expect(label.isStatic).toBe(false);
      expect(label.returnType).toBe("string");

      const badge = logLevel.methods.find((m) => m.name === "badge")!;
      expect(badge).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // MultiTraitClass
  // -----------------------------------------------------------------------
  describe("MultiTraitClass", () => {
    it("parses class using multiple traits", () => {
      const meta = parsePhpSource(fixture("MultiTraitClass.php"), "MultiTraitClass.php");

      const widget = meta.classes.find((c) => c.name === "Widget")!;
      expect(widget).toBeDefined();
      expect(widget.traits).toEqual(["HasIcon", "HasBadge"]);
    });

    it("parses methods from each trait", () => {
      const meta = parsePhpSource(fixture("MultiTraitClass.php"), "MultiTraitClass.php");

      const hasIcon = meta.classes.find((c) => c.name === "HasIcon")!;
      expect(hasIcon).toBeDefined();
      const iconMethod = hasIcon.methods.find((m) => m.name === "icon")!;
      expect(iconMethod).toBeDefined();
      expect(iconMethod.params).toHaveLength(2);
      expect(iconMethod.params[0]!.name).toBe("name");
      expect(iconMethod.params[1]!.name).toBe("size");
      expect(iconMethod.params[1]!.default).toBe("24");

      const hasBadge = meta.classes.find((c) => c.name === "HasBadge")!;
      expect(hasBadge).toBeDefined();
      const badgeMethod = hasBadge.methods.find((m) => m.name === "badge")!;
      expect(badgeMethod).toBeDefined();
      expect(badgeMethod.params).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // ArrayReturn
  // -----------------------------------------------------------------------
  describe("ArrayReturn", () => {
    it("parses class with array return type", () => {
      const meta = parsePhpSource(fixture("ArrayReturn.php"), "ArrayReturn.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StatsCard");

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render).toBeDefined();
      expect(render.returnType).toBe("array");
    });
  });

  // -----------------------------------------------------------------------
  // StringableReturn
  // -----------------------------------------------------------------------
  describe("StringableReturn", () => {
    it("parses HtmlFragment with __toString and FragmentBuilder", () => {
      const meta = parsePhpSource(fixture("StringableReturn.php"), "StringableReturn.php");

      const fragment = meta.classes.find((c) => c.name === "HtmlFragment")!;
      expect(fragment).toBeDefined();
      expect(fragment.methods.some((m) => m.name === "__toString")).toBe(true);
      expect(fragment.methods.some((m) => m.name === "append")).toBe(true);

      const builder = meta.classes.find((c) => c.name === "FragmentBuilder")!;
      expect(builder).toBeDefined();
      expect(builder.constructorParams).toHaveLength(2);
      expect(builder.constructorParams[0]!.name).toBe("heading");

      const render = builder.methods.find((m) => m.name === "render")!;
      expect(render).toBeDefined();
      expect(render.returnType).toBe("HtmlFragment");
    });
  });

  // -----------------------------------------------------------------------
  // MultiStaticMethods
  // -----------------------------------------------------------------------
  describe("MultiStaticMethods", () => {
    it("parses class with multiple static methods", () => {
      const meta = parsePhpSource(fixture("MultiStaticMethods.php"), "MultiStaticMethods.php");

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MarkupHelper");
      expect(cls.constructorParams).toHaveLength(0);

      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(staticMethods).toHaveLength(3);

      const button = cls.methods.find((m) => m.name === "button")!;
      expect(button.isStatic).toBe(true);
      expect(button.params).toHaveLength(2);
      expect(button.params[0]!.name).toBe("label");
      expect(button.params[1]!.name).toBe("variant");
      // String literals are replaced with __PLACEHOLDER__ during preprocessing
      expect(button.params[1]!.default).toBe("'__PLACEHOLDER__'");

      const link = cls.methods.find((m) => m.name === "link")!;
      expect(link.isStatic).toBe(true);
      expect(link.params).toHaveLength(3);

      const image = cls.methods.find((m) => m.name === "image")!;
      expect(image.isStatic).toBe(true);
      expect(image.params).toHaveLength(3);
    });
  });

  // -----------------------------------------------------------------------
  // ReadonlyClass
  // -----------------------------------------------------------------------
  describe("ReadonlyClass", () => {
    it("parses readonly class with public promoted params", () => {
      const meta = parsePhpSource(fixture("ReadonlyClass.php"), "ReadonlyClass.php");

      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Settings");
      expect(cls.isReadonly).toBe(true);
      expect(cls.isAbstract).toBe(false);
      expect(cls.isFinal).toBe(false);

      expect(cls.constructorParams).toHaveLength(3);

      const theme = cls.constructorParams[0]!;
      expect(theme.name).toBe("theme");
      expect(theme.type).toBe("string");
      expect(theme.isPromoted).toBe(true);
      expect(theme.visibility).toBe("public");
      expect(theme.required).toBe(false);

      const fontSize = cls.constructorParams[1]!;
      expect(fontSize.name).toBe("fontSize");
      expect(fontSize.type).toBe("int");

      const animations = cls.constructorParams[2]!;
      expect(animations.name).toBe("animations");
      expect(animations.type).toBe("bool");

      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
    });
  });

  // -----------------------------------------------------------------------
  // DefaultNewExpression
  // -----------------------------------------------------------------------
  describe("DefaultNewExpression", () => {
    it("parses classes with new expression as default value", () => {
      const meta = parsePhpSource(fixture("DefaultNewExpression.php"), "DefaultNewExpression.php");

      expect(meta.classes).toHaveLength(2);

      const options = meta.classes[0]!;
      expect(options.name).toBe("Options");

      const widget = meta.classes[1]!;
      expect(widget.name).toBe("Widget");
      expect(widget.constructorParams).toHaveLength(3);

      const title = widget.constructorParams[0]!;
      expect(title.name).toBe("title");
      expect(title.required).toBe(true);

      const optionsParam = widget.constructorParams[1]!;
      expect(optionsParam.name).toBe("options");
      expect(optionsParam.type).toBe("Options");
      expect(optionsParam.required).toBe(false);
      expect(optionsParam.default).toBe("new Options()");

      const subtitle = widget.constructorParams[2]!;
      expect(subtitle.name).toBe("subtitle");
      expect(subtitle.nullable).toBe(true);
      expect(subtitle.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // EnumWithInterface
  // -----------------------------------------------------------------------
  describe("EnumWithInterface", () => {
    it("parses enum implementing interface", () => {
      const meta = parsePhpSource(fixture("EnumWithInterface.php"), "EnumWithInterface.php");

      // Interface + Enum
      expect(meta.classes).toHaveLength(2);

      const iface = meta.classes[0]!;
      expect(iface.name).toBe("Renderable");

      const level = meta.classes[1]!;
      expect(level.name).toBe("Level");
      expect(level.isEnum).toBe(true);
      expect(level.enumBackingType).toBe("string");
      expect(level.enumCases).toEqual(["Low", "Medium", "High"]);
      expect(level.implements).toContain("Renderable");
      expect(level.methods).toHaveLength(1);
      expect(level.methods[0]!.name).toBe("render");
    });
  });

  // -----------------------------------------------------------------------
  // FinalReadonlyClass
  // -----------------------------------------------------------------------
  describe("FinalReadonlyClass", () => {
    it("parses final readonly class with static method", () => {
      const meta = parsePhpSource(fixture("FinalReadonlyClass.php"), "FinalReadonlyClass.php");

      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Coordinate");
      expect(cls.isFinal).toBe(true);
      expect(cls.isReadonly).toBe(true);
      expect(cls.isAbstract).toBe(false);

      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe("latitude");
      expect(cls.constructorParams[0]!.type).toBe("float");
      expect(cls.constructorParams[1]!.name).toBe("longitude");
      expect(cls.constructorParams[1]!.type).toBe("float");

      expect(cls.methods).toHaveLength(2);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);

      const origin = cls.methods.find((m) => m.name === "origin")!;
      expect(origin.isStatic).toBe(true);
      expect(origin.params).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // IntersectionType
  // -----------------------------------------------------------------------
  describe("IntersectionType", () => {
    it("parses intersection type parameter", () => {
      const meta = parsePhpSource(fixture("IntersectionType.php"), "IntersectionType.php");

      // Should have 3 class-like entries: Renderable (interface), Countable (interface), Collection (class)
      expect(meta.classes).toHaveLength(3);

      const collection = meta.classes.find((c) => c.name === "Collection")!;
      expect(collection).toBeDefined();
      expect(collection.constructorParams).toHaveLength(2);

      const sourceParam = collection.constructorParams[0]!;
      expect(sourceParam.name).toBe("source");
      expect(sourceParam.type).toBe("Renderable&Countable");
      expect(sourceParam.required).toBe(true);

      const titleParam = collection.constructorParams[1]!;
      expect(titleParam.name).toBe("title");
      expect(titleParam.type).toBe("string");
      expect(titleParam.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // DnfType (Disjunctive Normal Form)
  // -----------------------------------------------------------------------
  describe("DnfType", () => {
    it("parses DNF type parameter (A&B)|C", () => {
      const meta = parsePhpSource(fixture("DnfType.php"), "DnfType.php");

      const serializer = meta.classes.find((c) => c.name === "Serializer")!;
      expect(serializer).toBeDefined();
      expect(serializer.constructorParams).toHaveLength(2);

      const dataParam = serializer.constructorParams[0]!;
      expect(dataParam.name).toBe("data");
      // The DNF type should be captured as-is (parenthesized intersection | string)
      expect(dataParam.type).toContain("Stringable");
      expect(dataParam.type).toContain("Jsonable");
      expect(dataParam.type).toContain("string");
      expect(dataParam.required).toBe(true);

      const formatParam = serializer.constructorParams[1]!;
      expect(formatParam.name).toBe("format");
      expect(formatParam.type).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // MixedPromotion
  // -----------------------------------------------------------------------
  describe("MixedPromotion", () => {
    it("parses class with mixed promoted and non-promoted params", () => {
      const meta = parsePhpSource(fixture("MixedPromotion.php"), "MixedPromotion.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("FormField");
      expect(cls.constructorParams).toHaveLength(4);

      // label: public readonly string — promoted
      const label = cls.constructorParams[0]!;
      expect(label.name).toBe("label");
      expect(label.type).toBe("string");
      expect(label.isPromoted).toBe(true);
      expect(label.visibility).toBe("public");
      expect(label.required).toBe(true);

      // type: private string — promoted
      const type = cls.constructorParams[1]!;
      expect(type.name).toBe("type");
      expect(type.isPromoted).toBe(true);
      expect(type.visibility).toBe("private");
      expect(type.required).toBe(false);

      // id: ?string — NOT promoted (no visibility modifier)
      const id = cls.constructorParams[2]!;
      expect(id.name).toBe("id");
      expect(id.type).toBe("string");
      expect(id.nullable).toBe(true);
      expect(id.isPromoted).toBe(false);
      expect(id.required).toBe(false);

      // required: private bool — promoted
      const required = cls.constructorParams[3]!;
      expect(required.name).toBe("required");
      expect(required.isPromoted).toBe(true);
      expect(required.visibility).toBe("private");
    });
  });

  // -----------------------------------------------------------------------
  // NoConstructorMethods
  // -----------------------------------------------------------------------
  describe("NoConstructorMethods", () => {
    it("parses class with no constructor and multiple instance methods", () => {
      const meta = parsePhpSource(fixture("NoConstructorMethods.php"), "NoConstructorMethods.php");

      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Snippet");
      expect(cls.constructorParams).toHaveLength(0);
      expect(cls.methods).toHaveLength(2);

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);
      expect(render.params).toHaveLength(3);
      expect(render.params[0]!.name).toBe("code");
      expect(render.params[0]!.type).toBe("string");
      expect(render.params[0]!.required).toBe(true);
      expect(render.params[1]!.name).toBe("language");
      expect(render.params[1]!.default).toBe("'__PLACEHOLDER__'");
      expect(render.params[2]!.name).toBe("lineNumbers");
      expect(render.params[2]!.type).toBe("bool");

      const inline = cls.methods.find((m) => m.name === "inline")!;
      expect(inline.isStatic).toBe(false);
      expect(inline.params).toHaveLength(1);
      expect(inline.params[0]!.name).toBe("code");
    });
  });

  // -----------------------------------------------------------------------
  // EnumTypedParams
  // -----------------------------------------------------------------------
  describe("EnumTypedParams", () => {
    it("parses enum and class with enum-typed constructor params", () => {
      const meta = parsePhpSource(fixture("EnumTypedParams.php"), "EnumTypedParams.php");

      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(2);

      const enumCls = meta.classes.find((c) => c.name === "Phase")!;
      expect(enumCls.isEnum).toBe(true);
      expect(enumCls.enumBackingType).toBe("string");
      expect(enumCls.enumCases).toEqual(["Draft", "Review", "Published"]);

      const cls = meta.classes.find((c) => c.name === "EnumTransition")!;
      expect(cls.isEnum).toBe(false);
      expect(cls.constructorParams).toHaveLength(3);

      const from = cls.constructorParams[0]!;
      expect(from.name).toBe("from");
      expect(from.type).toBe("Phase");
      expect(from.required).toBe(true);

      const to = cls.constructorParams[1]!;
      expect(to.name).toBe("to");
      expect(to.type).toBe("Phase");
      expect(to.required).toBe(true);

      const label = cls.constructorParams[2]!;
      expect(label.name).toBe("label");
      expect(label.type).toBe("string");
      expect(label.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // NoNamespaceClass
  // -----------------------------------------------------------------------
  describe("NoNamespaceClass", () => {
    it("parses class without namespace", () => {
      const meta = parsePhpSource(fixture("NoNamespaceClass.php"), "NoNamespaceClass.php");

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("NoNamespaceButton");
      expect(cls.fqn).toBe("NoNamespaceButton");
      expect(cls.constructorParams).toHaveLength(3);

      expect(cls.constructorParams[0]!.name).toBe("label");
      expect(cls.constructorParams[0]!.type).toBe("string");
      expect(cls.constructorParams[0]!.required).toBe(true);

      expect(cls.constructorParams[1]!.name).toBe("variant");
      expect(cls.constructorParams[1]!.default).toBe("'__PLACEHOLDER__'");

      expect(cls.constructorParams[2]!.name).toBe("disabled");
      expect(cls.constructorParams[2]!.type).toBe("bool");
      expect(cls.constructorParams[2]!.default).toBe("false");

      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
    });
  });

  // -----------------------------------------------------------------------
  // ConstantDefaults
  // -----------------------------------------------------------------------
  describe("ConstantDefaults", () => {
    it("parses class with self:: constant defaults", () => {
      const meta = parsePhpSource(fixture("ConstantDefaults.php"), "ConstantDefaults.php");

      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ConstantDefaults");
      expect(cls.constructorParams).toHaveLength(3);

      const message = cls.constructorParams[0]!;
      expect(message.name).toBe("message");
      expect(message.required).toBe(true);

      const level = cls.constructorParams[1]!;
      expect(level.name).toBe("level");
      expect(level.type).toBe("string");
      expect(level.required).toBe(false);
      expect(level.default).toBe("self::LEVEL_INFO");

      const timeout = cls.constructorParams[2]!;
      expect(timeout.name).toBe("timeout");
      expect(timeout.type).toBe("int");
      expect(timeout.default).toBe("5000");
    });
  });

  // -----------------------------------------------------------------------
  // NullableParams
  // -----------------------------------------------------------------------
  describe("NullableParams", () => {
    it("parses various nullable parameter forms", () => {
      const meta = parsePhpSource(fixture("NullableParams.php"), "NullableParams.php");

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.constructorParams).toHaveLength(5);

      // message: required string
      expect(cls.constructorParams[0]!.name).toBe("message");
      expect(cls.constructorParams[0]!.nullable).toBe(false);
      expect(cls.constructorParams[0]!.required).toBe(true);

      // ?string $title = null
      const title = cls.constructorParams[1]!;
      expect(title.name).toBe("title");
      expect(title.nullable).toBe(true);
      expect(title.required).toBe(false);

      // ?string $icon = null
      const icon = cls.constructorParams[2]!;
      expect(icon.name).toBe("icon");
      expect(icon.nullable).toBe(true);

      // ?int $timeout = null
      const timeout = cls.constructorParams[3]!;
      expect(timeout.name).toBe("timeout");
      expect(timeout.type).toBe("int");
      expect(timeout.nullable).toBe(true);

      // string|null $footer = null
      const footer = cls.constructorParams[4]!;
      expect(footer.name).toBe("footer");
      expect(footer.nullable).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // MultiExportClasses
  // -----------------------------------------------------------------------
  describe("MultiExportClasses", () => {
    it("parses multiple independent classes from one file", () => {
      const meta = parsePhpSource(fixture("MultiExportClasses.php"), "MultiExportClasses.php");

      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(3);

      const header = meta.classes.find((c) => c.name === "PageHeader")!;
      expect(header.constructorParams).toHaveLength(2);
      expect(header.constructorParams[0]!.name).toBe("title");
      expect(header.methods).toHaveLength(1);
      expect(header.methods[0]!.name).toBe("render");

      const footer = meta.classes.find((c) => c.name === "PageFooter")!;
      expect(footer.constructorParams).toHaveLength(2);
      expect(footer.constructorParams[0]!.name).toBe("copyright");
      expect(footer.methods).toHaveLength(1);

      const sidebar = meta.classes.find((c) => c.name === "PageSidebar")!;
      expect(sidebar.constructorParams).toHaveLength(1);
      expect(sidebar.methods).toHaveLength(2);

      const render = sidebar.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);
      const collapsed = sidebar.methods.find((m) => m.name === "collapsed")!;
      expect(collapsed.isStatic).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // StringableReturn2
  // -----------------------------------------------------------------------
  describe("StringableReturn2", () => {
    it("parses multiple classes including one with __toString", () => {
      const meta = parsePhpSource(fixture("StringableReturn2.php"), "StringableReturn2.php");

      expect(meta.classes).toHaveLength(2);

      const htmlEl = meta.classes.find((c) => c.name === "HtmlElement")!;
      expect(htmlEl.constructorParams).toHaveLength(2);
      expect(htmlEl.methods).toHaveLength(1);
      expect(htmlEl.methods[0]!.name).toBe("__toString");

      const wrapper = meta.classes.find((c) => c.name === "StringableWrapper")!;
      expect(wrapper.constructorParams).toHaveLength(2);
      expect(wrapper.methods).toHaveLength(1);
      expect(wrapper.methods[0]!.name).toBe("render");
    });
  });

  // -----------------------------------------------------------------------
  // EnumWithTrait: traits on enums
  // -----------------------------------------------------------------------
  describe("EnumWithTrait", () => {
    it("extracts trait usage from enums (not just classes)", () => {
      const meta = parsePhpSource(fixture("EnumWithTrait.php"), "EnumWithTrait.php");

      // Traits should be parsed as class-like
      const hasBadge = meta.classes.find((c) => c.name === "HasBadge");
      expect(hasBadge).toBeDefined();
      expect(hasBadge!.methods).toHaveLength(1);

      const hasIcon = meta.classes.find((c) => c.name === "HasIcon");
      expect(hasIcon).toBeDefined();
      expect(hasIcon!.methods).toHaveLength(1);

      // Priority enum uses HasBadge
      const priority = meta.classes.find((c) => c.name === "Priority");
      expect(priority).toBeDefined();
      expect(priority!.isEnum).toBe(true);
      expect(priority!.traits).toContain("HasBadge");
      expect(priority!.traits).not.toContain("HasIcon");
      expect(priority!.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);

      // Severity enum uses both HasBadge and HasIcon
      const severity = meta.classes.find((c) => c.name === "Severity");
      expect(severity).toBeDefined();
      expect(severity!.isEnum).toBe(true);
      expect(severity!.traits).toContain("HasBadge");
      expect(severity!.traits).toContain("HasIcon");
      expect(severity!.enumCases).toEqual(["Info", "Warning", "Error"]);
    });
  });

  // -----------------------------------------------------------------------
  // PromotedReadonlyUnion: readonly + union type + promoted
  // -----------------------------------------------------------------------
  describe("PromotedReadonlyUnion", () => {
    it("parses readonly promoted parameters with union types", () => {
      const meta = parsePhpSource(
        fixture("PromotedReadonlyUnion.php"),
        "PromotedReadonlyUnion.php",
      );
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("PromotedReadonlyUnion");
      expect(cls.constructorParams).toHaveLength(3);

      const id = cls.constructorParams[0]!;
      expect(id.name).toBe("id");
      expect(id.type).toBe("string|int");
      expect(id.isPromoted).toBe(true);
      expect(id.visibility).toBe("public");
      expect(id.required).toBe(true);

      const label = cls.constructorParams[1]!;
      expect(label.name).toBe("label");
      expect(label.type).toBe("string");
      expect(label.isPromoted).toBe(true);

      const amount = cls.constructorParams[2]!;
      expect(amount.name).toBe("amount");
      expect(amount.type).toBe("int|float");
      expect(amount.isPromoted).toBe(true);
      expect(amount.visibility).toBe("private");
      expect(amount.required).toBe(false);
      expect(amount.default).toBe("0");
    });
  });

  // -----------------------------------------------------------------------
  // FunctionUnionReturn: union return types on functions
  // -----------------------------------------------------------------------
  describe("FunctionUnionReturn", () => {
    it("parses functions with union return types", () => {
      const meta = parsePhpSource(fixture("FunctionUnionReturn.php"), "FunctionUnionReturn.php");
      expect(meta.functions).toHaveLength(2);

      const formatValue = meta.functions.find((f) => f.name === "formatValue")!;
      expect(formatValue.returnType).toBe("string|int");
      expect(formatValue.params).toHaveLength(2);
      expect(formatValue.params[0]!.name).toBe("value");
      expect(formatValue.params[1]!.name).toBe("format");
      expect(formatValue.params[1]!.default).toBeDefined();

      const renderStatus = meta.functions.find((f) => f.name === "renderStatus")!;
      expect(renderStatus.returnType).toBe("string|bool");
      expect(renderStatus.params).toHaveLength(2);
      expect(renderStatus.params[0]!.name).toBe("status");
      expect(renderStatus.params[1]!.name).toBe("asHtml");
    });
  });

  // -----------------------------------------------------------------------
  // MethodConstantDefault: self:: defaults in method params
  // -----------------------------------------------------------------------
  describe("MethodConstantDefault", () => {
    it("parses method parameters with self:: constant defaults", () => {
      const meta = parsePhpSource(
        fixture("MethodConstantDefault.php"),
        "MethodConstantDefault.php",
      );
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MethodConstantDefault");

      // Constructor should have content param
      expect(cls.constructorParams).toHaveLength(1);
      expect(cls.constructorParams[0]!.name).toBe("content");

      // Render method should have 2 params with constant defaults
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(2);

      const format = render.params[0]!;
      expect(format.name).toBe("format");
      expect(format.type).toBe("string");
      expect(format.default).toBe("self::FORMAT_HTML");
      expect(format.required).toBe(false);

      const maxLen = render.params[1]!;
      expect(maxLen.name).toBe("maxLength");
      expect(maxLen.type).toBe("int");
      expect(maxLen.default).toBe("self::MAX_LENGTH");
      expect(maxLen.required).toBe(false);
    });
  });

  // NestedTrait: trait using another trait
  describe("NestedTrait", () => {
    it("parses trait-of-trait use statements", () => {
      const meta = parsePhpSource(fixture("NestedTrait.php"), "NestedTrait.php");
      const hasBorder = meta.classes.find((c) => c.name === "HasBorder")!;
      expect(hasBorder.isTrait).toBe(true);
      expect(hasBorder.traits).toEqual([]);
      expect(hasBorder.methods).toHaveLength(1);
      expect(hasBorder.methods[0]!.name).toBe("border");

      const hasCard = meta.classes.find((c) => c.name === "HasCard")!;
      expect(hasCard.isTrait).toBe(true);
      expect(hasCard.traits).toEqual(["HasBorder"]);
      expect(hasCard.methods).toHaveLength(1);
      expect(hasCard.methods[0]!.name).toBe("card");

      const widget = meta.classes.find((c) => c.name === "NestedTraitWidget")!;
      expect(widget.isTrait).toBe(false);
      expect(widget.traits).toEqual(["HasCard"]);
    });
  });

  // UnitEnumStatic: unit enum with static and instance methods
  describe("UnitEnumStatic", () => {
    it("parses unit enum with no backing type", () => {
      const meta = parsePhpSource(fixture("UnitEnumStatic.php"), "UnitEnumStatic.php");
      const dir = meta.classes.find((c) => c.name === "Direction")!;
      expect(dir.isEnum).toBe(true);
      expect(dir.enumBackingType).toBeNull();
      expect(dir.enumCases).toEqual(["North", "South", "East", "West"]);
    });

    it("parses both static and instance methods on unit enum", () => {
      const meta = parsePhpSource(fixture("UnitEnumStatic.php"), "UnitEnumStatic.php");
      const dir = meta.classes.find((c) => c.name === "Direction")!;
      const arrow = dir.methods.find((m) => m.name === "arrow")!;
      expect(arrow.isStatic).toBe(false);
      const compass = dir.methods.find((m) => m.name === "compass")!;
      expect(compass.isStatic).toBe(true);
    });
  });

  // ComposedClass: same-file class used as typed constructor param
  describe("ComposedClass", () => {
    it("parses both classes and their constructor relationships", () => {
      const meta = parsePhpSource(fixture("ComposedClass.php"), "ComposedClass.php");
      expect(meta.classes).toHaveLength(2);

      const address = meta.classes.find((c) => c.name === "Address")!;
      expect(address.constructorParams).toHaveLength(2);
      expect(address.constructorParams[0]!.name).toBe("city");
      expect(address.constructorParams[0]!.default).toBe("'__PLACEHOLDER__'");

      const contact = meta.classes.find((c) => c.name === "Contact")!;
      expect(contact.constructorParams).toHaveLength(2);
      const addrParam = contact.constructorParams.find((p) => p.name === "address")!;
      expect(addrParam.type).toBe("Address");
      expect(addrParam.required).toBe(false);
    });
  });

  // AbstractInterface: abstract class + interface + concrete child
  describe("AbstractInterface", () => {
    it("parses interface, abstract class, and concrete child", () => {
      const meta = parsePhpSource(fixture("AbstractInterface.php"), "AbstractInterface.php");
      expect(meta.classes).toHaveLength(3);

      const iface = meta.classes.find((c) => c.name === "Renderable")!;
      expect(iface.isInterface).toBe(true);

      const abstract = meta.classes.find((c) => c.name === "AbstractPanel")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.implements).toContain("Renderable");
      expect(abstract.methods.find((m) => m.name === "types")!.isStatic).toBe(true);

      const info = meta.classes.find((c) => c.name === "InfoPanel")!;
      expect(info.isAbstract).toBe(false);
      expect(info.extends).toBe("AbstractPanel");
      expect(info.methods.find((m) => m.name === "render")).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // TraitAbstract: trait with abstract method + concrete render
  // -----------------------------------------------------------------------
  describe("TraitAbstract", () => {
    it("parses trait with abstract and concrete methods, and class using it", () => {
      const meta = parsePhpSource(fixture("TraitAbstract.php"), "TraitAbstract.php");
      expect(meta.classes).toHaveLength(2);

      const trait = meta.classes.find((c) => c.name === "HasLayout")!;
      expect(trait.isTrait).toBe(true);
      // Trait should have both abstract content() and concrete render()
      expect(trait.methods.some((m) => m.name === "content")).toBe(true);
      expect(trait.methods.some((m) => m.name === "render")).toBe(true);
      expect(trait.methods.find((m) => m.name === "render")!.returnType).toBe("string");

      const cls = meta.classes.find((c) => c.name === "TraitAbstract")!;
      expect(cls.traits).toContain("HasLayout");
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe("title");
      expect(cls.constructorParams[1]!.name).toBe("body");
      // Class implements the abstract content() method
      expect(cls.methods.some((m) => m.name === "content")).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // DualCallable: class with both __invoke and render
  // -----------------------------------------------------------------------
  describe("DualCallable", () => {
    it("parses class with both __invoke and render methods", () => {
      const meta = parsePhpSource(fixture("DualCallable.php"), "DualCallable.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("DualCallable");
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe("label");

      // Should have both __invoke and render
      expect(cls.methods).toHaveLength(2);
      expect(cls.methods.some((m) => m.name === "__invoke")).toBe(true);
      expect(cls.methods.some((m) => m.name === "render")).toBe(true);

      // __invoke has a wrapper param
      const invoke = cls.methods.find((m) => m.name === "__invoke")!;
      expect(invoke.params).toHaveLength(1);
      expect(invoke.params[0]!.name).toBe("wrapper");
      expect(invoke.params[0]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // CurrencyEnum: backed enum implementing Stringable
  // -----------------------------------------------------------------------
  describe("CurrencyEnum", () => {
    it("parses backed enum with multiple instance and static methods", () => {
      const meta = parsePhpSource(fixture("CurrencyEnum.php"), "CurrencyEnum.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("Currency");
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["USD", "EUR", "GBP", "JPY"]);

      // Should have label, symbol, format, table
      expect(cls.methods.some((m) => m.name === "label")).toBe(true);
      expect(cls.methods.some((m) => m.name === "symbol")).toBe(true);
      expect(cls.methods.some((m) => m.name === "format")).toBe(true);
      expect(cls.methods.some((m) => m.name === "table")).toBe(true);

      // format has params
      const format = cls.methods.find((m) => m.name === "format")!;
      expect(format.params).toHaveLength(2);
      expect(format.params[0]!.name).toBe("amount");
      expect(format.params[0]!.type).toBe("float");
      expect(format.params[1]!.name).toBe("decimals");
      expect(format.params[1]!.default).toBe("2");

      // table is static
      const table = cls.methods.find((m) => m.name === "table")!;
      expect(table.isStatic).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // EnumDefaultFunc: function with enum-typed param and default
  // -----------------------------------------------------------------------
  describe("EnumDefaultFunc", () => {
    it("parses enum and function with enum-typed param", () => {
      const meta = parsePhpSource(fixture("EnumDefaultFunc.php"), "EnumDefaultFunc.php");

      // Should have the Align enum
      expect(meta.classes).toHaveLength(1);
      const align = meta.classes[0]!;
      expect(align.name).toBe("Align");
      expect(align.isEnum).toBe(true);
      expect(align.enumCases).toEqual(["Left", "Center", "Right"]);

      // Should have the alignedBox function
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe("alignedBox");
      expect(fn.params).toHaveLength(3);

      expect(fn.params[0]!.name).toBe("content");
      expect(fn.params[0]!.type).toBe("string");
      expect(fn.params[0]!.required).toBe(true);

      expect(fn.params[1]!.name).toBe("align");
      expect(fn.params[1]!.type).toBe("Align");
      expect(fn.params[1]!.default).toBe("Align::Left");
      expect(fn.params[1]!.required).toBe(false);

      expect(fn.params[2]!.name).toBe("bg");
      expect(fn.params[2]!.type).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // SplitView: class with multiple named render methods
  // -----------------------------------------------------------------------
  describe("SplitView", () => {
    it("parses class with renderFull and renderCompact methods", () => {
      const meta = parsePhpSource(fixture("SplitView.php"), "SplitView.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("SplitView");
      expect(cls.constructorParams).toHaveLength(3);

      expect(cls.methods).toHaveLength(2);
      expect(cls.methods.some((m) => m.name === "renderFull")).toBe(true);
      expect(cls.methods.some((m) => m.name === "renderCompact")).toBe(true);
      expect(cls.methods[0]!.returnType).toBe("string");
      expect(cls.methods[1]!.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // MixedOutput: class with echo (void) and return methods
  // -----------------------------------------------------------------------
  describe("MixedOutput", () => {
    it("parses class with render (string) and renderEcho (void) methods", () => {
      const meta = parsePhpSource(fixture("MixedOutput.php"), "MixedOutput.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("MixedOutput");
      expect(cls.constructorParams).toHaveLength(3);

      expect(cls.methods).toHaveLength(2);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.returnType).toBe("string");

      const echo = cls.methods.find((m) => m.name === "renderEcho")!;
      expect(echo.returnType).toBe("void");
    });
  });

  // -----------------------------------------------------------------------
  // ConcreteWidget: Interface + Trait + Abstract + Concrete hierarchy
  // -----------------------------------------------------------------------
  describe("ConcreteWidget", () => {
    it("parses all 4 class-like declarations", () => {
      const meta = parsePhpSource(fixture("ConcreteWidget.php"), "ConcreteWidget.php");
      expect(meta.classes).toHaveLength(4);

      const iface = meta.classes.find((c) => c.name === "Displayable")!;
      expect(iface.isInterface).toBe(true);
      expect(iface.methods).toHaveLength(1);
      expect(iface.methods[0]!.name).toBe("display");

      const trait = meta.classes.find((c) => c.name === "HasContainer")!;
      expect(trait.isTrait).toBe(true);
      expect(trait.methods).toHaveLength(1);
      expect(trait.methods[0]!.name).toBe("wrap");
      expect(trait.methods[0]!.params).toHaveLength(2);

      const abstract = meta.classes.find((c) => c.name === "BaseElement")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.traits).toContain("HasContainer");
      expect(abstract.constructorParams).toHaveLength(2);

      const concrete = meta.classes.find((c) => c.name === "ConcreteWidget")!;
      expect(concrete.isAbstract).toBe(false);
      expect(concrete.extends).toBe("BaseElement");
      expect(concrete.implements).toContain("Displayable");
      expect(concrete.constructorParams).toHaveLength(4);
      expect(concrete.methods.map((m) => m.name)).toEqual(
        expect.arrayContaining(["body", "display", "render"]),
      );
    });
  });

  // -----------------------------------------------------------------------
  // ExpandableList: Class implementing 3 interfaces
  // -----------------------------------------------------------------------
  describe("ExpandableList", () => {
    it("parses 3 interfaces and 1 implementing class", () => {
      const meta = parsePhpSource(fixture("ExpandableList.php"), "ExpandableList.php");

      const interfaces = meta.classes.filter((c) => c.isInterface);
      expect(interfaces).toHaveLength(3);
      expect(interfaces.map((i) => i.name).sort()).toEqual([
        "Expandable",
        "Filterable",
        "Sortable",
      ]);

      const cls = meta.classes.find((c) => c.name === "ExpandableList")!;
      expect(cls.implements).toHaveLength(3);
      expect(cls.implements).toContain("Expandable");
      expect(cls.implements).toContain("Filterable");
      expect(cls.implements).toContain("Sortable");
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.methods).toHaveLength(3);
      expect(cls.methods.map((m) => m.name).sort()).toEqual(["expand", "filter", "sort"]);
    });
  });

  // -----------------------------------------------------------------------
  // UtilFormat: Multiple standalone functions in one file
  // -----------------------------------------------------------------------
  describe("UtilFormat", () => {
    it("parses 3 standalone functions", () => {
      const meta = parsePhpSource(fixture("UtilFormat.php"), "UtilFormat.php");
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(3);

      const currency = meta.functions.find((f) => f.name === "formatCurrency")!;
      expect(currency.fqn).toBe("App\\Helpers\\formatCurrency");
      expect(currency.params).toHaveLength(3);
      expect(currency.params[0]!.type).toBe("float");
      expect(currency.params[1]!.type).toBe("string");
      expect(currency.params[2]!.type).toBe("int");

      const date = meta.functions.find((f) => f.name === "formatDate")!;
      expect(date.params).toHaveLength(2);
      expect(date.returnType).toBe("string");

      const fileSize = meta.functions.find((f) => f.name === "formatFileSize")!;
      expect(fileSize.params).toHaveLength(2);
      expect(fileSize.params[0]!.type).toBe("int");
    });
  });

  // -----------------------------------------------------------------------
  // EnumPermission: Enum with instance, param, and static methods
  // -----------------------------------------------------------------------
  describe("EnumPermission", () => {
    it("parses enum with badge, includes, and matrix methods", () => {
      const meta = parsePhpSource(fixture("EnumPermission.php"), "EnumPermission.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.name).toBe("Permission");
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Read", "Write", "Delete", "Admin"]);

      expect(cls.methods).toHaveLength(3);
      const badge = cls.methods.find((m) => m.name === "badge")!;
      expect(badge.isStatic).toBe(false);
      expect(badge.params).toHaveLength(0);

      const includes = cls.methods.find((m) => m.name === "includes")!;
      expect(includes.isStatic).toBe(false);
      expect(includes.params).toHaveLength(1);
      expect(includes.params[0]!.type).toBe("string");

      const matrix = cls.methods.find((m) => m.name === "matrix")!;
      expect(matrix.isStatic).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // NestedCompose: 3-level deep object composition
  // -----------------------------------------------------------------------
  describe("NestedCompose", () => {
    it("parses 2 readonly classes and 1 regular class", () => {
      const meta = parsePhpSource(fixture("NestedCompose.php"), "NestedCompose.php");
      expect(meta.classes).toHaveLength(3);

      const country = meta.classes.find((c) => c.name === "Country")!;
      expect(country.isReadonly).toBe(true);
      expect(country.constructorParams).toHaveLength(2);
      expect(country.constructorParams[0]!.name).toBe("code");
      expect(country.constructorParams[1]!.name).toBe("name");

      const address = meta.classes.find((c) => c.name === "Address")!;
      expect(address.isReadonly).toBe(true);
      expect(address.constructorParams).toHaveLength(3);
      expect(address.constructorParams[2]!.type).toBe("Country");

      const compose = meta.classes.find((c) => c.name === "NestedCompose")!;
      expect(compose.isReadonly).toBe(false);
      expect(compose.constructorParams).toHaveLength(3);
      expect(compose.constructorParams[1]!.type).toBe("Address");
    });
  });

  // -----------------------------------------------------------------------
  // EnumWorkflow: Enum state machine with transitions
  // -----------------------------------------------------------------------
  describe("EnumWorkflow", () => {
    it("parses enum with 5 cases and 3 methods (2 instance, 1 static)", () => {
      const meta = parsePhpSource(fixture("EnumWorkflow.php"), "EnumWorkflow.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.name).toBe("WorkflowState");
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Draft", "Review", "Approved", "Published", "Archived"]);

      const badge = cls.methods.find((m) => m.name === "badge")!;
      expect(badge.isStatic).toBe(false);

      const transitions = cls.methods.find((m) => m.name === "transitions")!;
      expect(transitions.isStatic).toBe(false);

      const diagram = cls.methods.find((m) => m.name === "diagram")!;
      expect(diagram.isStatic).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // StandaloneBoolType: PHP 8.2 true/false/null standalone types
  // -----------------------------------------------------------------------
  describe("StandaloneBoolType", () => {
    it("parses true, false, null as standalone parameter types", () => {
      const meta = parsePhpSource(fixture("StandaloneBoolType.php"), "StandaloneBoolType.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("StandaloneBoolType");

      // Constructor params
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe("label");
      expect(cls.constructorParams[0]!.type).toBe("string");
      expect(cls.constructorParams[1]!.name).toBe("color");
      expect(cls.constructorParams[1]!.type).toBe("string");

      // Methods
      expect(cls.methods).toHaveLength(3);

      const renderEnabled = cls.methods.find((m) => m.name === "renderEnabled")!;
      expect(renderEnabled.isStatic).toBe(false);
      expect(renderEnabled.params).toHaveLength(1);
      expect(renderEnabled.params[0]!.type).toBe("true");
      expect(renderEnabled.params[0]!.name).toBe("state");
      expect(renderEnabled.params[0]!.default).toBe("true");

      const renderDisabled = cls.methods.find((m) => m.name === "renderDisabled")!;
      expect(renderDisabled.isStatic).toBe(false);
      expect(renderDisabled.params).toHaveLength(1);
      expect(renderDisabled.params[0]!.type).toBe("false");
      expect(renderDisabled.params[0]!.name).toBe("state");
      expect(renderDisabled.params[0]!.default).toBe("false");

      const renderNull = cls.methods.find((m) => m.name === "renderNull")!;
      expect(renderNull.isStatic).toBe(true);
      expect(renderNull.params).toHaveLength(1);
      expect(renderNull.params[0]!.type).toBe("null");
      expect(renderNull.params[0]!.name).toBe("value");
      expect(renderNull.params[0]!.default).toBe("null");
    });
  });

  // -----------------------------------------------------------------------
  // TraitConflict: insteadof / as resolution
  // -----------------------------------------------------------------------
  describe("TraitConflict", () => {
    it("parses class with two traits using insteadof/as conflict resolution", () => {
      const meta = parsePhpSource(fixture("TraitConflict.php"), "TraitConflict.php");

      // Should find 2 traits + 1 class
      expect(meta.classes).toHaveLength(3);

      const htmlTrait = meta.classes.find((c) => c.name === "HasHtmlRender")!;
      expect(htmlTrait.isTrait).toBe(true);
      expect(htmlTrait.methods).toHaveLength(1);
      expect(htmlTrait.methods[0]!.name).toBe("render");

      const mdTrait = meta.classes.find((c) => c.name === "HasMarkdownRender")!;
      expect(mdTrait.isTrait).toBe(true);
      expect(mdTrait.methods).toHaveLength(1);
      expect(mdTrait.methods[0]!.name).toBe("render");

      const cls = meta.classes.find((c) => c.name === "TraitConflict")!;
      expect(cls.isTrait).toBe(false);
      expect(cls.traits).toContain("HasHtmlRender");
      expect(cls.traits).toContain("HasMarkdownRender");
      expect(cls.constructorParams).toHaveLength(1);
      expect(cls.constructorParams[0]!.name).toBe("title");
    });
  });

  // -----------------------------------------------------------------------
  // EnumArrayParam: enum method with array typed param
  // -----------------------------------------------------------------------
  describe("EnumArrayParam", () => {
    it("parses enum with methods taking array parameters", () => {
      const meta = parsePhpSource(fixture("EnumArrayParam.php"), "EnumArrayParam.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.name).toBe("ListStyle");
      expect(cls.enumBackingType).toBe("string");
      expect(cls.enumCases).toEqual(["Bullet", "Number", "None"]);

      const renderList = cls.methods.find((m) => m.name === "renderList")!;
      expect(renderList.isStatic).toBe(false);
      expect(renderList.params).toHaveLength(2);
      expect(renderList.params[0]!.type).toBe("array");
      expect(renderList.params[0]!.name).toBe("items");
      expect(renderList.params[1]!.type).toBe("string");
      expect(renderList.params[1]!.name).toBe("class");

      const preview = cls.methods.find((m) => m.name === "preview")!;
      expect(preview.isStatic).toBe(true);
      expect(preview.params).toHaveLength(1);
      expect(preview.params[0]!.type).toBe("array");
      expect(preview.params[0]!.name).toBe("items");
    });
  });

  // -----------------------------------------------------------------------
  // AbstractMultiChild: abstract base + 3 concrete children
  // -----------------------------------------------------------------------
  describe("AbstractMultiChild", () => {
    it("parses abstract class and 3 concrete children", () => {
      const meta = parsePhpSource(fixture("AbstractMultiChild.php"), "AbstractMultiChild.php");
      expect(meta.classes).toHaveLength(4);

      const base = meta.classes.find((c) => c.name === "AbstractPanel")!;
      expect(base.isAbstract).toBe(true);
      expect(base.constructorParams).toHaveLength(2);
      expect(base.methods.find((m) => m.name === "render")).toBeTruthy();

      const info = meta.classes.find((c) => c.name === "InfoPanel")!;
      expect(info.isAbstract).toBe(false);
      expect(info.extends).toBe("AbstractPanel");
      expect(info.methods.find((m) => m.name === "render")).toBeTruthy();

      const warning = meta.classes.find((c) => c.name === "WarningPanel")!;
      expect(warning.extends).toBe("AbstractPanel");
      expect(warning.constructorParams).toHaveLength(3);
      expect(warning.constructorParams[2]!.name).toBe("icon");

      const error = meta.classes.find((c) => c.name === "ErrorPanel")!;
      expect(error.extends).toBe("AbstractPanel");
      expect(error.constructorParams).toHaveLength(3);
      expect(error.constructorParams[2]!.name).toBe("code");
    });
  });

  // -----------------------------------------------------------------------
  // SelfStaticReturn: self and static return types
  // -----------------------------------------------------------------------
  describe("SelfStaticReturn", () => {
    it("parses methods with self and static return types", () => {
      const meta = parsePhpSource(fixture("SelfStaticReturn.php"), "SelfStaticReturn.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("SelfStaticReturn");

      const add = cls.methods.find((m) => m.name === "add")!;
      expect(add.returnType).toBe("self");
      expect(add.params).toHaveLength(1);
      expect(add.params[0]!.type).toBe("string");

      const merge = cls.methods.find((m) => m.name === "merge")!;
      expect(merge.returnType).toBe("static");
      expect(merge.params).toHaveLength(1);
      expect(merge.params[0]!.type).toBe("array");

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // FunctionIntersectionParam: function with intersection type param
  // -----------------------------------------------------------------------
  describe("FunctionIntersectionParam", () => {
    it("parses function with intersection type parameter", () => {
      const meta = parsePhpSource(
        fixture("FunctionIntersectionParam.php"),
        "FunctionIntersectionParam.php",
      );

      // 2 interfaces + 1 function
      expect(meta.classes).toHaveLength(2);
      expect(meta.functions).toHaveLength(1);

      const fn = meta.functions[0]!;
      expect(fn.name).toBe("renderTagged");
      expect(fn.params).toHaveLength(2);
      expect(fn.params[0]!.type).toBe("HasLabel&HasColor");
      expect(fn.params[0]!.name).toBe("item");
      expect(fn.params[1]!.type).toBe("string");
      expect(fn.params[1]!.name).toBe("size");
      expect(fn.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // VoidNeverReturn: void and never return types
  // -----------------------------------------------------------------------
  describe("VoidNeverReturn", () => {
    it("parses methods with void and never return types", () => {
      const meta = parsePhpSource(fixture("VoidNeverReturn.php"), "VoidNeverReturn.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("VoidNeverReturn");

      const renderEcho = cls.methods.find((m) => m.name === "renderEcho")!;
      expect(renderEcho.returnType).toBe("void");
      expect(renderEcho.params).toHaveLength(0);

      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.returnType).toBe("string");

      const fail = cls.methods.find((m) => m.name === "fail")!;
      expect(fail.returnType).toBe("never");
      expect(fail.params).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // ReadonlyClassDto: PHP 8.2 readonly class
  // -----------------------------------------------------------------------
  describe("ReadonlyClassDto", () => {
    it("parses readonly class with promoted properties", () => {
      const meta = parsePhpSource(fixture("ReadonlyClassDto.php"), "ReadonlyClassDto.php");
      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("ReadonlyClassDto");
      expect(cls.isReadonly).toBe(true);
      expect(cls.isAbstract).toBe(false);
      expect(cls.isFinal).toBe(false);

      expect(cls.constructorParams).toHaveLength(4);
      expect(cls.constructorParams[0]!.name).toBe("name");
      expect(cls.constructorParams[0]!.type).toBe("string");
      expect(cls.constructorParams[0]!.required).toBe(true);
      expect(cls.constructorParams[0]!.visibility).toBe("public");

      expect(cls.constructorParams[1]!.name).toBe("email");
      expect(cls.constructorParams[1]!.type).toBe("string");
      expect(cls.constructorParams[1]!.required).toBe(true);

      expect(cls.constructorParams[2]!.name).toBe("age");
      expect(cls.constructorParams[2]!.type).toBe("int");
      expect(cls.constructorParams[2]!.required).toBe(false);
      expect(cls.constructorParams[2]!.default).toBe("30");

      expect(cls.constructorParams[3]!.name).toBe("role");
      expect(cls.constructorParams[3]!.default).toBe("'__PLACEHOLDER__'");

      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
      expect(cls.methods[0]!.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // IntEnumCalc: int-backed enum with methods
  // -----------------------------------------------------------------------
  describe("IntEnumCalc", () => {
    it("parses int-backed enum with instance and static methods", () => {
      const meta = parsePhpSource(fixture("IntEnumCalc.php"), "IntEnumCalc.php");
      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("HttpPort");
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("int");
      expect(cls.enumCases).toEqual(["Http", "Https", "Dev", "Alt", "Proxy"]);

      expect(cls.methods).toHaveLength(2);
      const render = cls.methods.find((m) => m.name === "render")!;
      expect(render.isStatic).toBe(false);
      expect(render.returnType).toBe("string");

      const table = cls.methods.find((m) => m.name === "table")!;
      expect(table.isStatic).toBe(true);
      expect(table.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // IterableParam: iterable type hint
  // -----------------------------------------------------------------------
  describe("IterableParam", () => {
    it("parses class with iterable parameter type", () => {
      const meta = parsePhpSource(fixture("IterableParam.php"), "IterableParam.php");
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe("IterableParam");

      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe("title");
      expect(cls.constructorParams[1]!.name).toBe("emptyMessage");

      expect(cls.methods).toHaveLength(1);
      const render = cls.methods[0]!;
      expect(render.name).toBe("render");
      expect(render.params).toHaveLength(2);
      expect(render.params[0]!.name).toBe("items");
      expect(render.params[0]!.type).toBe("iterable");
      expect(render.params[0]!.required).toBe(true);
      expect(render.params[1]!.name).toBe("style");
      expect(render.params[1]!.type).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // StringableEnum: enum implementing Stringable + custom interface
  // -----------------------------------------------------------------------
  describe("StringableEnum", () => {
    it("parses enum with Stringable and custom interface", () => {
      const meta = parsePhpSource(fixture("StringableEnum.php"), "StringableEnum.php");
      expect(meta.namespace).toBe("App\\Components");

      // Interface + Enum
      expect(meta.classes).toHaveLength(2);

      const iface = meta.classes.find((c) => c.name === "HasDescription")!;
      expect(iface.isInterface).toBe(true);

      const enumCls = meta.classes.find((c) => c.name === "Planet")!;
      expect(enumCls.isEnum).toBe(true);
      expect(enumCls.enumBackingType).toBe("string");
      expect(enumCls.enumCases).toEqual(["Mercury", "Venus", "Earth", "Mars"]);
      expect(enumCls.implements).toContain("HasDescription");

      const render = enumCls.methods.find((m) => m.name === "render")!;
      expect(render.params).toHaveLength(1);
      expect(render.params[0]!.name).toBe("showDescription");
      expect(render.params[0]!.type).toBe("bool");
      expect(render.params[0]!.default).toBe("true");

      const description = enumCls.methods.find((m) => m.name === "description")!;
      expect(description.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // AbstractTemplateMethod: abstract + 3 concrete classes
  // -----------------------------------------------------------------------
  describe("AbstractTemplateMethod", () => {
    it("parses abstract class with template method + concrete subclasses", () => {
      const meta = parsePhpSource(
        fixture("AbstractTemplateMethod.php"),
        "AbstractTemplateMethod.php",
      );
      expect(meta.namespace).toBe("App\\Components");
      expect(meta.classes).toHaveLength(4);

      const abstract = meta.classes.find((c) => c.name === "AbstractNotification")!;
      expect(abstract.isAbstract).toBe(true);
      expect(abstract.constructorParams).toHaveLength(2);
      expect(abstract.constructorParams[0]!.name).toBe("message");
      expect(abstract.constructorParams[0]!.type).toBe("string");
      expect(abstract.constructorParams[1]!.name).toBe("recipient");
      expect(abstract.constructorParams[1]!.default).toBe("'__PLACEHOLDER__'");

      const render = abstract.methods.find((m) => m.name === "render")!;
      expect(render.returnType).toBe("string");
      expect(render.isStatic).toBe(false);

      const email = meta.classes.find((c) => c.name === "EmailNotification")!;
      expect(email.isAbstract).toBe(false);
      expect(email.extends).toBe("AbstractNotification");

      const sms = meta.classes.find((c) => c.name === "SmsNotification")!;
      expect(sms.extends).toBe("AbstractNotification");

      const push = meta.classes.find((c) => c.name === "PushNotification")!;
      expect(push.extends).toBe("AbstractNotification");
    });
  });

  // -----------------------------------------------------------------------
  // VariadicFunc: standalone functions with variadic params
  // -----------------------------------------------------------------------
  describe("VariadicFunc", () => {
    it("parses standalone functions with variadic parameters", () => {
      const meta = parsePhpSource(fixture("VariadicFunc.php"), "VariadicFunc.php");
      expect(meta.namespace).toBe("App\\Helpers");
      expect(meta.functions).toHaveLength(2);

      const breadcrumb = meta.functions.find((f) => f.name === "breadcrumbTrail")!;
      expect(breadcrumb.fqn).toBe("App\\Helpers\\breadcrumbTrail");
      expect(breadcrumb.params).toHaveLength(2);
      expect(breadcrumb.params[0]!.name).toBe("separator");
      expect(breadcrumb.params[0]!.type).toBe("string");
      expect(breadcrumb.params[0]!.isVariadic).toBe(false);
      expect(breadcrumb.params[1]!.name).toBe("segments");
      expect(breadcrumb.params[1]!.type).toBe("string");
      expect(breadcrumb.params[1]!.isVariadic).toBe(true);
      expect(breadcrumb.returnType).toBe("string");

      const join = meta.functions.find((f) => f.name === "joinParagraphs")!;
      expect(join.fqn).toBe("App\\Helpers\\joinParagraphs");
      expect(join.params).toHaveLength(2);
      expect(join.params[0]!.name).toBe("class");
      expect(join.params[0]!.isVariadic).toBe(false);
      expect(join.params[1]!.name).toBe("texts");
      expect(join.params[1]!.isVariadic).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // MixedDefaultsShowcase: diverse default value types
  // -----------------------------------------------------------------------
  describe("MixedDefaultsShowcase", () => {
    it("parses class with class constant, enum, array, nullable, and scalar defaults", () => {
      const meta = parsePhpSource(
        fixture("MixedDefaultsShowcase.php"),
        "MixedDefaultsShowcase.php",
      );
      expect(meta.namespace).toBe("App\\Components");

      // Theme enum + MixedDefaultsShowcase class
      const cls = meta.classes.find((c) => c.name === "MixedDefaultsShowcase")!;
      expect(cls).toBeTruthy();

      expect(cls.constructorParams).toHaveLength(7);

      const title = cls.constructorParams.find((p) => p.name === "title")!;
      expect(title.type).toBe("string");
      expect(title.default).toBe("self::DEFAULT_TITLE");

      const maxItems = cls.constructorParams.find((p) => p.name === "maxItems")!;
      expect(maxItems.type).toBe("int");
      expect(maxItems.default).toBe("self::MAX_ITEMS");

      const opacity = cls.constructorParams.find((p) => p.name === "opacity")!;
      expect(opacity.type).toBe("float");
      expect(opacity.default).toBe("1.0");

      const visible = cls.constructorParams.find((p) => p.name === "visible")!;
      expect(visible.type).toBe("bool");
      expect(visible.default).toBe("true");

      const subtitle = cls.constructorParams.find((p) => p.name === "subtitle")!;
      expect(subtitle.type).toBe("string");
      expect(subtitle.nullable).toBe(true);
      expect(subtitle.default).toBe("null");

      const tags = cls.constructorParams.find((p) => p.name === "tags")!;
      expect(tags.type).toBe("array");
      expect(tags.default).toBe("['__PLACEHOLDER__']");

      const theme = cls.constructorParams.find((p) => p.name === "theme")!;
      expect(theme.type).toBe("Theme");
      expect(theme.default).toBe("Theme::Light");
    });
  });

  // =========================================================================
  // Parser edge cases — breakage patterns
  // =========================================================================
  describe("Parser edge cases — breakage patterns", () => {
    // -----------------------------------------------------------------------
    // 1. Class modifier order
    // -----------------------------------------------------------------------
    describe("class modifier order", () => {
      it("parses 'final readonly class' (standard order)", () => {
        const meta = parsePhpSource(`<?php\nfinal readonly class Foo {}`, "test.php");
        const cls = meta.classes.find((c) => c.name === "Foo");
        expect(cls).toBeTruthy();
        expect(cls!.isFinal).toBe(true);
        expect(cls!.isReadonly).toBe(true);
      });

      it("parses 'readonly final class' (reversed order)", () => {
        const meta = parsePhpSource(`<?php\nreadonly final class Foo {}`, "test.php");
        const cls = meta.classes.find((c) => c.name === "Foo");
        expect(cls).toBeTruthy();
        expect(cls!.isFinal).toBe(true);
        expect(cls!.isReadonly).toBe(true);
      });

      it("parses 'readonly abstract class' (reversed order)", () => {
        const meta = parsePhpSource(`<?php\nreadonly abstract class Bar {}`, "test.php");
        const cls = meta.classes.find((c) => c.name === "Bar");
        expect(cls).toBeTruthy();
        expect(cls!.isAbstract).toBe(true);
        expect(cls!.isReadonly).toBe(true);
      });

      it("parses 'abstract readonly class' (standard order)", () => {
        const meta = parsePhpSource(`<?php\nabstract readonly class Bar {}`, "test.php");
        const cls = meta.classes.find((c) => c.name === "Bar");
        expect(cls).toBeTruthy();
        expect(cls!.isAbstract).toBe(true);
        expect(cls!.isReadonly).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // 2. Anonymous classes
    // -----------------------------------------------------------------------
    describe("anonymous classes", () => {
      it("skips anonymous class from 'new class extends Foo {}'", () => {
        const source = `<?php
namespace App;

class RealFactory {
    public function create(): object {
        return new class extends \\stdClass {
            public function hello(): string { return 'hi'; }
        };
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const names = meta.classes.map((c) => c.name);
        expect(names).toContain("RealFactory");
        expect(names).not.toContain("extends");
        expect(names).toHaveLength(1);
      });
    });

    // -----------------------------------------------------------------------
    // 3. Enum method with switch-case
    // -----------------------------------------------------------------------
    describe("enum method with switch-case", () => {
      it("ignores switch-case values inside enum methods", () => {
        const source = `<?php
enum Priority: int {
    case Low = 1;
    case Medium = 2;
    case High = 3;

    public function label(): string {
        switch ($this->value) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
        }
        return '';
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const enumMeta = meta.classes.find((c) => c.name === "Priority");
        expect(enumMeta).toBeTruthy();
        expect(enumMeta!.isEnum).toBe(true);
        expect(enumMeta!.enumCases).toEqual(["Low", "Medium", "High"]);
      });

      it("correctly parses enum without switch statements", () => {
        const source = `<?php
enum Color: string {
    case Red = 'red';
    case Green = 'green';
    case Blue = 'blue';
}`;
        const meta = parsePhpSource(source, "test.php");
        const enumMeta = meta.classes.find((c) => c.name === "Color");
        expect(enumMeta).toBeTruthy();
        expect(enumMeta!.enumCases).toEqual(["Red", "Green", "Blue"]);
      });
    });

    // -----------------------------------------------------------------------
    // 4. Standalone function with deep paren nesting
    // -----------------------------------------------------------------------
    describe("standalone function with deep paren nesting", () => {
      it("parses 2-level nested parens in default value", () => {
        const source = `<?php
function deepNested(Closure $fn = new Closure(new ReflectionFunction('strlen'))): void {}
`;
        const meta = parsePhpSource(source, "test.php");
        const fn = meta.functions.find((f) => f.name === "deepNested");
        expect(fn).toBeTruthy();
        expect(fn!.params).toHaveLength(1);
        expect(fn!.params[0]!.name).toBe("fn");
        expect(fn!.returnType).toBe("void");
      });

      it("parses 1-level nested parens (supported)", () => {
        const source = `<?php
function shallow(array $items = array('a')): void {}
`;
        const meta = parsePhpSource(source, "test.php");
        const fn = meta.functions.find((f) => f.name === "shallow");
        expect(fn).toBeTruthy();
        expect(fn!.params).toHaveLength(1);
        expect(fn!.params[0]!.name).toBe("items");
      });
    });

    // -----------------------------------------------------------------------
    // 5. Method without visibility modifier
    // -----------------------------------------------------------------------
    describe("method without visibility modifier", () => {
      it("detects method without visibility keyword (defaults to public)", () => {
        const source = `<?php
class LegacyWidget {
    function render(): string { return 'hello'; }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "LegacyWidget");
        expect(cls).toBeTruthy();
        expect(cls!.methods).toHaveLength(1);
        expect(cls!.methods[0]!.name).toBe("render");
        expect(cls!.methods[0]!.visibility).toBe("public");
        expect(cls!.methods[0]!.returnType).toBe("string");
      });

      it("detects method with explicit visibility (control)", () => {
        const source = `<?php
class ModernWidget {
    public function render(): string { return 'hello'; }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "ModernWidget");
        expect(cls).toBeTruthy();
        expect(cls!.methods).toHaveLength(1);
        expect(cls!.methods[0]!.name).toBe("render");
      });
    });

    // -----------------------------------------------------------------------
    // 6. Braced namespace
    // -----------------------------------------------------------------------
    describe("braced namespace", () => {
      it("extracts braced namespace correctly", () => {
        const source = `<?php
namespace App\\Models {
    class User {
        public function __construct(public string $name) {}
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        expect(meta.namespace).toBe("App\\Models");
        const cls = meta.classes.find((c) => c.name === "User");
        expect(cls).toBeTruthy();
        expect(cls!.fqn).toBe("App\\Models\\User");
      });

      it("correctly extracts semicolon namespace (control)", () => {
        const source = `<?php
namespace App\\Models;

class User {
    public function __construct(public string $name) {}
}`;
        const meta = parsePhpSource(source, "test.php");
        expect(meta.namespace).toBe("App\\Models");
        const cls = meta.classes.find((c) => c.name === "User");
        expect(cls!.fqn).toBe("App\\Models\\User");
      });

      it("keeps classes and functions scoped to each namespace block", () => {
        const source = `<?php
namespace App\\Models;

class User {
    public function render(): string { return 'user'; }
}

namespace App\\Admin {
    class Dashboard {
        public function render(): string { return 'admin'; }
    }

    function badge(): string {
        return 'badge';
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        expect(meta.namespace).toBe("App\\Models");

        const user = meta.classes.find((c) => c.name === "User");
        expect(user).toBeTruthy();
        expect(user!.fqn).toBe("App\\Models\\User");

        const dashboard = meta.classes.find((c) => c.name === "Dashboard");
        expect(dashboard).toBeTruthy();
        expect(dashboard!.fqn).toBe("App\\Admin\\Dashboard");

        const badge = meta.functions.find((f) => f.name === "badge");
        expect(badge).toBeTruthy();
        expect(badge!.fqn).toBe("App\\Admin\\badge");
      });

      it("supports explicit global namespace blocks alongside named namespaces", () => {
        const source = `<?php
namespace {
    function helper(): string {
        return 'helper';
    }
}

namespace App\\Widgets {
    class Banner {
        public function render(): string {
            return 'banner';
        }
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        expect(meta.namespace).toBe("App\\Widgets");

        const helper = meta.functions.find((f) => f.name === "helper");
        expect(helper).toBeTruthy();
        expect(helper!.fqn).toBe("helper");

        const banner = meta.classes.find((c) => c.name === "Banner");
        expect(banner).toBeTruthy();
        expect(banner!.fqn).toBe("App\\Widgets\\Banner");
      });
    });

    // -----------------------------------------------------------------------
    // 7. Backtick strings (shell exec)
    // -----------------------------------------------------------------------
    describe("backtick strings", () => {
      it("ignores class keywords inside backtick strings", () => {
        const source = `<?php
class Runner {
    public function execute(): string {
        $out = \`echo class FakeClass {}\`;
        return $out;
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const names = meta.classes.map((c) => c.name);
        expect(names).toContain("Runner");
        expect(names).not.toContain("FakeClass");
        expect(names).toHaveLength(1);
      });
    });

    // -----------------------------------------------------------------------
    // 8. Extremely long return type (>100 chars)
    // -----------------------------------------------------------------------
    describe("long return type", () => {
      it("captures return type longer than 100 chars", () => {
        const longType =
          "VeryLongNamespacePrefix\\SomeExtremelyVerboseClassName|AnotherRidiculouslyLongNamespace\\WithEvenMoreStuff";
        const source = `<?php
class TypeTest {
    public function process(): ${longType} {
        return new \\stdClass();
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "TypeTest");
        expect(cls).toBeTruthy();
        const method = cls!.methods.find((m) => m.name === "process");
        expect(method).toBeTruthy();
        expect(method!.returnType).toBe(longType);
      });

      it("captures normal-length return type (control)", () => {
        const source = `<?php
class ShortType {
    public function get(): string|int|null {
        return null;
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "ShortType");
        const method = cls!.methods.find((m) => m.name === "get");
        expect(method!.returnType).toBe("string|int|null");
      });
    });

    // -----------------------------------------------------------------------
    // 9. static before visibility (Bug 1)
    // -----------------------------------------------------------------------
    describe("static before visibility", () => {
      it("parses 'static public function' as public + static", () => {
        const source = `<?php
class Util {
    static public function helper(): void {}
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Util");
        expect(cls).toBeTruthy();
        const method = cls!.methods.find((m) => m.name === "helper");
        expect(method).toBeTruthy();
        expect(method!.isStatic).toBe(true);
        expect(method!.visibility).toBe("public");
      });

      it("parses 'static protected function' as protected + static", () => {
        const source = `<?php
class Util {
    static protected function secret(): string { return ''; }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Util");
        const method = cls!.methods.find((m) => m.name === "secret");
        expect(method).toBeTruthy();
        expect(method!.isStatic).toBe(true);
        expect(method!.visibility).toBe("protected");
      });

      it("parses 'public static function' (standard order, control)", () => {
        const source = `<?php
class Util {
    public static function standard(): void {}
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Util");
        const method = cls!.methods.find((m) => m.name === "standard");
        expect(method).toBeTruthy();
        expect(method!.isStatic).toBe(true);
        expect(method!.visibility).toBe("public");
      });
    });

    // -----------------------------------------------------------------------
    // 10. Interface multiple extends (Bug 2)
    // -----------------------------------------------------------------------
    describe("interface multiple extends", () => {
      it("captures first parent when interface extends multiple", () => {
        const source = `<?php
interface Composite extends Readable, Writable, Seekable {
    public function process(): void;
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Composite");
        expect(cls).toBeTruthy();
        expect(cls!.isInterface).toBe(true);
        expect(cls!.extends).toBe("Readable");
      });

      it("still works for single extends (control)", () => {
        const source = `<?php
interface Child extends Parent {
    public function doStuff(): void;
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Child");
        expect(cls).toBeTruthy();
        expect(cls!.extends).toBe("Parent");
      });
    });

    // -----------------------------------------------------------------------
    // 11. Anonymous class methods leaking to parent (Bug 3)
    // -----------------------------------------------------------------------
    describe("anonymous class methods do not leak to parent", () => {
      it("does not include anonymous class methods in parent class", () => {
        const source = `<?php
class Container {
    public function create(): object {
        return new class {
            public function innerMethod(): string { return 'inner'; }
            private function secretInner(): void {}
        };
    }
    public function realMethod(): void {}
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Container");
        expect(cls).toBeTruthy();
        const methodNames = cls!.methods.map((m) => m.name);
        expect(methodNames).toContain("create");
        expect(methodNames).toContain("realMethod");
        expect(methodNames).not.toContain("innerMethod");
        expect(methodNames).not.toContain("secretInner");
        expect(methodNames).toHaveLength(2);
      });
    });

    // -----------------------------------------------------------------------
    // 12. Return type with spaces in union/intersection (Bug 4)
    // -----------------------------------------------------------------------
    describe("return type with spaces in union/intersection", () => {
      it("captures spaced union return type on a method", () => {
        const source = `<?php
class Converter {
    public function convert(): int | string {
        return 42;
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Converter");
        const method = cls!.methods.find((m) => m.name === "convert");
        expect(method).toBeTruthy();
        expect(method!.returnType).toBe("int|string");
      });

      it("captures spaced intersection return type on a method", () => {
        const source = `<?php
class Intersector {
    public function combine(): Foo & Bar {
        return new class implements Foo, Bar {};
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Intersector");
        const method = cls!.methods.find((m) => m.name === "combine");
        expect(method).toBeTruthy();
        expect(method!.returnType).toBe("Foo&Bar");
      });

      it("captures spaced union return type on a standalone function", () => {
        const source = `<?php
function convert(): int | string | null {
    return null;
}`;
        const meta = parsePhpSource(source, "test.php");
        const fn = meta.functions.find((f) => f.name === "convert");
        expect(fn).toBeTruthy();
        expect(fn!.returnType).toBe("int|string|null");
      });
    });

    // -----------------------------------------------------------------------
    // 13. Anonymous class constructor leaking to parent (Bug 5)
    // -----------------------------------------------------------------------
    describe("anonymous class constructor does not leak to parent", () => {
      it("ignores anonymous class __construct when parent has none", () => {
        const source = `<?php
class Outer {
    public function make(): object {
        return new class {
            public function __construct(public string $x) {}
            public function inner(): void {}
        };
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Outer");
        expect(cls).toBeTruthy();
        expect(cls!.constructorParams).toHaveLength(0);
        // Also should not leak inner method
        const methodNames = cls!.methods.map((m) => m.name);
        expect(methodNames).not.toContain("inner");
      });

      it("uses parent __construct when both parent and anon class have one", () => {
        const source = `<?php
class WithCtor {
    public function __construct(public int $id) {}
    public function make(): object {
        return new class {
            public function __construct(public string $anonParam) {}
        };
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "WithCtor");
        expect(cls).toBeTruthy();
        expect(cls!.constructorParams).toHaveLength(1);
        expect(cls!.constructorParams[0]!.name).toBe("id");
        expect(cls!.constructorParams[0]!.type).toBe("int");
      });
    });

    // -----------------------------------------------------------------------
    // 14. __construct prefix collision (Bug 6)
    // -----------------------------------------------------------------------
    describe("__construct prefix collision", () => {
      it("does not match __constructHelper as a constructor", () => {
        const source = `<?php
class Builder {
    private function __constructHelper(string $val): void {}
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Builder");
        expect(cls).toBeTruthy();
        expect(cls!.constructorParams).toHaveLength(0);
      });

      it("matches real __construct when __constructHelper also exists", () => {
        const source = `<?php
class Builder {
    public function __construct(public string $name) {}
    private function __constructHelper(string $val): void {}
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Builder");
        expect(cls).toBeTruthy();
        expect(cls!.constructorParams).toHaveLength(1);
        expect(cls!.constructorParams[0]!.name).toBe("name");
      });
    });

    describe("zero-arg constructor overrides", () => {
      it("tracks an explicit zero-arg constructor separately from no constructor", () => {
        const meta = parsePhpSource(
          fixture("ZeroArgConstructorOverride.php"),
          "ZeroArgConstructorOverride.php",
        );

        const base = meta.classes.find((c) => c.name === "ConstructorBase");
        expect(base).toBeTruthy();
        expect(base!.hasConstructor).toBe(true);
        expect(base!.constructorParams).toHaveLength(1);
        expect(base!.constructorParams[0]!.name).toBe("label");

        const child = meta.classes.find((c) => c.name === "ConstructorOverride");
        expect(child).toBeTruthy();
        expect(child!.hasConstructor).toBe(true);
        expect(child!.constructorParams).toHaveLength(0);
      });
    });

    // -----------------------------------------------------------------------
    // 15. Local named functions stay scoped to their body
    // -----------------------------------------------------------------------
    describe("local named functions remain scoped", () => {
      it("does not treat a local function inside a method body as a class method", () => {
        const source = `<?php
class Widget {
    public function render(): string {
        function helper_local(string $label): string {
            return strtoupper($label);
        }

        return helper_local('ok');
    }
}`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "Widget");
        expect(cls).toBeTruthy();
        expect(cls!.methods.map((m) => m.name)).toEqual(["render"]);
      });

      it("does not export a local function declared inside a standalone function body", () => {
        const source = `<?php
function outer(): string {
    function inner_helper(): string {
        return 'inner';
    }

    return inner_helper();
}
`;
        const meta = parsePhpSource(source, "test.php");
        expect(meta.functions.map((f) => f.name)).toEqual(["outer"]);
      });
    });

    // -----------------------------------------------------------------------
    // 16. Anonymous class trait use stays isolated
    // -----------------------------------------------------------------------
    describe("anonymous class trait use stays isolated", () => {
      it("does not merge nested anonymous-class traits into the parent class", () => {
        const source = `<?php
trait HasBadge {
    public function badge(): string {
        return 'badge';
    }
}

class ParentCard {
    public function create(): object {
        return new class {
            use HasBadge;
        };
    }
}
`;
        const meta = parsePhpSource(source, "test.php");
        const cls = meta.classes.find((c) => c.name === "ParentCard");
        expect(cls).toBeTruthy();
        expect(cls!.traits).toEqual([]);
      });
    });
  });

  // -----------------------------------------------------------------------
  // PHP 8.4: AsymmetricVisibility
  // -----------------------------------------------------------------------
  describe("AsymmetricVisibility", () => {
    it("parses asymmetric visibility (public private(set)) with correct types", () => {
      const meta = parsePhpSource(fixture("AsymmetricVisibility.php"), "AsymmetricVisibility.php");

      expect(meta.namespace).toBe("App\\Components");
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("AsymmetricVisibility");
      expect(cls.constructorParams).toHaveLength(3);

      const title = cls.constructorParams[0]!;
      expect(title.name).toBe("title");
      expect(title.type).toBe("string");
      expect(title.visibility).toBe("public");
      expect(title.isPromoted).toBe(true);
      expect(title.required).toBe(false);
      expect(title.default).toBe("'__PLACEHOLDER__'");

      const status = cls.constructorParams[1]!;
      expect(status.name).toBe("status");
      expect(status.type).toBe("string");
      expect(status.visibility).toBe("public");
      expect(status.isPromoted).toBe(true);
      expect(status.required).toBe(false);

      const views = cls.constructorParams[2]!;
      expect(views.name).toBe("views");
      expect(views.type).toBe("int");
      expect(views.visibility).toBe("public");
      expect(views.isPromoted).toBe(true);
      expect(views.required).toBe(false);
      expect(views.default).toBe("0");

      // Methods
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
      expect(cls.methods[0]!.returnType).toBe("string");
    });
  });

  // -----------------------------------------------------------------------
  // PHP 8.4: PropertyHook
  // -----------------------------------------------------------------------
  describe("PropertyHook", () => {
    it("parses class with property hooks without breaking constructor or methods", () => {
      const meta = parsePhpSource(fixture("PropertyHook.php"), "PropertyHook.php");

      expect(meta.namespace).toBe("App\\Components");
      const cls = meta.classes[0]!;
      expect(cls.name).toBe("PropertyHook");

      // Constructor params (not promoted — just regular params)
      expect(cls.constructorParams).toHaveLength(2);

      const displayName = cls.constructorParams[0]!;
      expect(displayName.name).toBe("displayName");
      expect(displayName.type).toBe("string");
      expect(displayName.required).toBe(false);
      expect(displayName.default).toBe("'__PLACEHOLDER__'");
      expect(displayName.isPromoted).toBe(false);

      const age = cls.constructorParams[1]!;
      expect(age.name).toBe("age");
      expect(age.type).toBe("int");
      expect(age.required).toBe(false);
      expect(age.default).toBe("0");
      expect(age.isPromoted).toBe(false);

      // Methods — render only, property hooks should not be detected as methods
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe("render");
      expect(cls.methods[0]!.returnType).toBe("string");
    });
  });

  // BEGIN moved parser cases from integration
  describe("Moved from advanced-scenarios.integration.test.ts", () => {
    describe("Parser: metadata extraction for all patterns", () => {
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

    it("parser detects final class", () => {
      const meta = parsePhpFile(advanced("Avatar.php"));
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.isFinal).toBe(true);
      expect(meta.classes[0]!.name).toBe("Avatar");
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

    it("parser detects int-backed enum", () => {
      const meta = parsePhpFile(php81("Priority.php"));
      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe("int");
      expect(cls.enumCases).toEqual(["Low", "Medium", "High", "Critical"]);
      expect(cls.methods).toHaveLength(2);
    });

    it("parser detects implements", () => {
      const meta = parsePhpFile(advanced("Stepper.php"));
      const stepper = meta.classes.find((c) => c.name === "Stepper")!;
      expect(stepper.implements).toContain("StepRenderer");
    });

    it("parser detects multiple traits", () => {
      const meta = parsePhpFile(advanced("Modal.php"));
      const modal = meta.classes.find((c) => c.name === "Modal")!;
      expect(modal.traits).toEqual(["HasAnimation", "HasOverlay"]);
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

    it("parser detects Visibility enum with all cases and methods", () => {
      const meta = parsePhpFile(php81("Visibility.php"));
      const vis = meta.classes.find((c) => c.name === "Visibility")!;
      expect(vis.isEnum).toBe(true);
      expect(vis.enumBackingType).toBe("string");
      expect(vis.enumCases).toEqual(["Public", "Private", "Unlisted", "Draft"]);
      expect(vis.methods).toHaveLength(2);
      expect(vis.methods.map((m) => m.name).sort()).toEqual(["badge", "description"]);
    });

    describe("Parser: new example metadata", () => {
      it("parses DataRenderer with iterable and mixed types", () => {
        const meta = parsePhpFile(advanced("DataRenderer.php"));
        const cls = meta.classes[0]!;
        expect(cls.constructorParams[0]!.type).toBe("iterable");
        const render = cls.methods[0]!;
        expect(render.params[0]!.type).toBe("mixed");
      });
    });

    describe("Parser: UC46-UC55 metadata", () => {
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

    it("parser detects multiple interfaces", () => {
      const meta = parsePhpFile(advanced("Dropdown.php"));
      const cls = meta.classes.find((c) => c.name === "Dropdown");
      expect(cls).toBeDefined();
      expect(cls!.implements).toContain("Togglable");
      expect(cls!.implements).toContain("Searchable");
      expect(cls!.methods).toHaveLength(2);
      expect(cls!.methods.map((m) => m.name).sort()).toEqual(["search", "toggle"]);
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

    describe("Parser: new fixture metadata", () => {
      it("parses ReadonlyClass fixture", () => {
        const meta = parsePhpFile(fixturePath("ReadonlyClass.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("Settings");
        expect(cls.isReadonly).toBe(true);
        expect(cls.constructorParams).toHaveLength(3);
      });

      it("parses DefaultNewExpression fixture", () => {
        const meta = parsePhpFile(fixturePath("DefaultNewExpression.php"));
        expect(meta.classes).toHaveLength(2);
        const widget = meta.classes[1]!;
        expect(widget.name).toBe("Widget");
        const optionsParam = widget.constructorParams.find((p) => p.name === "options")!;
        expect(optionsParam.type).toBe("Options");
        expect(optionsParam.required).toBe(false);
      });

      it("parses EnumWithInterface fixture", () => {
        const meta = parsePhpFile(fixturePath("EnumWithInterface.php"));
        const level = meta.classes.find((c) => c.name === "Level")!;
        expect(level.isEnum).toBe(true);
        expect(level.implements).toContain("Renderable");
        expect(level.enumCases).toEqual(["Low", "Medium", "High"]);
      });
    });

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

    describe("Parser: UC121-UC128 fixture metadata", () => {
      it("parses EnumConstant fixture", () => {
        const meta = parsePhpFile(fixturePath("EnumConstant.php"));
        const cls = meta.classes.find((c) => c.name === "EnumConstant")!;
        expect(cls.isEnum).toBe(true);
        expect(cls.enumCases).toEqual(["Success", "Warning", "Danger"]);
        const badge = cls.methods.find((m) => m.name === "badge")!;
        expect(badge.isStatic).toBe(false);
        const all = cls.methods.find((m) => m.name === "all")!;
        expect(all.isStatic).toBe(true);
      });

      it("parses DeepInheritance fixture", () => {
        const meta = parsePhpFile(fixturePath("DeepInheritance.php"));
        expect(meta.classes).toHaveLength(3);
        const base = meta.classes.find((c) => c.name === "BaseWidget")!;
        expect(base.isAbstract).toBe(true);
        const detail = meta.classes.find((c) => c.name === "DetailWidget")!;
        expect(detail.extends).toBe("InfoWidget");
        expect(detail.constructorParams).toHaveLength(4);
      });

      it("parses GeneratorFunc fixture", () => {
        const meta = parsePhpFile(fixturePath("GeneratorFunc.php"));
        expect(meta.functions).toHaveLength(2);
        expect(meta.functions[0]!.name).toBe("generateList");
        expect(meta.functions[0]!.returnType).toBe("\\Generator");
        expect(meta.functions[1]!.name).toBe("generateTable");
        expect(meta.functions[1]!.returnType).toBe("\\Generator");
      });

      it("parses NowdocCard fixture", () => {
        const meta = parsePhpFile(fixturePath("NowdocCard.php"));
        const cls = meta.classes.find((c) => c.name === "NowdocCard")!;
        expect(cls).toBeDefined();
        expect(cls.constructorParams).toHaveLength(3);
        expect(cls.methods[0]!.name).toBe("render");
      });

      it("parses PrivateConstruct fixture", () => {
        const meta = parsePhpFile(fixturePath("PrivateConstruct.php"));
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
        const meta = parsePhpFile(fixturePath("MultiEnum.php"));
        expect(meta.classes).toHaveLength(2);

        const textAlign = meta.classes.find((c) => c.name === "TextAlign")!;
        expect(textAlign.isEnum).toBe(true);
        expect(textAlign.enumCases).toEqual(["Left", "Center", "Right"]);

        const fontWeight = meta.classes.find((c) => c.name === "FontWeight")!;
        expect(fontWeight.isEnum).toBe(true);
        expect(fontWeight.enumCases).toEqual(["Light", "Normal", "Bold", "Black"]);
      });

      it("parses AbstractFactory fixture", () => {
        const meta = parsePhpFile(fixturePath("AbstractFactory.php"));
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

    describe("Parser: UC130-UC135 fixture metadata", () => {
      it("parses MixedVisibility fixture", () => {
        const meta = parsePhpFile(fixturePath("MixedVisibility.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("MixedVisibility");
        expect(cls.constructorParams).toHaveLength(4);
        expect(cls.constructorParams[0]!.visibility).toBe("public");
        expect(cls.constructorParams[1]!.visibility).toBe("private");
        expect(cls.constructorParams[2]!.visibility).toBe("protected");
        expect(cls.constructorParams[3]!.visibility).toBe("public");
      });

      it("parses NoParamClock fixture", () => {
        const meta = parsePhpFile(fixturePath("NoParamClock.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("NoParamClock");
        expect(cls.constructorParams).toHaveLength(2);
        const render = cls.methods.find((m) => m.name === "render")!;
        expect(render.params).toHaveLength(0);
      });

      it("parses ComplexDefaults fixture", () => {
        const meta = parsePhpFile(fixturePath("ComplexDefaults.php"));
        expect(meta.functions).toHaveLength(1);
        const fn = meta.functions[0]!;
        expect(fn.name).toBe("complexList");
        expect(fn.params).toHaveLength(3);
        expect(fn.params[0]!.type).toBe("array");
        expect(fn.params[0]!.required).toBe(false);
      });

      it("parses EnumMultiInterface fixture", () => {
        const meta = parsePhpFile(fixturePath("EnumMultiInterface.php"));
        const cls = meta.classes.find((c) => c.name === "EnumMultiInterface")!;
        expect(cls.isEnum).toBe(true);
        expect(cls.implements).toContain("HasLabel");
        expect(cls.implements).toContain("HasIcon");
        expect(cls.enumCases).toEqual(["Home", "Settings", "Profile", "Logout"]);
      });

      it("parses StaticInstance fixture", () => {
        const meta = parsePhpFile(fixturePath("StaticInstance.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("StaticInstance");
        const instanceMethods = cls.methods.filter((m) => !m.isStatic);
        const staticMethods = cls.methods.filter((m) => m.isStatic);
        expect(instanceMethods).toHaveLength(1);
        expect(staticMethods).toHaveLength(1);
      });
    });

    describe("Parser: UC136-UC141 fixture metadata", () => {
      it("parses StandaloneTypes fixture", () => {
        const meta = parsePhpFile(fixturePath("StandaloneTypes.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("StandaloneTypes");
        expect(cls.constructorParams).toHaveLength(3);
        expect(cls.constructorParams[1]!.type).toBe("true");
        expect(cls.constructorParams[2]!.type).toBe("false");
      });

      it("parses NestedNamespace fixture", () => {
        const meta = parsePhpFile(fixturePath("NestedNamespace.php"));
        expect(meta.namespace).toBe("App\\UI\\Components\\Form");
        const cls = meta.classes[0]!;
        expect(cls.fqn).toBe("App\\UI\\Components\\Form\\TextInput");
        expect(cls.constructorParams).toHaveLength(4);
      });

      it("parses MultiRender fixture", () => {
        const meta = parsePhpFile(fixturePath("MultiRender.php"));
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
        const meta = parsePhpFile(fixturePath("EnumStaticInstance.php"));
        const cls = meta.classes[0]!;
        expect(cls.isEnum).toBe(true);
        expect(cls.enumCases).toEqual(["Info", "Warning", "Error"]);
        const statics = cls.methods.filter((m) => m.isStatic);
        const instances = cls.methods.filter((m) => !m.isStatic);
        expect(statics).toHaveLength(1);
        expect(instances).toHaveLength(1);
      });

      it("parses EnumTypedConstructor fixture", () => {
        const meta = parsePhpFile(fixturePath("EnumTypedConstructor.php"));
        const enumCls = meta.classes.find((c) => c.name === "Theme")!;
        expect(enumCls.isEnum).toBe(true);
        expect(enumCls.enumCases).toEqual(["Light", "Dark", "System"]);

        const cls = meta.classes.find((c) => c.name === "EnumTypedConstructor")!;
        expect(cls.constructorParams).toHaveLength(2);
        const themeParam = cls.constructorParams.find((p) => p.name === "theme")!;
        expect(themeParam.type).toBe("Theme");
      });
    });

    describe("Parser: UC142-UC146 fixture metadata", () => {
      it("parses EchoEnum fixture", () => {
        const meta = parsePhpFile(fixturePath("EchoEnum.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("EchoEnum");
        expect(cls.isEnum).toBe(true);
        expect(cls.enumCases).toEqual(["Success", "Error", "Warning"]);
        const alert = cls.methods.find((m) => m.name === "alert")!;
        expect(alert.params).toHaveLength(2);
        expect(alert.returnType).toBe("void");
      });

      it("parses InvocableEcho fixture", () => {
        const meta = parsePhpFile(fixturePath("InvocableEcho.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("InvocableEcho");
        expect(cls.constructorParams).toHaveLength(1);
        const invoke = cls.methods.find((m) => m.name === "__invoke")!;
        expect(invoke).toBeDefined();
        expect(invoke.params).toHaveLength(2);
        expect(invoke.returnType).toBe("void");
      });

      it("parses ScalarReturn fixture", () => {
        const meta = parsePhpFile(fixturePath("ScalarReturn.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("ScalarReturn");
        expect(cls.methods).toHaveLength(3);
        const pct = cls.methods.find((m) => m.name === "renderPercent")!;
        expect(pct.returnType).toBe("int");
        const ratio = cls.methods.find((m) => m.name === "renderRatio")!;
        expect(ratio.returnType).toBe("float");
      });

      it("parses FunctionArrayDefault fixture", () => {
        const meta = parsePhpFile(fixturePath("FunctionArrayDefault.php"));
        expect(meta.namespace).toBe("App\\Helpers");
        expect(meta.functions).toHaveLength(2);
        expect(meta.functions[0]!.name).toBe("renderNav");
        expect(meta.functions[0]!.params[0]!.type).toBe("array");
        expect(meta.functions[0]!.params[0]!.required).toBe(false);
        expect(meta.functions[1]!.name).toBe("renderTagList");
      });

      it("parses EnumMethodParams fixture", () => {
        const meta = parsePhpFile(fixturePath("EnumMethodParams.php"));
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

    describe("Parser: UC147-UC150 fixture metadata", () => {
      it("parses EnumWithTrait fixture: traits on enums", () => {
        const meta = parsePhpFile(fixturePath("EnumWithTrait.php"));

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
        const meta = parsePhpFile(fixturePath("PromotedReadonlyUnion.php"));
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
        const meta = parsePhpFile(fixturePath("FunctionUnionReturn.php"));
        expect(meta.functions).toHaveLength(2);

        const fv = meta.functions.find((f) => f.name === "formatValue")!;
        expect(fv.returnType).toBe("string|int");

        const rs = meta.functions.find((f) => f.name === "renderStatus")!;
        expect(rs.returnType).toBe("string|bool");
      });

      it("parses MethodConstantDefault fixture: self:: defaults in method", () => {
        const meta = parsePhpFile(fixturePath("MethodConstantDefault.php"));
        const cls = meta.classes[0]!;
        const render = cls.methods.find((m) => m.name === "render")!;
        expect(render.params[0]!.default).toBe("self::FORMAT_HTML");
        expect(render.params[1]!.default).toBe("self::MAX_LENGTH");
      });
    });

    describe("Parser: UC210-220 fixture metadata", () => {
      it("parses FinalReadonlyPoint as final readonly class", () => {
        const meta = parsePhpFile(fixturePath("FinalReadonlyPoint.php"));
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
        const meta = parsePhpFile(fixturePath("HttpStatusCode.php"));
        const cls = meta.classes.find((c) => c.name === "HttpStatusCode");
        expect(cls).toBeDefined();
        expect(cls!.isEnum).toBe(true);
        expect(cls!.enumBackingType).toBe("int");
        expect(cls!.enumCases).toContain("OK");
        expect(cls!.enumCases).toContain("NotFound");
        expect(cls!.enumCases).toContain("InternalServerError");
        expect(cls!.methods.some((m) => m.name === "badge")).toBe(true);
        expect(cls!.methods.some((m) => m.name === "table" && m.isStatic)).toBe(true);
      });

      it("parses MenuAction as enum with multiple interfaces", () => {
        const meta = parsePhpFile(fixturePath("MenuAction.php"));
        const cls = meta.classes.find((c) => c.name === "MenuAction");
        expect(cls).toBeDefined();
        expect(cls!.isEnum).toBe(true);
        expect(cls!.implements).toContain("Displayable");
        expect(cls!.implements).toContain("Accessible");
        expect(cls!.methods.some((m) => m.name === "menuItem")).toBe(true);
        expect(cls!.methods.some((m) => m.name === "palette" && m.isStatic)).toBe(true);
      });

      it("parses UserAvatar with multiple methods", () => {
        const meta = parsePhpFile(fixturePath("UserAvatar.php"));
        const cls = meta.classes.find((c) => c.name === "UserAvatar");
        expect(cls).toBeDefined();
        expect(cls!.constructorParams).toHaveLength(3);
        expect(cls!.methods.some((m) => m.name === "circle")).toBe(true);
        expect(cls!.methods.some((m) => m.name === "card")).toBe(true);
        expect(cls!.methods.some((m) => m.name === "badge")).toBe(true);
      });

      it("parses ThreeLevel with abstract + concrete classes", () => {
        const meta = parsePhpFile(fixturePath("ThreeLevel.php"));
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
        const meta = parsePhpFile(fixturePath("DnfConfig.php"));
        const cls = meta.classes.find((c) => c.name === "DnfConfig");
        expect(cls).toBeDefined();
        const source = cls!.constructorParams.find((p) => p.name === "source");
        expect(source).toBeDefined();
        expect(source!.type).toContain("|");
      });

      it("parses RuleEngine with __invoke method", () => {
        const meta = parsePhpFile(fixturePath("RuleEngine.php"));
        const cls = meta.classes.find((c) => c.name === "RuleEngine");
        expect(cls).toBeDefined();
        expect(cls!.methods.some((m) => m.name === "__invoke")).toBe(true);
        const invoke = cls!.methods.find((m) => m.name === "__invoke");
        expect(invoke!.params).toHaveLength(3);
      });

      it("parses DefinitionList as standalone generator function", () => {
        const meta = parsePhpFile(fixturePath("DefinitionList.php"));
        expect(meta.functions).toHaveLength(1);
        expect(meta.functions[0]!.name).toBe("definitionList");
        expect(meta.functions[0]!.params).toHaveLength(2);
      });

      it("parses FileSize with two static methods", () => {
        const meta = parsePhpFile(fixturePath("FileSize.php"));
        const cls = meta.classes.find((c) => c.name === "FileSize");
        expect(cls).toBeDefined();
        expect(cls!.constructorParams).toHaveLength(0);
        expect(cls!.methods.some((m) => m.name === "badge" && m.isStatic)).toBe(true);
        expect(cls!.methods.some((m) => m.name === "bar" && m.isStatic)).toBe(true);
      });

      it("parses Sections with two independent classes", () => {
        const meta = parsePhpFile(fixturePath("Sections.php"));
        expect(meta.classes.some((c) => c.name === "SectionHeader")).toBe(true);
        expect(meta.classes.some((c) => c.name === "SectionFooter")).toBe(true);
      });

      it("parses SocialShare with traits and classes", () => {
        const meta = parsePhpFile(fixturePath("SocialShare.php"));
        const twitter = meta.classes.find((c) => c.name === "TwitterShare");
        expect(twitter).toBeDefined();
        expect(twitter!.traits).toContain("HasShareLink");
        expect(twitter!.traits).toContain("HasSocialIcon");

        const facebook = meta.classes.find((c) => c.name === "FacebookShare");
        expect(facebook).toBeDefined();
        expect(facebook!.traits).toContain("HasShareLink");
      });
    });

    it("parser reads type as 'array' (docblock does not affect parser)", () => {
      const meta = parsePhpFile(fixturePath("ArrayOfObjects.php"));
      const tagCloud = meta.classes.find((c) => c.name === "TagCloud");
      expect(tagCloud).toBeDefined();
      const tagsParam = tagCloud!.constructorParams.find((p) => p.name === "tags");
      expect(tagsParam).toBeDefined();
      expect(tagsParam!.type).toBe("array");
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

    describe("UC61: Enum implementing interface", () => {
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
    });

    describe("UC62: Multiple traits", () => {
      it("parses Widget with HasIcon, HasBadge, HasActions traits", () => {
        const meta = parsePhpFile(advanced("Widget.php"));
        const widget = meta.classes.find((c) => c.name === "Widget");
        expect(widget).toBeDefined();
        expect(widget!.traits).toContain("HasIcon");
        expect(widget!.traits).toContain("HasBadge");
        expect(widget!.traits).toContain("HasActions");
      });
    });

    describe("UC63: Array return with html key", () => {
      it("parses StatsCard with array return type", () => {
        const meta = parsePhpFile(advanced("ArrayReturn.php"));
        const cls = meta.classes.find((c) => c.name === "StatsCard");
        expect(cls).toBeDefined();
        const render = cls!.methods.find((m) => m.name === "render");
        expect(render).toBeDefined();
        expect(render!.returnType).toBe("array");
      });
    });

    describe("UC64: Stringable return", () => {
      it("parses FragmentBuilder with HtmlFragment return type", () => {
        const meta = parsePhpFile(php80("HtmlFragment.php"));
        const builder = meta.classes.find((c) => c.name === "FragmentBuilder");
        expect(builder).toBeDefined();
        const render = builder!.methods.find((m) => m.name === "render");
        expect(render).toBeDefined();
        expect(render!.returnType).toBe("HtmlFragment");
      });
    });

    describe("UC65: Multiple static methods", () => {
      it("parses MarkupHelper with three static methods", () => {
        const meta = parsePhpFile(advanced("MarkupHelper.php"));
        const cls = meta.classes.find((c) => c.name === "MarkupHelper");
        expect(cls).toBeDefined();
        expect(cls!.constructorParams).toHaveLength(0);
        const statics = cls!.methods.filter((m) => m.isStatic);
        expect(statics).toHaveLength(3);
      });
    });

    describe("UC102: No-constructor class with instance methods", () => {
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

    describe("UC103: Callout with boolean flags", () => {
      it("parses Callout.php constructor with many boolean params", () => {
        const meta = parsePhpFile(advanced("Callout.php"));
        const cls = meta.classes.find((c) => c.name === "Callout")!;
        const boolParams = cls.constructorParams.filter((p) => p.type === "bool");
        expect(boolParams.length).toBeGreaterThanOrEqual(5);
      });
    });

    describe("UC104: DateFormatter with multiple instance methods", () => {
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

    describe("UC108: Echo-based standalone functions (renderHtml)", () => {
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

    describe("UC109: Variadic standalone functions (joinItems)", () => {
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

    describe("UC112: Float type parameters", () => {
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

    describe("UC113: Standalone readonly class", () => {
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

    describe("UC114: Heredoc syntax", () => {
      it("parses HeredocCard.php correctly", () => {
        const meta = parsePhpFile(advanced("HeredocCard.php"));
        const cls = meta.classes.find((c) => c.name === "HeredocCard")!;
        expect(cls).toBeDefined();
        expect(cls.constructorParams).toHaveLength(4);
        const imageParam = cls.constructorParams.find((p) => p.name === "imageUrl")!;
        expect(imageParam.nullable).toBe(true);
      });
    });

    describe("UC115: Enum with static and instance methods", () => {
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

    describe("UC116: Array type parameters", () => {
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

    describe("UC119: New expression in default parameter", () => {
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

    describe("UC120: DNF type parameters", () => {
      it("parses DnfParam with DNF type", () => {
        const meta = parsePhpFile(php82("DnfParam.php"));
        const cls = meta.classes.find((c) => c.name === "DnfParam")!;
        expect(cls).toBeDefined();
        const badgeParam = cls.constructorParams.find((p) => p.name === "badge")!;
        expect(badgeParam).toBeDefined();
        expect(badgeParam.required).toBe(false);
      });
    });

    describe("UC121: Enum with constants", () => {
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
    });

    describe("UC122: Deep inheritance (3 levels)", () => {
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
    });

    describe("UC123: Generator standalone functions", () => {
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
    });

    describe("UC124: Nowdoc syntax", () => {
      it("parses NowdocCard correctly despite nowdoc syntax", () => {
        const meta = parsePhpFile(advanced("NowdocCard.php"));
        const cls = meta.classes.find((c) => c.name === "NowdocCard")!;
        expect(cls).toBeDefined();
        expect(cls.constructorParams).toHaveLength(3);
        expect(cls.methods).toHaveLength(1);
        expect(cls.methods[0]!.name).toBe("render");
      });
    });

    describe("UC125: Private constructor with static factories", () => {
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
    });

    describe("UC126: Multiple enums in one file", () => {
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
    });

    describe("UC130: Mixed visibility constructor", () => {
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
    });

    describe("UC133: Enum implementing multiple interfaces", () => {
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
    });

    describe("UC135: Static factory + instance method on same class", () => {
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

    describe("UC136: Pure enum with method params", () => {
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
    });

    describe("UC137: PHP 8.2 standalone types", () => {
      it("parses standalone types from fixture", () => {
        const meta = parsePhpFile(fixturePath("StandaloneTypes.php"));
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

    describe("UC138: Deeply nested namespace", () => {
      it("parses deeply nested namespace", () => {
        const meta = parsePhpFile(fixturePath("NestedNamespace.php"));
        expect(meta.namespace).toBe("App\\UI\\Components\\Form");
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("TextInput");
        expect(cls.fqn).toBe("App\\UI\\Components\\Form\\TextInput");
      });
    });

    describe("UC139: Multiple render methods", () => {
      it("parses MultiRender with 3 public methods", () => {
        const meta = parsePhpFile(advanced("MultiRender.php"));
        const cls = meta.classes.find((c) => c.name === "MultiRender")!;
        expect(cls).toBeDefined();
        expect(cls.methods).toHaveLength(3);
        expect(cls.methods.map((m) => m.name).sort()).toEqual([
          "render",
          "renderCard",
          "renderRow",
        ]);
      });
    });

    describe("UC140: Enum with static + instance methods", () => {
      it("parses enum with both method types", () => {
        const meta = parsePhpFile(php81("EnumStaticInstance.php"));
        const cls = meta.classes.find((c) => c.name === "EnumStaticInstance")!;
        expect(cls.isEnum).toBe(true);
        const instanceMethods = cls.methods.filter((m) => !m.isStatic);
        const staticMethods = cls.methods.filter((m) => m.isStatic);
        expect(instanceMethods).toHaveLength(2);
        expect(staticMethods).toHaveLength(1);
      });
    });

    describe("UC141: Enum-typed constructor parameter", () => {
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

    describe("UC142: Echo-based enum method", () => {
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
    });

    describe("UC144: Scalar return values", () => {
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

    describe("UC145: Functions with array defaults", () => {
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
    });

    describe("UC146: Enum with multiple typed method params", () => {
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
    });

    describe("UC147: Enum with trait", () => {
      it("parses EnumWithTrait with trait usage on enum", () => {
        const meta = parsePhpFile(fixturePath("EnumWithTrait.php"));

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
    });

    describe("UC148: Promoted readonly union types", () => {
      it("parses PromotedReadonlyUnion fixture", () => {
        const meta = parsePhpFile(fixturePath("PromotedReadonlyUnion.php"));
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
    });

    describe("UC149: Method constant defaults", () => {
      it("parses MethodConstantDefault fixture", () => {
        const meta = parsePhpFile(fixturePath("MethodConstantDefault.php"));
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
    });

    describe("UC150: Function union return types", () => {
      it("parses FunctionUnionReturn fixture", () => {
        const meta = parsePhpFile(fixturePath("FunctionUnionReturn.php"));
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
    });

    describe("UC152: PHP 8 attributes (AttributeCard)", () => {
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
        const meta = parsePhpFile(fixturePath("AttributeClass.php"));
        const cls = meta.classes.find((c) => c.name === "AttributeClass");
        expect(cls).toBeDefined();
        expect(cls!.constructorParams).toHaveLength(2);
        expect(cls!.constructorParams[0]!.name).toBe("title");
        expect(cls!.constructorParams[1]!.name).toBe("body");
        expect(cls!.methods).toHaveLength(1);
        expect(cls!.methods[0]!.name).toBe("render");
      });
    });

    describe("UC153: Stringable return from class method (EnumToString)", () => {
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
        const meta = parsePhpFile(fixturePath("EnumStringable.php"));
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
    });

    describe("UC154: Enum with trait static method (TraitStaticEnum)", () => {
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
        const meta = parsePhpFile(fixturePath("TraitStaticEnum.php"));
        const trait = meta.classes.find((c) => c.name === "HasShowcase");
        expect(trait).toBeDefined();
        expect(trait!.isTrait).toBe(true);

        const swatch = meta.classes.find((c) => c.name === "Swatch");
        expect(swatch).toBeDefined();
        expect(swatch!.traits).toContain("HasShowcase");
      });
    });

    describe("UC155: Constant expression defaults (ConstExprDefaults)", () => {
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
        const meta = parsePhpFile(fixturePath("ConstExprDefaults.php"));
        const cls = meta.classes[0]!;
        expect(cls.constructorParams[1]!.default).toBe("PHP_EOL");
        expect(cls.constructorParams[2]!.default).toBe("PHP_INT_SIZE");
        expect(cls.constructorParams[3]!.default).toBe("PHP_VERSION");
      });
    });

    describe("UC156: Abstract parent with trait method (AbstractTraitChild)", () => {
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

      it("parses TraitInterface fixture: trait, interface, abstract, concrete", () => {
        const meta = parsePhpFile(fixturePath("TraitInterface.php"));

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
    });

    describe("UC158: Nullable function params", () => {
      it("parses NullableFunction fixture", () => {
        const meta = parsePhpFile(fixturePath("NullableFunction.php"));
        expect(meta.functions).toHaveLength(1);
        const fn = meta.functions[0]!;
        expect(fn.params).toHaveLength(4);
        expect(fn.params[1]!.nullable).toBe(true);
        expect(fn.params[2]!.nullable).toBe(true);
        expect(fn.params[3]!.nullable).toBe(true);
      });
    });

    describe("UC159: Echo-based standalone function", () => {
      it("parses echoGreet function with void return", () => {
        const meta = parsePhpFile(advanced("echoGreet.php"));
        expect(meta.functions).toHaveLength(1);
        const fn = meta.functions[0]!;
        expect(fn.name).toBe("echoGreet");
        expect(fn.returnType).toBe("void");
        expect(fn.params).toHaveLength(2);
      });

      it("parses EchoFunction fixture", () => {
        const meta = parsePhpFile(fixturePath("EchoFunction.php"));
        expect(meta.functions).toHaveLength(1);
        const fn = meta.functions[0]!;
        expect(fn.name).toBe("echoGreet");
        expect(fn.returnType).toBe("void");
      });
    });

    describe("UC160: Variadic string constructor", () => {
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

      it("parses VariadicCrumb fixture", () => {
        const meta = parsePhpFile(fixturePath("VariadicCrumb.php"));
        const cls = meta.classes[0]!;
        expect(cls.constructorParams).toHaveLength(2);
        expect(cls.constructorParams[1]!.isVariadic).toBe(true);
      });
    });

    describe("UC161: Enum array return", () => {
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

      it("parses EnumArrayReturn fixture", () => {
        const meta = parsePhpFile(fixturePath("EnumArrayReturn.php"));
        const cls = meta.classes[0]!;
        expect(cls.isEnum).toBe(true);
        const card = cls.methods.find((m) => m.name === "card")!;
        expect(card.returnType).toBe("array");
      });
    });

    describe("UC162: Match expression rendering", () => {
      it("parses MatchPanel class", () => {
        const meta = parsePhpFile(php80("MatchPanel.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("MatchPanel");
        expect(cls.constructorParams).toHaveLength(3);
        expect(cls.constructorParams[0]!.name).toBe("variant");
      });

      it("parses MatchPanel fixture", () => {
        const meta = parsePhpFile(fixturePath("MatchPanel.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("MatchPanel");
        expect(cls.constructorParams).toHaveLength(3);
      });
    });

    describe("UC163: Multiple functions in one file", () => {
      it("parses multiple functions in scalarFunc", () => {
        const meta = parsePhpFile(advanced("scalarFunc.php"));
        expect(meta.functions).toHaveLength(2);
        expect(meta.functions.map((f) => f.name).sort()).toEqual(["calcDiscount", "formatBytes"]);
      });
    });

    describe("UC165: static return type (FluentElement)", () => {
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
        const meta = parsePhpFile(fixturePath("StaticReturnType.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("StaticReturnType");
        const addClass = cls.methods.find((m) => m.name === "addClass");
        expect(addClass!.returnType).toBe("static");
        const setText = cls.methods.find((m) => m.name === "setText");
        expect(setText!.returnType).toBe("static");
        const render = cls.methods.find((m) => m.name === "render");
        expect(render!.returnType).toBe("string");
      });
    });

    describe("UC166: callable/Closure params (CallableLabel)", () => {
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
        const meta = parsePhpFile(fixturePath("CallableParam.php"));
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
    });

    describe("UC167: object and iterable params (ObjectInspector)", () => {
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
        const meta = parsePhpFile(fixturePath("ObjectTypeParam.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("ObjectTypeParam");
        const renderObj = cls.methods.find((m) => m.name === "renderObject");
        expect(renderObj!.params[0]!.type).toBe("object");
        const renderIter = cls.methods.find((m) => m.name === "renderIterable");
        expect(renderIter!.params[0]!.type).toBe("iterable");
      });
    });

    describe("UC168: Nested array defaults (nestedGrid)", () => {
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
        const meta = parsePhpFile(fixturePath("NestedDefaults.php"));
        expect(meta.functions).toHaveLength(2);
        const gridFn = meta.functions.find((f) => f.name === "renderGrid");
        expect(gridFn).toBeDefined();
        expect(gridFn!.params).toHaveLength(3);
        const matrixFn = meta.functions.find((f) => f.name === "renderMatrix");
        expect(matrixFn).toBeDefined();
        expect(matrixFn!.params).toHaveLength(2);
      });
    });

    describe("UC169: Enum static factory (SeverityEnum)", () => {
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
        const meta = parsePhpFile(fixturePath("EnumStaticFactory.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("Severity");
        expect(cls.isEnum).toBe(true);
        expect(cls.methods.find((m) => m.name === "badge")).toBeDefined();
        expect(cls.methods.find((m) => m.name === "all")!.isStatic).toBe(true);
        expect(cls.methods.find((m) => m.name === "ofLevel")!.isStatic).toBe(true);
      });
    });

    describe("UC170: string|false return type (SearchResult)", () => {
      it("parses string|false return type", () => {
        const meta = parsePhpFile(php80("SearchResult.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("SearchResult");
        const findFirst = cls.methods.find((m) => m.name === "findFirst");
        expect(findFirst).toBeDefined();
        expect(findFirst!.returnType).toBe("string|false");
      });

      it("parses StringFalseReturn fixture", () => {
        const meta = parsePhpFile(fixturePath("StringFalseReturn.php"));
        const cls = meta.classes[0]!;
        expect(cls.name).toBe("StringFalseReturn");
        const findFirst = cls.methods.find((m) => m.name === "findFirst");
        expect(findFirst!.returnType).toBe("string|false");
      });
    });

    describe("UC171: Multiple interface implementation (ItemCollection)", () => {
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
        const meta = parsePhpFile(fixturePath("MultiInterfaceClass.php"));
        const cls = meta.classes.find((c) => c.name === "MultiInterfaceClass");
        expect(cls).toBeDefined();
        expect(cls!.implements).toEqual(["Renderable", "Countable2", "Describable"]);
      });
    });

    describe("UC174: Nested trait chain (TraitChain)", () => {
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

      it("parses NestedTrait fixture", () => {
        const meta = parsePhpFile(fixturePath("NestedTrait.php"));
        const hasBorder = meta.classes.find((c) => c.name === "HasBorder")!;
        expect(hasBorder.isTrait).toBe(true);

        const hasCard = meta.classes.find((c) => c.name === "HasCard")!;
        expect(hasCard.isTrait).toBe(true);
        expect(hasCard.traits).toContain("HasBorder");

        const widget = meta.classes.find((c) => c.name === "NestedTraitWidget")!;
        expect(widget.traits).toContain("HasCard");
      });
    });

    describe("UC175: Unit enum with static method (Season)", () => {
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

      it("parses UnitEnumStatic fixture", () => {
        const meta = parsePhpFile(fixturePath("UnitEnumStatic.php"));
        const cls = meta.classes.find((c) => c.name === "Direction")!;
        expect(cls.isEnum).toBe(true);
        expect(cls.enumBackingType).toBeNull();
        expect(cls.enumCases).toEqual(["North", "South", "East", "West"]);
        expect(cls.methods.find((m) => m.name === "arrow")).toBeTruthy();
        expect(cls.methods.find((m) => m.name === "compass")!.isStatic).toBe(true);
      });
    });

    describe("UC176: Class composition (ComposedCard)", () => {
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
        const meta = parsePhpFile(fixturePath("ComposedClass.php"));
        const address = meta.classes.find((c) => c.name === "Address")!;
        expect(address.constructorParams).toHaveLength(2);

        const contact = meta.classes.find((c) => c.name === "Contact")!;
        const addrParam = contact.constructorParams.find((p) => p.name === "address")!;
        expect(addrParam.type).toBe("Address");
      });
    });

    describe("UC177: Abstract class + interface + concrete children (AbstractWidget)", () => {
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

      it("parses AbstractInterface fixture", () => {
        const meta = parsePhpFile(fixturePath("AbstractInterface.php"));

        const iface = meta.classes.find((c) => c.name === "Renderable")!;
        expect(iface.isInterface).toBe(true);

        const abstract = meta.classes.find((c) => c.name === "AbstractPanel")!;
        expect(abstract.isAbstract).toBe(true);
        expect(abstract.implements).toContain("Renderable");

        const info = meta.classes.find((c) => c.name === "InfoPanel")!;
        expect(info.extends).toBe("AbstractPanel");
      });
    });

    describe("UC178: Static echo method", () => {
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
        const meta = parsePhpFile(fixturePath("StaticEcho.php"));
        const cls = meta.classes.find((c) => c.name === "StaticEcho");
        expect(cls).toBeDefined();
        expect(cls!.methods).toHaveLength(2);
        expect(cls!.methods.every((m) => m.isStatic)).toBe(true);
        expect(cls!.methods.every((m) => m.returnType === "void")).toBe(true);
      });
    });

    describe("UC179: Trait template method pattern", () => {
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
        const meta = parsePhpFile(fixturePath("TraitTemplate.php"));
        const trait = meta.classes.find((c) => c.name === "HasSection");
        expect(trait?.isTrait).toBe(true);
        expect(trait!.methods.some((m) => m.name === "render")).toBe(true);

        const cls = meta.classes.find((c) => c.name === "InfoSection");
        expect(cls).toBeDefined();
        expect(cls!.traits).toContain("HasSection");
      });
    });

    describe("UC180: Function returning html array", () => {
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
        const meta = parsePhpFile(fixturePath("FuncHtmlArray.php"));
        expect(meta.functions).toHaveLength(1);
        expect(meta.functions[0]!.name).toBe("statusCard");
        expect(meta.functions[0]!.returnType).toBe("array");
      });
    });

    describe("UC181: Enum with interface and trait", () => {
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
        const meta = parsePhpFile(fixturePath("EnumInterfaceTrait.php"));
        const enumCls = meta.classes.find((c) => c.name === "Palette");
        expect(enumCls?.isEnum).toBe(true);
        expect(enumCls?.implements).toContain("Describable");
        expect(enumCls?.traits).toContain("HasColorCode");
      });
    });

    describe("UC182: Class overriding trait method", () => {
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
        const meta = parsePhpFile(fixturePath("OverrideTrait.php"));
        const cls = meta.classes.find((c) => c.name === "OverrideTrait");
        expect(cls).toBeDefined();
        expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
        expect(cls!.traits).toContain("HasDefaultRender");
      });
    });

    describe("UC185: Backed enum implementing Stringable", () => {
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

    describe("UC189: Interface + Trait + Abstract + Concrete hierarchy", () => {
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
    });

    describe("UC191: Multiple standalone functions", () => {
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
    });

    describe("UC193: 3-level deep object composition", () => {
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
    });

    describe("UC221: Autoloaded nested classes", () => {
      it("parses ContactCard as the only class in its file", () => {
        const meta = parsePhpFile(advanced("Autoload/ContactCard.php"));
        expect(meta.classes).toHaveLength(1);
        expect(meta.classes[0]!.name).toBe("ContactCard");
        expect(meta.classes[0]!.constructorParams[1]!.type).toBe("Address");
      });
    });
  });

  describe("Moved from examples-refactor.integration.test.ts", () => {
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

    it("should parse array-of-objects class", () => {
      const meta = parsePhpFile(advanced("ArrayOfObjects.php"));
      const cls = meta.classes.find((c) => c.name === "ArrayOfObjects");
      expect(cls).toBeDefined();
      const itemsParam = cls!.constructorParams.find((p) => p.name === "items");
      expect(itemsParam).toBeDefined();
      expect(itemsParam!.type).toBe("array");
    });

    it("should parse multiple classes from single file", () => {
      const meta = parsePhpFile(advanced("MultiClassExport.php"));
      const classNames = meta.classes.map((c) => c.name);
      expect(classNames).toContain("MultiClassExportA");
      expect(classNames).toContain("MultiClassExportB");
    });

    it("should parse self/static return type methods", () => {
      const meta = parsePhpFile(advanced("SelfReturn.php"));
      const cls = meta.classes.find((c) => c.name === "SelfReturn");
      expect(cls).toBeDefined();

      // Should have methods with self or static return types
      const methods = cls!.methods;
      expect(methods.length).toBeGreaterThanOrEqual(1);
    });

    it("should parse nested array default parameters", () => {
      const meta = parsePhpFile(advanced("NestedArrayDefault.php"));
      expect(meta.functions.length).toBeGreaterThanOrEqual(1);
      const fn = meta.functions[0]!;
      const configParam = fn.params.find((p) => p.name === "config");
      expect(configParam).toBeDefined();
      expect(configParam!.default).toBeDefined();
    });

    it("should parse variadic object constructor param", () => {
      const meta = parsePhpFile(advanced("VariadicObject.php"));
      const cls = meta.classes.find((c) => c.name === "VariadicObject");
      expect(cls).toBeDefined();
      // Should detect variadic parameter
      const variadicParam = cls!.constructorParams.find((p) => p.isVariadic);
      expect(variadicParam).toBeDefined();
    });

    it("should parse first-class callable class", () => {
      const meta = parsePhpFile(php81("FirstClassCallable.php"));
      const cls = meta.classes.find((c) => c.name === "FirstClassCallable");
      expect(cls).toBeDefined();
      expect(cls!.methods.some((m) => m.name === "render")).toBe(true);
    });

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
  });
  // END moved parser cases from integration
});
