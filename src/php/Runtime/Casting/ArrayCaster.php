<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionParameter;

/**
 * Casts each array element using PHPDoc generic type information.
 *
 * @param array<array-key, mixed> $value
 * @param array<string, mixed>|null $typeMap
 * @return array<array-key, mixed>
 */
function castArrayElements(array $value, string $docType, ReflectionParameter $param, ?array $typeMap = null): array
{
    $info = \StorybookPhp\Runtime\Contract\extractGenericValueType($docType);
    if ($info === null) {
        return $value;
    }

    $innerType = $info['valueType'];

    if (str_contains($innerType, '|')) {
        return $value;
    }

    if (\StorybookPhp\Runtime\Contract\isArrayLikeType($innerType)) {
        $result = [];
        foreach ($value as $key => $item) {
            $result[$key] = is_array($item) ? \StorybookPhp\Runtime\Casting\castArrayElements($item, $innerType, $param, $typeMap) : $item;
        }
        return $result;
    }

    $resolved = \StorybookPhp\Runtime\Casting\resolveBoundTypeName($innerType, $typeMap, $param);

    if (\StorybookPhp\Runtime\Contract\enumTypeExists($resolved)) {
        $enumClass = \StorybookPhp\Runtime\Contract\requireExistingClass($resolved);
        $result = [];
        foreach ($value as $key => $item) {
            $case = \StorybookPhp\Runtime\Contract\findEnumCase($enumClass, $item);
            $result[$key] = $case ?? $item;
        }
        return $result;
    }

    if (class_exists($resolved)) {
        $result = [];
        foreach ($value as $key => $item) {
            if ($item instanceof $resolved) {
                $result[$key] = $item;
                continue;
            }
            $result[$key] = \StorybookPhp\Runtime\Casting\instantiateClassFromValue($resolved, $item, $typeMap);
        }
        return $result;
    }

    return $value;
}

/**
 * Split union type candidates on | at generic depth 0.
 *
 * @return list<string>
 */
function splitUnionTypes(string $type): array
{
    $parts = [];
    $depth = 0;
    $current = '';
    $len = strlen($type);

    for ($i = 0; $i < $len; $i++) {
        $ch = $type[$i];
        if ($ch === '<' || $ch === '(') {
            $depth++;
            $current .= $ch;
            continue;
        }
        if ($ch === '>' || $ch === ')') {
            $depth--;
            $current .= $ch;
            continue;
        }
        if ($ch === '|' && $depth === 0) {
            $trimmed = trim($current);
            if ($trimmed !== '') {
                $parts[] = $trimmed;
            }
            $current = '';
            continue;
        }
        $current .= $ch;
    }

    $trimmed = trim($current);
    if ($trimmed !== '') {
        $parts[] = $trimmed;
    }

    return $parts;
}

/**
 * Resolve a doc/override type name against the declaring namespace and typeMap bindings.
 *
 * @param array<string, mixed>|null $typeMap
 */
function resolveBoundTypeName(string $typeName, ?array $typeMap = null, ?ReflectionParameter $param = null): string
{
    $raw = ltrim($typeName, '\\');
    $resolved = $param instanceof ReflectionParameter ? \StorybookPhp\Runtime\Contract\resolveClassName($raw, $param) : null;
    $candidate = $resolved ?? $raw;

    $bound = ltrim(\StorybookPhp\Runtime\Contract\resolveTypeMapBinding($candidate, $typeMap), '\\');
    if ($bound !== $candidate) {
        return $bound;
    }

    $rawBound = ltrim(\StorybookPhp\Runtime\Contract\resolveTypeMapBinding($raw, $typeMap), '\\');
    if ($rawBound !== $raw) {
        return $rawBound;
    }

    return $candidate;
}
