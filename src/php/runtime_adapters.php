<?php

declare(strict_types=1);

/**
 * @return callable(HydratedExecutionContext, callable(StringMap): mixed): mixed|null
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
 * @return list<callable(HydratedExecutionContext, callable(StringMap): mixed): mixed>
 * @throws RuntimeException when an adapter does not return middleware
 */
function loadAdapters(?array $adapterPaths): array
{
    if ($adapterPaths === null || $adapterPaths === []) {
        return [];
    }

    $middlewares = [];
    foreach ($adapterPaths as $adapterPath) {
        $middleware = loadAdapter($adapterPath);
        if ($middleware !== null) {
            $middlewares[] = $middleware;
        }
    }

    return $middlewares;
}

/**
 * @return ExecutionResponse
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
            $response[$field] = normalizeStringKeyArray($response[$field], $field);
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
 * @param list<callable(HydratedExecutionContext, callable(StringMap): mixed): mixed> $middlewares
 * @param ExecutionContext $context
 * @param callable(HydratedExecutionContext): mixed $terminal
 * @return ExecutionResponse
 */
function runAdapterMiddleware(array $middlewares, array $context, callable $terminal): array
{
    $runner = createAdapterTerminal($terminal);
    foreach (array_reverse($middlewares) as $middleware) {
        $runner = wrapAdapterMiddleware($runner, $middleware);
    }

    return $runner($context);
}

/**
 * @param callable(StringMap): mixed $next
 * @param callable(HydratedExecutionContext, callable(StringMap): mixed): mixed $middleware
 * @return callable(StringMap): ExecutionResponse
 */
function wrapAdapterMiddleware(callable $next, callable $middleware): callable
{
    return static function (array $context) use ($middleware, $next): array {
        $normalizedContext = normalizeStringKeyArray($context, 'adapterContext');

        return normalizeAdapterResponse($middleware(hydrateExecutionContext($normalizedContext), $next));
    };
}

/**
 * @param callable(HydratedExecutionContext): mixed $terminal
 * @return callable(StringMap): ExecutionResponse
 */
function createAdapterTerminal(callable $terminal): callable
{
    return static function (array $context) use ($terminal): array {
        $normalizedContext = normalizeStringKeyArray($context, 'adapterContext');

        return normalizeAdapterResponse($terminal(hydrateExecutionContext($normalizedContext)));
    };
}
