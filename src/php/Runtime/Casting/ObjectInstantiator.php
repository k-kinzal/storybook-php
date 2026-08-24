<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionType;
use ReflectionUnionType;

/**
 * Instantiates a class from Storybook input using the constructor shape when possible.
 *
 * Associative arrays are treated as named args, lists as positional args, and
 * scalars fall back to single-parameter constructors.
 *
 * @param class-string $className
 * @param array<string, mixed>|null $typeMap
 */
function instantiateClassFromValue(string $className, mixed $value, ?array $typeMap = null): object
{
    $ref = new ReflectionClass($className);

    if ($value instanceof $className) {
        return $value;
    }

    $constructor = $ref->getConstructor();
    if ($constructor === null) {
        return $ref->newInstance();
    }

    if (is_array($value)) {
        if (\StorybookPhp\Runtime\Casting\isListArray($value)) {
            return $ref->newInstanceArgs($value);
        }

        return $ref->newInstanceArgs(\StorybookPhp\Runtime\Execution\matchArgs($constructor, $value, $typeMap));
    }

    $parameters = $constructor->getParameters();
    if (count($parameters) === 1 && !$parameters[0]->isVariadic()) {
        $parameter = $parameters[0];
        $docType = \StorybookPhp\Runtime\Execution\resolveParamDocType($parameter, \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($constructor));

        return $ref->newInstanceArgs([
            \StorybookPhp\Runtime\Casting\castArg($parameter, $value, $docType, $typeMap),
        ]);
    }

    return $ref->newInstanceArgs(\StorybookPhp\Runtime\Execution\matchArgs($constructor, (array) $value, $typeMap));
}

/**
 * Scores whether an input array satisfies a class constructor's positional or
 * named argument contract before attempting instantiation.
 *
 * @param class-string $className
 * @param array<array-key, mixed> $value
 */
function scoreClassInstantiationMatch(string $className, array $value): int
{
    $reflection = new ReflectionClass($className);
    if (!$reflection->isInstantiable()) {
        return 0;
    }

    $constructor = $reflection->getConstructor();
    if ($constructor === null) {
        return 1;
    }

    $parameters = $constructor->getParameters();
    if (\StorybookPhp\Runtime\Casting\isListArray($value)) {
        $argumentCount = count($value);
        $parameterCount = count($parameters);
        if ($argumentCount < $constructor->getNumberOfRequiredParameters()) {
            return 0;
        }

        $lastParameter = $parameters[$parameterCount - 1] ?? null;
        if ($argumentCount > $parameterCount && (!$lastParameter instanceof ReflectionParameter || !$lastParameter->isVariadic())) {
            return 0;
        }

        return 1;
    }

    foreach ($parameters as $parameter) {
        if (
            !$parameter->isOptional()
            && !$parameter->isVariadic()
            && !$parameter->allowsNull()
            && !array_key_exists($parameter->getName(), $value)
        ) {
            return 0;
        }
    }

    return 1;
}

/**
 * Checks whether a generic collection wrapper can accept one array argument.
 *
 * @param class-string $className
 */
function canInstantiateCollectionWrapper(string $className): bool
{
    $reflection = new ReflectionClass($className);
    if (!$reflection->isInstantiable()) {
        return false;
    }

    $constructor = $reflection->getConstructor();
    if ($constructor === null) {
        return true;
    }

    if ($constructor->getNumberOfRequiredParameters() > 1) {
        return false;
    }

    $parameter = $constructor->getParameters()[0] ?? null;
    return $parameter instanceof ReflectionParameter && \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($parameter->getType());
}

/**
 * Checks whether a reflected parameter type accepts a PHP array directly.
 */
function reflectionTypeAcceptsArray(?ReflectionType $type): bool
{
    if (!$type instanceof ReflectionType) {
        return true;
    }

    if ($type instanceof ReflectionNamedType) {
        return in_array(strtolower($type->getName()), ['array', 'iterable', 'mixed'], true);
    }

    if ($type instanceof ReflectionUnionType) {
        foreach ($type->getTypes() as $member) {
            if ($member instanceof ReflectionNamedType && \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($member)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Wraps a cast collection when the wrapper exposes a compatible constructor;
 * otherwise returns the cast items unchanged.
 *
 * @param class-string $className
 * @param array<array-key, mixed> $items
 * @return object|array<array-key, mixed>
 */
function instantiateCollectionWrapper(string $className, array $items): object|array
{
    if (!\StorybookPhp\Runtime\Casting\canInstantiateCollectionWrapper($className)) {
        return $items;
    }

    $reflection = new ReflectionClass($className);
    if (!$reflection->getConstructor() instanceof ReflectionMethod) {
        return $reflection->newInstance();
    }

    return $reflection->newInstanceArgs([$items]);
}
