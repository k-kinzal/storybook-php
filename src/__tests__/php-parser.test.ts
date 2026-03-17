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
});
