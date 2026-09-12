<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

use RuntimeException;

/**
 * Converts a render value into a string without relying on mixed casts.
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

/**
 * Produces a stable scalar value or type label for an error message.
 */
function stringifyScalarForError(mixed $value): string
{
    $stringValue = \StorybookPhp\Runtime\Contract\stringifyOutputValue($value);
    return $stringValue !== '' ? $stringValue : get_debug_type($value);
}

/**
 * @param array<array-key, mixed> $value
 * @return array<string, mixed>
 * @throws RuntimeException when a protocol object contains a numeric key
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
 * @throws RuntimeException when the value is not a list of non-empty strings
 */
function normalizeStringList(array $value, string $fieldName): array
{
    if (!\StorybookPhp\Runtime\Contract\isSequentialList($value)) {
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
