import { describe, it, expect } from 'vitest';
import { parsePhpSource } from '../php-parser.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8');

describe('PHP Parser', () => {
  // -----------------------------------------------------------------------
  // 1. SimpleComponent
  // -----------------------------------------------------------------------
  describe('SimpleComponent', () => {
    it('parses namespace, class name, constructor params, and render method', () => {
      const meta = parsePhpSource(fixture('SimpleComponent.php'), 'SimpleComponent.php');

      expect(meta.namespace).toBe('App\\Components');
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('SimpleComponent');
      expect(cls.fqn).toBe('App\\Components\\SimpleComponent');
      expect(cls.isAbstract).toBe(false);
      expect(cls.isFinal).toBe(false);
      expect(cls.isReadonly).toBe(false);

      // Constructor params
      expect(cls.constructorParams).toHaveLength(2);

      const nameParam = cls.constructorParams[0]!;
      expect(nameParam.name).toBe('name');
      expect(nameParam.type).toBe('string');
      expect(nameParam.required).toBe(true);
      expect(nameParam.isPromoted).toBe(true);
      expect(nameParam.visibility).toBe('private');
      expect(nameParam.position).toBe(0);

      const ageParam = cls.constructorParams[1]!;
      expect(ageParam.name).toBe('age');
      expect(ageParam.type).toBe('int');
      expect(ageParam.required).toBe(false);
      expect(ageParam.default).toBe('25');
      expect(ageParam.isPromoted).toBe(true);
      expect(ageParam.visibility).toBe('private');
      expect(ageParam.position).toBe(1);

      // Methods
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe('render');
      expect(cls.methods[0]!.returnType).toBe('string');
      expect(cls.methods[0]!.isStatic).toBe(false);
      expect(cls.methods[0]!.visibility).toBe('public');
    });
  });

  // -----------------------------------------------------------------------
  // 2. ComplexComponent
  // -----------------------------------------------------------------------
  describe('ComplexComponent', () => {
    it('parses nullable params, bool/array defaults, trailing comma, multiple methods', () => {
      const meta = parsePhpSource(fixture('ComplexComponent.php'), 'ComplexComponent.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('ComplexComponent');
      expect(cls.constructorParams).toHaveLength(4);

      const title = cls.constructorParams[0]!;
      expect(title.name).toBe('title');
      expect(title.type).toBe('string');
      expect(title.required).toBe(true);

      const subtitle = cls.constructorParams[1]!;
      expect(subtitle.name).toBe('subtitle');
      expect(subtitle.type).toBe('string');
      expect(subtitle.nullable).toBe(true);
      expect(subtitle.required).toBe(false);
      expect(subtitle.default).toBe('null');

      const featured = cls.constructorParams[2]!;
      expect(featured.name).toBe('featured');
      expect(featured.type).toBe('bool');
      expect(featured.default).toBe('false');

      const items = cls.constructorParams[3]!;
      expect(items.name).toBe('items');
      expect(items.type).toBe('array');
      expect(items.default).toBe('[]');

      // Two methods: render and renderCard
      expect(cls.methods).toHaveLength(2);
      expect(cls.methods[0]!.name).toBe('render');
      expect(cls.methods[1]!.name).toBe('renderCard');

      // renderCard has a param
      expect(cls.methods[1]!.params).toHaveLength(1);
      expect(cls.methods[1]!.params[0]!.name).toBe('extra');
      expect(cls.methods[1]!.params[0]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // 3. StaticMethods
  // -----------------------------------------------------------------------
  describe('StaticMethods', () => {
    it('parses static vs instance methods with correct isStatic flag', () => {
      const meta = parsePhpSource(fixture('StaticMethods.php'), 'StaticMethods.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Alert');
      expect(cls.methods).toHaveLength(3);

      const danger = cls.methods.find((m) => m.name === 'danger')!;
      expect(danger.isStatic).toBe(true);
      expect(danger.visibility).toBe('public');
      expect(danger.params).toHaveLength(2);
      expect(danger.params[0]!.name).toBe('message');
      expect(danger.params[1]!.name).toBe('dismissible');
      expect(danger.params[1]!.default).toBe('false');

      const success = cls.methods.find((m) => m.name === 'success')!;
      expect(success.isStatic).toBe(true);

      const instance = cls.methods.find((m) => m.name === 'instanceMethod')!;
      expect(instance.isStatic).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 4. StandaloneFunctions
  // -----------------------------------------------------------------------
  describe('StandaloneFunctions', () => {
    it('parses global functions with no class', () => {
      const meta = parsePhpSource(fixture('StandaloneFunctions.php'), 'StandaloneFunctions.php');

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(2);

      const badge = meta.functions.find((f) => f.name === 'badge')!;
      expect(badge.fqn).toBe('badge');
      expect(badge.returnType).toBe('string');
      expect(badge.params).toHaveLength(2);
      expect(badge.params[0]!.name).toBe('label');
      expect(badge.params[0]!.type).toBe('string');
      expect(badge.params[1]!.name).toBe('color');
      expect(badge.params[1]!.default).toBe("'__PLACEHOLDER__'");

      const icon = meta.functions.find((f) => f.name === 'icon')!;
      expect(icon.fqn).toBe('icon');
      expect(icon.params[0]!.name).toBe('name');
      expect(icon.params[1]!.name).toBe('size');
      expect(icon.params[1]!.default).toBe('16');
    });
  });

  // -----------------------------------------------------------------------
  // 5. PromotedProps
  // -----------------------------------------------------------------------
  describe('PromotedProps', () => {
    it('parses readonly class with promoted properties', () => {
      const meta = parsePhpSource(fixture('PromotedProps.php'), 'PromotedProps.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('ProductCard');
      expect(cls.isReadonly).toBe(true);

      expect(cls.constructorParams).toHaveLength(4);

      const nameParam = cls.constructorParams[0]!;
      expect(nameParam.name).toBe('name');
      expect(nameParam.isPromoted).toBe(true);
      expect(nameParam.visibility).toBe('public');
      expect(nameParam.type).toBe('string');
      expect(nameParam.required).toBe(true);

      const priceParam = cls.constructorParams[1]!;
      expect(priceParam.name).toBe('price');
      expect(priceParam.isPromoted).toBe(true);
      expect(priceParam.visibility).toBe('public');
      expect(priceParam.type).toBe('float');

      const currencyParam = cls.constructorParams[2]!;
      expect(currencyParam.name).toBe('currency');
      expect(currencyParam.default).toBe("'__PLACEHOLDER__'");
      expect(currencyParam.visibility).toBe('public');

      const decimalsParam = cls.constructorParams[3]!;
      expect(decimalsParam.name).toBe('decimals');
      expect(decimalsParam.visibility).toBe('private');
      expect(decimalsParam.default).toBe('2');
    });
  });

  // -----------------------------------------------------------------------
  // 6. EnumComponent
  // -----------------------------------------------------------------------
  describe('EnumComponent', () => {
    it('parses backed enum with string type, cases, and methods', () => {
      const meta = parsePhpSource(fixture('EnumComponent.php'), 'EnumComponent.php');

      expect(meta.classes).toHaveLength(2);

      const color = meta.classes.find((c) => c.name === 'Color')!;
      expect(color.isEnum).toBe(true);
      expect(color.enumBackingType).toBe('string');
      expect(color.enumCases).toEqual(['Red', 'Blue', 'Green']);
      expect(color.fqn).toBe('App\\Components\\Color');

      // Enum methods
      expect(color.methods).toHaveLength(2);
      expect(color.methods[0]!.name).toBe('badge');
      expect(color.methods[1]!.name).toBe('label');
      expect(color.methods[1]!.params).toHaveLength(1);
      expect(color.methods[1]!.params[0]!.name).toBe('prefix');

      // Unit enum
      const size = meta.classes.find((c) => c.name === 'Size')!;
      expect(size.isEnum).toBe(true);
      expect(size.enumBackingType).toBeNull();
      expect(size.enumCases).toEqual(['Small', 'Medium', 'Large']);
    });
  });

  // -----------------------------------------------------------------------
  // 7. TemplateFile
  // -----------------------------------------------------------------------
  describe('TemplateFile', () => {
    it('returns empty result for file with no classes or functions', () => {
      const meta = parsePhpSource(fixture('TemplateFile.php'), 'TemplateFile.php');

      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(0);
      expect(meta.namespace).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // 8. MultipleClasses
  // -----------------------------------------------------------------------
  describe('MultipleClasses', () => {
    it('parses two classes in one file', () => {
      const meta = parsePhpSource(fixture('MultipleClasses.php'), 'MultipleClasses.php');

      expect(meta.classes).toHaveLength(2);

      const header = meta.classes.find((c) => c.name === 'Header')!;
      expect(header.constructorParams).toHaveLength(1);
      expect(header.constructorParams[0]!.name).toBe('title');
      expect(header.methods).toHaveLength(1);
      expect(header.methods[0]!.name).toBe('render');

      const footer = meta.classes.find((c) => c.name === 'Footer')!;
      expect(footer.constructorParams).toHaveLength(1);
      expect(footer.constructorParams[0]!.name).toBe('copyright');
      expect(footer.methods).toHaveLength(1);
    });
  });

  // -----------------------------------------------------------------------
  // 9. NoNamespace
  // -----------------------------------------------------------------------
  describe('NoNamespace', () => {
    it('class without namespace has fqn equal to class name', () => {
      const meta = parsePhpSource(fixture('NoNamespace.php'), 'NoNamespace.php');

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('SimpleWidget');
      expect(cls.fqn).toBe('SimpleWidget');
    });
  });

  // -----------------------------------------------------------------------
  // 10. EchoComponent
  // -----------------------------------------------------------------------
  describe('EchoComponent', () => {
    it('parses void return type', () => {
      const meta = parsePhpSource(fixture('EchoComponent.php'), 'EchoComponent.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Layout');

      const render = cls.methods.find((m) => m.name === 'render')!;
      expect(render.returnType).toBe('void');
    });
  });

  // -----------------------------------------------------------------------
  // 11. InvocableClass
  // -----------------------------------------------------------------------
  describe('InvocableClass', () => {
    it('detects __invoke method', () => {
      const meta = parsePhpSource(fixture('InvocableClass.php'), 'InvocableClass.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Greeting');
      expect(cls.constructorParams).toHaveLength(1);
      expect(cls.constructorParams[0]!.name).toBe('locale');
      expect(cls.constructorParams[0]!.default).toBe("'__PLACEHOLDER__'");

      const invoke = cls.methods.find((m) => m.name === '__invoke')!;
      expect(invoke).toBeDefined();
      expect(invoke.returnType).toBe('string');
      expect(invoke.params).toHaveLength(1);
      expect(invoke.params[0]!.name).toBe('name');
    });
  });

  // -----------------------------------------------------------------------
  // 12. NamespacedFunctions
  // -----------------------------------------------------------------------
  describe('NamespacedFunctions', () => {
    it('parses namespaced standalone functions with correct fqn', () => {
      const meta = parsePhpSource(fixture('NamespacedFunctions.php'), 'NamespacedFunctions.php');

      expect(meta.namespace).toBe('App\\Helpers');
      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(2);

      const pill = meta.functions.find((f) => f.name === 'pill')!;
      expect(pill.fqn).toBe('App\\Helpers\\pill');
      expect(pill.params).toHaveLength(2);
      expect(pill.params[0]!.name).toBe('text');
      expect(pill.params[1]!.name).toBe('outline');
      expect(pill.params[1]!.default).toBe('false');

      const tag = meta.functions.find((f) => f.name === 'tag')!;
      expect(tag.fqn).toBe('App\\Helpers\\tag');
    });
  });

  // -----------------------------------------------------------------------
  // 13. InheritedMethods
  // -----------------------------------------------------------------------
  describe('InheritedMethods', () => {
    it('parses base class, extending class, and abstract class', () => {
      const meta = parsePhpSource(fixture('InheritedMethods.php'), 'InheritedMethods.php');

      expect(meta.classes).toHaveLength(3);

      const base = meta.classes.find((c) => c.name === 'BaseComponent')!;
      expect(base.isAbstract).toBe(false);
      expect(base.methods).toHaveLength(2);
      expect(base.methods[0]!.name).toBe('render');
      expect(base.methods[0]!.visibility).toBe('public');
      expect(base.methods[1]!.name).toBe('helper');
      expect(base.methods[1]!.visibility).toBe('protected');

      const card = meta.classes.find((c) => c.name === 'Card')!;
      expect(card.extends).toBe('BaseComponent');
      expect(card.constructorParams).toHaveLength(1);

      const abstractWidget = meta.classes.find((c) => c.name === 'AbstractWidget')!;
      expect(abstractWidget.isAbstract).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 14. ObjectParams
  // -----------------------------------------------------------------------
  describe('ObjectParams', () => {
    it('parses class-typed params, enum-typed params, and new ClassName() defaults', () => {
      const meta = parsePhpSource(fixture('ObjectParams.php'), 'ObjectParams.php');

      const productDisplay = meta.classes.find((c) => c.name === 'ProductDisplay')!;
      expect(productDisplay.isReadonly).toBe(true);
      expect(productDisplay.constructorParams).toHaveLength(4);

      const name = productDisplay.constructorParams[0]!;
      expect(name.name).toBe('name');
      expect(name.type).toBe('string');

      const price = productDisplay.constructorParams[1]!;
      expect(price.name).toBe('price');
      expect(price.type).toBe('float');

      const config = productDisplay.constructorParams[2]!;
      expect(config.name).toBe('config');
      expect(config.type).toBe('ProductConfig');
      expect(config.default).toBe('new ProductConfig()');

      const status = productDisplay.constructorParams[3]!;
      expect(status.name).toBe('status');
      expect(status.type).toBe('ProductStatus');
      expect(status.default).toBe('ProductStatus::Draft');

      // Also check the enum and config class
      const productStatus = meta.classes.find((c) => c.name === 'ProductStatus')!;
      expect(productStatus.isEnum).toBe(true);
      expect(productStatus.enumBackingType).toBe('string');

      const productConfig = meta.classes.find((c) => c.name === 'ProductConfig')!;
      expect(productConfig.isReadonly).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 15. Comment stripping
  // -----------------------------------------------------------------------
  describe('Comment stripping', () => {
    it('inline comments do not break parsing', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.constructorParams).toHaveLength(2);
      expect(meta.classes[0]!.constructorParams[0]!.name).toBe('name');
      expect(meta.classes[0]!.constructorParams[1]!.name).toBe('count');
      expect(meta.classes[0]!.methods).toHaveLength(1);
    });

    it('hash comments (not attributes) are stripped', () => {
      const source = `<?php
# This is a hash comment
class Foo {
    public function bar(): void {}
}
`;
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe('Foo');
    });
  });

  // -----------------------------------------------------------------------
  // 16. String literal handling
  // -----------------------------------------------------------------------
  describe('String literal handling', () => {
    it('PHP strings containing class/function keywords do not cause false matches', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe('RealClass');
      expect(meta.functions).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // 17. Union types
  // -----------------------------------------------------------------------
  describe('Union types', () => {
    it('parses string|int union type correctly', () => {
      const source = `<?php
class UnionTest {
    public function __construct(
        private string|int $id,
        private string|null $label = null,
    ) {}
}
`;
      const meta = parsePhpSource(source, 'test.php');
      const params = meta.classes[0]!.constructorParams;

      expect(params[0]!.name).toBe('id');
      expect(params[0]!.type).toBe('string|int');
      expect(params[0]!.required).toBe(true);

      expect(params[1]!.name).toBe('label');
      expect(params[1]!.type).toBe('string|null');
      expect(params[1]!.nullable).toBe(true);
      expect(params[1]!.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 18. Nullable types
  // -----------------------------------------------------------------------
  describe('Nullable types', () => {
    it('parses ?string as nullable', () => {
      const source = `<?php
class NullableTest {
    public function __construct(
        private ?string $name,
        private ?int $age = null,
    ) {}
}
`;
      const meta = parsePhpSource(source, 'test.php');
      const params = meta.classes[0]!.constructorParams;

      expect(params[0]!.name).toBe('name');
      expect(params[0]!.type).toBe('string');
      expect(params[0]!.nullable).toBe(true);
      // ?string with no default means it's not required since it's nullable
      expect(params[0]!.required).toBe(false);

      expect(params[1]!.name).toBe('age');
      expect(params[1]!.type).toBe('int');
      expect(params[1]!.nullable).toBe(true);
      expect(params[1]!.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 19. Variadic params
  // -----------------------------------------------------------------------
  describe('Variadic params', () => {
    it('parses ...$items with isVariadic=true', () => {
      const source = `<?php
function merge(string ...$items): string {
    return implode(', ', $items);
}
`;
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.functions).toHaveLength(1);

      const param = meta.functions[0]!.params[0]!;
      expect(param.name).toBe('items');
      expect(param.type).toBe('string');
      expect(param.isVariadic).toBe(true);
      expect(param.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 20. Default values
  // -----------------------------------------------------------------------
  describe('Default values', () => {
    it('handles scalar, null, array, and class constant default patterns', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      const params = meta.classes[0]!.constructorParams;

      expect(params).toHaveLength(7);
      expect(params[0]!.default).toBe("'__PLACEHOLDER__'");
      expect(params[1]!.default).toBe('42');
      expect(params[2]!.default).toBe('3.14');
      expect(params[3]!.default).toBe('true');
      expect(params[4]!.default).toBe('null');
      expect(params[5]!.default).toBe('[1, 2, 3]');
      expect(params[6]!.default).toBe('self::DEFAULT_VALUE');
    });
  });

  // -----------------------------------------------------------------------
  // Additional edge cases
  // -----------------------------------------------------------------------
  describe('PHP 8 attributes', () => {
    it('strips attributes without affecting parsing', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.name).toBe('Controller');
      expect(meta.classes[0]!.constructorParams).toHaveLength(1);
      expect(meta.classes[0]!.constructorParams[0]!.name).toBe('query');
      expect(meta.classes[0]!.methods).toHaveLength(1);
      expect(meta.classes[0]!.methods[0]!.name).toBe('list');
    });
  });

  describe('Intersection types', () => {
    it('parses A&B intersection type', () => {
      const source = `<?php
class IntersectionTest {
    public function handle(Countable&Iterator $collection): void {}
}
`;
      const meta = parsePhpSource(source, 'test.php');
      const method = meta.classes[0]!.methods[0]!;
      expect(method.params[0]!.type).toBe('Countable&Iterator');
      expect(method.params[0]!.name).toBe('collection');
    });
  });

  describe('Trait and interface detection', () => {
    it('detects traits and interfaces', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(2);

      const renderable = meta.classes.find((c) => c.name === 'Renderable')!;
      expect(renderable).toBeDefined();
      expect(renderable.methods).toHaveLength(1);

      const hasSlug = meta.classes.find((c) => c.name === 'HasSlug')!;
      expect(hasSlug).toBeDefined();
      expect(hasSlug.methods).toHaveLength(1);
      expect(hasSlug.methods[0]!.name).toBe('slug');
    });
  });

  // -----------------------------------------------------------------------
  // Trait usage
  // -----------------------------------------------------------------------
  describe('Trait usage', () => {
    it('parses use TraitName in class body', () => {
      const meta = parsePhpSource(fixture('TraitUsage.php'), 'TraitUsage.php');

      const accordion = meta.classes.find((c) => c.name === 'Accordion')!;
      expect(accordion).toBeDefined();
      expect(accordion.traits).toEqual(['HasToggle']);
      expect(accordion.constructorParams).toHaveLength(1);
      expect(accordion.constructorParams[0]!.name).toBe('label');

      const richWidget = meta.classes.find((c) => c.name === 'RichWidget')!;
      expect(richWidget).toBeDefined();
      expect(richWidget.traits).toEqual(['HasToggle', 'HasTooltip']);
    });

    it('traits have their methods parsed', () => {
      const meta = parsePhpSource(fixture('TraitUsage.php'), 'TraitUsage.php');

      const hasToggle = meta.classes.find((c) => c.name === 'HasToggle')!;
      expect(hasToggle).toBeDefined();
      expect(hasToggle.methods).toHaveLength(1);
      expect(hasToggle.methods[0]!.name).toBe('toggle');
      expect(hasToggle.methods[0]!.params).toHaveLength(2);
      expect(hasToggle.methods[0]!.params[0]!.name).toBe('content');
      expect(hasToggle.methods[0]!.params[1]!.name).toBe('open');
    });

    it('classes using traits have empty traits when none declared', () => {
      const meta = parsePhpSource('<?php class Simple { public function render(): string { return ""; } }', 'test.php');
      expect(meta.classes[0]!.traits).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // Enum implementing interface
  // -----------------------------------------------------------------------
  describe('Enum implementing interface', () => {
    it('parses enum with implements', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      const dir = meta.classes.find((c) => c.name === 'Direction')!;
      expect(dir.isEnum).toBe(true);
      expect(dir.enumBackingType).toBe('string');
      expect(dir.implements).toContain('Renderable');
      expect(dir.enumCases).toEqual(['Up', 'Down']);
      expect(dir.methods).toHaveLength(1);
      expect(dir.methods[0]!.name).toBe('render');
    });
  });

  // -----------------------------------------------------------------------
  // Multiple classes in one file
  // -----------------------------------------------------------------------
  describe('Multiple classes with different constructors', () => {
    it('parses two classes from same file independently', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(2);

      const header = meta.classes.find((c) => c.name === 'SectionHeader')!;
      expect(header.constructorParams).toHaveLength(2);
      expect(header.constructorParams[0]!.name).toBe('title');
      expect(header.constructorParams[1]!.name).toBe('level');

      const footer = meta.classes.find((c) => c.name === 'SectionFooter')!;
      expect(footer.constructorParams).toHaveLength(2);
      expect(footer.constructorParams[0]!.name).toBe('copyright');
      expect(footer.constructorParams[1]!.name).toBe('year');
    });
  });

  // -----------------------------------------------------------------------
  // __toString / Stringable return type
  // -----------------------------------------------------------------------
  describe('Stringable class', () => {
    it('parses class implementing Stringable', () => {
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
      const meta = parsePhpSource(source, 'test.php');
      expect(meta.classes).toHaveLength(2);

      const tooltip = meta.classes.find((c) => c.name === 'Tooltip')!;
      expect(tooltip.methods).toHaveLength(1);
      expect(tooltip.methods[0]!.name).toBe('render');
      expect(tooltip.methods[0]!.returnType).toBe('HtmlFragment');
      expect(tooltip.methods[0]!.params).toHaveLength(1);
      expect(tooltip.methods[0]!.params[0]!.name).toBe('position');
      expect(tooltip.methods[0]!.params[0]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  describe('filePath is passed through', () => {
    it('returns the filePath in the result', () => {
      const meta = parsePhpSource('<?php class A {}', '/path/to/file.php');
      expect(meta.filePath).toBe('/path/to/file.php');
    });
  });

  // -----------------------------------------------------------------------
  // Final class
  // -----------------------------------------------------------------------
  describe('FinalClass', () => {
    it('parses final class with isFinal=true', () => {
      const meta = parsePhpSource(fixture('FinalClass.php'), 'FinalClass.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Avatar');
      expect(cls.isFinal).toBe(true);
      expect(cls.isAbstract).toBe(false);
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[0]!.name).toBe('name');
      expect(cls.constructorParams[0]!.type).toBe('string');
      expect(cls.constructorParams[1]!.name).toBe('size');
      expect(cls.constructorParams[1]!.type).toBe('int');
      expect(cls.constructorParams[1]!.default).toBe('48');
      expect(cls.constructorParams[2]!.name).toBe('imageUrl');
      expect(cls.constructorParams[2]!.nullable).toBe(true);
      expect(cls.constructorParams[2]!.default).toBe('null');
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe('render');
    });
  });

  // -----------------------------------------------------------------------
  // Abstract class with concrete subclasses
  // -----------------------------------------------------------------------
  describe('AbstractClass', () => {
    it('parses abstract class and concrete subclasses', () => {
      const meta = parsePhpSource(fixture('AbstractClass.php'), 'AbstractClass.php');

      expect(meta.classes).toHaveLength(3);

      const base = meta.classes.find((c) => c.name === 'BaseChip')!;
      expect(base.isAbstract).toBe(true);
      expect(base.constructorParams).toHaveLength(2);
      expect(base.constructorParams[0]!.name).toBe('label');
      expect(base.constructorParams[0]!.visibility).toBe('protected');
      expect(base.constructorParams[1]!.name).toBe('removable');
      expect(base.constructorParams[1]!.type).toBe('bool');
      expect(base.constructorParams[1]!.default).toBe('false');
      // abstract method + concrete method
      expect(base.methods).toHaveLength(2);
      const abstractMethod = base.methods.find((m) => m.name === 'cssClass')!;
      expect(abstractMethod).toBeDefined();
      const renderMethod = base.methods.find((m) => m.name === 'render')!;
      expect(renderMethod).toBeDefined();

      const info = meta.classes.find((c) => c.name === 'InfoChip')!;
      expect(info.extends).toBe('BaseChip');
      expect(info.isAbstract).toBe(false);

      const success = meta.classes.find((c) => c.name === 'SuccessChip')!;
      expect(success.extends).toBe('BaseChip');
    });
  });

  // -----------------------------------------------------------------------
  // Int-backed enum
  // -----------------------------------------------------------------------
  describe('IntBackedEnum', () => {
    it('parses int-backed enum with cases and methods', () => {
      const meta = parsePhpSource(fixture('IntBackedEnum.php'), 'IntBackedEnum.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Priority');
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe('int');
      expect(cls.enumCases).toEqual(['Low', 'Medium', 'High', 'Critical']);
      expect(cls.methods).toHaveLength(2);
      expect(cls.methods[0]!.name).toBe('badge');
      expect(cls.methods[0]!.returnType).toBe('string');
      expect(cls.methods[1]!.name).toBe('icon');
    });
  });

  // -----------------------------------------------------------------------
  // Interface with implementing class
  // -----------------------------------------------------------------------
  describe('InterfaceImpl', () => {
    it('parses interface and implementing class', () => {
      const meta = parsePhpSource(fixture('InterfaceImpl.php'), 'InterfaceImpl.php');

      expect(meta.classes).toHaveLength(2);

      const iface = meta.classes.find((c) => c.name === 'StepRenderer')!;
      expect(iface).toBeDefined();
      expect(iface.methods).toHaveLength(1);
      expect(iface.methods[0]!.name).toBe('renderStep');
      expect(iface.methods[0]!.params).toHaveLength(3);

      const stepper = meta.classes.find((c) => c.name === 'Stepper')!;
      expect(stepper.implements).toContain('StepRenderer');
      expect(stepper.constructorParams).toHaveLength(2);
      expect(stepper.constructorParams[0]!.name).toBe('current');
      expect(stepper.constructorParams[0]!.type).toBe('int');
      expect(stepper.constructorParams[1]!.name).toBe('steps');
      expect(stepper.constructorParams[1]!.type).toBe('array');
      expect(stepper.methods).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // Static factory methods
  // -----------------------------------------------------------------------
  describe('StaticFactory', () => {
    it('parses class with both static and instance methods', () => {
      const meta = parsePhpSource(fixture('StaticFactory.php'), 'StaticFactory.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Button');
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams[0]!.name).toBe('label');
      expect(cls.constructorParams[1]!.name).toBe('variant');
      expect(cls.constructorParams[2]!.name).toBe('disabled');

      expect(cls.methods).toHaveLength(3);

      const primary = cls.methods.find((m) => m.name === 'primary')!;
      expect(primary.isStatic).toBe(true);
      expect(primary.params).toHaveLength(2);
      expect(primary.params[0]!.name).toBe('label');
      expect(primary.params[1]!.name).toBe('disabled');
      expect(primary.params[1]!.default).toBe('false');

      const secondary = cls.methods.find((m) => m.name === 'secondary')!;
      expect(secondary.isStatic).toBe(true);

      const render = cls.methods.find((m) => m.name === 'render')!;
      expect(render.isStatic).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Multi-trait usage
  // -----------------------------------------------------------------------
  describe('MultiTrait', () => {
    it('parses class using multiple traits', () => {
      const meta = parsePhpSource(fixture('MultiTrait.php'), 'MultiTrait.php');

      // Two traits + one class
      expect(meta.classes).toHaveLength(3);

      const modal = meta.classes.find((c) => c.name === 'Modal')!;
      expect(modal).toBeDefined();
      expect(modal.traits).toEqual(['HasAnimation', 'HasOverlay']);
      expect(modal.constructorParams).toHaveLength(3);
      expect(modal.constructorParams[0]!.name).toBe('title');
      expect(modal.constructorParams[1]!.name).toBe('body');
      expect(modal.constructorParams[1]!.nullable).toBe(true);
      expect(modal.constructorParams[2]!.name).toBe('size');
      expect(modal.constructorParams[2]!.default).toBe("'__PLACEHOLDER__'");

      const anim = meta.classes.find((c) => c.name === 'HasAnimation')!;
      expect(anim).toBeDefined();
      expect(anim.methods).toHaveLength(1);
      expect(anim.methods[0]!.name).toBe('animate');
      expect(anim.methods[0]!.params).toHaveLength(3);
      expect(anim.methods[0]!.params[0]!.name).toBe('content');
      expect(anim.methods[0]!.params[1]!.name).toBe('effect');
      expect(anim.methods[0]!.params[2]!.name).toBe('duration');

      const overlay = meta.classes.find((c) => c.name === 'HasOverlay')!;
      expect(overlay).toBeDefined();
      expect(overlay.methods).toHaveLength(1);
      expect(overlay.methods[0]!.name).toBe('overlay');
      expect(overlay.methods[0]!.params).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // Class constants as defaults
  // -----------------------------------------------------------------------
  describe('ClassConstants', () => {
    it('parses class with self::CONSTANT defaults', () => {
      const meta = parsePhpSource(fixture('ClassConstants.php'), 'ClassConstants.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Notification');
      expect(cls.constructorParams).toHaveLength(4);

      const message = cls.constructorParams[0]!;
      expect(message.name).toBe('message');
      expect(message.type).toBe('string');
      expect(message.required).toBe(true);

      const type = cls.constructorParams[1]!;
      expect(type.name).toBe('type');
      expect(type.type).toBe('string');
      expect(type.default).toBe('self::TYPE_INFO');

      const metadata = cls.constructorParams[2]!;
      expect(metadata.name).toBe('metadata');
      expect(metadata.type).toBe('mixed');
      expect(metadata.default).toBe('null');

      const timeout = cls.constructorParams[3]!;
      expect(timeout.name).toBe('timeout');
      expect(timeout.type).toBe('int');
      expect(timeout.default).toBe('5000');
    });
  });

  // -----------------------------------------------------------------------
  // Readonly without visibility keyword
  // -----------------------------------------------------------------------
  describe('ReadonlyNoVisibility', () => {
    it('parses readonly without explicit visibility as promoted', () => {
      const meta = parsePhpSource(fixture('ReadonlyNoVisibility.php'), 'ReadonlyNoVisibility.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('ValueObject');
      expect(cls.constructorParams).toHaveLength(3);

      const id = cls.constructorParams[0]!;
      expect(id.name).toBe('id');
      expect(id.type).toBe('string');
      expect(id.isPromoted).toBe(true);
      expect(id.required).toBe(true);
      // No explicit visibility
      expect(id.visibility).toBeUndefined();

      const value = cls.constructorParams[1]!;
      expect(value.name).toBe('value');
      expect(value.type).toBe('int');
      expect(value.isPromoted).toBe(true);

      const secret = cls.constructorParams[2]!;
      expect(secret.name).toBe('secret');
      expect(secret.type).toBe('string');
      expect(secret.isPromoted).toBe(true);
      expect(secret.visibility).toBe('private');
      expect(secret.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // Mixed, iterable, callable types
  // -----------------------------------------------------------------------
  describe('MixedTypes', () => {
    it('parses mixed, iterable, and callable type params', () => {
      const meta = parsePhpSource(fixture('MixedTypes.php'), 'MixedTypes.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('DataRenderer');
      expect(cls.constructorParams).toHaveLength(3);

      const data = cls.constructorParams[0]!;
      expect(data.name).toBe('data');
      expect(data.type).toBe('mixed');
      expect(data.required).toBe(true);

      const items = cls.constructorParams[1]!;
      expect(items.name).toBe('items');
      expect(items.type).toBe('iterable');
      expect(items.default).toBe('[]');

      const formatter = cls.constructorParams[2]!;
      expect(formatter.name).toBe('formatter');
      expect(formatter.type).toBe('callable');
      expect(formatter.nullable).toBe(true);
      expect(formatter.default).toBe('null');

      // Also check static method
      expect(cls.methods).toHaveLength(2);
      const fromArray = cls.methods.find((m) => m.name === 'fromArray')!;
      expect(fromArray.isStatic).toBe(true);
      expect(fromArray.params).toHaveLength(2);
      expect(fromArray.params[0]!.type).toBe('array');
      expect(fromArray.params[1]!.name).toBe('format');
      expect(fromArray.params[1]!.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // Static + instance method combo
  // -----------------------------------------------------------------------
  describe('StaticAndInstance', () => {
    it('parses class with both static and instance methods', () => {
      const meta = parsePhpSource(fixture('StaticAndInstance.php'), 'StaticAndInstance.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Pagination');
      expect(cls.constructorParams).toHaveLength(3);

      expect(cls.constructorParams[0]!.name).toBe('total');
      expect(cls.constructorParams[0]!.type).toBe('int');
      expect(cls.constructorParams[0]!.required).toBe(true);

      expect(cls.constructorParams[1]!.name).toBe('perPage');
      expect(cls.constructorParams[1]!.default).toBe('10');

      expect(cls.constructorParams[2]!.name).toBe('current');
      expect(cls.constructorParams[2]!.default).toBe('1');

      expect(cls.methods).toHaveLength(2);

      const simple = cls.methods.find((m) => m.name === 'simple')!;
      expect(simple.isStatic).toBe(true);
      expect(simple.params).toHaveLength(2);
      expect(simple.params[0]!.name).toBe('total');
      expect(simple.params[1]!.name).toBe('current');
      expect(simple.params[1]!.default).toBe('1');

      const render = cls.methods.find((m) => m.name === 'render')!;
      expect(render.isStatic).toBe(false);
      expect(render.returnType).toBe('string');
    });
  });

  // -----------------------------------------------------------------------
  // UnionTypeParams
  // -----------------------------------------------------------------------
  describe('UnionTypeParams', () => {
    it('parses int|float union type constructor params', () => {
      const meta = parsePhpSource(fixture('UnionTypeParams.php'), 'UnionTypeParams.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Meter');
      expect(cls.constructorParams).toHaveLength(4);

      const value = cls.constructorParams[0]!;
      expect(value.name).toBe('value');
      expect(value.type).toBe('int|float');
      expect(value.required).toBe(true);

      const min = cls.constructorParams[1]!;
      expect(min.name).toBe('min');
      expect(min.type).toBe('int|float');
      expect(min.required).toBe(false);
      expect(min.default).toBe('0');

      const max = cls.constructorParams[2]!;
      expect(max.name).toBe('max');
      expect(max.type).toBe('int|float');
      expect(max.default).toBe('100');

      const render = cls.methods[0]!;
      expect(render.name).toBe('render');
      expect(render.params[0]!.name).toBe('color');
      expect(render.params[0]!.nullable).toBe(true);
      expect(render.params[0]!.type).toBe('string');
    });
  });

  // -----------------------------------------------------------------------
  // MultipleInterfaces
  // -----------------------------------------------------------------------
  describe('MultipleInterfaces', () => {
    it('parses class implementing multiple interfaces', () => {
      const meta = parsePhpSource(fixture('MultipleInterfaces.php'), 'MultipleInterfaces.php');

      // Interfaces + class
      const dropdown = meta.classes.find((c) => c.name === 'Dropdown');
      expect(dropdown).toBeDefined();
      expect(dropdown!.implements).toContain('Togglable');
      expect(dropdown!.implements).toContain('Searchable');
      expect(dropdown!.implements).toHaveLength(2);

      expect(dropdown!.constructorParams).toHaveLength(3);
      expect(dropdown!.constructorParams[0]!.name).toBe('label');
      expect(dropdown!.constructorParams[2]!.name).toBe('placeholder');
      expect(dropdown!.constructorParams[2]!.nullable).toBe(true);

      expect(dropdown!.methods).toHaveLength(2);
      const methodNames = dropdown!.methods.map((m) => m.name).sort();
      expect(methodNames).toEqual(['search', 'toggle']);
    });

    it('parses interface declarations', () => {
      const meta = parsePhpSource(fixture('MultipleInterfaces.php'), 'MultipleInterfaces.php');

      const togglable = meta.classes.find((c) => c.name === 'Togglable');
      expect(togglable).toBeDefined();

      const searchable = meta.classes.find((c) => c.name === 'Searchable');
      expect(searchable).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // GlobalFunctions (no namespace)
  // -----------------------------------------------------------------------
  describe('GlobalFunctions', () => {
    it('parses multiple functions without namespace', () => {
      const meta = parsePhpSource(fixture('GlobalFunctions.php'), 'GlobalFunctions.php');

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(0);
      expect(meta.functions).toHaveLength(3);

      const truncate = meta.functions.find((f) => f.name === 'truncate')!;
      expect(truncate.fqn).toBe('truncate');
      expect(truncate.params).toHaveLength(3);
      expect(truncate.params[0]!.type).toBe('string');
      expect(truncate.params[0]!.required).toBe(true);
      expect(truncate.params[1]!.type).toBe('int');
      expect(truncate.params[1]!.default).toBe('50');
      expect(truncate.params[2]!.type).toBe('string');
      expect(truncate.returnType).toBe('string');

      const highlight = meta.functions.find((f) => f.name === 'highlight')!;
      expect(highlight.fqn).toBe('highlight');
      expect(highlight.params).toHaveLength(3);
      expect(highlight.params[1]!.name).toBe('term');
      expect(highlight.params[1]!.required).toBe(true);

      const slugify = meta.functions.find((f) => f.name === 'slugify')!;
      expect(slugify.fqn).toBe('slugify');
      expect(slugify.params).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // VariadicConstructor
  // -----------------------------------------------------------------------
  describe('VariadicConstructor', () => {
    it('parses class with variadic constructor param', () => {
      const meta = parsePhpSource(fixture('VariadicConstructor.php'), 'VariadicConstructor.php');

      const carousel = meta.classes.find((c) => c.name === 'Carousel')!;
      expect(carousel).toBeDefined();
      expect(carousel.constructorParams).toHaveLength(3);

      const activeIndex = carousel.constructorParams[0]!;
      expect(activeIndex.name).toBe('activeIndex');
      expect(activeIndex.type).toBe('int');
      expect(activeIndex.isVariadic).toBe(false);

      const slides = carousel.constructorParams[2]!;
      expect(slides.name).toBe('slides');
      expect(slides.type).toBe('Slide');
      expect(slides.isVariadic).toBe(true);

      const render = carousel.methods.find((m) => m.name === 'render')!;
      expect(render).toBeDefined();
      const items = render.params[0]!;
      expect(items.name).toBe('items');
      expect(items.type).toBe('string');
      expect(items.isVariadic).toBe(true);
    });

    it('parses Slide class with __toString', () => {
      const meta = parsePhpSource(fixture('VariadicConstructor.php'), 'VariadicConstructor.php');

      const slide = meta.classes.find((c) => c.name === 'Slide')!;
      expect(slide).toBeDefined();
      expect(slide.constructorParams).toHaveLength(2);
      expect(slide.constructorParams[0]!.name).toBe('content');
      expect(slide.constructorParams[0]!.isPromoted).toBe(true);
      expect(slide.methods.some((m) => m.name === '__toString')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // EnumInterface
  // -----------------------------------------------------------------------
  describe('EnumInterface', () => {
    it('parses enum implementing interface', () => {
      const meta = parsePhpSource(fixture('EnumInterface.php'), 'EnumInterface.php');

      // Should find the interface and the enum
      expect(meta.classes.length).toBeGreaterThanOrEqual(2);

      const iface = meta.classes.find((c) => c.name === 'HasLabel')!;
      expect(iface).toBeDefined();

      const logLevel = meta.classes.find((c) => c.name === 'LogLevel')!;
      expect(logLevel).toBeDefined();
      expect(logLevel.isEnum).toBe(true);
      expect(logLevel.enumBackingType).toBe('string');
      expect(logLevel.implements).toContain('HasLabel');
      expect(logLevel.enumCases).toEqual(['Debug', 'Info', 'Warning', 'Error']);
    });

    it('parses enum methods including interface method', () => {
      const meta = parsePhpSource(fixture('EnumInterface.php'), 'EnumInterface.php');
      const logLevel = meta.classes.find((c) => c.name === 'LogLevel')!;

      const label = logLevel.methods.find((m) => m.name === 'label')!;
      expect(label).toBeDefined();
      expect(label.isStatic).toBe(false);
      expect(label.returnType).toBe('string');

      const badge = logLevel.methods.find((m) => m.name === 'badge')!;
      expect(badge).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // MultiTraitClass
  // -----------------------------------------------------------------------
  describe('MultiTraitClass', () => {
    it('parses class using multiple traits', () => {
      const meta = parsePhpSource(fixture('MultiTraitClass.php'), 'MultiTraitClass.php');

      const widget = meta.classes.find((c) => c.name === 'Widget')!;
      expect(widget).toBeDefined();
      expect(widget.traits).toEqual(['HasIcon', 'HasBadge']);
    });

    it('parses methods from each trait', () => {
      const meta = parsePhpSource(fixture('MultiTraitClass.php'), 'MultiTraitClass.php');

      const hasIcon = meta.classes.find((c) => c.name === 'HasIcon')!;
      expect(hasIcon).toBeDefined();
      const iconMethod = hasIcon.methods.find((m) => m.name === 'icon')!;
      expect(iconMethod).toBeDefined();
      expect(iconMethod.params).toHaveLength(2);
      expect(iconMethod.params[0]!.name).toBe('name');
      expect(iconMethod.params[1]!.name).toBe('size');
      expect(iconMethod.params[1]!.default).toBe('24');

      const hasBadge = meta.classes.find((c) => c.name === 'HasBadge')!;
      expect(hasBadge).toBeDefined();
      const badgeMethod = hasBadge.methods.find((m) => m.name === 'badge')!;
      expect(badgeMethod).toBeDefined();
      expect(badgeMethod.params).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // ArrayReturn
  // -----------------------------------------------------------------------
  describe('ArrayReturn', () => {
    it('parses class with array return type', () => {
      const meta = parsePhpSource(fixture('ArrayReturn.php'), 'ArrayReturn.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('StatsCard');

      const render = cls.methods.find((m) => m.name === 'render')!;
      expect(render).toBeDefined();
      expect(render.returnType).toBe('array');
    });
  });

  // -----------------------------------------------------------------------
  // StringableReturn
  // -----------------------------------------------------------------------
  describe('StringableReturn', () => {
    it('parses HtmlFragment with __toString and FragmentBuilder', () => {
      const meta = parsePhpSource(fixture('StringableReturn.php'), 'StringableReturn.php');

      const fragment = meta.classes.find((c) => c.name === 'HtmlFragment')!;
      expect(fragment).toBeDefined();
      expect(fragment.methods.some((m) => m.name === '__toString')).toBe(true);
      expect(fragment.methods.some((m) => m.name === 'append')).toBe(true);

      const builder = meta.classes.find((c) => c.name === 'FragmentBuilder')!;
      expect(builder).toBeDefined();
      expect(builder.constructorParams).toHaveLength(2);
      expect(builder.constructorParams[0]!.name).toBe('heading');

      const render = builder.methods.find((m) => m.name === 'render')!;
      expect(render).toBeDefined();
      expect(render.returnType).toBe('HtmlFragment');
    });
  });

  // -----------------------------------------------------------------------
  // MultiStaticMethods
  // -----------------------------------------------------------------------
  describe('MultiStaticMethods', () => {
    it('parses class with multiple static methods', () => {
      const meta = parsePhpSource(fixture('MultiStaticMethods.php'), 'MultiStaticMethods.php');

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('MarkupHelper');
      expect(cls.constructorParams).toHaveLength(0);

      const staticMethods = cls.methods.filter((m) => m.isStatic);
      expect(staticMethods).toHaveLength(3);

      const button = cls.methods.find((m) => m.name === 'button')!;
      expect(button.isStatic).toBe(true);
      expect(button.params).toHaveLength(2);
      expect(button.params[0]!.name).toBe('label');
      expect(button.params[1]!.name).toBe('variant');
      // String literals are replaced with __PLACEHOLDER__ during preprocessing
      expect(button.params[1]!.default).toBe("'__PLACEHOLDER__'");

      const link = cls.methods.find((m) => m.name === 'link')!;
      expect(link.isStatic).toBe(true);
      expect(link.params).toHaveLength(3);

      const image = cls.methods.find((m) => m.name === 'image')!;
      expect(image.isStatic).toBe(true);
      expect(image.params).toHaveLength(3);
    });
  });

  // -----------------------------------------------------------------------
  // ReadonlyClass
  // -----------------------------------------------------------------------
  describe('ReadonlyClass', () => {
    it('parses readonly class with public promoted params', () => {
      const meta = parsePhpSource(fixture('ReadonlyClass.php'), 'ReadonlyClass.php');

      expect(meta.namespace).toBe('App\\Components');
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Settings');
      expect(cls.isReadonly).toBe(true);
      expect(cls.isAbstract).toBe(false);
      expect(cls.isFinal).toBe(false);

      expect(cls.constructorParams).toHaveLength(3);

      const theme = cls.constructorParams[0]!;
      expect(theme.name).toBe('theme');
      expect(theme.type).toBe('string');
      expect(theme.isPromoted).toBe(true);
      expect(theme.visibility).toBe('public');
      expect(theme.required).toBe(false);

      const fontSize = cls.constructorParams[1]!;
      expect(fontSize.name).toBe('fontSize');
      expect(fontSize.type).toBe('int');

      const animations = cls.constructorParams[2]!;
      expect(animations.name).toBe('animations');
      expect(animations.type).toBe('bool');

      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe('render');
    });
  });

  // -----------------------------------------------------------------------
  // DefaultNewExpression
  // -----------------------------------------------------------------------
  describe('DefaultNewExpression', () => {
    it('parses classes with new expression as default value', () => {
      const meta = parsePhpSource(fixture('DefaultNewExpression.php'), 'DefaultNewExpression.php');

      expect(meta.classes).toHaveLength(2);

      const options = meta.classes[0]!;
      expect(options.name).toBe('Options');

      const widget = meta.classes[1]!;
      expect(widget.name).toBe('Widget');
      expect(widget.constructorParams).toHaveLength(3);

      const title = widget.constructorParams[0]!;
      expect(title.name).toBe('title');
      expect(title.required).toBe(true);

      const optionsParam = widget.constructorParams[1]!;
      expect(optionsParam.name).toBe('options');
      expect(optionsParam.type).toBe('Options');
      expect(optionsParam.required).toBe(false);
      expect(optionsParam.default).toBe('new Options()');

      const subtitle = widget.constructorParams[2]!;
      expect(subtitle.name).toBe('subtitle');
      expect(subtitle.nullable).toBe(true);
      expect(subtitle.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // EnumWithInterface
  // -----------------------------------------------------------------------
  describe('EnumWithInterface', () => {
    it('parses enum implementing interface', () => {
      const meta = parsePhpSource(fixture('EnumWithInterface.php'), 'EnumWithInterface.php');

      // Interface + Enum
      expect(meta.classes).toHaveLength(2);

      const iface = meta.classes[0]!;
      expect(iface.name).toBe('Renderable');

      const level = meta.classes[1]!;
      expect(level.name).toBe('Level');
      expect(level.isEnum).toBe(true);
      expect(level.enumBackingType).toBe('string');
      expect(level.enumCases).toEqual(['Low', 'Medium', 'High']);
      expect(level.implements).toContain('Renderable');
      expect(level.methods).toHaveLength(1);
      expect(level.methods[0]!.name).toBe('render');
    });
  });

  // -----------------------------------------------------------------------
  // FinalReadonlyClass
  // -----------------------------------------------------------------------
  describe('FinalReadonlyClass', () => {
    it('parses final readonly class with static method', () => {
      const meta = parsePhpSource(fixture('FinalReadonlyClass.php'), 'FinalReadonlyClass.php');

      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Coordinate');
      expect(cls.isFinal).toBe(true);
      expect(cls.isReadonly).toBe(true);
      expect(cls.isAbstract).toBe(false);

      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe('latitude');
      expect(cls.constructorParams[0]!.type).toBe('float');
      expect(cls.constructorParams[1]!.name).toBe('longitude');
      expect(cls.constructorParams[1]!.type).toBe('float');

      expect(cls.methods).toHaveLength(2);
      const render = cls.methods.find(m => m.name === 'render')!;
      expect(render.isStatic).toBe(false);

      const origin = cls.methods.find(m => m.name === 'origin')!;
      expect(origin.isStatic).toBe(true);
      expect(origin.params).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // IntersectionType
  // -----------------------------------------------------------------------
  describe('IntersectionType', () => {
    it('parses intersection type parameter', () => {
      const meta = parsePhpSource(fixture('IntersectionType.php'), 'IntersectionType.php');

      // Should have 3 class-like entries: Renderable (interface), Countable (interface), Collection (class)
      expect(meta.classes).toHaveLength(3);

      const collection = meta.classes.find(c => c.name === 'Collection')!;
      expect(collection).toBeDefined();
      expect(collection.constructorParams).toHaveLength(2);

      const sourceParam = collection.constructorParams[0]!;
      expect(sourceParam.name).toBe('source');
      expect(sourceParam.type).toBe('Renderable&Countable');
      expect(sourceParam.required).toBe(true);

      const titleParam = collection.constructorParams[1]!;
      expect(titleParam.name).toBe('title');
      expect(titleParam.type).toBe('string');
      expect(titleParam.default).toBe("'__PLACEHOLDER__'");
    });
  });

  // -----------------------------------------------------------------------
  // DnfType (Disjunctive Normal Form)
  // -----------------------------------------------------------------------
  describe('DnfType', () => {
    it('parses DNF type parameter (A&B)|C', () => {
      const meta = parsePhpSource(fixture('DnfType.php'), 'DnfType.php');

      const serializer = meta.classes.find(c => c.name === 'Serializer')!;
      expect(serializer).toBeDefined();
      expect(serializer.constructorParams).toHaveLength(2);

      const dataParam = serializer.constructorParams[0]!;
      expect(dataParam.name).toBe('data');
      // The DNF type should be captured as-is (parenthesized intersection | string)
      expect(dataParam.type).toContain('Stringable');
      expect(dataParam.type).toContain('Jsonable');
      expect(dataParam.type).toContain('string');
      expect(dataParam.required).toBe(true);

      const formatParam = serializer.constructorParams[1]!;
      expect(formatParam.name).toBe('format');
      expect(formatParam.type).toBe('string');
    });
  });

  // -----------------------------------------------------------------------
  // MixedPromotion
  // -----------------------------------------------------------------------
  describe('MixedPromotion', () => {
    it('parses class with mixed promoted and non-promoted params', () => {
      const meta = parsePhpSource(fixture('MixedPromotion.php'), 'MixedPromotion.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('FormField');
      expect(cls.constructorParams).toHaveLength(4);

      // label: public readonly string — promoted
      const label = cls.constructorParams[0]!;
      expect(label.name).toBe('label');
      expect(label.type).toBe('string');
      expect(label.isPromoted).toBe(true);
      expect(label.visibility).toBe('public');
      expect(label.required).toBe(true);

      // type: private string — promoted
      const type = cls.constructorParams[1]!;
      expect(type.name).toBe('type');
      expect(type.isPromoted).toBe(true);
      expect(type.visibility).toBe('private');
      expect(type.required).toBe(false);

      // id: ?string — NOT promoted (no visibility modifier)
      const id = cls.constructorParams[2]!;
      expect(id.name).toBe('id');
      expect(id.type).toBe('string');
      expect(id.nullable).toBe(true);
      expect(id.isPromoted).toBe(false);
      expect(id.required).toBe(false);

      // required: private bool — promoted
      const required = cls.constructorParams[3]!;
      expect(required.name).toBe('required');
      expect(required.isPromoted).toBe(true);
      expect(required.visibility).toBe('private');
    });
  });

  // -----------------------------------------------------------------------
  // NoConstructorMethods
  // -----------------------------------------------------------------------
  describe('NoConstructorMethods', () => {
    it('parses class with no constructor and multiple instance methods', () => {
      const meta = parsePhpSource(fixture('NoConstructorMethods.php'), 'NoConstructorMethods.php');

      expect(meta.namespace).toBe('App\\Components');
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Snippet');
      expect(cls.constructorParams).toHaveLength(0);
      expect(cls.methods).toHaveLength(2);

      const render = cls.methods.find(m => m.name === 'render')!;
      expect(render.isStatic).toBe(false);
      expect(render.params).toHaveLength(3);
      expect(render.params[0]!.name).toBe('code');
      expect(render.params[0]!.type).toBe('string');
      expect(render.params[0]!.required).toBe(true);
      expect(render.params[1]!.name).toBe('language');
      expect(render.params[1]!.default).toBe("'__PLACEHOLDER__'");
      expect(render.params[2]!.name).toBe('lineNumbers');
      expect(render.params[2]!.type).toBe('bool');

      const inline = cls.methods.find(m => m.name === 'inline')!;
      expect(inline.isStatic).toBe(false);
      expect(inline.params).toHaveLength(1);
      expect(inline.params[0]!.name).toBe('code');
    });
  });

  // -----------------------------------------------------------------------
  // EnumTypedParams
  // -----------------------------------------------------------------------
  describe('EnumTypedParams', () => {
    it('parses enum and class with enum-typed constructor params', () => {
      const meta = parsePhpSource(fixture('EnumTypedParams.php'), 'EnumTypedParams.php');

      expect(meta.namespace).toBe('App\\Components');
      expect(meta.classes).toHaveLength(2);

      const enumCls = meta.classes.find(c => c.name === 'Phase')!;
      expect(enumCls.isEnum).toBe(true);
      expect(enumCls.enumBackingType).toBe('string');
      expect(enumCls.enumCases).toEqual(['Draft', 'Review', 'Published']);

      const cls = meta.classes.find(c => c.name === 'EnumTransition')!;
      expect(cls.isEnum).toBe(false);
      expect(cls.constructorParams).toHaveLength(3);

      const from = cls.constructorParams[0]!;
      expect(from.name).toBe('from');
      expect(from.type).toBe('Phase');
      expect(from.required).toBe(true);

      const to = cls.constructorParams[1]!;
      expect(to.name).toBe('to');
      expect(to.type).toBe('Phase');
      expect(to.required).toBe(true);

      const label = cls.constructorParams[2]!;
      expect(label.name).toBe('label');
      expect(label.type).toBe('string');
      expect(label.required).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // NoNamespaceClass
  // -----------------------------------------------------------------------
  describe('NoNamespaceClass', () => {
    it('parses class without namespace', () => {
      const meta = parsePhpSource(fixture('NoNamespaceClass.php'), 'NoNamespaceClass.php');

      expect(meta.namespace).toBeNull();
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('NoNamespaceButton');
      expect(cls.fqn).toBe('NoNamespaceButton');
      expect(cls.constructorParams).toHaveLength(3);

      expect(cls.constructorParams[0]!.name).toBe('label');
      expect(cls.constructorParams[0]!.type).toBe('string');
      expect(cls.constructorParams[0]!.required).toBe(true);

      expect(cls.constructorParams[1]!.name).toBe('variant');
      expect(cls.constructorParams[1]!.default).toBe("'__PLACEHOLDER__'");

      expect(cls.constructorParams[2]!.name).toBe('disabled');
      expect(cls.constructorParams[2]!.type).toBe('bool');
      expect(cls.constructorParams[2]!.default).toBe('false');

      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0]!.name).toBe('render');
    });
  });

  // -----------------------------------------------------------------------
  // ConstantDefaults
  // -----------------------------------------------------------------------
  describe('ConstantDefaults', () => {
    it('parses class with self:: constant defaults', () => {
      const meta = parsePhpSource(fixture('ConstantDefaults.php'), 'ConstantDefaults.php');

      expect(meta.namespace).toBe('App\\Components');
      expect(meta.classes).toHaveLength(1);

      const cls = meta.classes[0]!;
      expect(cls.name).toBe('ConstantDefaults');
      expect(cls.constructorParams).toHaveLength(3);

      const message = cls.constructorParams[0]!;
      expect(message.name).toBe('message');
      expect(message.required).toBe(true);

      const level = cls.constructorParams[1]!;
      expect(level.name).toBe('level');
      expect(level.type).toBe('string');
      expect(level.required).toBe(false);
      expect(level.default).toBe('self::LEVEL_INFO');

      const timeout = cls.constructorParams[2]!;
      expect(timeout.name).toBe('timeout');
      expect(timeout.type).toBe('int');
      expect(timeout.default).toBe('5000');
    });
  });

  // -----------------------------------------------------------------------
  // NullableParams
  // -----------------------------------------------------------------------
  describe('NullableParams', () => {
    it('parses various nullable parameter forms', () => {
      const meta = parsePhpSource(fixture('NullableParams.php'), 'NullableParams.php');

      expect(meta.classes).toHaveLength(1);
      const cls = meta.classes[0]!;
      expect(cls.constructorParams).toHaveLength(5);

      // message: required string
      expect(cls.constructorParams[0]!.name).toBe('message');
      expect(cls.constructorParams[0]!.nullable).toBe(false);
      expect(cls.constructorParams[0]!.required).toBe(true);

      // ?string $title = null
      const title = cls.constructorParams[1]!;
      expect(title.name).toBe('title');
      expect(title.nullable).toBe(true);
      expect(title.required).toBe(false);

      // ?string $icon = null
      const icon = cls.constructorParams[2]!;
      expect(icon.name).toBe('icon');
      expect(icon.nullable).toBe(true);

      // ?int $timeout = null
      const timeout = cls.constructorParams[3]!;
      expect(timeout.name).toBe('timeout');
      expect(timeout.type).toBe('int');
      expect(timeout.nullable).toBe(true);

      // string|null $footer = null
      const footer = cls.constructorParams[4]!;
      expect(footer.name).toBe('footer');
      expect(footer.nullable).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // MultiExportClasses
  // -----------------------------------------------------------------------
  describe('MultiExportClasses', () => {
    it('parses multiple independent classes from one file', () => {
      const meta = parsePhpSource(fixture('MultiExportClasses.php'), 'MultiExportClasses.php');

      expect(meta.namespace).toBe('App\\Components');
      expect(meta.classes).toHaveLength(3);

      const header = meta.classes.find(c => c.name === 'PageHeader')!;
      expect(header.constructorParams).toHaveLength(2);
      expect(header.constructorParams[0]!.name).toBe('title');
      expect(header.methods).toHaveLength(1);
      expect(header.methods[0]!.name).toBe('render');

      const footer = meta.classes.find(c => c.name === 'PageFooter')!;
      expect(footer.constructorParams).toHaveLength(2);
      expect(footer.constructorParams[0]!.name).toBe('copyright');
      expect(footer.methods).toHaveLength(1);

      const sidebar = meta.classes.find(c => c.name === 'PageSidebar')!;
      expect(sidebar.constructorParams).toHaveLength(1);
      expect(sidebar.methods).toHaveLength(2);

      const render = sidebar.methods.find(m => m.name === 'render')!;
      expect(render.isStatic).toBe(false);
      const collapsed = sidebar.methods.find(m => m.name === 'collapsed')!;
      expect(collapsed.isStatic).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // StringableReturn2
  // -----------------------------------------------------------------------
  describe('StringableReturn2', () => {
    it('parses multiple classes including one with __toString', () => {
      const meta = parsePhpSource(fixture('StringableReturn2.php'), 'StringableReturn2.php');

      expect(meta.classes).toHaveLength(2);

      const htmlEl = meta.classes.find(c => c.name === 'HtmlElement')!;
      expect(htmlEl.constructorParams).toHaveLength(2);
      expect(htmlEl.methods).toHaveLength(1);
      expect(htmlEl.methods[0]!.name).toBe('__toString');

      const wrapper = meta.classes.find(c => c.name === 'StringableWrapper')!;
      expect(wrapper.constructorParams).toHaveLength(2);
      expect(wrapper.methods).toHaveLength(1);
      expect(wrapper.methods[0]!.name).toBe('render');
    });
  });
});
