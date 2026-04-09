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

Relative paths in these options are resolved from Storybook's config directory.

## Available Options

| Option          | Type            | Default     | Description                                            |
| --------------- | --------------- | ----------- | ------------------------------------------------------ |
| `bootstrap`     | `string`        | `undefined` | PHP file loaded before each render                     |
| `phpBinary`     | `string`        | `"php"`     | PHP executable path                                    |
| `timeout`       | `number`        | `5000`      | Render timeout in milliseconds                         |
| `defaultMethod` | `string`        | `undefined` | Method name used when `@method` is omitted             |
| `adapter`       | `string`        | `undefined` | Global adapter middleware wrapped around PHP execution |
| `typeMap`       | `TypeMapConfig` | `undefined` | Advanced mapping for files, bindings, and arg metadata |

`bootstrap`, `phpBinary`, `timeout`, and `adapter` affect runtime rendering. `defaultMethod` and `typeMap` also affect import resolution, TS plugin output, and `typegen` when you pass them through `--options-file`.

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

For `typegen`, pass the same setting through `--options-file`; the CLI does not read `.storybook/main.ts`.

## `adapter`

Adapters are PHP middleware around the core executor. They can:

- rewrite public Storybook args before PHP reflection/template execution
- read hydrated execution inputs from `templateArgs`, `constructorArgs`, and `methodArgs`
- delegate to the next adapter or terminate the chain
- wrap or replace the final HTML response

This is especially useful when the target runtime has its own input/output model, such as Blade, Twig, Latte, or framework view objects.

Recommended adapter signature:

```php
<?php

return static function (array $context, callable $next): array|string {
    $response = $next($context);

    return array_merge($response, [
        'html' => resolveOutput($response['result'] ?? null, (string) ($response['buffered'] ?? '')),
    ]);
};
```

`$context` contains:

- `type`: the resolved callable type such as `classMethod` or `template`
- `file`: the original imported file path
- `executionFile`: the PHP file that will actually execute
- `class`: resolved PHP class name when applicable
- `callable`: resolved method/function name when applicable
- `publicArgs`: the story args sent from Storybook
- `templateArgs`: hydrated template variables for template imports
- `constructorArgs`: hydrated constructor arguments for instance methods
- `methodArgs`: hydrated method/function arguments
- `publicArgDefs`, `constructorArgDefs`, `callableArgDefs`: resolved arg definitions
- `typeMap`: runtime bindings used during casting

`$next($context)` returns a response envelope with:

- `html`: current HTML payload
- `result`: raw PHP return value from the core executor
- `buffered`: captured output buffer
- `instance`: constructed object for instance methods
- `publicArgs`, `templateArgs`, `constructorArgs`, `methodArgs`: input snapshots used for execution

Returning a plain string is shorthand for `['html' => '...']`. If an adapter does not call `next`, it becomes the terminal renderer.

### Execution Order

Middleware wraps from least specific to most specific:

1. global `framework.options.adapter`
2. matching `typeMap.files` pattern adapters, from shortest suffix to longest suffix
3. exact `typeMap.files["/exact/path"]` adapter
4. per-request adapter overrides
5. the built-in core executor

Request flows in that order and the response unwinds in reverse.

### Laravel Blade Example

```php
<?php

use Illuminate\Container\Container;
use Illuminate\View\Factory as ViewFactory;

return static function (array $context, callable $next): array {
    $factory = Container::getInstance()->make(ViewFactory::class);
    $templateArgs = $context['templateArgs'] ?? [];
    $templateFile = realpath((string) ($context['file'] ?? '')) ?: (string) ($context['file'] ?? '');

    foreach ($factory->getFinder()->getPaths() as $viewPath) {
        $resolvedViewPath = realpath($viewPath) ?: $viewPath;
        $normalizedViewPath = rtrim($resolvedViewPath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        if (!str_starts_with($templateFile, $normalizedViewPath)) {
            continue;
        }

        $relativeViewPath = substr($templateFile, strlen($normalizedViewPath));
        $viewName = preg_replace('/\\.blade\\.php$/', '', str_replace(DIRECTORY_SEPARATOR, '.', $relativeViewPath));

        if (is_string($viewName) && $viewName !== '') {
            return [
                'html' => $factory->make($viewName, $templateArgs)->render(),
            ];
        }
    }

    return [
        'html' => $factory->file($templateFile, $templateArgs)->render(),
    ];
};
```

This adapter is terminal middleware for direct Blade imports. It does not call `next()`.

If you also want to adapt `Illuminate\View\Component` classes, keep that as a separate middleware that calls `next()` first and then rewrites the HTML based on the constructed instance.

### Template-Engine Adapters

For `template` mode, adapters can take over rendering completely by reading `$context['templateArgs']` and returning HTML without calling `next`. This is how Blade, Twig, Latte, and similar engines can render files that should not be included directly.

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

## `typeMap`

`typeMap` is shared by build-time resolution and runtime casting:

- `typeMap.files` controls how imported files map to public args, PHP execution files, callable selection, includes, and file-scoped adapters
- `typeMap.bindings` provides runtime-only interface or abstract-type bindings used while hydrating PHP objects

For the full schema, merging rules, and story-level overrides, see [Type Mapping](type-mapping.md).

If you use `typeMap` with `typegen`, load it through `--options-file` because `typegen` does not evaluate your Storybook config.

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
- [Testing and Types](testing-and-types.md)
