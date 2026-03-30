<?php

declare(strict_types=1);

use Illuminate\Container\Container;
use Illuminate\View\Factory as ViewFactory;

return static function (array $context, callable $next): array {
    $factory = Container::getInstance()->make(ViewFactory::class);
    $templateArgs = $context['templateArgs'] ?? [];
    $templateFile = realpath((string) ($context['file'] ?? '')) ?: (string) ($context['file'] ?? '');

    foreach ($factory->getFinder()->getPaths() as $viewPath) {
        $resolvedViewPath = realpath($viewPath) ?: $viewPath;
        $normalizedViewPath = rtrim($resolvedViewPath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        if (!str_starts_with($templateFile, $normalizedViewPath)) {
            continue;
        }

        $relativeViewPath = substr($templateFile, strlen($normalizedViewPath));
        $viewName = preg_replace('/\\.blade\\.php$/', '', str_replace(DIRECTORY_SEPARATOR, '.', $relativeViewPath));

        if (is_string($viewName) && $viewName !== '') {
            return [
                'html' => $factory->make($viewName, $templateArgs)->render(),
            ];
        }
    }

    return [
        'html' => $factory->file($templateFile, $templateArgs)->render(),
    ];
};
