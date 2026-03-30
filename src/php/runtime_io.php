<?php

declare(strict_types=1);

/**
 * Convert a render value into a string without relying on mixed casts.
 */
function stringifyOutputValue(mixed $value): string
{
    if (is_string($value)) {
        return $value;
    }

    if (is_int($value) || is_float($value) || is_bool($value)) {
        return (string) $value;
    }

    if (is_object($value) && method_exists($value, '__toString')) {
        return (string) $value;
    }

    return '';
}

function stringifyScalarForError(mixed $value): string
{
    $stringValue = stringifyOutputValue($value);
    return $stringValue !== '' ? $stringValue : get_debug_type($value);
}

function getOutputBuffer(): string
{
    $buffered = ob_get_clean();
    // @codeCoverageIgnoreStart
    if ($buffered === false) {
        throw new \RuntimeException('Failed to collect output buffer.');
    }
    // @codeCoverageIgnoreEnd

    return $buffered;
}

/**
 * @param array<array-key, mixed> $value
 * @return array<string, mixed>
 */
function normalizeStringKeyArray(array $value, string $fieldName): array
{
    $normalized = [];

    foreach ($value as $key => $item) {
        if (!is_string($key)) {
            throw new \RuntimeException("Field '{$fieldName}' must use string keys.");
        }

        $normalized[$key] = $item;
    }

    return $normalized;
}

/**
 * @param array<array-key, mixed> $value
 * @return list<string>
 */
function normalizeStringList(array $value, string $fieldName): array
{
    $normalized = [];

    foreach ($value as $item) {
        if (!is_string($item) || $item === '') {
            throw new \RuntimeException("Field '{$fieldName}' must be a list of non-empty strings.");
        }

        $normalized[] = $item;
    }

    return $normalized;
}

/**
 * @return array{
 *   type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod',
 *   file: string,
 *   sourceFile: string|null,
 *   class: string|null,
 *   callable: string|null,
 *   args: array<string, mixed>,
 *   publicArgDefs: array<string, mixed>|null,
 *   constructorArgDefs: array<string, mixed>|null,
 *   callableArgDefs: array<string, mixed>|null,
 *   bootstrap: string|null,
 *   adapters: list<string>|null,
 *   typeMap: array<string, mixed>|null
 * }
 */
function readRunnerRequest(string $input): array
{
    $decoded = json_decode($input, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($decoded)) {
        throw new \RuntimeException('Invalid request payload.');
    }

    /** @var array<string, mixed> $decoded */
    $type = $decoded['type'] ?? null;
    if (!is_string($type) || !isRenderType($type)) {
        throw new \RuntimeException('Request field "type" is invalid.');
    }
    /** @var 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod' $type */

    $file = $decoded['file'] ?? null;
    if (!is_string($file) || $file === '') {
        throw new \RuntimeException('Request field "file" is required.');
    }

    $sourceFile = $decoded['sourceFile'] ?? null;
    if ($sourceFile !== null && !is_string($sourceFile)) {
        throw new \RuntimeException('Request field "sourceFile" must be a string or null.');
    }

    $class = $decoded['class'] ?? null;
    if ($class !== null && !is_string($class)) {
        throw new \RuntimeException('Request field "class" must be a string or null.');
    }

    $callable = $decoded['callable'] ?? null;
    if ($callable !== null && !is_string($callable)) {
        throw new \RuntimeException('Request field "callable" must be a string or null.');
    }

    $args = $decoded['args'] ?? [];
    if (!is_array($args)) {
        throw new \RuntimeException('Request field "args" must be an object.');
    }

    $publicArgDefs = $decoded['publicArgDefs'] ?? null;
    if ($publicArgDefs !== null && !is_array($publicArgDefs)) {
        throw new \RuntimeException('Request field "publicArgDefs" must be an object or null.');
    }

    $constructorArgDefs = $decoded['constructorArgDefs'] ?? null;
    if ($constructorArgDefs !== null && !is_array($constructorArgDefs)) {
        throw new \RuntimeException('Request field "constructorArgDefs" must be an object or null.');
    }

    $callableArgDefs = $decoded['callableArgDefs'] ?? null;
    if ($callableArgDefs !== null && !is_array($callableArgDefs)) {
        throw new \RuntimeException('Request field "callableArgDefs" must be an object or null.');
    }

    $bootstrap = $decoded['bootstrap'] ?? null;
    if ($bootstrap !== null && !is_string($bootstrap)) {
        throw new \RuntimeException('Request field "bootstrap" must be a string or null.');
    }

    $adapters = $decoded['adapters'] ?? null;
    if ($adapters !== null && !is_array($adapters)) {
        throw new \RuntimeException('Request field "adapters" must be an array or null.');
    }

    $typeMap = $decoded['typeMap'] ?? null;
    if ($typeMap !== null && !is_array($typeMap)) {
        throw new \RuntimeException('Request field "typeMap" must be an object or null.');
    }

    return [
        'type' => $type,
        'file' => $file,
        'sourceFile' => $sourceFile,
        'class' => $class,
        'callable' => $callable,
        'args' => normalizeStringKeyArray($args, 'args'),
        'publicArgDefs' => $publicArgDefs === null ? null : normalizeStringKeyArray($publicArgDefs, 'publicArgDefs'),
        'constructorArgDefs' => $constructorArgDefs === null ? null : normalizeStringKeyArray($constructorArgDefs, 'constructorArgDefs'),
        'callableArgDefs' => $callableArgDefs === null ? null : normalizeStringKeyArray($callableArgDefs, 'callableArgDefs'),
        'bootstrap' => $bootstrap,
        'adapters' => $adapters === null ? null : normalizeStringList($adapters, 'adapters'),
        'typeMap' => $typeMap === null ? null : normalizeStringKeyArray($typeMap, 'typeMap'),
    ];
}

