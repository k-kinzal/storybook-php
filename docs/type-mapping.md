# Type Mapping

`typeMap` fills in the parts that static PHP parsing cannot infer on its own. Use it to define the public Storybook args surface, redirect non-PHP imports to PHP type sources, and resolve runtime bindings for interfaces and abstract types.

## Overview

`typeMap` now has two build-time/runtime sections:

- `files`: file- or pattern-scoped component metadata
- `bindings`: runtime PHP type bindings

Per-story overrides live in `parameters.typeMap` and use the same public `args` shape as `typeMap.files[*].args`.

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
          adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
        },
        "../src/SearchCard.php": {
          callables: {
            render: {
              args: {
                "method.limit": { type: "int", default: 10 },
              },
            },
          },
        },
      },
      bindings: {
        "App\\Contracts\\Renderable": "App\\View\\HtmlBlock",
      },
    },
  },
}
```

## `typeMap.files`

`files` is the build-time source of truth for imported components. Each entry can target:

- an exact file path, resolved relative to your Storybook config directory
- a suffix pattern starting with `*`, such as `*.blade.php`

Supported fields:

- `args`: define or refine the public Storybook args surface
- `callables`: callable-specific `args` overrides for PHP files with multiple callables
- `phpFile`: reuse another PHP file as the execution/type source
- `callable`: force the callable used by `phpFile` redirects or mapped imports
- `includes`: extra PHP files to parse for inheritance / trait metadata
- `adapter`: adapter middleware for this file or pattern

### Public Args Surface

`args` always describes the public Storybook args surface, regardless of whether the source is:

- a Blade/Twig/Latte template
- a PHP class constructor
- a PHP method or function

Examples:

```ts
files: {
  "../src/views/components/card.blade.php": {
    args: {
      title: "string",
      body: "?string",
      featured: { type: "bool", default: false },
    },
  },
  "../src/Button.php": {
    args: {
      variant: {
        options: ["default", "primary", "danger"],
      },
    },
  },
}
```

### `constructor.` / `method.` Keys

When a callable-backed component needs separate public inputs for constructor and invoked-method parameters with the same name, use namespaced public keys:

```ts
files: {
  "../src/Card.php": {
    callables: {
      render: {
        args: {
          "constructor.title": "string",
          "method.title": "?string",
        },
      },
    },
  },
}
```

Flat keys stay the default. Use namespaced keys only when you need to split the public surface.

### Callable-Specific Overrides

Use `callables` when one PHP file exports multiple callable stories and they need different public args:

```ts
files: {
  "../src/SearchCard.php": {
    callables: {
      render: {
        args: {
          query: "string",
          "method.limit": { type: "int", default: 10 },
        },
      },
      preview: {
        args: {
          compact: { type: "bool", default: true },
        },
      },
    },
  },
}
```

### Non-PHP Templates

For Blade or other non-PHP templates, `args` can define the entire public contract directly:

```ts
files: {
  "../src/views/components/card.blade.php": {
    args: {
      title: "string",
      content: {
        type: "App\\Contracts\\Renderable",
        required: true,
      },
    },
    adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
  },
}
```

That adapter can be a terminal middleware that renders the template engine directly and returns HTML without calling `next`.

### `phpFile` Redirects

Use `phpFile` when a non-PHP import should reuse a PHP callable's signature and runtime plan:

```ts
files: {
  "../src/views/components/card.blade.php": {
    phpFile: "../src/BladeCard.php",
    callable: "render",
    adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
  },
}
```

### `includes`

If parent classes or traits live in other files, list them with `includes` so parsing can still resolve constructor and method metadata:

```ts
files: {
  "../src/InfoCard.php": {
    includes: ["../src/BaseCard.php", "../src/HasBadge.php"],
  },
}
```

### Pattern Matching and Precedence

Behavior:

- the longest matching suffix wins among patterns
- exact matches override pattern fields
- exact and pattern matches are merged when both apply

## `typeMap.bindings`

`bindings` are runtime-only mappings used when the PHP runner instantiates typed constructor or method arguments.

Typical use cases:

- interface -> concrete implementation
- abstract class -> concrete implementation
- nested typed collections
- variadic object arguments

```ts
bindings: {
  "App\\Contracts\\Renderable": "App\\View\\HtmlBlock",
}
```

## Per-Story Overrides with `parameters.typeMap`

Per-story overrides use the same public `args` shape as `typeMap.files[*].args`.

```ts
export const Custom = {
  args: {
    title: "Preview",
  },
  parameters: {
    typeMap: {
      args: {
        "method.title": "?string",
        subtitle: { nullable: true },
      },
      bindings: {
        "App\\Contracts\\Renderable": "App\\View\\PlainTextBlock",
      },
    },
  },
};
```

Story-level `args` overrides are runtime-only. They affect runtime casting and adapter input mapping for that story, but they do not regenerate module types or Storybook controls.

## When To Reach for `typeMap`

Use `typeMap` when:

- your component comes from Blade, Twig, Latte, or another non-PHP file
- inheritance or traits live outside the imported file
- Storybook controls need options, defaults, element types, or nullable hints
- runtime object construction needs interface-to-concrete bindings
- one PHP file exposes multiple callable stories with different public args

For general runtime setup, see [Framework Options](framework-options.md).
