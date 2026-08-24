<?php

declare(strict_types=1);

/**
 * Parse PHPDoc @param / @phpstan-param / @psalm-param annotations from a
 * function or method docblock. Returns a map of parameter name to doc type.
 *
 * Priority per param: @phpstan-param > @psalm-param > @param.
 *
 * @return array<string, string>
 */
function parseDocBlockParamTypes(?ReflectionFunctionAbstract $ref): array
{
    if (!$ref instanceof ReflectionFunctionAbstract) {
        return [];
    }

    $doc = $ref->getDocComment();
    if ($doc === false) {
        return [];
    }

    $types = [];

    if (preg_match_all('/@phpstan-param\s+(.+?)\s+\$(\w+)/m', $doc, $matches, PREG_SET_ORDER) !== false) {
        foreach ($matches as $match) {
            $types[$match[2]] = trim($match[1]);
        }
    }

    if (preg_match_all('/@psalm-param\s+(.+?)\s+\$(\w+)/m', $doc, $matches, PREG_SET_ORDER) !== false) {
        foreach ($matches as $match) {
            if (!isset($types[$match[2]])) {
                $types[$match[2]] = trim($match[1]);
            }
        }
    }

    if (preg_match_all('/@param\s+(.+?)\s+\$(\w+)/m', $doc, $matches, PREG_SET_ORDER) !== false) {
        foreach ($matches as $match) {
            if (!isset($types[$match[2]])) {
                $types[$match[2]] = trim($match[1]);
            }
        }
    }

    return $types;
}

/**
 * Split generic type arguments on commas at <> depth 0.
 *
 * @return list<string>
 */
function splitGenericArgs(string $inner): array
{
    $parts = [];
    $depth = 0;
    $current = '';
    $len = strlen($inner);

    for ($i = 0; $i < $len; $i++) {
        $ch = $inner[$i];
        if ($ch === '<') {
            $depth++;
            $current .= $ch;
        } elseif ($ch === '>') {
            $depth--;
            $current .= $ch;
        } elseif ($ch === ',' && $depth === 0) {
            $parts[] = trim($current);
            $current = '';
        } else {
            $current .= $ch;
        }
    }

    $trimmed = trim($current);
    if ($trimmed !== '') {
        $parts[] = $trimmed;
    }

    return $parts;
}

/** Native array-like type names recognised by PHPStan / Psalm. */
const NATIVE_ARRAY_TYPES = ['list', 'array', 'iterable', 'non-empty-list', 'non-empty-array'];

/**
 * Extract the inner value type from a generic / array doc type.
 *
 * Returns ['valueType' => string, 'wrapperClass' => string|null] or null.
 *
 * @return array{valueType: string, wrapperClass: string|null}|null
 */
function extractGenericValueType(string $docType): ?array
{
    $type = preg_replace('/\|null$/i', '', $docType) ?? $docType;
    $type = preg_replace('/^null\|/i', '', $type) ?? $type;
    $type = trim($type);

    if (str_ends_with($type, '[]')) {
        return ['valueType' => substr($type, 0, -2), 'wrapperClass' => null];
    }

    if (preg_match('/^(.+?)<(.+)>$/', $type, $matches) === 1) {
        $outer = trim($matches[1]);
        $inner = trim($matches[2]);
        $args = splitGenericArgs($inner);
        $valueType = count($args) >= 2 ? trim($args[count($args) - 1]) : $inner;

        $isNative = in_array(strtolower($outer), NATIVE_ARRAY_TYPES, true);
        return [
            'valueType' => $valueType,
            'wrapperClass' => $isNative ? null : $outer,
        ];
    }

    return null;
}

/**
 * Check whether a PHPDoc type string represents an array-like or generic type.
 */
function isArrayLikeType(string $type): bool
{
    $t = preg_replace('/\|null$/i', '', $type) ?? $type;
    $t = preg_replace('/^null\|/i', '', $t) ?? $t;
    $t = trim($t);

    return str_ends_with($t, '[]') || preg_match('/^.+<.+>$/', $t) === 1;
}
