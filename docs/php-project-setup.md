# PHP Project Setup

One of the goals of `storybook-php` is that you can run Storybook inside a PHP project without turning the repository into a full Node-managed app.

In practice, that means:

- you can keep using a PHP-first project layout
- you do not need to commit a local `package.json` just to start Storybook
- you can run the tooling through `npx`

You still keep Storybook config and story files in the repository. What becomes optional is a project-local Node package manifest.

## Minimal Project Layout

```text
your-php-project/
  .storybook/
    main.ts
  storybook-php.config.mjs
  src/
    Greeting.php
    Greeting.stories.ts
  bootstrap.php
```

Only these are truly required:

- `.storybook/main.ts`
- one or more `*.stories.ts` files
- the PHP files you want to render

`bootstrap.php` is optional, but common.

`storybook-php.config.mjs` is only needed when `typegen` must know about `defaultMethod` or `typeMap`.

## Minimal Storybook Config

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

If you do not need bootstrap logic yet, you can omit `bootstrap`.

## Starting Storybook With `npx`

For a PHP project with no local `package.json`, the normal start command is enough:

```bash
npx --yes storybook-php start
```

With current npm, this installs `storybook-php` and resolves the required Storybook/Vite peers for the command.

## Using Composer Scripts

In a PHP-first repository, it is often convenient to expose these commands through `composer.json`:

```json
{
  "scripts": {
    "storybook": "npx --yes storybook-php start",
    "storybook:build": "npx --yes storybook-php build",
    "storybook:typegen": "npx --yes storybook-php typegen"
  }
}
```

Then you can run:

```bash
composer storybook
composer storybook:build
composer storybook:typegen
```

## Building Static Output

```bash
npx --yes storybook-php build
```

## Generating Types

`typegen` only needs `storybook-php` itself:

```bash
npx --yes storybook-php typegen
```

It writes declaration files next to each matching source file, including exact-import outputs such as `Greeting.php@render.d.ts`.

If your Storybook setup uses `defaultMethod` or `typeMap`, pass those settings explicitly because `typegen` does not evaluate `.storybook/main.ts`:

```bash
npx --yes storybook-php typegen --options-file storybook-php.config.mjs
```

Example `storybook-php.config.mjs`:

```ts
import { fileURLToPath } from "node:url";

export default {
  _configDir: fileURLToPath(new URL("./.storybook/", import.meta.url)),
  defaultMethod: "render",
  typeMap: {
    files: {
      "../src/views/components/card.blade.php": {
        phpFile: "../src/BladeCard.php",
        callable: "render",
      },
    },
  },
};
```

`typegen` reads `defaultMethod`, `typeMap`, and `_configDir` from that file. Storybook itself still reads `.storybook/main.ts`.

## Running Storybook Tests

For the bundled test config, `test` needs these extra test packages:

```bash
npx --yes \
  --package=storybook-php \
  --package=vitest \
  --package=@storybook/addon-vitest \
  --package=@vitest/browser-playwright \
  storybook-php test
```

Also enable `@storybook/addon-vitest` in `.storybook/main.ts`.

If you provide your own `vitest.config.*`, the required ephemeral packages depend on that config instead.

In pure `npx` setups, keep two troubleshooting points in mind:

- If npm reports `ERESOLVE`, pin `vitest` and `@vitest/browser-playwright` to the same version instead of relying on floating latest tags.
- If browser-mode Vitest cannot import `@storybook/addon-vitest` setup files from npm's cache, add a custom `vitest.config.mjs` that allows the resolved addon directory through Vite's file-system allowlist.

Fallback example using `vitest.config.ts`:

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { searchForWorkspaceRoot } from "vite";

const addonVitestDir = path.dirname(
  fileURLToPath(import.meta.resolve("@storybook/addon-vitest/package.json")),
);

export default defineConfig({
  plugins: [storybookTest({ configDir: path.resolve(".storybook") })],
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), addonVitestDir],
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
```

## When To Use `--package`

`--package` is not required for normal `start`, `build`, or `typegen` usage.

Use it when:

- you want to be fully explicit about which ephemeral packages are installed
- your environment has unusual npm behavior and you want to avoid peer-resolution surprises
- you are running `test`, which needs extra test packages

Example:

```bash
npx --yes \
  --package=storybook-php \
  --package=storybook \
  --package=@storybook/builder-vite \
  --package=vite \
  storybook-php start
```

## How This Works

When `storybook-php` runs from `npx`, the CLI temporarily exposes the cached `node_modules` to the current project so Storybook can resolve its packages as if they were installed locally.

That is why this workflow works even when:

- the current PHP project has no `package.json`
- the current PHP project has no real `node_modules`

## When To Use This Style

This setup is a good fit when:

- the repository is primarily a PHP application or library
- Storybook is only used as a component preview tool
- you want to avoid introducing a full frontend dependency management layer

If the repo already has a substantial frontend toolchain, a normal local `package.json` install is usually simpler.

## When To Add `tsconfig.json`

You only need `tsconfig.json` when you want TypeScript-specific tooling, especially:

- editor completion for `.php` imports
- typed `args` in stories
- the `storybook-php/client` types
- the `storybook-php/ts-plugin`

If you are keeping the setup minimal, or you only need Storybook to run, you can skip it.

When you do want that tooling, add:

```json
{
  "compilerOptions": {
    "types": ["storybook-php/client"],
    "plugins": [{ "name": "storybook-php/ts-plugin" }]
  }
}
```

This improves completion for `.php` imports and typed story args.

If you also run `typegen`, the TS plugin and generated declaration files complement each other: the plugin gives live editor support, and `typegen` writes reusable `.d.ts` files alongside the PHP import paths.

## Related Guides

- [Getting Started](getting-started.md)
- [Framework Options](framework-options.md)
- [Testing and Types](testing-and-types.md)
