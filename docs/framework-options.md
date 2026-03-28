# Framework Options

Configure `storybook-php` in `.storybook/main.ts` under `framework.options`.

```ts
import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
      adapter: new URL("../adapter.php", import.meta.url).pathname,
      defaultMethod: "render",
      timeout: 10000,
    },
  },
};

export default config;
```

## Available Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `bootstrap` | `string` | `undefined` | PHP file loaded before each render |
| `phpBinary` | `string` | `"php"` | PHP executable path |
| `timeout` | `number` | `5000` | Render timeout in milliseconds |
| `defaultMethod` | `string` | `undefined` | Method name used when `@method` is omitted |
| `adapter` | `string` | `undefined` | Global adapter file used to convert results into HTML |
| `typeMap` | `TypeMapConfig` | `undefined` | Advanced mapping for files, bindings, and arg metadata |

## `bootstrap`

Use `bootstrap` to prepare the PHP runtime for Storybook rendering:

- load Composer autoloaders
- register framework containers
- configure template engines
- define shared globals or helper functions

Example:

```php
<?php

require_once __DIR__ . "/vendor/autoload.php";

$GLOBALS["app_templates"] = __DIR__ . "/src/templates/";
```

## `defaultMethod`

`defaultMethod` lets you omit callable suffixes in story imports:

```ts
framework: {
  name: "storybook-php",
  options: {
    defaultMethod: "render",
  },
}
```

Then both of these imports resolve to the same callable:

```ts
import { Card } from "./Card.php";
import { Card as CardExplicit } from "./Card.php@render";
```

Once enabled, a bare `.php` import stops meaning template mode and instead resolves to the configured default method.

If you use `defaultMethod`, configure the TS plugin with the same value for consistent editor behavior:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "storybook-php/ts-plugin", "defaultMethod": "render" }]
  }
}
```

## `adapter`

Adapters customize how PHP results become HTML. This is especially useful when the callable returns a framework object instead of a plain string.

Recommended adapter signature:

```php
<?php

return function (mixed $result, string $buffered, ?object $instance, array $context): string {
    return resolveOutput($result, $buffered);
};
```

The fourth `$context` argument is optional but supported. It contains:

- `type`: the resolved callable type such as `classMethod` or `template`
- `file`: the source file path
- `args`: the story args sent from Storybook

Existing three-argument adapters remain valid.

### Laravel Blade Example

```php
<?php

use Illuminate\View\Component;

return function (mixed $result, string $buffered, ?object $instance): string {
    if ($instance instanceof Component) {
        $view = $instance->resolveView();

        if (is_string($view)) {
            return $view;
        }

        return $view->with($instance->data())->render();
    }

    return resolveOutput($result, $buffered);
};
```

### Template-Engine Adapters

For `template` mode, adapters take over rendering completely. This is how Blade, Twig, Latte, and similar engines can render files that should not be included directly.

## Per-File Adapters

Use `typeMap.files` when only some files need a custom adapter:

```ts
typeMap: {
  files: {
    "*.blade.php": {
      adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
    },
  },
}
```

Exact file matches and glob-style suffix matches can be combined. Exact-match fields win when both apply.

## `phpBinary` and `timeout`

Use `phpBinary` when PHP is not available as plain `php`:

```ts
options: {
  phpBinary: "/opt/homebrew/bin/php",
  timeout: 15000,
}
```

Raise `timeout` when your bootstrap or template engine does meaningful startup work.

## Related Guides

- [Rendering Model](rendering-model.md)
- [Type Mapping](type-mapping.md)
