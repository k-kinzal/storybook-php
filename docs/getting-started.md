# Getting Started

This guide explains how to install and use `storybook-php` to preview PHP-rendered UI pieces inside Storybook.

## Requirements

- PHP 8.0-8.5
- Node.js 20.19+
- Storybook 10.x
- Vite 5.x-8.x
- A `php` binary available on your `PATH`, or a custom `phpBinary` configured in Storybook

## Installation

Install the framework addon and its required Storybook/Vite packages:

```bash
npm install -D storybook storybook-php @storybook/builder-vite vite
```

If your project already has Storybook 10 with the Vite builder, add `storybook-php` on top of that setup.

## Storybook Configuration

Add the framework to `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
    },
  },
};

export default config;
```

`bootstrap` is optional, but most real projects use it to load Composer autoloaders, framework containers, template engines, or application config.

## First Component

Create a PHP component:

```php
<?php

class Greeting
{
    public function __construct(
        private string $name,
        private string $greeting = "Hello",
    ) {}

    public function render(): string
    {
        return "<h2>{$this->greeting}, {$this->name}!</h2>";
    }
}
```

Create the story:

```ts
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

The import suffix `@render` tells `storybook-php` which PHP callable to execute. Constructor parameters and method parameters are merged into a single Storybook args object.

## Running Storybook

Start the dev server:

```bash
npx storybook-php start
```

Other supported commands:

- `npx storybook-php build`
- `npx storybook-php test`
- `npx storybook-php typegen`
- `npx storybook-php typegen --options-file storybook-php.config.mjs`

`start` and `build` accept the same options as the regular Storybook CLI. `test` passes arguments through to `vitest run`.

If you want to use `storybook-php` from a PHP-first repository without a local `package.json`, see [PHP Project Setup](php-project-setup.md).

## TypeScript Support

If you want richer TypeScript editor support, add the client types and TS plugin to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["storybook-php/client"],
    "plugins": [{ "name": "storybook-php/ts-plugin" }]
  }
}
```

This is optional. It improves IDE support for `.php` imports and gives your stories typed `args` based on parsed PHP signatures.

If you want declaration files on disk, run:

```bash
npx storybook-php typegen
```

That command writes bare-import and exact-import declarations next to the source file, for example:

- `Greeting.php.d.ts`
- `Greeting.php@render.d.ts`

If your setup relies on `defaultMethod` or `typeMap`, pass those settings to `typegen` with `--options-file`. The CLI does not read `.storybook/main.ts`.

## Next Steps

- [Rendering Model](rendering-model.md): import patterns, args, and runtime behavior
- [PHP Project Setup](php-project-setup.md): running from a PHP project via `npx` without a local `package.json`
- [Framework Options](framework-options.md): bootstrap, adapters, default methods, and runtime configuration
- [Type Mapping](type-mapping.md): advanced metadata for templates, interfaces, and controls
- [Testing and Types](testing-and-types.md): `typegen`, Vitest integration, and editor support
