<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Transport;

use RuntimeException;

/**
 * Loads user-defined adapter middleware for a render invocation.
 *
 * @return callable(array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}, callable(array<string, mixed>): mixed): mixed|null
 * @throws RuntimeException when the adapter does not return middleware
 */
function loadAdapter(?string $adapterPath): ?callable
{
    if ($adapterPath === null || $adapterPath === '') {
        return null;
    }

    $adapter = require $adapterPath;
    if (!is_callable($adapter)) {
        throw new RuntimeException("Adapter file must return a callable middleware: {$adapterPath}");
    }

    return $adapter;
}

/**
 * @param list<string>|null $adapterPaths
 * @return list<callable(array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}, callable(array<string, mixed>): mixed): mixed>
 * @throws RuntimeException when an adapter does not return middleware
 */
function loadAdapters(?array $adapterPaths): array
{
    if ($adapterPaths === null || $adapterPaths === []) {
        return [];
    }

    $middlewares = [];
    foreach ($adapterPaths as $adapterPath) {
        $middleware = \StorybookPhp\Runtime\Transport\loadAdapter($adapterPath);
        if ($middleware !== null) {
            $middlewares[] = $middleware;
        }
    }

    return $middlewares;
}

/**
 * @return array{html: string, ...}
 * @throws RuntimeException when middleware returns an invalid response
 */
function normalizeAdapterResponse(mixed $response): array
{
    if (is_string($response)) {
        return ['html' => $response];
    }

    if (!is_array($response)) {
        throw new RuntimeException('Adapter middleware must return a response array or HTML string.');
    }

    if (!array_key_exists('html', $response) || !is_string($response['html'])) {
        throw new RuntimeException("Adapter middleware responses must include a string 'html' field.");
    }

    foreach (['publicArgs', 'templateArgs', 'constructorArgs', 'methodArgs'] as $field) {
        if (array_key_exists($field, $response)) {
            if (!is_array($response[$field])) {
                throw new RuntimeException("Adapter response field '{$field}' must be an object.");
            }
            $response[$field] = \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($response[$field], $field);
        }
    }
    if (array_key_exists('buffered', $response) && !is_string($response['buffered'])) {
        throw new RuntimeException("Adapter response field 'buffered' must be a string.");
    }
    if (array_key_exists('instance', $response) && $response['instance'] !== null && !is_object($response['instance'])) {
        throw new RuntimeException("Adapter response field 'instance' must be an object or null.");
    }

    return ['html' => $response['html']] + $response;
}

/**
 * @param list<callable(array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}, callable(array<string, mixed>): mixed): mixed> $middlewares
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, ...} $context
 * @param callable(array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}): mixed $terminal
 * @return array{html: string, ...}
 */
function runAdapterMiddleware(array $middlewares, array $context, callable $terminal): array
{
    $runner = \StorybookPhp\Runtime\Transport\createAdapterTerminal($terminal);
    foreach (array_reverse($middlewares) as $middleware) {
        $runner = \StorybookPhp\Runtime\Transport\wrapAdapterMiddleware($runner, $middleware);
    }

    return $runner($context);
}

/**
 * @param callable(array<string, mixed>): mixed $next
 * @param callable(array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}, callable(array<string, mixed>): mixed): mixed $middleware
 * @return callable(array<string, mixed>): array{html: string, ...}
 */
function wrapAdapterMiddleware(callable $next, callable $middleware): callable
{
    return static function (array $context) use ($middleware, $next): array {
        $normalizedContext = \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($context, 'adapterContext');

        return \StorybookPhp\Runtime\Transport\normalizeAdapterResponse($middleware(\StorybookPhp\Runtime\Execution\hydrateExecutionContext($normalizedContext), $next));
    };
}

/**
 * @param callable(array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}): mixed $terminal
 * @return callable(array<string, mixed>): array{html: string, ...}
 */
function createAdapterTerminal(callable $terminal): callable
{
    return static function (array $context) use ($terminal): array {
        $normalizedContext = \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($context, 'adapterContext');

        return \StorybookPhp\Runtime\Transport\normalizeAdapterResponse($terminal(\StorybookPhp\Runtime\Execution\hydrateExecutionContext($normalizedContext)));
    };
}
