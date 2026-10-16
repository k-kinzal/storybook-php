<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

use ReflectionFunctionAbstract;

/**
 * Parses @param / @phpstan-param / @psalm-param annotations from a
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

/**
 * Parses the `@var` / `@phpstan-var` / `@psalm-var` annotation of a property docblock.
 *
 * Priority: @phpstan-var > @psalm-var > @var. Returns null when the property has no documented type.
 *
 * @example Reading a property type
 *     \StorybookPhp\Runtime\Contract\parseDocBlockVarType("/**\n * @var array<string, App\\Item> \$items the items\n *\/") // => 'array<string, App\\Item>'
 *     \StorybookPhp\Runtime\Contract\parseDocBlockVarType(false) // => null
 */
function parseDocBlockVarType(string|false $docComment): ?string
{
    if ($docComment === false) {
        return null;
    }
    foreach (['phpstan-var', 'psalm-var', 'var'] as $tag) {
        if (preg_match('/@' . $tag . '[ \t]+([^\r\n]+)/', $docComment, $match) === 1) {
            return \StorybookPhp\Runtime\Contract\leadingTypeExpression($match[1]);
        }
    }

    return null;
}

/**
 * Returns the type expression at the start of a docblock tag line, which ends
 * at the first whitespace outside of brackets.
 *
 * @example Stopping before the variable name
 *     \StorybookPhp\Runtime\Contract\leadingTypeExpression('array{foo: int, bar?: string} $value description') // => 'array{foo: int, bar?: string}'
 */
function leadingTypeExpression(string $text): string
{
    $depth = 0;
    $length = strlen($text);
    for ($index = 0; $index < $length; $index++) {
        $char = $text[$index];
        if (in_array($char, ['<', '(', '{', '['], true)) {
            $depth++;
        } elseif (in_array($char, ['>', ')', '}', ']'], true)) {
            $depth--;
        } elseif ($depth === 0 && ($char === ' ' || $char === "\t") && !\StorybookPhp\Runtime\Contract\whitespaceJoinsTypeExpression($text, $index)) {
            return trim(substr($text, 0, $index));
        }
    }

    return trim($text);
}

/**
 * Reports whether the whitespace at an offset sits inside one type
 * expression, such as after `:` in a callable return type or around `|`.
 */
function whitespaceJoinsTypeExpression(string $text, int $offset): bool
{
    $previous = rtrim(substr($text, 0, $offset));
    $next = ltrim(substr($text, $offset));

    return ($previous !== '' && str_contains(':|&,', $previous[strlen($previous) - 1]))
        || ($next !== '' && str_contains('|&', $next[0]));
}
