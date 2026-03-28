# Type Mapping

`typeMap` supplements what `storybook-php` can infer directly from a single PHP file. Use it when you need better Storybook controls, runtime object casting, or metadata for non-PHP templates.

## Overview

`typeMap` has three sections:

- `files`: map a file path or suffix pattern to extra metadata
- `bindings`: resolve interface or abstract types to concrete classes at runtime
- `args`: override or supplement argument metadata

Example:

```ts
framework: {
  name: "storybook-php",
  options: {
    typeMap: {
      files: {
        "../src/views/components/card.blade.php": {
          args: {
            title: "string",
            body: "?string",
            featured: { type: "bool", default: false },
          },
        },
        "../src/InfoCard.php": {
          includes: ["../src/BaseCard.php"],
        },
      },
      bindings: {
        "App\\Contracts\\Renderable": "App\\View\\HtmlBlock",
      },
      args: {
        "App\\Components\\Button::$variant": {
          options: ["default", "primary", "danger"],
        },
        "App\\Components\\TagList::$tags": {
          elementType: "string",
        },
      },
    },
  },
}
```

## `typeMap.files`

`files` is build-time metadata used by the Vite plugin.

### Inline Args for Non-PHP Files

Use `args` when the source file is not a normal PHP callable but you still want Storybook controls for it:

```ts
files: {
  "../src/views/components/card.blade.php": {
    args: {
      title: "string",
      body: "?string",
      featured: { type: "bool", default: false },
    },
    adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
  },
}
```

### `phpFile` Redirects

Use `phpFile` when a non-PHP template should reuse the signature of another PHP file:

```ts
files: {
  "../src/views/components/card.blade.php": {
    phpFile: "../src/BladeCard.php",
    callable: "render",
    adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
  },
}
```

### `includes` for Cross-File Inheritance or Traits

The parser only sees the imported file directly. If parent classes or traits live elsewhere, add them with `includes` so constructor and method metadata can still be resolved:

```ts
files: {
  "../src/InfoCard.php": {
    includes: ["../src/BaseCard.php", "../src/HasBadge.php"],
  },
}
```

### Pattern Matching and Precedence

`files` supports:

- exact file paths, resolved relative to your Storybook config directory
- suffix-style patterns starting with `*`, such as `*.blade.php`

Behavior:

- the longest matching suffix wins among patterns
- exact matches override pattern fields
- exact and pattern matches are merged when both apply

## `typeMap.bindings`

`bindings` are runtime-only mappings used by the PHP runner when it needs to instantiate typed constructor or method arguments.

Typical use cases:

- interface to concrete implementation
- abstract class to concrete implementation
- nested lists of typed objects
- variadic object arguments

Example:

```ts
bindings: {
  "App\\Contracts\\Renderable": "App\\View\\HtmlBlock",
}
```

If a component expects `Renderable $content`, the runner can now instantiate `HtmlBlock` from Storybook args.

## `typeMap.args`

`args` lets you override metadata for a specific argument. Supported keys:

- `FQCN::$arg` for constructor parameters
- `FQCN::method::$arg` for method parameters

Supported override fields:

- `type`
- `options`
- `elementType`
- `nullable`
- `required`
- `default`

Examples:

```ts
args: {
  "App\\Components\\Button::$variant": {
    options: ["default", "primary", "danger"],
  },
  "App\\Components\\TagList::$tags": {
    elementType: "string",
  },
  "App\\Components\\Search::render::$limit": {
    type: "int",
    default: 10,
  },
}
```

Common reasons to use it:

- turn a plain `string` into a select control by supplying `options`
- describe array element types for runtime casting
- correct or refine inferred metadata when static parsing cannot infer enough

## Per-Story Overrides with `parameters.typeMap`

Stories can override runtime mappings:

```ts
export const PlainText: Story = {
  args: {
    content: { content: "Hello", tag: "p" },
  },
  parameters: {
    typeMap: {
      bindings: {
        "App\\Contracts\\Renderable": "App\\View\\PlainTextBlock",
      },
    },
  },
};
```

Per-story overrides only support runtime sections:

- `bindings`
- `args`

`files` cannot be overridden per story because it affects build-time module generation.

## When To Reach for `typeMap`

Use `typeMap` when:

- your Storybook component comes from Blade, Twig, Latte, or another non-PHP file
- inheritance or trait metadata lives outside the imported file
- Storybook controls need more structure than raw PHP types provide
- runtime object construction needs an interface-to-concrete mapping

For general runtime setup, see [Framework Options](framework-options.md).
