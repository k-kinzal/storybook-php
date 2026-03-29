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

function loadAdapter(?string $adapterPath): ?callable
{
    if ($adapterPath === null || $adapterPath === '') {
        return null;
    }

    $adapter = require $adapterPath;
    if (!is_callable($adapter)) {
        throw new \RuntimeException("Adapter file must return a callable: {$adapterPath}");
    }

    return $adapter;
}

/**
 * @param array{type: string, file: string, executionFile: string, args: array<string, mixed>} $context
 */
function applyAdapter(callable $adapter, mixed $result, string $buffered, ?object $instance, array $context): string
{
    $html = call_user_func($adapter, $result, $buffered, $instance, $context);
    if (!is_string($html)) {
        throw new \RuntimeException('Adapter must return a string.');
    }

    return $html;
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
