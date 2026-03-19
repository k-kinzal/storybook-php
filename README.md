# storybook-php

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/storybook-php.svg)](https://www.npmjs.com/package/storybook-php)

A Storybook framework addon for developing and previewing PHP components as stories.

## Quick Start

`.storybook/main.ts`:

```typescript
import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php/preset",
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

`npx` で直接実行できます:

```bash
npx storybook-php start
```

プロジェクトの依存として追加する場合:

```bash
npm install storybook-php storybook @storybook/builder-vite vite
```

## npx storybook-php

| Command                               | Description                          |
| ------------------------------------- | ------------------------------------ |
| `npx storybook-php start [opts]`      | Start Storybook dev server           |
| `npx storybook-php build [opts]`      | Build static Storybook               |
| `npx storybook-php test [opts]`       | Run tests via vitest                 |
| `npx storybook-php typegen [dirs...]` | Generate .d.ts files for PHP sources |

`start` and `build` accept the same options as the `storybook` CLI (e.g. `-p 6006`).

## Import Syntax

PHP components are imported with the `./File.php@method` specifier. The `@method` suffix tells storybook-php which callable to invoke. Constructor parameters and method parameters are merged into the story's args.

| Pattern               | Import Syntax                 | Args Source                            |
| --------------------- | ----------------------------- | -------------------------------------- |
| Class instance method | `./File.php@render`           | Constructor params + method params     |
| Static method         | `./File.php@danger`           | Method params only                     |
| Standalone function   | `./file.php@funcName`         | Function params                        |
| Invocable class       | `./File.php@__invoke`         | Constructor params + `__invoke` params |
| Enum method           | `./File.php@swatch`           | `_case` + method params                |
| Template file         | `./file.php` (default import) | Template variables from args           |

Methods that use `echo` instead of returning a string are captured via output buffering automatically.

## Configuration

Configure in `.storybook/main.ts` under `framework.options`:

| Option          | Type     | Default     | Description                                                                |
| --------------- | -------- | ----------- | -------------------------------------------------------------------------- |
| `bootstrap`     | `string` | `undefined` | Path to a PHP file executed before each render (autoloader, config, etc.)  |
| `phpBinary`     | `string` | `'php'`     | Path to the PHP binary                                                     |
| `timeout`       | `number` | `5000`      | Render timeout in milliseconds                                             |
| `defaultMethod` | `string` | `undefined` | Method name used when `@method` is omitted from the import specifier       |
| `adapter`       | `string` | `undefined` | Path to a PHP adapter file for custom output handling (e.g. Laravel Blade) |

The adapter file must return a callable: `fn(mixed $result, string $buffered, ?object $instance): string`

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

To generate `.d.ts` declarations from PHP source files:

```bash
npx storybook-php typegen
```

## License

[MIT](LICENSE)
