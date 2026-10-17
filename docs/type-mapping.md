# Component Configuration and Type Mapping

Component execution and conversion of argument values have separate contracts:

- `components` describes imported components: their public args, constructors, callables, execution files, and adapters.
- `types` describes objects appearing inside those arguments: concrete type routes and property types or fixed values.

## Component configuration (`components`)

```ts
framework: {
  name: "storybook-php",
  options: {
    components: {
      files: {
        "../src/Card.php": {
          args: {
            title: "string",
            "method.limit": { type: "int", default: 10 },
          },
          callables: { compact: { args: { title: { default: "Compact" } } } },
          includes: ["../src/BaseCard.php"],
        },
        "*.blade.php": { adapter: "./blade-adapter.php" },
      },
      classes: {
        "App\\Card": { args: { badge: "App\\View\\Badge" } },
      },
    },
    types: {
      "App\\Contracts\\Renderable": "App\\View\\HtmlBlock",
      "App\\View\\Badge::$items": "list<App\\Item>",
      "App\\View\\Badge::$meta": { value: { theme: "dark" } },
    },
  },
}
```

A function component maps its arguments and calls the function. A class component maps its constructor arguments, runs the constructor, and calls the selected method with mapped method arguments. Static methods, enum methods, and templates retain their existing execution rules. Extra public args are ignored when they match neither constructor nor callable parameters.

