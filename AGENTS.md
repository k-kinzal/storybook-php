# AGENTS.md

<!-- Human-managed project guidance. Keep this file aligned with CI and the
     supported-version policy when changing development tooling. -->

## Overview

PHP renders HTML server-side, and frameworks compose pages from partial templates and components. Storybook only supports client-side JS frameworks, so there is no way to preview these partials in isolation. This addon executes PHP server-side and pipes the rendered HTML into Storybook.

## Supported Versions

- **PHP:** 8.0–8.5
- **Storybook:** 10.x
- **Vite:** 5.x–8.x
- **Node:** ≥20.19

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

The PHP runner intentionally exposes global functions: `runner.php` is copied
and executed as a standalone protocol adapter, so its source units must not
depend on Composer autoloading at runtime. Keep the bootstrap files small and
put each responsibility in its matching `runtime_*.php` source unit.

| Source unit                               | Responsibility                                     |
| ----------------------------------------- | -------------------------------------------------- |
| `runtime_request*`                        | Decode and validate the untrusted JSON request     |
| `runtime_context*` / `runtime_planner*`   | Build validated execution plans                    |
| `runtime_cast*` / `runtime_args*`         | Match and cast public arguments                    |
| `runtime_invocation*`                     | Dispatch the four supported render modes           |
| `runtime_output*` / `runtime_response*`   | Buffer and encode protocol output                  |
| `runtime_adapters*` / `runtime_boundary*` | Compose middleware and translate boundary failures |

## PHP Contracts

- Treat request JSON, reflection values, adapter responses, and buffered output
  as trust boundaries. Validate their shape before using a PHPStan type alias.
- Preserve `array{...}` and generic contracts through intermediate helpers;
  do not replace a precise shape with `array<string, mixed>` merely to silence
  analysis.
- Do not catch `Throwable` inside core logic. Convert failures only at the
  runner boundary, where the JSON protocol requires it.
- A source file under `src/php` has a paired `tests/php/<basename>Test.php`.
  ParaTest derives the test class name from this snake-case filename.
- Prefer splitting a responsibility over raising LocGuard or TreeGuard limits.

## Quality Commands

Run these before changing the PHP runtime:

```bash
composer test
composer doctest
composer lint
composer test:coverage
composer doc-gen:fresh
```

`composer lint` includes syntax, formatting, PHPStan, PHP 8.0 compatibility,
LocGuard, TreeGuard, dependency audit, and Rector dry-run checks. Coverage must
remain at 100% for `src/php` because the runner is a small protocol boundary and
all branches are expected to have an explicit contract test.

The repository keeps `composer.lock.php-8.0` through
`composer.lock.php-8.5`. CI selects the lock matching each PHP minor before
installation; regenerate all six when development dependencies change.

## Design Trade-offs

- Compatibility and explicit runtime validation take priority over terseness.
- Keep reflection and protocol details at the edges; keep conversion and
  planning helpers deterministic.
- ScopeGuard, Deptrac, and Infection inspect class-like declarations. Do not add
  zero-target configurations while the production runner is function-based.
  Reconsider them only when a real responsibility is moved behind classes,
  without adding classes solely to satisfy a tool.
