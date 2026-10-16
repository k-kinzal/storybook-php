<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use Stringable;
use Traversable;

/**
 * Converts a JSON-decoded Storybook value into the PHP value described by a
 * type contract.
 *
 * `null` always passes through: whether a slot accepts `null` is decided by
 * the parameter or property that owns the slot, where PHP's own declaration
 * is known.
 *
 * @throws HydrationException when the value cannot satisfy the contract
 *
 * @example Hydrating a documented array shape
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{count: int, tags: list<string>}');
 *     \StorybookPhp\Runtime\Casting\hydrateValue(['count' => '3', 'tags' => ['a', 5]], $type, $ctx) // => ['count' => 3, 'tags' => ['a', '5']]
 */
function hydrateValue(mixed $value, TypeNode $type, HydrationContext $context): mixed
{
    if ($value === null) {
        return null;
    }

    return match ($type->kind) {
        'named' => \StorybookPhp\Runtime\Casting\hydrateNamedType($value, $type->name, $context),
        'literal' => \StorybookPhp\Runtime\Casting\hydrateLiteralType($value, $type, $context),
        'nullable' => \StorybookPhp\Runtime\Casting\hydrateValue($value, $type->members[0], $context),
        'union' => \StorybookPhp\Runtime\Casting\hydrateUnionType($value, $type, $context),
        'intersection' => \StorybookPhp\Runtime\Casting\hydrateIntersectionType($value, $type, $context),
        'generic' => \StorybookPhp\Runtime\Casting\hydrateGenericType($value, $type, $context),
        'shape' => \StorybookPhp\Runtime\Casting\hydrateShapeType($value, $type, $context),
    };
}

/**
 * Hydrates a value against a builtin name or a class, interface, or enum name.
 *
 * @throws HydrationException when the value cannot satisfy the type
 */
function hydrateNamedType(mixed $value, string $name, HydrationContext $context): mixed
{
    $builtin = \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($name);
    if ($builtin === null) {
        return \StorybookPhp\Runtime\Casting\hydrateObject($name, $value, $context);
    }

    return \StorybookPhp\Runtime\Casting\castBuiltinValue($builtin, $value, $context);
}

/**
 * Converts a value to a builtin PHP type, accepting only conversions that
 * preserve the value (`'12'` → `12`, but `'abc'` → error).
 *
 * @throws HydrationException when the value cannot be converted
 *
 * @example Lossless scalar conversion
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     \StorybookPhp\Runtime\Casting\castBuiltinValue('int', '12', $ctx) // => 12
 *     \StorybookPhp\Runtime\Casting\castBuiltinValue('bool', 'off', $ctx) // => false
 *     \StorybookPhp\Runtime\Casting\castBuiltinValue('int', 'abc', $ctx) // throws \StorybookPhp\Runtime\Contract\HydrationException: expected int, received string 'abc'
 */
function castBuiltinValue(string $builtin, mixed $value, HydrationContext $ctx): mixed
{
    return match ($builtin) {
        'mixed' => $value,
        'string' => \StorybookPhp\Runtime\Casting\castToString($value, $ctx),
        'int' => \StorybookPhp\Runtime\Casting\castToInt($value, $ctx),
        'float' => \StorybookPhp\Runtime\Casting\castToFloat($value, $ctx),
        'bool' => \StorybookPhp\Runtime\Casting\castToBool($value, $ctx),
        'numeric' => \StorybookPhp\Runtime\Casting\castToNumeric($value, $ctx),
        'null' => throw \StorybookPhp\Runtime\Casting\hydrationFailure($ctx, 'null', $value),
        'void', 'never' => throw \StorybookPhp\Runtime\Casting\hydrationFailure($ctx, $builtin, $value, "A {$builtin} parameter cannot receive a value."),
        'self', 'static', 'parent' => throw \StorybookPhp\Runtime\Casting\hydrationFailure($ctx, $builtin, $value, "'{$builtin}' could not be resolved to a class because the declaration has no owning class."),
        default => \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue($builtin, $value, $ctx),
    };
}

/**
 * Validates values for the builtin types that are not converted but only
 * checked: arrays, iterables, objects, callables, scalars, and resources.
 *
 * @throws HydrationException when the value is not of the builtin type
 */
function castStructuralBuiltinValue(string $builtin, mixed $value, HydrationContext $ctx): mixed
{
    $accepted = match ($builtin) {
        'array', 'list', 'non-empty-list', 'non-empty-array' => is_array($value),
        'iterable' => is_array($value) || $value instanceof Traversable,
        'object' => is_object($value) || is_array($value),
        'callable' => is_callable($value),
        'scalar' => is_scalar($value),
        'resource' => is_resource($value),
        default => throw \StorybookPhp\Runtime\Casting\hydrationFailure($ctx, $builtin, $value, "'{$builtin}' is not a supported builtin type."),
    };
    if (!$accepted) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($ctx, $builtin, $value);
    }

    return $builtin === 'object' && is_array($value) ? (object) $value : $value;
}

/**
 * @throws HydrationException when the value has no lossless string form
 */
function castToString(mixed $value, HydrationContext $context): string
{
    if (is_string($value)) {
        return $value;
    }
    if (is_int($value) || is_float($value) || is_bool($value) || $value instanceof Stringable) {
        return (string) $value;
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'string', $value);
}

/**
 * @throws HydrationException when the value is not an integer or an integral number
 */