For initialization through setters, factories, containers, or other lifecycle operations, use an [adapter](framework-options.md#adapter). The built-in class and function execution paths serve the same purpose as project adapters: connecting the public Storybook args to the component's execution contract.

### File contracts

`components.files` keys are paths or suffix patterns such as `"*.blade.php"`. Relative paths resolve from Storybook's configuration directory. An exact match overlays the longest matching suffix pattern.

Each entry supports:

| Field       | Purpose                                                    |
| ----------- | ---------------------------------------------------------- |
| `args`      | Public argument types, controls, defaults, and nullability |
| `callables` | Callable-specific `args` overrides within one file         |
| `phpFile`   | A PHP execution/type source for an imported file           |
| `callable`  | Callable to select from that PHP file                      |
| `includes`  | Additional files to parse for parent classes and traits    |
| `adapter`   | Middleware for the file or pattern                         |

A string argument override is shorthand for `{ type: "..." }`. Object overrides accept `type`, `elementType`, `options`, `nullable`, `required`, and `default`.

```ts
components: {
  files: {
    "../src/Button.php": {
      args: { variant: { options: ["primary", "secondary"] } },
    },
    "../src/List.php": {
      args: { items: { type: "array", elementType: "App\\Item" } },
    },
    "../src/card.bridge": {
      phpFile: "../src/Card.php",
      callable: "render",
    },
    "../src/notice.view": {
      args: {
        title: "string",
        featured: { type: "bool", default: false },
        note: { type: "string", nullable: true },
      },
    },
  },
}
```

Use `constructor.name` and `method.name` to disambiguate parameters with the same name. `callables.render.args` and story overrides use this same public argument surface. `options` describes control choices; runtime conversions still follow the declared PHP contract.

### Component class constructor contracts

`components.classes` supplements constructor argument definitions when a class is executed as a component. Definitions for the concrete component take precedence over entries for ancestors sharing its constructor. Explicit effective argument types from file/story contracts and generated PHPDoc metadata retain precedence; class contracts can refine otherwise untyped or plain-array parameters.

Nested objects use property mappings instead:

```ts
components: {
  classes: {
    "App\\NavMenu": { args: { sections: "list<App\\NavSection>" } },
  },
},
types: {
  "App\\NavSection::$links": "list<App\\NavLink>",
  "App\\NavLink::$href": { value: "/docs" },
},
```

Here `NavMenu` runs its constructor. Each `NavSection` and `NavLink` is allocated without running a constructor. A `components.classes` entry for either nested class would not affect these argument values.

## Type mapping (`types`)

`types` accepts exactly two kinds of key:

| Key                        | Value                                                          | Meaning                                                      |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `App\Contracts\Renderable` | `"App\\View\\HtmlBlock"` or `{ type: "App\\View\\HtmlBlock" }` | Route a type to a concrete type                              |
| `App\Card::$badge`         | `"App\\View\\Badge"` or `{ type: "App\\View\\Badge" }`         | Refine the property's type                                   |
| `App\Card::$meta`          | `{ value: { theme: "dark" } }`                                 | Replace input, including an absent input, with a fixed value |
| `App\Card::$items`         | `{ type: "list<App\\Item>", value: [] }`                       | Refine the property contract and supply its value            |

Type routes can chain; cycles are errors. Type names in this configuration are fully qualified, optionally prefixed with `\`. They are not resolved against any source file's namespace or `use` imports. Global names such as `stdClass` remain valid. Property type expressions can use lists, shapes, unions, literals, and generics with fully qualified class names.

`Class::method($param)`, `Class::__construct($param)`, and `function($param)` keys are rejected. Configure those parameters with `components.files[*].args`, `components.classes[*].args` for component constructors, or `parameters.php.component.args`.

### Property hydration rules

For objects appearing as values of constructor, method, function, or template arguments, and recursively inside those values:

1. Resolve interfaces and abstract classes through type routes.
2. Establish a property's contract from its native PHP type, then its `@var` docblock (or constructor `@param` for a promoted property), then a property type mapping. Mappings take precedence over docblocks but can only narrow the native type.
3. Allocate the concrete class with `ReflectionClass::newInstanceWithoutConstructor()`.
4. Hydrate input values against their property contracts and assign them with `ReflectionProperty::setValue()`. Public, protected, private, and inherited private properties are supported. Static properties are not instance slots.

No constructor, setter, magic setter, or factory is called. A JSON key with no corresponding property is an error. Property lookup prefers exact names and retains case/underscore-insensitive matching for input keys. Mapping property names use the PHP property name.

A scalar or positional list cannot initialize an object; there is no single-argument constructor conversion or collection-wrapper constructor fallback. An array/list contract still accepts array/list input. A generic wrapper must receive a property map such as `{ items: [{ label: "One" }] }`, rather than a bare list.

Input keys omitted from a property map are left untouched. Typed properties without declaration defaults remain uninitialized, even when promoted constructor parameters have defaults. Supply required state explicitly or use a fixed property value mapping. Declaration defaults remain PHP defaults.

Fixed property values override input and are hydrated through the property's contract. This also applies when the input omits the property. Existing PHP object instances are retained, enum values resolve by case name or backed value, and `stdClass` / `object{...}` shapes retain their existing behavior.

PHPDoc names continue to resolve through `use` imports. `@template` binds generic arguments while descending into properties. Array shapes, lists, unions, literals, and lossless conversions use the same contract pipeline. A lossy conversion fails with a slot path:

```text
Cannot hydrate App\Card::render($items)[0] > App\Item::$count: expected int, received string 'many'.
```

These rules do not populate the component's own properties. Its constructor and selected method remain its execution contract. If the same PHP class is used as a nested argument value, that value follows property hydration.

## Story overrides (`parameters.php`)

```ts
import type { PhpStoryParameters } from "storybook-php";

export const Preview = {
  args: { title: "Preview", content: { content: "Hello" } },
  parameters: {
    php: {
      component: {
        args: { "method.limit": { type: "int", default: 3 } },
      },
      types: {
        "App\\Contracts\\Renderable": "App\\View\\PlainTextBlock",
        "App\\Item::$meta": { value: { theme: "dark" } },
      },
    } satisfies PhpStoryParameters,
  },
};
```

Story component args overlay the resolved public argument surface. Story `types` overlay global `types`; a story entry replaces the entire global entry with the same key. There is no per-story nested constructor configuration.

## CLI and editor configuration

The CLI does not evaluate `.storybook/main.ts`. Pass configuration explicitly:

```sh
npx storybook-php typegen --options-file storybook-php.config.mjs
```

The file can export `components`, `types`, `defaultMethod`, and `_configDir`. Component file contracts and `defaultMethod` determine generated declarations. Runtime `types` do not rewrite the public editor argument surface. The TS plugin accepts the same component file configuration.

## Breaking changes from `typeMap`

- Move `typeMap.files` to `components.files`.
- Move component constructor entries from `typeMap.classes` to `components.classes`.
- Replace nested-class constructor entries with `types["Class::$property"]` mappings, using fully qualified names.
- Move type/property entries from `typeMap.bindings` directly into `types`.
- Replace parameter bindings with component argument contracts and defaults.
- Move `parameters.typeMap.args` to `parameters.php.component.args` and per-story bindings to `parameters.php.types`.
- Remove reliance on `stateArgs`, setters, constructor defaults for nested values, scalar constructors, and positional constructors. Use property maps or an adapter.

Old `typeMap` and `parameters.typeMap` settings are rejected. Exported configuration types are now `ComponentsConfig`, `ComponentFileConfig`, `ComponentClassConfig`, `TypeMapping`, `TypeMappings`, and `PhpStoryParameters`.

For adapters using the PHP helper API, `instantiateClassFromValue($class, $value, $types)` now takes a property map and a direct `types` map. `HydrationContext::fromTypes($types)` replaces `fromTypeMap()`. Component adapters still receive hydrated constructor/method/template args and can provide custom execution when needed.
