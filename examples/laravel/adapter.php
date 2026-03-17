<?php

/**
 * storybook-php adapter for Laravel Illuminate\View\Component.
 *
 * When a Component's render() returns a View (or Closure),
 * this adapter performs the full Component lifecycle:
 *   resolveView() → data() → render to HTML string.
 *
 * For non-Component classes the default behavior is preserved.
 */

use Illuminate\View\Component;

return function (mixed $result, string $buffered, ?object $instance): string {
    if ($instance instanceof Component) {
        $view = $instance->resolveView();

        if (is_string($view)) {
            return $view;
        }

        return $view->with($instance->data())->render();
    }

    // Default: delegate to the built-in resolveOutput()
    return resolveOutput($result, $buffered);
};
