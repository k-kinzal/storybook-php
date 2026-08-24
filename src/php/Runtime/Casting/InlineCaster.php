<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use LogicException;
use RuntimeException;

/**
 * Casts a value described by inline Storybook argument metadata.
 *
 * @param array<string, mixed>|null $typeMap
 */
function castInlineNamedType(string $typeName, mixed $value, ?array $typeMap = null): mixed
{
    $resolved = ltrim(\StorybookPhp\Runtime\Contract\resolveTypeMapBinding($typeName, $typeMap), '\\');
    $normalized = strtolower($resolved);

    if (\StorybookPhp\Runtime\Casting\isInlineBuiltinType($normalized)) {
        return \StorybookPhp\Runtime\Casting\castInlineBuiltinType($normalized, $value);
    }

    if (\StorybookPhp\Runtime\Contract\enumTypeExists($resolved)) {
        return \StorybookPhp\Runtime\Contract\resolveEnumCase(\StorybookPhp\Runtime\Contract\requireExistingClass($resolved), $value);
    }

    if (!class_exists($resolved)) {
        return $value;
    }

    return \StorybookPhp\Runtime\Casting\instantiateClassFromValue($resolved, $value, $typeMap);
}

/**
 * Reports whether an inline type name has a deterministic scalar conversion.
 */
function isInlineBuiltinType(string $typeName): bool
{
    return in_array($typeName, [
        'string', 'int', 'integer', 'float', 'double', 'bool', 'boolean',
        'array', 'iterable', 'object', 'callable', 'mixed', 'unknown',
        'true', 'false', 'null',
    ], true);
}

/**
 * Converts a value according to a supported inline builtin type.
 *
 * @throws LogicException when called with a type outside the supported set
 */
function castInlineBuiltinType(string $typeName, mixed $value): mixed
{
    return match ($typeName) {
        'string' => \StorybookPhp\Runtime\Transport\stringifyOutputValue($value),
        'int', 'integer' => is_int($value) ? $value : (is_numeric($value) ? (int) $value : 0),
        'float', 'double' => is_float($value) ? $value : (is_numeric($value) ? (float) $value : 0.0),
        'bool', 'boolean' => is_bool($value) ? $value : !in_array($value, [null, 0, 0.0, '', '0', []], true),
        'array', 'iterable' => is_array($value) ? $value : (array) $value,
        'object' => \StorybookPhp\Runtime\Casting\castValueToObject($value),
        'callable', 'mixed', 'unknown' => $value,
        'true' => true,
        'false' => false,
        'null' => null,
        default => throw new LogicException("Unsupported inline builtin type: {$typeName}"),
    };
}

/**
 * Preserves objects and converts scalar or array input to a generic object.
 */
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
        return \StorybookPhp\Runtime\Casting\castInlineDocTypeValue($value, substr($normalized, 1), $typeMap);
    }

    $unionTypes = \StorybookPhp\Runtime\Casting\splitUnionTypes($normalized);
    if (count($unionTypes) > 1) {
        $candidate = \StorybookPhp\Runtime\Casting\rankDocTypeCandidates($unionTypes, $value, null, $typeMap)[0] ?? null;

        return $candidate === null ? $value : \StorybookPhp\Runtime\Casting\castInlineDocTypeValue($value, $candidate, $typeMap);
    }

    $info = \StorybookPhp\Runtime\Contract\extractGenericValueType($normalized);
    if ($info !== null) {
        return \StorybookPhp\Runtime\Casting\castInlineGenericValue($value, $info['valueType'], $info['wrapperClass'], $typeMap);
    }

    return \StorybookPhp\Runtime\Casting\castInlineNamedType($normalized, $value, $typeMap);
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castInlineGenericValue(mixed $value, string $valueType, ?string $wrapperClass, ?array $typeMap): mixed
{
    $casted = [];
    foreach (is_array($value) ? $value : (array) $value as $key => $item) {
        $casted[$key] = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue($item, $valueType, $typeMap);
    }
    if ($wrapperClass === null) {
        return $casted;
    }
    $wrapper = ltrim(\StorybookPhp\Runtime\Contract\resolveTypeMapBinding($wrapperClass, $typeMap), '\\');
    if (!class_exists($wrapper)) {
        return $casted;
    }

    return \StorybookPhp\Runtime\Casting\instantiateCollectionWrapper($wrapper, $casted);
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
            $casted[$key] = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue($item, $elementType, $typeMap);
        }

        if (is_string($type) && $type !== '' && !in_array(strtolower($type), ['array', 'iterable', 'mixed', 'unknown'], true)) {
            $wrapper = ltrim(\StorybookPhp\Runtime\Contract\resolveTypeMapBinding($type, $typeMap), '\\');
            if (class_exists($wrapper)) {
                return \StorybookPhp\Runtime\Casting\instantiateCollectionWrapper($wrapper, $casted);
            }
        }

        return $casted;
    }

    if (!is_string($type) || $type === '' || strtolower($type) === 'unknown') {
        return $value;
    }

    return \StorybookPhp\Runtime\Casting\castInlineDocTypeValue($value, $type, $typeMap);
}

/**
 * Cast template arguments using inline arg definitions emitted by the Vite plugin.
 *
 * @param array<string, mixed> $args
 * @param array<string, mixed> $argDefs
 * @param array<string, mixed>|null $typeMap
 * @return array<string, mixed>
 * @throws RuntimeException when a required template argument is missing
 */
function castTemplateArgs(array $args, array $argDefs, ?array $typeMap = null): array
{
    $casted = $args;

    foreach ($argDefs as $name => $argDef) {
        if (!is_array($argDef)) {
            continue;
        }
        $argDef = \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($argDef, "argDefs.{$name}");

        if (array_key_exists($name, $args)) {
            $casted[$name] = \StorybookPhp\Runtime\Casting\castTemplateArgValue($argDef, $args[$name], $typeMap);
            continue;
        }

        if (array_key_exists('default', $argDef)) {
            $casted[$name] = \StorybookPhp\Runtime\Casting\castTemplateArgValue($argDef, $argDef['default'], $typeMap);
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
