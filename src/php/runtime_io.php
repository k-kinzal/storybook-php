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
 *   adapter: string|null,
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

    $adapter = $decoded['adapter'] ?? null;
    if ($adapter !== null && !is_string($adapter)) {
        throw new \RuntimeException('Request field "adapter" must be a string or null.');
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
        'adapter' => $adapter,
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
 * @return array{mapArgs: callable|null, render: callable|null}|null
 */
function loadAdapter(?string $adapterPath): ?array
{
    if ($adapterPath === null || $adapterPath === '') {
        return null;
    }

    $adapter = require $adapterPath;
    if (is_callable($adapter)) {
        return ['mapArgs' => null, 'render' => $adapter];
    }

    if (!is_array($adapter)) {
        throw new \RuntimeException("Adapter file must return an adapter definition array or callable: {$adapterPath}");
    }

    $mapArgs = $adapter['mapArgs'] ?? null;
    $render = $adapter['render'] ?? null;

    if ($mapArgs !== null && !is_callable($mapArgs)) {
        throw new \RuntimeException("Adapter 'mapArgs' hook must be callable: {$adapterPath}");
    }

    if ($render !== null && !is_callable($render)) {
        throw new \RuntimeException("Adapter 'render' hook must be callable: {$adapterPath}");
    }

    if ($mapArgs === null && $render === null) {
        throw new \RuntimeException("Adapter must define at least one of 'mapArgs' or 'render': {$adapterPath}");
    }

    return ['mapArgs' => $mapArgs, 'render' => $render];
}

/**
 * @param array{
 *   mapArgs: callable|null,
 *   render: callable|null
 * } $adapter
 * @param array{
 *   type: string,
 *   file: string,
 *   executionFile: string,
 *   args?: array<string, mixed>,
 *   storyArgs?: array<string, mixed>,
 *   publicArgDefs?: array<string, mixed>|null,
 *   constructorArgDefs?: array<string, mixed>|null,
 *   callableArgDefs?: array<string, mixed>|null
 * } $context
 */
function applyAdapterRender(array $adapter, mixed $result, string $buffered, ?object $instance, array $context): string
{
    $render = $adapter['render'] ?? null;
    if ($render === null) {
        return resolveOutput($result, $buffered);
    }

    /** @var callable $render */
    $html = call_user_func($render, $result, $buffered, $instance, $context);
    if (!is_string($html)) {
        throw new \RuntimeException('Adapter must return a string.');
    }

    return $html;
}

/**
 * @param array{mapArgs: callable|null, render: callable|null}|null $adapter
 * @param array{
 *   type: string,
 *   file: string,
 *   executionFile: string,
 *   storyArgs: array<string, mixed>,
 *   publicArgDefs?: array<string, mixed>|null,
 *   constructorArgDefs?: array<string, mixed>|null,
 *   callableArgDefs?: array<string, mixed>|null
 * } $context
 * @return array{constructor?: array<string, mixed>, method?: array<string, mixed>, template?: array<string, mixed>}
 */
function mapAdapterArgs(?array $adapter, array $context): array
{
    $mapArgs = $adapter['mapArgs'] ?? null;
    $mapped = $mapArgs !== null
        ? call_user_func($mapArgs, $context['storyArgs'], $context)
        : defaultAdapterMapArgs($context['storyArgs'], $context);

    if (!is_array($mapped)) {
        throw new \RuntimeException("Adapter 'mapArgs' hook must return an array.");
    }

    $normalized = [];
    foreach (['constructor', 'method', 'template'] as $field) {
        if (!array_key_exists($field, $mapped)) {
            continue;
        }

        if (!is_array($mapped[$field])) {
            throw new \RuntimeException("Adapter 'mapArgs.{$field}' value must be an object.");
        }

        /** @var array<array-key, mixed> $fieldValue */
        $fieldValue = $mapped[$field];
        $normalized[$field] = normalizeStringKeyArray($fieldValue, "mapArgs.{$field}");
    }

    return $normalized;
}

/**
 * @param array<string, mixed> $storyArgs
 * @param array{
 *   type: string,
 *   constructorArgDefs?: array<string, mixed>|null,
 *   callableArgDefs?: array<string, mixed>|null
 * } $context
 * @return array{constructor?: array<string, mixed>, method?: array<string, mixed>, template?: array<string, mixed>}
 */
function defaultAdapterMapArgs(array $storyArgs, array $context): array
{
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
        $mapped['constructor'] = projectStoryArgsToTarget($storyArgs, $constructorArgDefs, 'constructor');
    } elseif ($context['type'] === 'classMethod') {
        $mapped['constructor'] = projectStoryArgsWithoutDefinitions($storyArgs, 'constructor');
    }

    $callableArgDefs = $context['callableArgDefs'] ?? null;
    if (is_array($callableArgDefs) && $callableArgDefs !== []) {
        $mapped['method'] = projectStoryArgsToTarget($storyArgs, $callableArgDefs, 'method');
    } elseif ($context['type'] !== 'template') {
        $mapped['method'] = projectStoryArgsWithoutDefinitions($storyArgs, 'method');
    }

    return $mapped;
}

/**
 * @param array<string, mixed> $storyArgs
 * @param array<string, mixed> $targetArgDefs
 * @return array<string, mixed>
 */
function projectStoryArgsToTarget(array $storyArgs, array $targetArgDefs, string $scope): array
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
function projectStoryArgsWithoutDefinitions(array $storyArgs, string $scope): array
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