/**
 * @codeCoverageIgnore
 */
function readRunnerStdin(): string
{
    $input = file_get_contents('php://stdin');
    if ($input === false) {
        throw new \RuntimeException('Failed to read request from stdin.');
    }

    return $input;
}

/**
 * @return callable(array<string, mixed>, callable): mixed|null
 */
function loadAdapter(?string $adapterPath): ?callable
{
    if ($adapterPath === null || $adapterPath === '') {
        return null;
    }

    $adapter = require $adapterPath;
    if (!is_callable($adapter)) {
        throw new \RuntimeException("Adapter file must return a callable middleware: {$adapterPath}");
    }

    return $adapter;
}

/**
 * @param list<string>|null $adapterPaths
 * @return list<callable(array<string, mixed>, callable): mixed>
 */
function loadAdapters(?array $adapterPaths): array
{
    if ($adapterPaths === null || $adapterPaths === []) {
        return [];
    }

    /** @var list<callable(array<string, mixed>, callable(array<string, mixed>): mixed): mixed> $middlewares */
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
 * @return array{
 *   html: string,
 *   result?: mixed,
 *   buffered?: string,
 *   instance?: object|null,
 *   publicArgs?: array<string, mixed>,
 *   templateArgs?: array<string, mixed>,
 *   constructorArgs?: array<string, mixed>,
 *   methodArgs?: array<string, mixed>,
 *   enumCaseValue?: mixed
 * }
 */
function normalizeAdapterResponse(mixed $response): array
{
    if (is_string($response)) {
        return ['html' => $response];
    }

    if (!is_array($response)) {
        throw new \RuntimeException('Adapter middleware must return a response array or HTML string.');
    }

    if (!array_key_exists('html', $response) || !is_string($response['html'])) {
        throw new \RuntimeException("Adapter middleware responses must include a string 'html' field.");
    }

    /** @var array{
     *   html: string,
     *   result?: mixed,
     *   buffered?: string,
     *   instance?: object|null,
     *   publicArgs?: array<string, mixed>,
     *   templateArgs?: array<string, mixed>,
     *   constructorArgs?: array<string, mixed>,
     *   methodArgs?: array<string, mixed>,
     *   enumCaseValue?: mixed
     * } $response
     */
    return $response;
}

/**
 * @param list<callable(array<string, mixed>, callable(array<string, mixed>): mixed): mixed> $middlewares
 * @param array<string, mixed> $context
 * @param callable(array<string, mixed>): mixed $terminal
 * @return array{
 *   html: string,
 *   result?: mixed,
 *   buffered?: string,
 *   instance?: object|null,
 *   publicArgs?: array<string, mixed>,
 *   templateArgs?: array<string, mixed>,
 *   constructorArgs?: array<string, mixed>,
 *   methodArgs?: array<string, mixed>,
 *   enumCaseValue?: mixed
 * }
 */
function runAdapterMiddleware(array $middlewares, array $context, callable $terminal): array
{
    $runner = array_reduce(
        array_reverse($middlewares),
        /**
         * @param callable(array<string, mixed>): mixed $next
         * @param callable(array<string, mixed>, callable(array<string, mixed>): mixed): mixed $middleware
         * @return callable(array<string, mixed>): array<string, mixed>
         */
        static function (callable $next, callable $middleware): callable {
            /**
             * @param array<string, mixed> $innerContext
             */
            return static function (array $innerContext) use ($middleware, $next): array {
                /** @var array<string, mixed> $adapterContext */
                $adapterContext = hydrateExecutionContext($innerContext);
                return normalizeAdapterResponse($middleware($adapterContext, $next));
            };
        },
        /**
         * @return array{
         *   html: string,
         *   result?: mixed,
         *   buffered?: string,
         *   instance?: object|null,
         *   publicArgs?: array<string, mixed>,
         *   templateArgs?: array<string, mixed>,
         *   constructorArgs?: array<string, mixed>,
         *   methodArgs?: array<string, mixed>,
         *   enumCaseValue?: mixed
         * }
         */
        static function (array $innerContext) use ($terminal): array {
            /** @var array<string, mixed> $terminalContext */
            $terminalContext = hydrateExecutionContext($innerContext);
            return normalizeAdapterResponse($terminal($terminalContext));
        }
    );

    return $runner(hydrateExecutionContext($context));
}

/**
 * @param array{
 *   type: string,
 *   publicArgs: array<string, mixed>,
 *   constructorArgDefs?: array<string, mixed>|null,
 *   callableArgDefs?: array<string, mixed>|null
 * } $context
 * @return array{constructor?: array<string, mixed>, method?: array<string, mixed>, template?: array<string, mixed>}
 */
function mapPublicArgsToExecutionTargets(array $context): array
{
    $storyArgs = $context['publicArgs'];

    if ($context['type'] === 'template') {
        $templateArgs = [];
        foreach ($storyArgs as $key => $value) {
            if (str_starts_with($key, 'constructor.') || str_starts_with($key, 'method.')) {
                continue;
            }
            $templateArgs[$key] = $value;
        }

        return ['template' => $templateArgs];
    }

    $mapped = [];
    $constructorArgDefs = $context['constructorArgDefs'] ?? null;
    if (is_array($constructorArgDefs) && $constructorArgDefs !== []) {
        $mapped['constructor'] = projectPublicArgsToTarget($storyArgs, $constructorArgDefs, 'constructor');
    } elseif ($context['type'] === 'classMethod') {
        $mapped['constructor'] = projectNamespacedPublicArgs($storyArgs, 'constructor');
    }

    $callableArgDefs = $context['callableArgDefs'] ?? null;
    if (is_array($callableArgDefs) && $callableArgDefs !== []) {
        $mapped['method'] = projectPublicArgsToTarget($storyArgs, $callableArgDefs, 'method');
    } elseif ($context['type'] !== 'template') {
        $mapped['method'] = projectNamespacedPublicArgs($storyArgs, 'method');
    }

    return $mapped;
}

/**
 * @param array<string, mixed> $storyArgs
 * @param array<string, mixed> $targetArgDefs
 * @return array<string, mixed>
 */
function projectPublicArgsToTarget(array $storyArgs, array $targetArgDefs, string $scope): array
{
    $mapped = [];

    foreach (array_keys($targetArgDefs) as $name) {
        $scopedKey = $scope . '.' . $name;
        if (array_key_exists($scopedKey, $storyArgs)) {
            $mapped[$name] = $storyArgs[$scopedKey];
            continue;
        }

        if (array_key_exists($name, $storyArgs)) {
            $mapped[$name] = $storyArgs[$name];
        }
    }

    return $mapped;
}

/**
 * @param array<string, mixed> $storyArgs
 * @return array<string, mixed>
 */
function projectNamespacedPublicArgs(array $storyArgs, string $scope): array
{
    $mapped = [];

    foreach ($storyArgs as $key => $value) {
        if (str_starts_with($key, 'constructor.')) {
            if ($scope === 'constructor') {
                $mapped[substr($key, strlen('constructor.'))] = $value;
            }
            continue;
        }

        if (str_starts_with($key, 'method.')) {
            if ($scope === 'method') {
                $mapped[substr($key, strlen('method.'))] = $value;
            }
            continue;
        }

        $mapped[$key] = $value;
    }

    return $mapped;
}

/**
 * Resolve the final HTML output from a method result and output buffer.
 */
function resolveOutput(mixed $result, string $buffered): string
{
    if ($result instanceof \Generator) {
        $chunks = [];
        foreach (iterator_to_array($result, false) as $chunk) {
            $chunks[] = stringifyOutputValue($chunk);
        }
        $result = implode('', $chunks);
    }

    if (is_object($result) && method_exists($result, '__toString')) {
        $result = (string) $result;
    }

    if (is_array($result) && array_key_exists('html', $result) && is_string($result['html'])) {
        $result = $result['html'];
    }

    if (is_string($result) && $result !== '') {
        return $buffered !== '' ? $result . $buffered : $result;
    }

    if ($buffered !== '') {
        return $buffered;
    }

    if (is_scalar($result) && $result !== '') {
        return (string) $result;
    }

    return '';
}

/**
 * @return array{html: string, error: string, trace: string}
 */
function buildRunnerErrorResponse(\Throwable $e): array
{
    return [
        'html' => '',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ];
}

/**
 * @param array{html: string, error?: string, trace?: string} $response
 */
function encodeRunnerResponse(array $response): string
{
    return json_encode($response, JSON_THROW_ON_ERROR);
}
