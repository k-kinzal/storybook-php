<?php

declare(strict_types=1);

/**
 * @param array<string, mixed>|null $typeMap
 */
function castInlineNamedType(string $typeName, mixed $value, ?array $typeMap = null): mixed
{
    $resolved = ltrim(resolveTypeMapBinding($typeName, $typeMap), '\\');
    $normalized = strtolower($resolved);

    if (isInlineBuiltinType($normalized)) {
        return castInlineBuiltinType($normalized, $value);
    }

    if (enumTypeExists($resolved)) {
        return resolveEnumCase(requireExistingClass($resolved), $value);
    }

    if (!class_exists($resolved)) {
        return $value;
    }

    return instantiateClassFromValue($resolved, $value, $typeMap);
}

function isInlineBuiltinType(string $typeName): bool
{
    return in_array($typeName, [
        'string', 'int', 'integer', 'float', 'double', 'bool', 'boolean',
        'array', 'iterable', 'object', 'callable', 'mixed', 'unknown',
        'true', 'false', 'null',
    ], true);
}

function castInlineBuiltinType(string $typeName, mixed $value): mixed
{
    return match ($typeName) {
        'string' => stringifyOutputValue($value),
        'int', 'integer' => is_int($value) ? $value : (is_numeric($value) ? (int) $value : 0),
        'float', 'double' => is_float($value) ? $value : (is_numeric($value) ? (float) $value : 0.0),
        'bool', 'boolean' => is_bool($value) ? $value : !in_array($value, [null, 0, 0.0, '', '0', []], true),
        'array', 'iterable' => is_array($value) ? $value : (array) $value,
        'object' => castValueToObject($value),
        'callable', 'mixed', 'unknown' => $value,
        'true' => true,
        'false' => false,
        'null' => null,
        default => throw new LogicException("Unsupported inline builtin type: {$typeName}"),
    };
}

function castValueToObject(mixed $value): object
{
    if (is_object($value)) {
        return $value;
    }

    return is_array($value) || is_scalar($value) || $value === null
        ? (object) $value
        : (object) [];
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castInlineDocTypeValue(mixed $value, string $docType, ?array $typeMap = null): mixed
{
    $normalized = trim($docType);
    if ($normalized === '' || strtolower($normalized) === 'mixed' || strtolower($normalized) === 'unknown') {
        return $value;
    }

    if ($value === null) {
        return null;
    }

    if (str_starts_with($normalized, '?')) {
        return castInlineDocTypeValue($value, substr($normalized, 1), $typeMap);
    }

    $unionTypes = splitUnionTypes($normalized);
    if (count($unionTypes) > 1) {
        $candidate = rankDocTypeCandidates($unionTypes, $value, null, $typeMap)[0] ?? null;

        return $candidate === null ? $value : castInlineDocTypeValue($value, $candidate, $typeMap);
    }

    $info = extractGenericValueType($normalized);
    if ($info !== null) {
        return castInlineGenericValue($value, $info['valueType'], $info['wrapperClass'], $typeMap);
    }

    return castInlineNamedType($normalized, $value, $typeMap);
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castInlineGenericValue(mixed $value, string $valueType, ?string $wrapperClass, ?array $typeMap): mixed
{
    $casted = [];
    foreach (is_array($value) ? $value : (array) $value as $key => $item) {
        $casted[$key] = castInlineDocTypeValue($item, $valueType, $typeMap);
    }
    if ($wrapperClass === null) {
        return $casted;
    }
    $wrapper = ltrim(resolveTypeMapBinding($wrapperClass, $typeMap), '\\');
    if (!class_exists($wrapper)) {
        return $casted;
    }

    return instantiateCollectionWrapper($wrapper, $casted);
}

/**
 * @param array<string, mixed> $argDef
 * @param array<string, mixed>|null $typeMap
 */
function castTemplateArgValue(array $argDef, mixed $value, ?array $typeMap = null): mixed
{
    if ($value === null) {
        return null;
    }

    $elementType = $argDef['elementType'] ?? null;
    $type = $argDef['type'] ?? null;

    if (is_string($elementType) && $elementType !== '') {
        $arr = is_array($value) ? $value : (array) $value;
        $casted = [];
        foreach ($arr as $key => $item) {
            $casted[$key] = castInlineDocTypeValue($item, $elementType, $typeMap);
        }

        if (is_string($type) && $type !== '' && !in_array(strtolower($type), ['array', 'iterable', 'mixed', 'unknown'], true)) {
            $wrapper = ltrim(resolveTypeMapBinding($type, $typeMap), '\\');
            if (class_exists($wrapper)) {
                return instantiateCollectionWrapper($wrapper, $casted);
            }
        }

        return $casted;
    }

    if (!is_string($type) || $type === '' || strtolower($type) === 'unknown') {
        return $value;
    }

    return castInlineDocTypeValue($value, $type, $typeMap);
}

/**
 * Cast template arguments using inline arg definitions emitted by the Vite plugin.
 *
 * @param array<string, mixed> $args
 * @param array<string, mixed> $argDefs
 * @param array<string, mixed>|null $typeMap
 * @return array<string, mixed>
 */
function castTemplateArgs(array $args, array $argDefs, ?array $typeMap = null): array
{
    $casted = $args;

    foreach ($argDefs as $name => $argDef) {
        if (!is_array($argDef)) {
            continue;
        }
        $argDef = normalizeStringKeyArray($argDef, "argDefs.{$name}");

        if (array_key_exists($name, $args)) {
            $casted[$name] = castTemplateArgValue($argDef, $args[$name], $typeMap);
            continue;
        }

        if (array_key_exists('default', $argDef)) {
            $casted[$name] = castTemplateArgValue($argDef, $argDef['default'], $typeMap);
            continue;
        }

        if (($argDef['nullable'] ?? false) === true) {
            $casted[$name] = null;
            continue;
        }

        if (($argDef['required'] ?? false) === true) {
            throw new RuntimeException("Missing required argument: {$name}");
        }
    }

    return $casted;
}
