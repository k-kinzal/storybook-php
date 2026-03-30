# storybook-php

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/storybook-php.svg)](https://www.npmjs.com/package/storybook-php)

A Storybook framework addon for developing and previewing PHP components as stories.

## Supported Versions

- PHP 8.0-8.5
- Storybook 10.x
- Vite 5.x-8.x
- Node.js 20.19+

## Quick Start

`.storybook/main.ts`:

```typescript
import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {},
  },
};

export default config;
```

`src/Greeting.php`:

```php
<?php
class Greeting {
    public function __construct(private string $name, private string $greeting = 'Hello') {}

    public function render(): string {
        return "<h2>{$this->greeting}, {$this->name}!</h2>";
    }
}
```

`src/Greeting.stories.ts`:

```typescript
import type { Meta, StoryObj } from "storybook-php";
import { Greeting } from "./Greeting.php@render";

const meta: Meta<typeof Greeting> = {
  component: Greeting,
  title: "Components/Greeting",
};

export default meta;
type Story = StoryObj<typeof Greeting>;

export const Default: Story = {
  args: { name: "World" },
};
```

```bash
npx storybook-php start
```

## npx storybook-php

| Command                                                      | Description                                      |
| ------------------------------------------------------------ | ------------------------------------------------ |
| `npx storybook-php start [storybook opts]`                  | Start the Storybook dev server                   |
| `npx storybook-php build [storybook opts]`                  | Build static Storybook output                    |
| `npx storybook-php test [vitest opts]`                      | Run Storybook tests through `vitest run`         |
| `npx storybook-php typegen [dirs...] [--options-file path]` | Generate declaration files for PHP import paths  |

`start` and `build` accept the same options as the `storybook` CLI (e.g. `-p 6006`).
`test` passes arguments through to `vitest run`.

`typegen` defaults to the `src` directory when no directories are specified. It writes declaration files next to the source import path, including exact-import outputs such as `Button.php@render.d.ts`. When `defaultMethod` resolves, the bare `Button.php.d.ts` output mirrors that callable; otherwise a bare import remains template-shaped.

If your type generation depends on `defaultMethod` or `typeMap`, pass them through `--options-file` because `typegen` does not read `.storybook/main.ts`. The options file can be JSON or a JS module and may also provide `_configDir` for relative path resolution.

For PHP-first repositories that do not want to add a local `package.json`, see [PHP Project Setup](docs/php-project-setup.md) for the `npx`-based setup.

## Testing

```bash
npx --package=storybook-php --package=vitest \
    --package=@storybook/addon-vitest \
    --package=@vitest/browser-playwright \
    storybook-php test
```

Add `@storybook/addon-vitest` to `.storybook/main.ts`:

```typescript
const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  // ...
};
```

If your project does not define `vitest.config.*` and you do not pass `--config`, the bundled Vitest config is used automatically. To customize, create your own `vitest.config.*`.

## Import Syntax

PHP components are imported with the `./File.php@method` specifier. The `@method` suffix tells storybook-php which callable to invoke. Constructor parameters and method parameters are merged into the story's args.

| Pattern                      | Import Syntax                 | Args Source                            |
| ---------------------------- | ----------------------------- | -------------------------------------- |
| Class instance method        | `./File.php@render`           | Constructor params + method params     |
| Static method                | `./File.php@danger`           | Method params only                     |
| Standalone function          | `./file.php@funcName`         | Function params                        |
| Invocable class              | `./File.php@__invoke`         | Constructor params + `__invoke` params |
| Enum method                  | `./File.php@swatch`           | `_case` + method params                |
| Template file                | `./file.php` (default import) | Template variables from args           |
| Mapped non-PHP import source | `./card.blade.php`            | `typeMap.files` decides the public API |

Methods that use `echo` instead of returning a string are captured via output buffering automatically.

Non-PHP sources such as Blade, Twig, or Latte are supported through `framework.options.typeMap.files`. Those mappings can provide public args, redirect execution to a PHP file, select a callable, include extra files for analysis, and attach adapter middleware.

## Configuration

Configure in `.storybook/main.ts` under `framework.options`:

| Option          | Type     | Default     | Description                                                                |
| --------------- | -------- | ----------- | -------------------------------------------------------------------------- |
| `bootstrap`     | `string` | `undefined` | Path to a PHP file executed before each render (autoloader, config, etc.)  |
| `phpBinary`     | `string` | `'php'`     | Path to the PHP binary                                                     |
| `timeout`       | `number` | `5000`      | Render timeout in milliseconds                                             |
| `defaultMethod` | `string` | `undefined` | Method name used when `@method` is omitted from the import specifier       |
| `adapter`       | `string` | `undefined` | Path to a PHP adapter file for custom output handling (e.g. Laravel Blade) |
| `typeMap`       | `object` | `undefined` | File mappings, callable overrides, and runtime type bindings               |

The adapter file must return middleware compatible with `fn(array $context, callable $next): array|string`

Relative option paths are resolved from Storybook's config directory. `defaultMethod` and `typeMap` also affect module resolution, TS plugin output, and `typegen` when you pass them through `--options-file`.

## TypeScript Support

Add to `tsconfig.json` for type support on `.php` imports and IDE integration:

```json
{
  "compilerOptions": {
    "types": ["storybook-php/client"],
    "plugins": [{ "name": "storybook-php/ts-plugin" }]
  }
}
```

This gives editor support for `.php` imports without requiring generated files.

To generate declaration files on disk:

```bash
npx storybook-php typegen
```

`typegen` writes both bare-import and exact-import declarations when they resolve:

- `Button.php.d.ts`
- `Button.php@render.d.ts`

For advanced setups, load `defaultMethod` and `typeMap` from a separate file:

```bash
npx storybook-php typegen --options-file storybook-php.config.mjs
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [PHP Project Setup](docs/php-project-setup.md)
- [Rendering Model](docs/rendering-model.md)
- [Framework Options](docs/framework-options.md)
- [Type Mapping](docs/type-mapping.md)
- [Testing and Types](docs/testing-and-types.md)

## License

[MIT](LICENSE)
