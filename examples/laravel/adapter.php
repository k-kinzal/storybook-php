<?php

declare(strict_types=1);

/**
 * storybook-php adapter for Laravel Illuminate\View\Component.
 *
 * When a Component's render() returns a View (or Closure),
 * this adapter performs the full Component lifecycle:
 *   resolveView() → data() → render to HTML string.
 *
 * For non-Component classes the default behavior is preserved.
 */

use Illuminate\Container\Container;
use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\View\Factory as ViewFactory;
use Illuminate\View\Component;

return function (mixed $result, string $buffered, ?object $instance, array $context = []): string {
    $factory = Container::getInstance()->make(ViewFactory::class);

    if (($context['type'] ?? null) === 'template') {
        return $factory->file($context['file'], $context['args'] ?? [])->render();
    }

    if ($instance instanceof Component) {
        $view = $instance->resolveView();

        if ($view instanceof \Closure) {
            $view = $view($instance->data());
        }

        if ($view instanceof ViewContract) {
            return $view->with($instance->data())->render();
        }

        if (is_string($view)) {
            return $factory->make($view, $instance->data())->render();
        }

        return (string) $view;
    }

    // Default: delegate to the built-in resolveOutput()
    return resolveOutput($result, $buffered);
};