function castToInt(mixed $value, HydrationContext $context): int
{
    if (is_int($value)) {
        return $value;
    }
    if (is_bool($value)) {
        return (int) $value;
    }
    if (is_float($value) && floor($value) === $value && is_finite($value)) {
        return (int) $value;
    }
    if (is_string($value) && is_numeric($value) && floor((float) $value) === (float) $value && is_finite((float) $value)) {
        return (int) $value;
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'int', $value);
}

/**
 * @throws HydrationException when the value is not numeric
 */
function castToFloat(mixed $value, HydrationContext $context): float
{
    if (is_float($value)) {
        return $value;
    }
    if (is_int($value) || is_bool($value) || (is_string($value) && is_numeric($value))) {
        return (float) $value;
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'float', $value);
}

/**
 * Accepts booleans, `0`/`1`, and the usual textual spellings of a flag.
 *
 * @throws HydrationException when the value is not a recognisable flag
 */
function castToBool(mixed $value, HydrationContext $context): bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_int($value) || is_float($value)) {
        return $value !== 0 && $value !== 0.0;
    }
    $flags = ['1' => true, 'true' => true, 'yes' => true, 'on' => true, '0' => false, 'false' => false, 'no' => false, 'off' => false, '' => false];
    if (is_string($value) && isset($flags[strtolower($value)])) {
        return $flags[strtolower($value)];
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'bool', $value, "Use true/false, 1/0, or 'yes'/'no'.");
}

/**
 * @throws HydrationException when the value is not an int, float, or numeric string
 */
function castToNumeric(mixed $value, HydrationContext $context): int|float
{
    if (is_int($value) || is_float($value)) {
        return $value;
    }
    if (is_string($value) && is_numeric($value)) {
        return str_contains($value, '.') || stripos($value, 'e') !== false ? (float) $value : (int) $value;
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'numeric', $value);
}

/**
 * Hydrates a value against a literal type such as `'draft'` or `1`.
 *
 * @throws HydrationException when the value is not the literal
 */
function hydrateLiteralType(mixed $value, TypeNode $type, HydrationContext $context): string|int|float|bool|null
{
    $literal = $type->literal;
    if ($value === $literal) {
        return $literal;
    }
    if (is_string($value) && !is_string($literal) && !is_bool($literal) && is_numeric($value) && (float) $value === (float) $literal) {
        return $literal;
    }
    if (is_bool($literal) && (is_int($value) || is_string($value))) {
        return \StorybookPhp\Runtime\Casting\castToBool($value, $context) === $literal
            ? $literal
            : throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, \StorybookPhp\Runtime\Contract\describeTypeNode($type), $value);
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, \StorybookPhp\Runtime\Contract\describeTypeNode($type), $value);
}

/**
 * Builds the exception for a value that does not satisfy its contract.
 *
 * @example Message shape
 *     $ctx = new \StorybookPhp\Runtime\Casting\HydrationContext(['types' => [], 'slots' => []], 'App\Card::$count');
 *     \StorybookPhp\Runtime\Casting\hydrationFailure($ctx, 'int', 'abc')->getMessage() // => "Cannot hydrate App\\Card::\$count: expected int, received string 'abc'."
 */
function hydrationFailure(HydrationContext $context, string $expected, mixed $value, string $hint = ''): HydrationException
{
    $reason = "expected {$expected}, received " . \StorybookPhp\Runtime\Casting\describeHydrationValue($value) . '.';

    return new HydrationException($context->path, $hint === '' ? $reason : "{$reason} {$hint}");
}

/**
 * Describes a value for error messages without dumping large payloads.
 *
 * @example Value descriptions
 *     \StorybookPhp\Runtime\Casting\describeHydrationValue(['id' => 1, 'name' => 'x']) // => 'object with keys [id, name]'
 *     \StorybookPhp\Runtime\Casting\describeHydrationValue([1, 2, 3]) // => 'list of 3 items'
 *     \StorybookPhp\Runtime\Casting\describeHydrationValue(true) // => 'bool true'
 *     \StorybookPhp\Runtime\Casting\describeHydrationValue(null) // => 'null'
 */
function describeHydrationValue(mixed $value): string
{
    if ($value === null) {
        return 'null';
    }
    if (is_bool($value)) {
        return 'bool ' . ($value ? 'true' : 'false');
    }
    if (is_int($value) || is_float($value)) {
        return get_debug_type($value) . ' ' . var_export($value, true);
    }
    if (is_string($value)) {
        $shown = strlen($value) > 40 ? substr($value, 0, 37) . '...' : $value;

        return "string '{$shown}'";
    }
    if (is_array($value)) {
        if ($value === []) {
            return 'empty array';
        }
        if (\StorybookPhp\Runtime\Casting\isListArray($value)) {
            return 'list of ' . count($value) . ' item' . (count($value) === 1 ? '' : 's');
        }

        return 'object with keys [' . implode(', ', array_map('strval', array_keys($value))) . ']';
    }

    return get_debug_type($value) . ' instance';
}

/**
 * Detect whether an array uses consecutive integer keys starting at 0.
 *
 * @param array<array-key, mixed> $value
 * @phpstan-assert-if-true list<mixed> $value
 *
 * @example Lists versus objects
 *     \StorybookPhp\Runtime\Casting\isListArray(['a', 'b']) // => true
 *     \StorybookPhp\Runtime\Casting\isListArray(['name' => 'a']) // => false
 */
function isListArray(array $value): bool
{
    $expectedKey = 0;
    foreach (array_keys($value) as $key) {
        if ($key !== $expectedKey) {
            return false;
        }
        $expectedKey++;
    }

    return true;
}
