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
    return requireOutputBuffer(ob_get_clean());
}

/**
 * Converts the engine-level output-buffer failure into the runner contract.
 *
 * @throws RuntimeException when no output buffer is active
 */
function requireOutputBuffer(string|false $buffered): string
{
    if ($buffered === false) {
        throw new RuntimeException('Failed to collect output buffer.');
    }

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
            throw new RuntimeException("Field '{$fieldName}' must use string keys.");
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
    if (!isSequentialList($value)) {
        throw new RuntimeException("Field '{$fieldName}' must be a list of non-empty strings.");
    }

    $normalized = [];

    foreach ($value as $item) {
        if (!is_string($item) || $item === '') {
            throw new RuntimeException("Field '{$fieldName}' must be a list of non-empty strings.");
        }

        $normalized[] = $item;
    }

    return $normalized;
}

/**
 * @param array<array-key, mixed> $value
 */
function isSequentialList(array $value): bool
{
    $expectedKey = 0;

    foreach (array_keys($value) as $key) {
        if (!is_int($key) || $key !== $expectedKey) {
            return false;
        }

        $expectedKey++;
    }

    return true;
}
