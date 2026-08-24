<?php

declare(strict_types=1);

/**
 * Cast a value using a PHPDoc type string when the reflection parameter is untyped.
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
        return castDocTypeValue($value, substr($normalized, 1), $param, $typeMap);
    }

    $unionTypes = splitUnionTypes($normalized);
    if (count($unionTypes) > 1) {
        $candidate = rankDocTypeCandidates($unionTypes, $value, $param, $typeMap)[0] ?? null;

        return $candidate === null ? $value : castDocTypeValue($value, $candidate, $param, $typeMap);
    }

    $info = extractGenericValueType($normalized);
    if ($info !== null) {
        return castReflectedGenericValue($value, $normalized, $info['wrapperClass'], $param, $typeMap);
    }

    return castInlineNamedType(resolveBoundTypeName($normalized, $typeMap, $param), $value);
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
    $casted = castArrayElements($items, $docType, $param, $typeMap);
    if ($wrapperClass === null) {
        return $casted;
    }
    $wrapper = resolveBoundTypeName($wrapperClass, $typeMap, $param);
    if (!class_exists($wrapper)) {
        return $casted;
    }

    return instantiateCollectionWrapper($wrapper, $casted);
}

/**
 * Score how well a named type matches a given value.
 */
function scoreTypeMatch(ReflectionNamedType $type, mixed $value): int
{
    if ($value === null) {
        return $type->allowsNull() ? 2 : 0;
    }

    return scoreInlineNamedTypeMatch($type->getName(), $value);
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
            return castDocTypeValue($value, $docType, $param, $typeMap);
        }
        return $value;
    }

    if ($type instanceof ReflectionUnionType) {
        return castUnionArg($type, $param, $value, $docType, $typeMap);
    }

    if ($type instanceof ReflectionNamedType) {
        return castWithNamedType($type, $value, $param, $docType, $typeMap);
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
            $ranked[] = ['type' => $type, 'score' => scoreTypeMatch($type, $value), 'index' => $index];
        }
    }
    usort($ranked, static function (array $left, array $right): int {
        $scoreComparison = $right['score'] <=> $left['score'];

        return $scoreComparison !== 0 ? $scoreComparison : ($left['index'] <=> $right['index']);
    });
    foreach ($ranked as $candidate) {
        if ($candidate['score'] > 0) {
            return castWithNamedType($candidate['type'], $value, $param, $docType, $typeMap);
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

    if (isReflectionBuiltinType($typeName)) {
        return castReflectionBuiltinType($typeName, $value, $param, $docType, $typeMap);
    }

    return castDeclaredNamedType(resolveBoundTypeName($typeName, $typeMap, $param), $value, $param, $docType, $typeMap);
}

function isReflectionBuiltinType(string $typeName): bool
{
    return in_array($typeName, [
        'string', 'int', 'float', 'bool', 'array', 'iterable', 'object',
        'callable', 'mixed', 'true', 'false', 'null', 'void', 'never',
    ], true);
}

/**
 * @param array<string, mixed>|null $typeMap
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
        'string' => stringifyOutputValue($value),
        'int' => is_int($value) ? $value : (is_numeric($value) ? (int) $value : 0),
        'float' => is_float($value) ? $value : (is_numeric($value) ? (float) $value : 0.0),
        'bool' => is_bool($value) ? $value : !in_array($value, [null, 0, 0.0, '', '0', []], true),
        'array', 'iterable' => $docType === null ? $items : castArrayElements($items, $docType, $param, $typeMap),
        'object' => castValueToObject($value),
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
    if (enumTypeExists($typeName)) {
        return resolveEnumCase(requireExistingClass($typeName), $value);
    }

    $className = requireExistingClass($typeName);
    if ($value instanceof $className) {
        return $value;
    }
    if ($docType !== null && is_array($value)) {
        $wrapper = castNamedCollectionWrapper($className, $value, $docType, $param, $typeMap);
        if ($wrapper !== null) {
            return $wrapper;
        }
    }

    return instantiateClassFromValue($className, $value, $typeMap);
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
    $info = extractGenericValueType($docType);
    if ($info === null || $info['wrapperClass'] === null) {
        return null;
    }
    $reflection = new ReflectionClass($className);
    $constructor = $reflection->getConstructor();
    if ($constructor === null) {
        return null;
    }

    return $reflection->newInstanceArgs([
        castArrayElements($value, $docType, $param, $typeMap),
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
