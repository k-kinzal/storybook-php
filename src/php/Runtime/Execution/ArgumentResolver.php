<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Execution;

use ReflectionException;
use ReflectionFunctionAbstract;
use ReflectionNamedType;
use ReflectionParameter;
use RuntimeException;

/**
 * Resolves the effective doc type for a parameter using the provided arg definition.
 *
 * @param array<string, string> $docTypes
 * @param array<string, mixed>|null $argDef
 */
function resolveParamDocType(
    ReflectionParameter $param,
    array $docTypes,
    ?array $argDef = null,
): ?string {
    $name = $param->getName();
    $docType = $docTypes[$name] ?? null;

    if ($argDef !== null) {
        $overrideDocType = \StorybookPhp\Runtime\Execution\buildOverrideDocType($param, $argDef);
        if ($overrideDocType !== null) {
            return $overrideDocType;
        }
    }

    return $docType;
}

/**
 * Convert an arg definition into a doc-type string that the runtime caster understands.
 *
 * @param array<string, mixed> $argDef
 */
function buildOverrideDocType(ReflectionParameter $param, array $argDef): ?string
{
    $type = isset($argDef['type']) && is_string($argDef['type']) && trim($argDef['type']) !== ''
        ? trim($argDef['type'])
        : null;
    if ($type !== null && in_array(strtolower($type), ['mixed', 'unknown'], true)) {
        $type = null;
    }
    $elementType = isset($argDef['elementType']) && is_string($argDef['elementType']) && trim($argDef['elementType']) !== ''
        ? trim($argDef['elementType'])
        : null;

    if ($type !== null) {
        if ($elementType === null && \StorybookPhp\Runtime\Execution\isRedundantDocTypeOverride($param, $type)) {
            return null;
        }

        if ($elementType === null) {
            return $type;
        }

        if (in_array(strtolower($type), \StorybookPhp\Runtime\Contract\NATIVE_ARRAY_TYPES, true)) {
            return $elementType . '[]';
        }

        return $type . '<' . $elementType . '>';
    }

    if ($elementType === null) {
        return null;
    }

    $paramType = $param->getType();
    if ($paramType === null) {
        return $elementType . '[]';
    }
    if ($paramType instanceof ReflectionNamedType) {
        $paramTypeName = $paramType->getName();
        if (in_array(strtolower($paramTypeName), \StorybookPhp\Runtime\Contract\NATIVE_ARRAY_TYPES, true)) {
            return $elementType . '[]';
        }
        if (!in_array(strtolower($paramTypeName), ['string', 'int', 'integer', 'float', 'double', 'bool', 'boolean', 'object', 'callable', 'mixed', 'true', 'false', 'null'], true)) {
            return $paramTypeName . '<' . $elementType . '>';
        }
    }

    return $elementType;
}

/**
 * Reports whether generated metadata merely repeats the reflected native type.
 */
function isRedundantDocTypeOverride(ReflectionParameter $param, string $overrideType): bool
{
    $paramType = $param->getType();
    if (!$paramType instanceof ReflectionNamedType) {
        return false;
    }

    $normalizedOverride = \StorybookPhp\Runtime\Execution\normalizeRuntimeTypeName($overrideType, $param);
    $normalizedParamType = \StorybookPhp\Runtime\Execution\normalizeRuntimeTypeName($paramType->getName(), $param);

    return $normalizedOverride !== null
        && $normalizedParamType !== null
        && $normalizedOverride === $normalizedParamType;
}

/**
 * Normalizes aliases and relative class names for contract comparison.
 */
function normalizeRuntimeTypeName(string $typeName, ReflectionParameter $param): ?string
{
    $normalized = ltrim(trim($typeName), '\\');
    if ($normalized === '') {
        return null;
    }

    $lower = strtolower($normalized);
    return match ($lower) {
        'integer' => 'int',
        'double' => 'float',
        'boolean' => 'bool',
        default => \StorybookPhp\Runtime\Contract\resolveClassName($normalized, $param) ?? $lower,
    };
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return array{ordered: list<mixed>, named: array<string, mixed>}
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function resolveArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    if (!$ref instanceof ReflectionFunctionAbstract) {
        return ['ordered' => [], 'named' => []];
    }

    $docTypes = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($ref);

    $ordered = [];
    $named = [];
    foreach ($ref->getParameters() as $param) {
        $name = $param->getName();
        $argDef = \StorybookPhp\Runtime\Execution\resolveParameterArgDef($name, $argDefs);
        $docType = \StorybookPhp\Runtime\Execution\resolveParamDocType($param, $docTypes, $argDef);

        if ($param->isVariadic()) {
            if (array_key_exists($name, $args)) {
                $variadicValues = \StorybookPhp\Runtime\Execution\resolveVariadicArgValues($param, $args[$name], $docType, $typeMap);
                array_push($ordered, ...$variadicValues);
                $named[$name] = $variadicValues;
            }
            continue;
        }

        $resolved = \StorybookPhp\Runtime\Execution\resolveParameterArgValue($param, $args, $argDef, $docType, $typeMap);
        $ordered[] = $resolved;
        $named[$name] = $resolved;
    }

    return ['ordered' => $ordered, 'named' => $named];
}

/**
 * @param array<string, mixed>|null $argDefs
 * @return array<string, mixed>|null
 */
function resolveParameterArgDef(string $name, ?array $argDefs): ?array
{
    $argDef = $argDefs[$name] ?? null;
    if (!is_array($argDef)) {
        return null;
    }

    return \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($argDef, "argument definition '{$name}'");
}

/**
 * @param array<string, mixed>|null $typeMap
 * @return list<mixed>
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function resolveVariadicArgValues(
    ReflectionParameter $param,
    mixed $value,
    ?string $docType,
    ?array $typeMap,
): array {
    $values = is_array($value) && \StorybookPhp\Runtime\Casting\isListArray($value) ? $value : [$value];

    $resolved = [];
    foreach ($values as $item) {
        $resolved[] = \StorybookPhp\Runtime\Casting\castArg($param, $item, $docType, $typeMap);
    }

    return $resolved;
}

/**
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $argDef
 * @param array<string, mixed>|null $typeMap
 * @throws RuntimeException when a required argument has no supplied or declared default
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function resolveParameterArgValue(
    ReflectionParameter $param,
    array $args,
    ?array $argDef,
    ?string $docType,
    ?array $typeMap,
): mixed {
    $name = $param->getName();
    if (array_key_exists($name, $args)) {
        return \StorybookPhp\Runtime\Casting\castArg($param, $args[$name], $docType, $typeMap);
    }
    if ($argDef !== null && array_key_exists('default', $argDef)) {
        return \StorybookPhp\Runtime\Casting\castArg($param, $argDef['default'], $docType, $typeMap);
    }
    if ($param->isDefaultValueAvailable()) {
        return $param->getDefaultValue();
    }
    $type = $param->getType();
    if (($argDef['nullable'] ?? false) === true && ($type === null || $param->allowsNull())) {
        return null;
    }
    if ($param->allowsNull()) {
        return null;
    }

    throw new RuntimeException("Missing required argument: {$name}");
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return list<mixed>
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function matchArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    return \StorybookPhp\Runtime\Execution\resolveArgs($ref, $args, $typeMap, $argDefs)['ordered'];
}

/**
 * Resolve arguments into a named map keyed by parameter name.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return array<string, mixed>
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function resolveNamedArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    return \StorybookPhp\Runtime\Execution\resolveArgs($ref, $args, $typeMap, $argDefs)['named'];
}
