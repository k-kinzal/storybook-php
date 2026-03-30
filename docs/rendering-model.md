# Rendering Model

`storybook-php` turns PHP callables and templates into Storybook components by combining a Vite plugin, a browser-side preview renderer, and a small PHP runner.

## Request Flow

```text
Story (.stories.ts)
  -> import "./Foo.php@render"
Vite plugin
  -> resolves the import to a virtual JS module
Preview renderer
  -> POST /__storybook_php/render with args
Dev middleware
  -> validates the request and invokes PhpExecutor
PHP runner
  -> runs adapter middleware around the core executor
Storybook canvas
  -> injects the returned HTML
```

The PHP process runs server-side. Storybook only receives HTML.

Behind that request flow, each imported component is registered server-side as a render plan. The browser only sends `componentId`, story `args`, and optional `parameters.typeMap` overrides to `/__storybook_php/render`.

## Internal Layering

The TypeScript codebase is split into five layers:

- contracts: `src/types.ts` and `src/public-types.ts` define package-level types shared across the rest of the codebase.
- shared: `src/shared/` holds shared constants and contracts used by multiple higher layers.
- core: `src/core/config/`, `src/core/analysis/`, `src/core/component/`, and `src/core/typescript/` normalize framework options, analyze PHP sources, and generate shared schemas plus declaration/module output.
- runtime: `src/runtime/render/` and `src/runtime/server/` validate render requests, manage registered render plans, and execute server-side rendering.
- entrypoints: top-level `src/*.ts`, plus helpers under `src/cli/` and `src/ts-plugin/`, compose the lower layers for Storybook, Vite, preview, CLI, and editor integration.

`src/php/` contains the PHP-side runtime helpers and sits alongside these TypeScript layers.

The dependency rule is one-way: entrypoints may depend on runtime, core, shared, and contracts; runtime may depend on core, shared, and contracts; core may depend on shared and contracts; shared may depend only on contracts. Lower layers should not reach back up into Storybook/Vite adapters.

## Supported Import Patterns

| Pattern                      | Import syntax            | Args source                            |
| ---------------------------- | ------------------------ | -------------------------------------- |
| Instance method              | `./File.php@render`      | Constructor params + method params     |
| Static method                | `./File.php@danger`      | Method params                          |
| Standalone function          | `./file.php@renderBadge` | Function params                        |
| Invocable class              | `./File.php@__invoke`    | Constructor params + `__invoke` params |
| Enum instance method         | `./File.php@badge`       | `_case` + method params                |
| Template file                | `./file.php`             | Story args become template variables   |
| Mapped non-PHP import source | `./card.blade.php`       | `typeMap.files` defines the contract   |

If `framework.options.defaultMethod` is set, you can omit `@render` and import `./File.php` directly.
Bare `.php` imports only mean template mode when `defaultMethod` is not set.

Non-PHP imports are resolved only when they match `typeMap.files`. Those mappings can keep template mode, redirect execution with `phpFile`, force a callable with `callable`, and attach adapters.

## Build-Time Resolution

At import time, `storybook-php` resolves three related concepts:

- `sourceFile`: the file you imported in the story
- `executionFile`: the PHP file that will actually be parsed and executed
- `adapter`: the middleware chain chosen from global options, file mappings, and request overrides

For plain `.php` imports, `sourceFile` and `executionFile` are the same file. For mapped files such as Blade or Twig templates, `typeMap.files[*].phpFile` can redirect execution to a separate PHP file while preserving the original import path as `sourceFile`.

## How Args Are Matched

`storybook-php` uses PHP reflection to match Storybook args to the target callable.

- Class instance methods receive constructor args and method args from one merged object.
- Static methods and standalone functions only receive callable args.
- Enum methods reserve `_case` to select the enum case before the method runs.
- Template files receive all story args as local template variables.
- If constructor and method parameters share a name but cannot be merged safely, the public surface splits into `constructor.name` and `method.name`. `typeMap` can also introduce those namespaced keys explicitly.

Parameters are matched by name, not just position, so Storybook controls map naturally to PHP parameter names.

## Output Resolution

The runner converts PHP output into final HTML using these rules:

- A non-empty returned string is used as HTML.
- Buffered `echo` output is captured automatically.
- If both a string return value and buffered output exist, they are concatenated.
- `Generator` results are consumed and joined.
- Objects with `__toString()` are stringified.
- Arrays with an `html` key use that value as the HTML payload.
- Non-empty scalars are converted to strings.
- If nothing produces content, the result is an empty string.

This means components that `return`, `echo`, or mix both styles all work.

## Adapter Middleware

Adapters sit around the core executor as middleware.

- They receive the public Storybook `args` surface in `$context['publicArgs']`.
- They also receive hydrated execution inputs in `$context['templateArgs']`, `$context['constructorArgs']`, and `$context['methodArgs']` when those targets exist.
- They may rewrite `publicArgs` before calling `next($context)`.
- Inner adapters and the core executor will then receive freshly re-hydrated execution inputs.
- They may wrap or replace the returned HTML response after `next(...)`.
- They may terminate the chain entirely by returning HTML without calling `next`.

The runtime composes adapters from least specific to most specific:

1. global `framework.options.adapter`
2. matching `typeMap.files` pattern adapters
3. exact file adapters
4. per-request adapter overrides
5. core executor

This keeps cross-cutting adapters on the outside while file-specific adapters stay closest to the target runtime.

## Templates

When you import a PHP file without a callable suffix, `storybook-php` treats it as a template:

```ts
import CardTemplate from "./card.php";
```

Without an adapter, the runner:

1. Extracts story args into local variables.
2. Includes the template file inside an output buffer.
3. Returns the buffered HTML.

For Blade, Twig, Latte, and other engines that need their own rendering pipeline, use a terminal adapter middleware instead of raw `include`. Those adapters can read `$context['templateArgs']` directly and return HTML without calling `next`.

## Decorators and Script Tags

The preview renderer returns a placeholder string first so Storybook decorators can wrap it. Once PHP rendering completes, the placeholder is replaced with the HTML response.

If the rendered HTML contains `<script>` tags, `storybook-php` recreates them after injection so inline scripts execute inside the preview canvas.

## Errors and Reloading

- PHP exceptions are returned to Storybook and shown as `PHP Render Error`.
- Changes to PHP files invalidate the generated virtual modules.
- Changes to redirected execution files and `typeMap.files[*].includes` dependencies also trigger reloads.

For configuration-driven cases such as Blade or cross-file inheritance, see [Framework Options](framework-options.md) and [Type Mapping](type-mapping.md).
