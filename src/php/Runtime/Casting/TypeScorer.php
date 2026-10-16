<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use StorybookPhp\Runtime\Contract\TypeNode;
use Traversable;

/**
 * Scores how well a type accepts a value. Zero means the value cannot be
 * hydrated into the type; higher scores are more exact matches.
 *
 * @example Exact matches score higher than conversions
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $int = new \StorybookPhp\Runtime\Contract\TypeNode('named', 'int');
 *     \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($int, 42, $ctx) // => 3
 *     \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($int, '42', $ctx) // => 2
 *     \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($int, 'abc', $ctx) // => 0
 */
function scoreTypeNodeMatch(TypeNode $type, mixed $value, HydrationContext $context): int
{
    return match ($type->kind) {
        'named' => \StorybookPhp\Runtime\Casting\scoreNamedTypeMatch($type->name, $value, $context),
        'literal' => \StorybookPhp\Runtime\Casting\scoreLiteralTypeMatch($type, $value),
        'nullable' => $value === null ? 3 : \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($type->members[0], $value, $context),
        'union' => \StorybookPhp\Runtime\Casting\scoreUnionTypeMatch($type->members, $value, $context),
        'intersection' => \StorybookPhp\Runtime\Casting\scoreIntersectionTypeMatch($type->members, $value, $context),
        'generic' => \StorybookPhp\Runtime\Casting\scoreGenericTypeMatch($type, $value, $context),
        'shape' => \StorybookPhp\Runtime\Casting\scoreShapeTypeMatch($type, $value),
    };
}

/**
 * Picks the union member with the highest score, preferring earlier members
 * on ties. Returns null when no member accepts the value.
 *
 * @param list<TypeNode> $members
 *
 * @example Earlier members win ties
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('scalar|string');
 *     \StorybookPhp\Runtime\Casting\selectUnionMember($type->members, 'x', $ctx)->name // => 'scalar'
 */
function selectUnionMember(array $members, mixed $value, HydrationContext $context): ?TypeNode
{
    $best = null;
    $bestScore = 0;
    foreach ($members as $member) {
        if ($member->kind === 'named' && $member->name === 'mixed') {
            return $member;
        }
        $score = \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($member, $value, $context);
        if ($score > $bestScore) {
            $best = $member;
            $bestScore = $score;
        }
    }

    return $best;
}

/**
 * @param list<TypeNode> $members
 */
function scoreUnionTypeMatch(array $members, mixed $value, HydrationContext $context): int
{
    $best = 0;
    foreach ($members as $member) {
        $best = max($best, \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($member, $value, $context));
    }

    return $best;
}

/**
 * @param list<TypeNode> $members
 */
function scoreIntersectionTypeMatch(array $members, mixed $value, HydrationContext $context): int
{
    if (!is_object($value)) {
        $first = $members[0] ?? null;

        return $first instanceof TypeNode && is_array($value) ? min(1, \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch($first, $value, $context)) : 0;
    }
    foreach ($members as $member) {
        if (!\StorybookPhp\Runtime\Casting\docTypeIsClassLike($member) || !$value instanceof $member->name) {
            return 0;
        }
    }

    return 3;
}

/**
 * Scores a builtin or class name against a value.
 */
function scoreNamedTypeMatch(string $name, mixed $value, HydrationContext $context): int
{
    $builtin = \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($name);
    if ($builtin !== null) {
        return \StorybookPhp\Runtime\Casting\scoreBuiltinTypeMatch($builtin, $value);
    }

    return \StorybookPhp\Runtime\Casting\scoreClassTypeMatch($name, $value, $context);
}

/**
 * Scores a canonical builtin type against a value.
 */
function scoreBuiltinTypeMatch(string $builtin, mixed $value): int
{
    return match ($builtin) {
        'string' => \StorybookPhp\Runtime\Casting\scoreStringTypeMatch($value),
        'int' => \StorybookPhp\Runtime\Casting\scoreIntTypeMatch($value),
        'float' => \StorybookPhp\Runtime\Casting\scoreFloatTypeMatch($value),
        'bool' => \StorybookPhp\Runtime\Casting\scoreBoolTypeMatch($value),
        'numeric' => is_int($value) || is_float($value) ? 3 : (is_string($value) && is_numeric($value) ? 2 : 0),
        'scalar' => is_scalar($value) ? 3 : 0,
        'null' => $value === null ? 3 : 0,
        default => \StorybookPhp\Runtime\Casting\scoreStructuralBuiltinMatch($builtin, $value),
    };
}

/**
 * Scores the builtin types that describe arrays, objects, callables, and resources.
 */
