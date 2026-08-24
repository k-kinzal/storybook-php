# Testing and Types

`storybook-php` includes tooling for TypeScript editor support, generated declaration files, and Storybook test runs.

## PHP Runtime Quality Gates

The PHP runner is checked with `k-kinzal/php-ai-toolkit` and complementary
tools. The default local sequence is:

```bash
composer test
composer doctest
composer lint
composer test:coverage
composer doc-gen:fresh
```

The gates cover different failure modes:

- PHPUnit and ParaTest verify behavior, boundary failures, and parallel safety.
- Doctest executes PHPDoc examples so documentation remains part of the contract.
- PHPStan checks strict types plus toolkit design rules and preserves named array
  shapes across the request, planning, invocation, and response stages.
- PHP-CS-Fixer makes formatting deterministic; Rector runs in dry-run mode to
  detect safe structural improvements that have not been applied.
- PHPCompatibility enforces the declared PHP 8.0 floor.
- LocGuard limits function length, branches, nesting, complexity, and
  parameters; TreeGuard constrains maintained source layout and naming.
- Composer audit rejects known vulnerable or abandoned development dependencies.
- Coverage enforces 100% of executable lines in `src/php`.
- DocGen builds the browsable API and contract documentation in `build/docs`.

The project deliberately does not configure ScopeGuard, Deptrac, or Infection
while the standalone runner is implemented as top-level functions. Those tools
discover class-like declarations; enabling them now would report success while
checking no production declarations (Infection 0.35 likewise generates zero
mutants). A future class-backed runtime should add these gates when they can
measure real responsibilities.

CI tests the PHP runtime on every supported PHP minor from 8.0 through 8.5.
Each minor uses its matching `composer.lock.php-<minor>` so dependency drift
cannot silently reduce or expand the supported matrix.

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

`typegen` does not read `.storybook/main.ts`. If declaration generation depends on `defaultMethod` or `typeMap`, pass them through a separate JSON or JS module:

```bash
npx storybook-php typegen --options-file storybook-php.config.mjs
```

Example options file:

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

`typegen` reads `defaultMethod`, `typeMap`, and `_configDir` from this file. `_configDir` is useful when relative `typeMap.files` entries should resolve the same way they do from your Storybook config directory.

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
