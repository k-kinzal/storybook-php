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

| Option          | Type            | Default     | Description                                            |
| --------------- | --------------- | ----------- | ------------------------------------------------------ |
| `bootstrap`     | `string`        | `undefined` | PHP file loaded before each render                     |
| `phpBinary`     | `string`        | `"php"`     | PHP executable path                                    |
| `timeout`       | `number`        | `5000`      | Render timeout in milliseconds                         |
| `defaultMethod` | `string`        | `undefined` | Method name used when `@method` is omitted             |
| `adapter`       | `string`        | `undefined` | Global adapter middleware wrapped around PHP execution |
| `typeMap`       | `TypeMapConfig` | `undefined` | Advanced mapping for files, bindings, and arg metadata |

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

Adapters are PHP middleware around the core executor. They can:

- rewrite Storybook args before PHP reflection/template execution
- delegate to the next adapter or terminate the chain
- wrap or replace the final HTML response

This is especially useful when the target runtime has its own input/output model, such as Blade, Twig, Latte, or framework view objects.

Recommended adapter signature:

```php
<?php

return static function (array $context, callable $next): array|string {
    $response = $next($context);

    return [
        ...$response,
        'html' => resolveOutput($response['result'] ?? null, (string) ($response['buffered'] ?? '')),
    ];
};
```

`$context` contains:

- `type`: the resolved callable type such as `classMethod` or `template`
- `file`: the original imported file path
- `executionFile`: the PHP file that will actually execute
- `class`: resolved PHP class name when applicable
- `callable`: resolved method/function name when applicable
- `args`: the story args sent from Storybook
- `publicArgDefs`, `constructorArgDefs`, `callableArgDefs`: resolved arg definitions
- `typeMap`: runtime bindings used during casting

`$next($context)` returns a response envelope with:

- `html`: current HTML payload
- `result`: raw PHP return value from the core executor
- `buffered`: captured output buffer
- `instance`: constructed object for instance methods
- `args`, `constructorArgs`, `methodArgs`: resolved input snapshots

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
use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\View\Factory as ViewFactory;
use Illuminate\View\Component;

return static function (array $context, callable $next): array {
    $factory = Container::getInstance()->make(ViewFactory::class);

    if (($context['type'] ?? null) === 'template') {
        return [
            'html' => $factory->file($context['file'], resolveTemplateContextArgs($context))->render(),
        ];
    }

    $response = $next($context);
    $instance = $response['instance'] ?? null;

    if ($instance instanceof Component) {
        $view = $instance->resolveView();

        if ($view instanceof Closure) {
            $view = $view($instance->data());
        }

        if ($view instanceof ViewContract) {
            return [...$response, 'html' => $view->with($instance->data())->render()];
        }

        if (is_string($view)) {
            return [...$response, 'html' => $factory->make($view, $instance->data())->render()];
        }

        return [...$response, 'html' => (string) $view];
    }

    return $response;
};
```

### Template-Engine Adapters

For `template` mode, adapters can take over rendering completely by returning HTML without calling `next`. This is how Blade, Twig, Latte, and similar engines can render files that should not be included directly.

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
