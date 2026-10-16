<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use Traversable;

/**
 * Hydrates a value against a union by choosing the member that matches the
 * value best, preferring earlier members on ties.
 *
 * @throws HydrationException when no member accepts the value
 *
 * @example Choosing the union member by value shape
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('int|list<int>');
 *     \StorybookPhp\Runtime\Casting\hydrateUnionType('5', $type, $ctx) // => 5
 *     \StorybookPhp\Runtime\Casting\hydrateUnionType(['5'], $type, $ctx) // => [5]
 */
function hydrateUnionType(mixed $value, TypeNode $type, HydrationContext $context): mixed
{
    $member = \StorybookPhp\Runtime\Casting\selectUnionMember($type->members, $value, $context);
    if (!$member instanceof TypeNode) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure(
            $context,
            \StorybookPhp\Runtime\Contract\describeTypeNode($type),
            $value,
            'None of the union members accepts this value.',
        );
    }

    return \StorybookPhp\Runtime\Casting\hydrateValue($value, $member, $context);
}

/**
 * Hydrates a value against an intersection such as `Countable&Traversable`.
 *
 * Objects are accepted when they implement every member; other values are
 * built through the first class-like member (typically a bound interface)
 * and then verified against the rest.
 *
 * @throws HydrationException when the value cannot satisfy every member
 */
function hydrateIntersectionType(mixed $value, TypeNode $type, HydrationContext $context): object
{
    $classes = array_values(array_filter(
        $type->members,
        static fn (TypeNode $member): bool => \StorybookPhp\Runtime\Casting\docTypeIsClassLike($member),
    ));
    $expected = \StorybookPhp\Runtime\Contract\describeTypeNode($type);
    if ($classes === []) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $expected, $value, 'An intersection must name at least one class or interface.');
    }
    $object = is_object($value) ? $value : \StorybookPhp\Runtime\Casting\hydrateObject($classes[0]->name, $value, $context);
    foreach ($classes as $member) {
        if (!$object instanceof $member->name) {
            throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $expected, $value, get_class($object) . " does not implement {$member->name}.");
        }
    }

    return $object;
}

/**
 * Hydrates a value against a generic type: array-likes convert every
 * element, builtin generics such as `class-string<T>` fall back to their
 * base type, and class generics bind the class's `@template` names.
 *
 * @throws HydrationException when the value or an element cannot be converted
 *
 * @example Converting list elements
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('array<string, int>');
 *     \StorybookPhp\Runtime\Casting\hydrateGenericType(['a' => '1', 'b' => 2], $type, $ctx) // => ['a' => 1, 'b' => 2]
 */
function hydrateGenericType(mixed $value, TypeNode $type, HydrationContext $context): mixed
{
    $builtin = \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($type->name);
    if ($builtin === null) {
        return \StorybookPhp\Runtime\Casting\hydrateGenericObject($type->name, $type->members, $value, $context);
    }
    if (\StorybookPhp\Runtime\Contract\isArrayLikeTypeName($builtin)) {
        $elementType = $type->members[count($type->members) - 1];

        return \StorybookPhp\Runtime\Casting\hydrateArrayElements($value, $elementType, $context, \StorybookPhp\Runtime\Contract\describeTypeNode($type));
    }

    return \StorybookPhp\Runtime\Casting\castBuiltinValue($builtin, $value, $context);
}

/**
 * Hydrates every element of an array against the element type. Traversable
 * objects are passed through untouched.
 *
 * @return array<array-key, mixed>|Traversable<mixed>
 * @throws HydrationException when the value is not an array or an element cannot be converted
 */
function hydrateArrayElements(mixed $value, TypeNode $elementType, HydrationContext $context, string $expected): array|Traversable
{
    if ($value instanceof Traversable) {
        return $value;
    }
    if (!is_array($value)) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $expected, $value);
    }
    $result = [];
    foreach ($value as $key => $item) {
        $result[$key] = \StorybookPhp\Runtime\Casting\hydrateValue($item, $elementType, $context->key($key));
    }

    return $result;
}

/**
 * Hydrates a value against an array or object shape, converting every
 * declared key and keeping undeclared keys as they are.
 *
 * @return array<array-key, mixed>|object
 * @throws HydrationException when a required key is missing or a field cannot be converted
 *
 * @example Optional keys may be absent
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{id: int, note?: string}');
 *     \StorybookPhp\Runtime\Casting\hydrateShapeType(['id' => '7'], $type, $ctx) // => ['id' => 7]
 */
function hydrateShapeType(mixed $value, TypeNode $type, HydrationContext $context): array|object
{
    $expected = \StorybookPhp\Runtime\Contract\describeTypeNode($type);
    if (strtolower($type->name) === 'object') {
        $source = is_object($value) ? get_object_vars($value) : $value;
        if (!is_array($source)) {
            throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $expected, $value);
        }

        return (object) \StorybookPhp\Runtime\Casting\hydrateShapeFields($source, $type, $context, $expected);
    }
    if (!is_array($value)) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $expected, $value);
    }

    return \StorybookPhp\Runtime\Casting\hydrateShapeFields($value, $type, $context, $expected);
}

/**
 * @param array<array-key, mixed> $source
 * @return array<array-key, mixed>
 * @throws HydrationException when a required key is missing or a field cannot be converted
 */
function hydrateShapeFields(array $source, TypeNode $type, HydrationContext $context, string $expected): array
{
    $converted = [];
    foreach ($type->fields as $key => $fieldType) {
        if (array_key_exists($key, $source)) {
            $converted[$key] = \StorybookPhp\Runtime\Casting\hydrateValue($source[$key], $fieldType, $context->key($key));
            continue;
        }
        if (!in_array($key, $type->optionalKeys, true)) {
            throw \StorybookPhp\Runtime\Casting\hydrationFailure(
                $context,
                $expected,
                $source,
                "The required key '{$key}' is missing.",
            );
        }
    }

    return array_replace($source, $converted);
}
