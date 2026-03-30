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

return static function (array $context, callable $next): array {
    $factory = Container::getInstance()->make(ViewFactory::class);

    if (($context['type'] ?? null) === 'template') {
        return [
            'html' => $factory->file($context['file'], resolveTemplateContextArgs($context))->render(),
        ];
    }

    $response = $next($context);
    $instance = $response['instance'] ?? null;

    if ($instance instanceof Component) {
        $view = $instance->resolveView();

        if ($view instanceof \Closure) {
            $view = $view($instance->data());
        }

        if ($view instanceof ViewContract) {
            return array_merge($response, ['html' => $view->with($instance->data())->render()]);
        }

        if (is_string($view)) {
            return array_merge($response, ['html' => $factory->make($view, $instance->data())->render()]);
        }

        return array_merge($response, ['html' => (string) $view]);
    }

    return array_merge($response, [
        'html' => resolveOutput($response['result'] ?? null, (string) ($response['buffered'] ?? '')),
    ]);
};
