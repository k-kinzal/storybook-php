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
  -> reflects on the callable, matches args, renders HTML
Storybook canvas
  -> injects the returned HTML
```

The PHP process runs server-side. Storybook only receives HTML.

## Internal Layering

The codebase is split into four responsibilities:

- `src/config/`: normalize `FrameworkOptions`, resolve file mappings, and turn imports into absolute PHP sources.
- `src/component/`: parse PHP sources, apply type-map enrichments, and build shared component schemas plus declaration/module output.
- `src/render/`: validate render requests, manage registered render plans, and merge runtime type-map overrides.
- top-level `src/*.ts`: Storybook, Vite, preview, CLI, and executor entrypoints that compose the lower layers.

The dependency rule is one-way: composition entrypoints may depend on internal layers, but the lower layers should not reach back up into Storybook/Vite adapters. In particular, the PHP execution path should not depend on framework option resolution.

## Supported Import Patterns

| Pattern              | Import syntax            | Args source                            |
| -------------------- | ------------------------ | -------------------------------------- |
| Instance method      | `./File.php@render`      | Constructor params + method params     |
| Static method        | `./File.php@danger`      | Method params                          |
| Standalone function  | `./file.php@renderBadge` | Function params                        |
| Invocable class      | `./File.php@__invoke`    | Constructor params + `__invoke` params |
| Enum instance method | `./File.php@badge`       | `_case` + method params                |
| Template file        | `./file.php`             | Story args become template variables   |

If `framework.options.defaultMethod` is set, you can omit `@render` and import `./File.php` directly.
Bare `.php` imports only mean template mode when `defaultMethod` is not set.

## How Args Are Matched

`storybook-php` uses PHP reflection to match Storybook args to the target callable.

- Class instance methods receive constructor args and method args from one merged object.
- Static methods and standalone functions only receive callable args.
- Enum methods reserve `_case` to select the enum case before the method runs.
- Template files receive all story args as local template variables.

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

## Templates

When you import a PHP file without a callable suffix, `storybook-php` treats it as a template:

```ts
import CardTemplate from "./card.php";
```

Without an adapter, the runner:

1. Extracts story args into local variables.
2. Includes the template file inside an output buffer.
3. Returns the buffered HTML.

For Blade, Twig, Latte, and other engines that need their own rendering pipeline, use an adapter instead of raw `include`.

## Decorators and Script Tags

The preview renderer returns a placeholder string first so Storybook decorators can wrap it. Once PHP rendering completes, the placeholder is replaced with the HTML response.

If the rendered HTML contains `<script>` tags, `storybook-php` recreates them after injection so inline scripts execute inside the preview canvas.

## Errors and Reloading

- PHP exceptions are returned to Storybook and shown as `PHP Render Error`.
- Changes to PHP files invalidate the generated virtual modules.
- Changes to mapped files referenced by `typeMap.files` also trigger reloads.

For configuration-driven cases such as Blade or cross-file inheritance, see [Framework Options](framework-options.md) and [Type Mapping](type-mapping.md).
