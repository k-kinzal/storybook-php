# storybook-php

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/storybook-php.svg)](https://www.npmjs.com/package/storybook-php)

A Storybook 10 framework addon that lets you develop and preview PHP components as stories. Write your UI in PHP -- classes, static methods, functions, templates, enums -- and use Storybook's controls, docs, and addons to build a living component library.

## Quick Start

```bash
npm install storybook-php storybook @storybook/builder-vite vite
```

Create `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from 'storybook';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: 'storybook-php/preset',
    options: {},
  },
};

export default config;
```

Create a PHP component (`src/Greeting.php`):

```php
<?php
class Greeting {
    public function __construct(private string $name, private string $greeting = 'Hello') {}

    public function render(): string {
        return "<h2>{$this->greeting}, {$this->name}!</h2>";
    }
}
```

Write a story (`src/Greeting.stories.ts`):

```typescript
import type { Meta, StoryObj } from 'storybook-php';
import { Greeting } from './Greeting.php@render';

const meta: Meta<typeof Greeting> = {
  component: Greeting,
  title: 'Components/Greeting',
};

export default meta;
type Story = StoryObj<typeof Greeting>;

export const Default: Story = {
  args: { name: 'World' },
};
```

Run Storybook:

```bash
npx storybook dev -p 6006
```

## Configuration

### Framework Options

Configure options in `.storybook/main.ts` under `framework.options`:

```typescript
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: 'storybook-php/preset',
    options: {
      // Path to a PHP bootstrap file (autoloader, framework config, etc.)
      bootstrap: new URL('../bootstrap.php', import.meta.url).pathname,

      // PHP binary path (default: 'php')
      phpBinary: '/usr/bin/php',

      // Render timeout in milliseconds (default: 5000)
      timeout: 5000,

      // Default method name when @method is omitted from import (default: none)
      defaultMethod: 'render',
    },
  },
};
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `bootstrap` | `string` | `undefined` | Path to a PHP file executed before each render (autoloader, config, etc.) |
| `phpBinary` | `string` | `'php'` | Path to the PHP binary |
| `timeout` | `number` | `5000` | Render timeout in milliseconds |
| `defaultMethod` | `string` | `undefined` | Method name used when `@method` is omitted from the import specifier |

## Writing Stories

### Import Syntax

PHP components are imported using a special specifier format:

```
./File.php@method
```

The `@method` suffix tells storybook-php which callable to invoke. The Vite plugin resolves the import, parses the PHP file, and generates a virtual module with argument metadata.

### Class Instance Method

The most common pattern. Constructor parameters and method parameters are merged into the story's args.

```php
<?php
class Card {
    public function __construct(
        private string $title,
        private string $body,
        private string $variant = 'default',
    ) {}

    public function render(): string {
        return "<div class=\"card card-{$this->variant}\"><h3>{$this->title}</h3><p>{$this->body}</p></div>";
    }
}
```

```typescript
import { Card } from './Card.php@render';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Components/Card',
};

export const Default: Story = {
  args: { title: 'Hello', body: 'World', variant: 'primary' },
};
```

### Static Method

No constructor is invoked. Only the static method's parameters become args.

```php
<?php
class Alert {
    public static function danger(string $message, bool $dismissible = false): string {
        $dismiss = $dismissible ? '<button class="close">&times;</button>' : '';
        return "<div class=\"alert alert-danger\">{$dismiss}{$message}</div>";
    }
}
```

```typescript
import { Alert } from './Alert.php@danger';

export const Danger: Story = {
  args: { message: 'Something went wrong!', dismissible: true },
};
```

### Standalone Function

Functions defined at the file level (not inside a class) are imported by function name.

```php
<?php
function badge(string $label, string $color = 'gray'): string {
    return "<span class=\"badge\" style=\"background: {$color};\">{$label}</span>";
}
```

```typescript
import { badge } from './badge.php@badge';

export const Default: Story = {
  args: { label: 'New', color: 'green' },
};
```

### Template File

Plain `.php` template files are imported without the `@method` suffix. Variables are extracted into the template scope from args.

```php
<?php /** @var string $title */ /** @var string $body */ ?>
<div class="card">
    <h2><?= htmlspecialchars($title ?? 'Untitled') ?></h2>
    <p><?= htmlspecialchars($body ?? '') ?></p>
</div>
```

```typescript
import CardTemplate from './templates/card.php';

const meta: Meta = {
  component: CardTemplate,
  title: 'Templates/Card',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
  },
};
```

### Invocable Class (`__invoke`)

Classes with an `__invoke` method work just like instance methods. Constructor params and `__invoke` params are merged.

```php
<?php
class Button {
    public function __construct(private string $label) {}

    public function __invoke(string $variant = 'primary'): string {
        return "<button class=\"btn btn-{$variant}\">{$this->label}</button>";
    }
}
```

```typescript
import { Button } from './Button.php@__invoke';

export const Default: Story = {
  args: { label: 'Click me', variant: 'primary' },
};
```

### Enum Method

Backed enums with methods can be used as components. A special `_case` arg selects the enum case.

```php
<?php
enum Color: string {
    case Red = 'red';
    case Blue = 'blue';

    public function swatch(): string {
        return "<div style=\"width:50px;height:50px;background:{$this->value}\"></div>";
    }
}
```

```typescript
import { Color } from './Color.php@swatch';

export const Red: Story = {
  args: { _case: 'Red' },
};
```

### Echo-Based (Void Return)

Methods that use `echo` or inline PHP (`<?= ?>`) instead of returning a string are captured via output buffering automatically.

```php
<?php
class Layout {
    public function __construct(private string $title) {}

