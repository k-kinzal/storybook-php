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

| Option          | Type                     | Default     | Description                                                   |
| --------------- | ------------------------ | ----------- | ------------------------------------------------------------- |
| `bootstrap`     | `string`                 | `undefined` | PHP file loaded before each render                            |
| `phpBinary`     | `string`                 | `"php"`     | PHP executable path                                           |
| `phpOptions`    | `string[]`               | `[]`        | CLI options prepended to the PHP binary invocation            |
| `phpEnv`        | `Record<string, string>` | `undefined` | Environment variables merged over `process.env`               |
| `timeout`       | `number`                 | `5000`      | Render timeout in milliseconds                                |
| `defaultMethod` | `string`                 | `undefined` | Method name used when `@method` is omitted                    |
| `adapter`       | `string`                 | `undefined` | Global adapter middleware wrapped around PHP execution        |
| `components`    | `ComponentsConfig`       | `undefined` | Component file contracts, constructor contracts, and adapters |
| `types`         | `TypeMappings`           | `undefined` | Type routes and property type/value mappings                  |

`bootstrap`, `phpBinary`, `phpOptions`, `phpEnv`, `timeout`, and `adapter` affect runtime rendering. `defaultMethod` and `components` also affect import resolution, TS plugin output, and `typegen` when you pass them through `--options-file`.

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
        'html' => \StorybookPhp\Runtime\Transport\resolveOutput($response['result'] ?? null, (string) ($response['buffered'] ?? '')),
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
- `components`: constructor contracts for component classes
- `types`: runtime type routes and property mappings for argument values

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
2. matching `components.files` pattern adapters, from shortest suffix to longest suffix
3. exact `components.files["/exact/path"]` adapter
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

Use `components.files` when only some files need a custom adapter:

```ts
components: {
  files: {
    "*.blade.php": {
      adapter: new URL("../blade-adapter.php", import.meta.url).pathname,
    },
  },
}
```

Exact file matches and glob-style suffix matches can be combined. Exact-match fields win when both apply.

## `components` and `types`

`components.files` defines the public args, execution file, callable, includes, and adapter for each imported file or suffix pattern. `components.classes` supplies constructor argument contracts only for a class executed as a component. Neither setting defines the properties of nested objects.

`types` maps fully qualified type names to concrete types, or `Class::$property` keys to types and fixed values. It applies to objects inside constructor, method, function, and template arguments. These objects are allocated without constructors and populated through Reflection, including inherited private properties. Method and function parameter keys are not accepted.

Per-story configuration uses `parameters.php.component.args` and `parameters.php.types`. Story type mappings replace global entries with the same key. To change an argument type or default, use the component argument contract.

See [Component Configuration and Type Mapping](type-mapping.md) for contracts, precedence, and migration examples. For `typegen`, pass `components`, `defaultMethod`, and `_configDir` through `--options-file`; the CLI does not evaluate `.storybook/main.ts`.
