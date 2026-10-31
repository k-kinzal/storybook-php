# Testing and Types

`storybook-php` includes tooling for TypeScript editor support, generated declaration files, and Storybook test runs.

## Repository development and CI

Use the Node version in `.nvmrc` (24.22.1) for repository development. The root
toolchain uses Vite Plus 1.4.0 and Vitest / coverage-v8 5.0.5. The examples retain
their separate Vitest 4 environment for the visual comparison plugins. These
development versions do not change the addon's public Node compatibility range.

The eMudhra fixes are in [Vite Plus 1.4.0](https://github.com/voidzero-dev/vite-plus/releases/tag/v1.4.0)
and [Node 24.22.1](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
Every CI job checks the hosted runner's **own** Node 24 binary before executing
JavaScript actions; `actions/setup-node` only changes the Node used by build
commands. An older embedded runtime stops the job and requires an updated hosted
runner. The preflight also updates an older system CA package to the
[USN-8944-1](https://ubuntu.com/security/notices/USN-8944-1) minimum.

VRT uses the pinned Playwright container in `examples/_shared/vrt-environment.json`
on an internal Docker network. The browser can reach the local test server through
Playwright's loopback tunnel, but cannot connect to the internet. Before running
stories, `.github/vrt/check-browser-network.mjs` checks both local access and
blocked external HTTP/HTTPS, even with certificate errors ignored as they are by
the Vitest provider. Story images live in `examples/_shared/public/fixtures`.

This network isolation is a CI mitigation, not a claim that Playwright 1.64.1
rejects the compromised certificates. A local browser run without the isolated
container has no such network boundary. Keep external assets out of the examples;
add fixtures when a new story needs an image.

## TypeScript Editor Support

Add the client types and TS plugin to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["storybook-php/client"],
    "plugins": [{ "name": "storybook-php/ts-plugin" }]
  }
}
```

This gives you:

- typed `Meta` and `StoryObj` helpers from `storybook-php`
- IDE support for `.php` imports
- inferred `args` shapes from parsed PHP signatures
- suppression of "cannot find module" diagnostics for `.php` imports

If you rely on `defaultMethod`, pass the same setting to the TS plugin:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "storybook-php/ts-plugin", "defaultMethod": "render" }]
  }
}
```

## `typegen`

Generate `.d.ts` files next to your source files:

```bash
npx storybook-php typegen
```

When no directories are passed, `typegen` scans `src`.

You can also target specific directories:

```bash
npx storybook-php typegen src components templates
```

`typegen` writes both bare-import and exact-import declaration modules whenever they resolve:

- `Button.php.d.ts`
- `Button.php@render.d.ts`

For a callable-backed file without `defaultMethod`, the bare `.php.d.ts` output stays template-shaped. When `defaultMethod` resolves, the bare output mirrors that callable instead.

What `typegen` generates inside those files:

- class exports for parsed class methods
- function exports for standalone functions
- enum exports with `_case`
- default exports for template-only PHP files

Output notes:

- scalar PHP types map to regular TypeScript primitives
- `array` becomes `unknown[]`
- `object` and `mixed` become `unknown`
- class-like types become `Record<string, unknown>`
- optional PHP parameters become optional TS properties

## `typegen --options-file`

`typegen` does not read `.storybook/main.ts`. If declaration generation depends on `defaultMethod` or `components`, pass them through a separate JSON or JS module:

```bash
npx storybook-php typegen --options-file storybook-php.config.mjs
```

Example options file:

```ts
import { fileURLToPath } from "node:url";

export default {
  _configDir: fileURLToPath(new URL("./.storybook/", import.meta.url)),
  defaultMethod: "render",
  components: {
    files: {
      "../src/views/components/card.blade.php": {
        phpFile: "../src/BladeCard.php",
        callable: "render",
      },
    },
  },
};
```

`typegen` reads `defaultMethod`, `components`, and `_configDir` from this file. `_configDir` is useful when relative `components.files` entries should resolve the same way they do from your Storybook config directory.

## Storybook Tests

Run Storybook tests with:

```bash
npx storybook-php test
```

`storybook-php test` runs `vitest run`. If your project does not define `vitest.config.*` and you do not pass `--config`, it automatically falls back to the bundled Vitest config.

## Required Test Dependencies

Install these when using `storybook-php test`:

```bash
npm install -D vitest @storybook/addon-vitest @vitest/browser-playwright
```

Also enable the addon in `.storybook/main.ts`:

```ts
const config = {
  addons: ["@storybook/addon-vitest"],
};
```

If you prefer ephemeral installs, this also works:

```bash
npx --package=storybook-php --package=vitest \
    --package=@storybook/addon-vitest \
    --package=@vitest/browser-playwright \
    storybook-php test
```

If npm reports a peer-resolution error in a pure `npx` setup, pin `vitest` and `@vitest/browser-playwright` to the same version.

## Custom Vitest Config

When you provide your own `vitest.config.*` or pass `--config`, `storybook-php` uses that instead of the bundled template.

This is the right choice when you need custom browser settings, aliases, reporters, or workspace-level Vitest configuration.

It can also be used as a fallback in package-less `npx` environments to add `server.fs.allow` entries for packages resolved from npm's cache.

## Editor Support vs Generated Files

Use the TS plugin when you want live editor support without writing files to disk.

Use `typegen` when you want `.d.ts` files checked into the repo, consumed by tooling outside the TS plugin, or shared across editors and CI.

It is normal to use both together.

## Related Guides

- [Getting Started](getting-started.md)
- [Framework Options](framework-options.md)
- [Type Mapping](type-mapping.md)