    public function render(): void {
        ?><div class="layout">
            <h1><?= htmlspecialchars($this->title) ?></h1>
            <main><slot></slot></main>
        </div><?php
    }
}
```

```typescript
import { Layout } from './Layout.php@render';

export const Default: Story = {
  args: { title: 'My Application' },
};
```

## TypeScript Support

### Module Declarations

Add `storybook-php/client` to your `tsconfig.json` to get type support for `.php` imports:

```json
{
  "compilerOptions": {
    "types": ["storybook-php/client"]
  }
}
```

This provides ambient declarations for `*.php` and `*.php@*` module specifiers.

### TypeScript Plugin

For richer IDE support (go-to-definition, auto-complete on args), enable the TypeScript language service plugin:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "storybook-php/ts-plugin" }]
  }
}
```

### Type Generation CLI

Generate TypeScript declaration files from your PHP source files:

```bash
npx storybook-php typegen
```

This parses your PHP files and emits `.d.ts` declarations so that `args` in your stories are fully typed.

## How It Works

1. **Vite Plugin** -- The `storybook-php` Vite plugin intercepts imports matching `*.php@method`. It resolves the file, parses it with the built-in PHP parser, and generates a virtual ES module exporting a `PhpComponent` descriptor with argument metadata.

2. **PHP Parser** -- A TypeScript-based parser reads PHP source files and extracts class metadata (constructors, methods, parameters, types, defaults), standalone functions, and enum definitions. No PHP execution is needed at parse time.

3. **Dev Middleware** -- During `storybook dev`, an Express middleware handles POST requests to `/__storybook_php/render`. It receives the component type, file path, callable name, and args, then invokes the PHP binary to render HTML.

4. **PHP Runner** -- A PHP script (`src/php/render.php`) is executed as a subprocess. It includes the target file, instantiates classes or calls functions with the provided args, captures output (including echo/void methods via output buffering), and returns the HTML as JSON.

5. **Preview Renderer** -- The `renderToCanvas` function in the browser fetches rendered HTML from the dev middleware and injects it into the Storybook canvas. Script tags are re-executed to support interactive components.

## PHP Requirements

- **PHP 8.2+** is required on the machine running Storybook.
- The PHP binary must be available in `PATH` or specified via the `phpBinary` option.

### Supported Patterns

| Pattern | Import Syntax | Args Source |
| --- | --- | --- |
| Class instance method | `./File.php@render` | Constructor params + method params |
| Static method | `./File.php@danger` | Method params only |
| Standalone function | `./file.php@funcName` | Function params |
| Template file | `./file.php` (default import) | Template variables from args |
| Invocable class | `./File.php@__invoke` | Constructor params + `__invoke` params |
| Enum method | `./File.php@swatch` | `_case` + method params |

## API Reference

### `FrameworkOptions`

```typescript
interface FrameworkOptions {
  bootstrap?: string;
  phpBinary?: string;
  timeout?: number;
  defaultMethod?: string;
}
```

### `Meta<TComponent>`

Story metadata object. Accepts a `PhpComponent` type parameter for type-safe `args`.

```typescript
interface Meta<TComponent extends PhpComponent = PhpComponent> {
  component?: TComponent;
  title?: string;
  tags?: string[];
  args?: Partial<ArgsFromComponent<TComponent>>;
  argTypes?: Record<string, ArgType>;
  decorators?: Decorator[];
  parameters?: Record<string, unknown>;
  render?: (args: ArgsFromComponent<TComponent>) => string;
}
```

### `StoryObj<TComponent>`

Individual story definition.

```typescript
interface StoryObj<TComponent extends PhpComponent = PhpComponent> {
  args?: Partial<ArgsFromComponent<TComponent>>;
  argTypes?: Record<string, ArgType>;
  decorators?: Decorator[];
  parameters?: Record<string, unknown>;
  render?: (args: ArgsFromComponent<TComponent>) => string;
  name?: string;
  tags?: string[];
  play?: (context: StoryContext) => Promise<void> | void;
}
```

### `PhpComponent`

The descriptor object exported from virtual PHP modules.

```typescript
interface PhpComponent<TArgs = Record<string, unknown>> {
  __php: true;
  __type: 'classMethod' | 'staticMethod' | 'function' | 'template' | 'enumMethod';
  __file: string;
  __class: string | null;
  __callable: string | null;
  __constructorArgs: PhpArgMap;
  __callableArgs: PhpArgMap;
  __allArgs: PhpArgMap;
}
```

## Development

### Building

```bash
npm install
npm run build
```

### Running Tests

```bash
npm test
```

### Watch Mode

```bash
npm run dev        # rebuild on changes
npm run test:watch # re-run tests on changes
```

### Linting and Type Checking

```bash
npm run lint
npm run typecheck
```

### Example Projects

| Directory | Port | Description |
|-----------|------|-------------|
| `examples/basic/` | 6006 | Introductory examples — each callable type's simplest form |
| `examples/advanced/` | 6007 | Advanced OOP, design patterns, templates |
| `examples/php80/` | 6008 | PHP 8.0: union types, match, Stringable, mixed |
| `examples/php81/` | 6009 | PHP 8.1: enums, readonly, intersection types |
| `examples/php82/` | 6010 | PHP 8.2: readonly classes, DNF types |
| `examples/php83/` | 6011 | PHP 8.3: typed constants, #[Override] |
| `examples/php84/` | 6012 | PHP 8.4: property hooks, asymmetric visibility |
| `examples/php85/` | 6013 | PHP 8.5: pipe operator |
| `examples/laravel/` | 6014 | Laravel Blade components |

To run any example:

```bash
cd examples/basic  # or any other directory
npm install
npm run storybook
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm test` and `npm run typecheck`
5. Submit a pull request

## License

[MIT](LICENSE)
