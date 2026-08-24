<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use LogicException;
use ReflectionClass;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionUnionType;
use RuntimeException;

/**
 * Casts a value using a PHPDoc type string when the reflection parameter is untyped.
 *
 * @param array<string, mixed>|null $typeMap
 */
function castDocTypeValue(mixed $value, string $docType, ReflectionParameter $param, ?array $typeMap = null): mixed
{
    $normalized = trim($docType);
    if ($normalized === '' || strtolower($normalized) === 'mixed' || strtolower($normalized) === 'unknown') {
        return $value;
    }

    if ($value === null) {
        return null;
    }

    if (str_starts_with($normalized, '?')) {
        return \StorybookPhp\Runtime\Casting\castDocTypeValue($value, substr($normalized, 1), $param, $typeMap);
    }

    $unionTypes = \StorybookPhp\Runtime\Casting\splitUnionTypes($normalized);
    if (count($unionTypes) > 1) {
        $candidate = \StorybookPhp\Runtime\Casting\rankDocTypeCandidates($unionTypes, $value, $param, $typeMap)[0] ?? null;

        return $candidate === null ? $value : \StorybookPhp\Runtime\Casting\castDocTypeValue($value, $candidate, $param, $typeMap);
    }

    $info = \StorybookPhp\Runtime\Contract\extractGenericValueType($normalized);
    if ($info !== null) {
        return \StorybookPhp\Runtime\Casting\castReflectedGenericValue($value, $normalized, $info['wrapperClass'], $param, $typeMap);
    }

    return \StorybookPhp\Runtime\Casting\castInlineNamedType(\StorybookPhp\Runtime\Casting\resolveBoundTypeName($normalized, $typeMap, $param), $value);
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castReflectedGenericValue(
    mixed $value,
    string $docType,
    ?string $wrapperClass,
    ReflectionParameter $param,
    ?array $typeMap,
): mixed {
    $items = is_array($value) ? $value : (array) $value;
    $casted = \StorybookPhp\Runtime\Casting\castArrayElements($items, $docType, $param, $typeMap);
    if ($wrapperClass === null) {
        return $casted;
    }
    $wrapper = \StorybookPhp\Runtime\Casting\resolveBoundTypeName($wrapperClass, $typeMap, $param);
    if (!class_exists($wrapper)) {
        return $casted;
    }

    return \StorybookPhp\Runtime\Casting\instantiateCollectionWrapper($wrapper, $casted);
}

/**
 * Score how well a named type matches a given value.
 */
function scoreTypeMatch(ReflectionNamedType $type, mixed $value): int
{
    if ($value === null) {
        return $type->allowsNull() ? 2 : 0;
    }

    return \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch($type->getName(), $value);
}

/**
 * Cast a value to match the expected type of a reflection parameter.
 *
 * @param array<string, mixed>|null $typeMap
 */
function castArg(ReflectionParameter $param, mixed $value, ?string $docType = null, ?array $typeMap = null): mixed
{
    $type = $param->getType();

    if ($value === null && $type !== null && $type->allowsNull()) {
        return null;
    }

    if ($type === null) {
        if ($docType !== null) {
            return \StorybookPhp\Runtime\Casting\castDocTypeValue($value, $docType, $param, $typeMap);
        }
        return $value;
    }

    if ($type instanceof ReflectionUnionType) {
        return \StorybookPhp\Runtime\Casting\castUnionArg($type, $param, $value, $docType, $typeMap);
    }

    if ($type instanceof ReflectionNamedType) {
        return \StorybookPhp\Runtime\Casting\castWithNamedType($type, $value, $param, $docType, $typeMap);
    }

    return $value;
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castUnionArg(
    ReflectionUnionType $union,
    ReflectionParameter $param,
    mixed $value,
    ?string $docType,
    ?array $typeMap,
): mixed {
    $ranked = [];
    foreach ($union->getTypes() as $index => $type) {
        if ($type instanceof ReflectionNamedType) {
            $ranked[] = ['type' => $type, 'score' => \StorybookPhp\Runtime\Casting\scoreTypeMatch($type, $value), 'index' => $index];
        }
    }
    usort($ranked, static function (array $left, array $right): int {
        $scoreComparison = $right['score'] <=> $left['score'];

        return $scoreComparison !== 0 ? $scoreComparison : ($left['index'] <=> $right['index']);
    });
    foreach ($ranked as $candidate) {
        if ($candidate['score'] > 0) {
            return \StorybookPhp\Runtime\Casting\castWithNamedType($candidate['type'], $value, $param, $docType, $typeMap);
        }
    }

    return $value;
}

/**
 * Cast a value using a specific ReflectionNamedType.
 *
 * @param array<string, mixed>|null $typeMap
 */
function castWithNamedType(ReflectionNamedType $type, mixed $value, ReflectionParameter $param, ?string $docType = null, ?array $typeMap = null): mixed
{
    if ($value === null && $type->allowsNull()) {
        return null;
    }

    $typeName = $type->getName();

    if (\StorybookPhp\Runtime\Casting\isReflectionBuiltinType($typeName)) {
        return \StorybookPhp\Runtime\Casting\castReflectionBuiltinType($typeName, $value, $param, $docType, $typeMap);
    }

    return \StorybookPhp\Runtime\Casting\castDeclaredNamedType(\StorybookPhp\Runtime\Casting\resolveBoundTypeName($typeName, $typeMap, $param), $value, $param, $docType, $typeMap);
}

/**
 * Reports whether Reflection identifies a type handled by builtin conversion.
 */
function isReflectionBuiltinType(string $typeName): bool
{
    return in_array($typeName, [
        'string', 'int', 'float', 'bool', 'array', 'iterable', 'object',
        'callable', 'mixed', 'true', 'false', 'null', 'void', 'never',
    ], true);
}

/**
 * @param array<string, mixed>|null $typeMap
 * @throws RuntimeException when a void or never parameter receives a value
 * @throws LogicException when Reflection returns an unsupported builtin type
 */
function castReflectionBuiltinType(
    string $typeName,
    mixed $value,
    ReflectionParameter $param,
    ?string $docType,
    ?array $typeMap,
): mixed {
    $items = is_array($value) ? $value : (array) $value;

    return match ($typeName) {
        'string' => \StorybookPhp\Runtime\Transport\stringifyOutputValue($value),
        'int' => is_int($value) ? $value : (is_numeric($value) ? (int) $value : 0),
        'float' => is_float($value) ? $value : (is_numeric($value) ? (float) $value : 0.0),
        'bool' => is_bool($value) ? $value : !in_array($value, [null, 0, 0.0, '', '0', []], true),
        'array', 'iterable' => $docType === null ? $items : \StorybookPhp\Runtime\Casting\castArrayElements($items, $docType, $param, $typeMap),
        'object' => \StorybookPhp\Runtime\Casting\castValueToObject($value),
        'callable', 'mixed' => $value,
        'true' => true,
        'false' => false,
        'null' => null,
        'void', 'never' => throw new RuntimeException("Cannot provide a value for '{$typeName}' type parameter"),
        default => throw new LogicException("Unsupported reflection builtin type: {$typeName}"),
    };
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castDeclaredNamedType(
    string $typeName,
    mixed $value,
    ReflectionParameter $param,
    ?string $docType,
    ?array $typeMap,
): mixed {
    if (\StorybookPhp\Runtime\Contract\enumTypeExists($typeName)) {
        return \StorybookPhp\Runtime\Contract\resolveEnumCase(\StorybookPhp\Runtime\Contract\requireExistingClass($typeName), $value);
    }

    $className = \StorybookPhp\Runtime\Contract\requireExistingClass($typeName);
    if ($value instanceof $className) {
        return $value;
    }
    if ($docType !== null && is_array($value)) {
        $wrapper = \StorybookPhp\Runtime\Casting\castNamedCollectionWrapper($className, $value, $docType, $param, $typeMap);
        if ($wrapper !== null) {
            return $wrapper;
        }
    }

    return \StorybookPhp\Runtime\Casting\instantiateClassFromValue($className, $value, $typeMap);
}

/**
 * @param class-string $className
 * @param array<array-key, mixed> $value
 * @param array<string, mixed>|null $typeMap
 */
function castNamedCollectionWrapper(
    string $className,
    array $value,
    string $docType,
    ReflectionParameter $param,
    ?array $typeMap,
): ?object {
    $info = \StorybookPhp\Runtime\Contract\extractGenericValueType($docType);
    if ($info === null || $info['wrapperClass'] === null) {
        return null;
    }
    $reflection = new ReflectionClass($className);
    $constructor = $reflection->getConstructor();
    if ($constructor === null) {
        return null;
    }

    return $reflection->newInstanceArgs([
        \StorybookPhp\Runtime\Casting\castArrayElements($value, $docType, $param, $typeMap),
    ]);
}

/**
 * Detect whether an array uses consecutive integer keys starting at 0.
 *
 * @param array<array-key, mixed> $value
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
