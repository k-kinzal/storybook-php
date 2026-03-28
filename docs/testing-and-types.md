# Testing and Types

`storybook-php` includes tooling for TypeScript editor support, generated declaration files, and Storybook test runs.

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

Generate `.d.ts` files next to your PHP files:

```bash
npx storybook-php typegen
```

When no directories are passed, `typegen` scans `src`.

You can also target specific directories:

```bash
npx storybook-php typegen src components templates
```

What `typegen` generates:

- class exports for parsed class methods
- function exports for standalone functions
- enum exports with `_case`
- default exports for template-only PHP files

Output notes:

- scalar PHP types map to regular TypeScript primitives
- `array` becomes `unknown[]`
- object and class-like types become `Record<string, unknown>`
- optional PHP parameters become optional TS properties

## Storybook Tests

Run Storybook tests with:

```bash
npx storybook-php test
```

If your project does not define `vitest.config.*`, `storybook-php` automatically falls back to its bundled Vitest config.

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

## Related Guides

- [Getting Started](getting-started.md)
- [Framework Options](framework-options.md)
- [Type Mapping](type-mapping.md)
