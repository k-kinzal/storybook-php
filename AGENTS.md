# AGENTS.md

## Overview

PHP renders HTML server-side, and frameworks compose pages from partial templates and components. Storybook only supports client-side JS frameworks, so there is no way to preview these partials in isolation. This addon executes PHP server-side and pipes the rendered HTML into Storybook.

## Supported Versions

- **PHP:** 8.0–8.5
- **Storybook:** 10.6.2+ (10.x)
- **Vite:** 6.4.4+, 7.3.7+, or 8.3.3+
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