function scoreStructuralBuiltinMatch(string $builtin, mixed $value): int
{
    return match ($builtin) {
        'array', 'non-empty-array' => is_array($value) ? 3 : 0,
        'list', 'non-empty-list' => is_array($value) ? (\StorybookPhp\Runtime\Casting\isListArray($value) ? 3 : 1) : 0,
        'iterable' => is_array($value) || $value instanceof Traversable ? 3 : 0,
        'object' => is_object($value) ? 3 : (is_array($value) ? 1 : 0),
        'callable' => is_callable($value) ? 3 : 0,
        'resource' => is_resource($value) ? 3 : 0,
        default => 0,
    };
}

/**
 * Scores a literal type: exact values score 3, numeric strings 2.
 */
function scoreLiteralTypeMatch(TypeNode $type, mixed $value): int
{
    if ($value === $type->literal) {
        return 3;
    }
    if (is_string($value) && is_numeric($value) && (is_int($type->literal) || is_float($type->literal))) {
        return (float) $value === (float) $type->literal ? 2 : 0;
    }

    return 0;
}

/**
 * Scores whether a value can be converted to a string without data loss.
 */
function scoreStringTypeMatch(mixed $value): int
{
    if (is_string($value)) {
        return 3;
    }
    if (is_object($value) && method_exists($value, '__toString')) {
        return 2;
    }

    return is_int($value) || is_float($value) || is_bool($value) ? 1 : 0;
}

/**
 * Scores exact integers above numeric strings and integral floats.
 */
function scoreIntTypeMatch(mixed $value): int
{
    if (is_int($value)) {
        return 3;
    }
    if (is_string($value) && preg_match('/^-?\d+$/', $value) === 1) {
        return 2;
    }

    return is_float($value) && floor($value) === $value ? 1 : 0;
}

/**
 * Scores exact floats above integers and numeric strings.
 */
function scoreFloatTypeMatch(mixed $value): int
{
    if (is_float($value)) {
        return 3;
    }
    if (is_int($value)) {
        return 2;
    }

    return is_string($value) && is_numeric($value) ? 1 : 0;
}

/**
 * Scores booleans and the explicit scalar forms the runtime accepts.
 */
function scoreBoolTypeMatch(mixed $value): int
{
    if (is_bool($value)) {
        return 3;
    }
    if (is_int($value) && in_array($value, [0, 1], true)) {
        return 1;
    }

    return is_string($value)
        && in_array(strtolower($value), ['0', '1', 'true', 'false', 'yes', 'no', 'on', 'off', ''], true)
        ? 1
        : 0;
}

/**
 * Scores a class, interface, or enum against a value, following type bindings.
 */
function scoreClassTypeMatch(string $className, mixed $value, HydrationContext $context): int
{
    if (is_object($value)) {
        return $value instanceof $className ? 3 : 0;
    }
    $resolved = \StorybookPhp\Runtime\Contract\boundTypeName($className, $context->bindings);
    if (\StorybookPhp\Runtime\Contract\enumTypeExists($resolved)) {
        return \StorybookPhp\Runtime\Contract\findEnumCase(\StorybookPhp\Runtime\Contract\requireExistingClass($resolved), $value) !== null ? 2 : 0;
    }
    if (!class_exists($resolved)) {
        return 0;
    }
    if (is_array($value)) {
        if (!\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray($resolved, $value)) {
            return 0;
        }

        return \StorybookPhp\Runtime\Casting\isListArray($value) && $value !== [] ? 1 : 2;
    }

    return \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar($resolved) ? 1 : 0;
}

/**
 * Scores array-likes, builtin generics, and generic class wrappers.
 */
function scoreGenericTypeMatch(TypeNode $type, mixed $value, HydrationContext $context): int
{
    $builtin = \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($type->name);
    if ($builtin !== null && \StorybookPhp\Runtime\Contract\isArrayLikeTypeName($builtin)) {
        if (is_array($value)) {
            return str_contains($builtin, 'list') && !\StorybookPhp\Runtime\Casting\isListArray($value) ? 1 : 4;
        }

        return $value instanceof Traversable ? 2 : 0;
    }
    if ($builtin !== null) {
        return \StorybookPhp\Runtime\Casting\scoreBuiltinTypeMatch($builtin, $value);
    }
    if (is_object($value)) {
        return $value instanceof $type->name ? 5 : 0;
    }
    $resolved = \StorybookPhp\Runtime\Contract\boundTypeName($type->name, $context->bindings);

    return is_array($value) && class_exists($resolved) && \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray($resolved, $value) ? 4 : 0;
}

/**
 * Scores an array or object shape: every required key must be present.
 */
function scoreShapeTypeMatch(TypeNode $type, mixed $value): int
{
    if (strtolower($type->name) === 'object') {
        return is_object($value) ? 4 : (is_array($value) ? 3 : 0);
    }
    if (!is_array($value)) {
        return 0;
    }
    foreach (array_keys($type->fields) as $key) {
        if (!array_key_exists($key, $value) && !in_array($key, $type->optionalKeys, true)) {
            return 0;
        }
    }

    return 4;
}
