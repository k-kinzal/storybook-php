# AGENTS.md — storybook-php

## Project Overview

Storybook 10 framework addon that renders PHP components as Storybook stories. Users write `.stories.ts` files that import PHP classes/functions via `'./Component.php@method'` syntax. The Vite plugin resolves these imports into virtual JS modules, and a PHP runner executes the actual PHP code server-side on each render.

## Tech Stack

- **Runtime:** Node 20.19+, PHP 8.2+
- **Build:** tsup (ESM-only), TypeScript 5.7+
- **Test:** vitest 3.x (node env + jsdom for preview tests)
- **Storybook:** v10.2.x with `@storybook/builder-vite`
- **Lint:** eslint 9 (flat config)

## Commands

```bash
npm run build      # tsup → dist/
npm test           # vitest run (149 tests, ~2s)
npm run test:watch # vitest --watch
npm run lint       # eslint src/
npm run typecheck  # tsc --noEmit
```

Integration tests in `src/__tests__/integration.test.ts` require PHP 8.2+ — they auto-skip if unavailable.

## Architecture

```
Story (.stories.ts)
  ↓ import './Foo.php@render'
Vite Plugin (vite-plugin.ts)
  ↓ resolveId → virtual ID, load → virtual JS module
Preview (preview.ts, runs in browser)
  ↓ POST /__storybook_php/render { type, file, class, callable, args }
Dev Middleware (dev-middleware.ts)
  ↓ validates, delegates
PHP Executor (php-executor.ts)
  ↓ child_process.spawn php runner.php < JSON
PHP Runner (src/php/runner.php)
  ↓ Reflection-based arg matching, type casting, ob_start()
  → JSON { html } on stdout
```

### Key Modules

| File | Role |
|------|------|
| `src/types.ts` | Internal types (`PhpComponent`, `PhpFileMeta`, `PhpRenderRequest`, etc.) |
| `src/public-types.ts` | User-facing types (`Meta`, `StoryObj`, `Story`, `Decorator`) |
| `src/index.ts` | Public re-exports |
| `src/php-parser.ts` | Regex-based PHP parser. Extracts namespaces, classes, enums, functions, params |
| `src/vite-plugin.ts` | Vite plugin: `resolveId`, `load` (virtual modules), `configureServer`, HMR |
| `src/php-executor.ts` | Spawns PHP process, sends JSON stdin, reads JSON stdout |
| `src/php/runner.php` | PHP-side executor. Uses Reflection for arg matching + type casting |
| `src/dev-middleware.ts` | Express-compatible `POST /__storybook_php/render` handler |
| `src/preview.ts` | Browser-side `renderToCanvas()` — fetches PHP HTML via the endpoint |
| `src/preset.ts` | Storybook 10 preset: `core`, `viteFinal` |
| `src/typegen.ts` | Generates `.d.ts` from PHP files (PHP type → TS type mapping) |
| `src/cli.ts` | `storybook-php typegen [dirs...]` CLI |
| `src/ts-plugin/` | TypeScript Language Service Plugin for IDE support |

### Supported PHP Callable Types

The Vite plugin and PHP runner handle 5 types:

| `__type` | Execution |
|----------|-----------|
| `classMethod` | `new Class(ctorArgs)->method(methodArgs)` |
| `staticMethod` | `Class::method(args)` |
| `function` | `functionFqn(args)` (supports namespaced) |
| `template` | `extract($args) + include $file` |
| `enumMethod` | `Enum::from(_case)->method(args)` |

### Adapter System

The `adapter` option allows customizing how method return values become HTML. This is essential for frameworks like Laravel where `Component::render()` returns a `View` object, not a string.

**Configuration flow:** `main.ts options.adapter` → preset → Vite plugin → middleware → PhpExecutor → `runner.php`

**Adapter file contract:** Must return a callable with signature:
```php
// adapter.php
return function (mixed $result, string $buffered, ?object $instance): string {
    // Custom logic, e.g. for Laravel Component:
    if ($instance instanceof \Illuminate\View\Component) {
        return $instance->resolveView()->with($instance->data())->render();
    }
    return resolveOutput($result, $buffered);
};
```

The runner calls `resolveOutput()` by default. When adapter is set, the adapter callable is called instead. It receives the raw return value, the output buffer, and the instance (null for static/function/template calls).

**Example: `examples/laravel/`** — uses `adapter.php` to bridge `Illuminate\View\Component` → HTML. Component classes extend `Component` directly (no wrapper needed).

## Conventions

- **ESM only.** No CJS output, no `require()`. Use `import.meta.url` for path resolution.
- **Paths:** Use `import.meta.resolve()` or `new URL(..., import.meta.url)` — never `require.resolve`.
- **Tests** go in `src/__tests__/`, fixtures in `src/__tests__/fixtures/`.
- **PHP fixtures** are real `.php` files that are executed by the PHP runner in integration tests.
- **Vite plugin virtual modules** are prefixed with `\0storybook-php:`.
- **Function callables** use FQN (`App\Helpers\pill`), not short name — PHP needs the full namespace.
- **Inherited methods** — the Vite plugin traverses `extends` within the same file to find parent methods.
- **Multiple exports** — when multiple classes in a file match a callable, all are exported.

## Storybook 10 Integration Notes

- The `framework.name` in `.storybook/main.ts` must be `'storybook-php'` (SB10 auto-appends `/preset`).
- Framework options flow through `options.presets.apply('frameworkOptions')` in `viteFinal`, **not** `options.frameworkOptions`.
- `core.renderer = 'storybook-php'` causes SB10 to auto-load `storybook-php/preview` — don't also export `previewAnnotations` or the preview gets loaded twice.
- For local development, `node_modules/storybook-php` must be a symlink to `./` so SB10 can resolve the package:
  ```bash
  ln -sf ../ node_modules/storybook-php
  ```

## Testing the Example

```bash
npm run build                          # build the plugin first
ln -sf ../ node_modules/storybook-php  # create self-referencing symlink
npx storybook dev -p 6006 --config-dir examples/basic/.storybook
```

Verify PHP rendering via:
```bash
curl -X POST http://localhost:6006/__storybook_php/render \
  -H "Content-Type: application/json" \
  -d '{"type":"classMethod","file":"/abs/path/Greeting.php","class":"App\\Components\\Greeting","callable":"render","args":{"name":"World"}}'
```

## Adding a New PHP Pattern

1. Add a PHP fixture in `src/__tests__/fixtures/`
2. Add parser tests in `src/__tests__/php-parser.test.ts`
3. If it needs a new `__type`, update:
   - `PhpCallableType` in `src/types.ts`
   - `runner.php` switch statement
   - `vite-plugin.ts` load handler + generator function
   - `dev-middleware.ts` VALID_TYPES
4. Add an integration test case in `src/__tests__/integration.test.ts`
5. Add an example in `examples/basic/src/`
