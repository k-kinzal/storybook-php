<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionClass;
use ReflectionFunctionAbstract;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionType;
use RuntimeException;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeScope;

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
        $overrideDocType = \StorybookPhp\Runtime\Casting\buildOverrideDocType($param, $argDef);
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
    $type = \StorybookPhp\Runtime\Casting\argDefTypeString($argDef, 'type');
    $elementType = \StorybookPhp\Runtime\Casting\argDefTypeString($argDef, 'elementType');
    if ($type !== null && $elementType === null && \StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride($param, $type)) {
        return null;
    }
    if ($type !== null || $elementType === null) {
        return \StorybookPhp\Runtime\Casting\argDefDocType($argDef);
    }

    $paramType = $param->getType();
    if ($paramType instanceof ReflectionNamedType) {
        $paramTypeName = $paramType->getName();
        if (\StorybookPhp\Runtime\Contract\isArrayLikeTypeName($paramTypeName)) {
            return $elementType . '[]';
        }
        if (\StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($paramTypeName) === null) {
            return $paramTypeName . '<' . $elementType . '>';
        }

        return $elementType;
    }

    return $elementType . '[]';
}

/**
 * Converts the `type` / `elementType` fields of an arg definition into a doc
 * type string without consulting a PHP declaration.
 *
 * @param array<string, mixed> $argDef
 *
 * @example Element types become generic arrays
 *     \StorybookPhp\Runtime\Casting\argDefDocType(['type' => 'array', 'elementType' => 'App\Item']) // => 'App\Item[]'
 *     \StorybookPhp\Runtime\Casting\argDefDocType(['type' => 'App\Collection', 'elementType' => 'App\Item']) // => 'App\Collection<App\Item>'
 *     \StorybookPhp\Runtime\Casting\argDefDocType(['type' => 'unknown']) // => null
 */
function argDefDocType(array $argDef): ?string
{
    $type = \StorybookPhp\Runtime\Casting\argDefTypeString($argDef, 'type');
    $elementType = \StorybookPhp\Runtime\Casting\argDefTypeString($argDef, 'elementType');
    if ($elementType === null) {
        return $type;
    }
    if ($type === null || \StorybookPhp\Runtime\Contract\isArrayLikeTypeName($type)) {
        return $elementType . '[]';
    }

    return $type . '<' . $elementType . '>';
}

/**
 * Reads a non-empty type string from an arg definition, treating `mixed` and `unknown` as absent.
 *
 * @param array<string, mixed> $argDef
 */
function argDefTypeString(array $argDef, string $field): ?string
{
    $value = $argDef[$field] ?? null;
    if (!is_string($value) || trim($value) === '' || in_array(strtolower(trim($value)), ['mixed', 'unknown'], true)) {
        return null;
    }

    return trim($value);
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

    $normalizedOverride = \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName($overrideType, $param);
    $normalizedParamType = \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName($paramType->getName(), $param);

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

    return \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($normalized)
        ?? \StorybookPhp\Runtime\Contract\resolveClassName($normalized, $param)
        ?? strtolower($normalized);
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return array{ordered: list<mixed>, named: array<string, mixed>}
 * @throws HydrationException when a value cannot satisfy its parameter
 * @throws RuntimeException when a required argument is missing
 */
function resolveArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    if (!$ref instanceof ReflectionFunctionAbstract) {
        return ['ordered' => [], 'named' => []];
    }

    $context = HydrationContext::fromTypeMap($typeMap);
    $docTypes = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($ref);
    $scope = \StorybookPhp\Runtime\Contract\typeScopeForFunction($ref);

    $ordered = [];
    $named = [];
    foreach ($ref->getParameters() as $param) {
        $name = $param->getName();
        $argDef = \StorybookPhp\Runtime\Casting\resolveParameterArgDef($name, $argDefs);
        $docType = $docTypes[$name] ?? null;

        if ($param->isVariadic()) {
            if (array_key_exists($name, $args)) {
                $variadicValues = \StorybookPhp\Runtime\Casting\resolveVariadicArgValues($param, $args[$name], $docType, $argDef, $context, $scope);
                array_push($ordered, ...$variadicValues);
                $named[$name] = $variadicValues;
            }
            continue;
        }

        $resolved = \StorybookPhp\Runtime\Casting\resolveParameterArgValue($param, $args, $argDef, $docType, $context, $scope);
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

    return \StorybookPhp\Runtime\Contract\normalizeStringKeyArray($argDef, "argument definition '{$name}'");
}

/**
 * Layers explicit constructor arg definitions over `typeMap.classes` entries.
 *
 * Explicit definitions keep precedence whenever they carry an effective type;
 * otherwise the class-level type contract fills the gap that reflection and
 * PHPDoc could not describe.
 *
 * @param ReflectionClass<object> $class
 * @param array<string, mixed>|null $argDefs
 * @param array<string, mixed>|null $typeMap
 * @return array<string, mixed>|null
 */
function resolveConstructorArgDefs(ReflectionClass $class, ?array $argDefs, ?array $typeMap): ?array
{
    $constructor = $class->getConstructor();
    if ($constructor === null) {
        return $argDefs;
    }
    $classArgDefs = \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs($class, $typeMap);
    if ($classArgDefs === null) {
        return $argDefs;
    }

    $resolved = $argDefs ?? [];
    foreach ($constructor->getParameters() as $param) {
        $name = $param->getName();
        if (isset($classArgDefs[$name])) {
            $resolved[$name] = \StorybookPhp\Runtime\Casting\layerClassArgDef(
                $param,
                $classArgDefs[$name],
                \StorybookPhp\Runtime\Casting\resolveParameterArgDef($name, $argDefs),
            );
        }
    }

    return $resolved;
}

/**
 * @param array<string, mixed> $classArgDef
 * @param array<string, mixed>|null $argDef
 * @return array<string, mixed>
 */
function layerClassArgDef(ReflectionParameter $param, array $classArgDef, ?array $argDef): array
{
    if ($argDef === null) {
        return $classArgDef;
    }
    $overrideDocType = \StorybookPhp\Runtime\Casting\buildOverrideDocType($param, $argDef);
    if ($overrideDocType !== null && !\StorybookPhp\Runtime\Casting\isPlainArrayDocType($overrideDocType)) {
        return array_merge($classArgDef, $argDef);
    }

    return array_merge($classArgDef, array_diff_key($argDef, ['type' => true, 'elementType' => true]));
}

/**
 * Reports whether a doc type names a native array without describing its
 * elements, which is the case `typeMap.classes` is allowed to refine.
 *
 * @example Plain and described arrays
 *     \StorybookPhp\Runtime\Casting\isPlainArrayDocType('?list') // => true
 *     \StorybookPhp\Runtime\Casting\isPlainArrayDocType('array<int, App\Leaf>') // => false
 *     \StorybookPhp\Runtime\Casting\isPlainArrayDocType('list<') // => false
 */
function isPlainArrayDocType(string $docType): bool
{
    try {
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression($docType);
    } catch (HydrationException) {
        return false;
    }
    $members = \StorybookPhp\Runtime\Contract\typeNodeMembers(\StorybookPhp\Runtime\Contract\stripNullFromTypeNode($node));

    return count($members) === 1
        && $members[0]->kind === 'named'
        && \StorybookPhp\Runtime\Contract\isArrayLikeTypeName($members[0]->name);
}

/**
 * @param array<string, mixed>|null $argDef
 * @param TypeScope|null $scope resolution scope of the declaring callable, built on demand when omitted
 * @return list<mixed>
 * @throws HydrationException when a value cannot satisfy the parameter
 */
function resolveVariadicArgValues(
    ReflectionParameter $param,
    mixed $value,
    ?string $docType,
    ?array $argDef,
    HydrationContext $context,
    ?TypeScope $scope = null,
): array {
    $values = is_array($value) && \StorybookPhp\Runtime\Casting\isListArray($value) ? $value : [$value];

    $resolved = [];
    foreach ($values as $item) {
        $resolved[] = \StorybookPhp\Runtime\Casting\hydrateParameterValue($param, $item, $docType, $argDef, $context, $scope);
    }

    return $resolved;
}

/**
 * Resolves one parameter from the story arguments, a slot binding value, the
 * generated default, the PHP default, or null for nullable parameters.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $argDef
 * @param TypeScope|null $scope resolution scope of the declaring callable, built on demand when omitted
 * @throws RuntimeException when a required argument has no supplied or declared default
 * @throws HydrationException when a value cannot satisfy the parameter
 */
function resolveParameterArgValue(
    ReflectionParameter $param,
    array $args,
    ?array $argDef,
    ?string $docType,
    HydrationContext $context,
    ?TypeScope $scope = null,
): mixed {
    $name = $param->getName();
    $binding = \StorybookPhp\Runtime\Contract\slotBinding(\StorybookPhp\Runtime\Casting\parameterSlotKeys($param), $context->bindings);
    if ($binding !== null && $binding['hasValue']) {
        return \StorybookPhp\Runtime\Casting\hydrateParameterValue($param, $binding['value'], $docType, $argDef, $context, $scope);
    }
    if (array_key_exists($name, $args)) {
        return \StorybookPhp\Runtime\Casting\hydrateParameterValue($param, $args[$name], $docType, $argDef, $context, $scope);
    }
    if ($argDef !== null && array_key_exists('default', $argDef)) {
        return \StorybookPhp\Runtime\Casting\hydrateParameterValue($param, $argDef['default'], $docType, $argDef, $context, $scope);
    }
    if ($param->isDefaultValueAvailable()) {
        return \StorybookPhp\Runtime\Casting\parameterDefaultValue($param);
    }
    if ($param->allowsNull() || (($argDef['nullable'] ?? false) === true && !$param->getType() instanceof ReflectionType)) {
        return null;
    }

    throw new RuntimeException("Missing required argument: {$name} (" . \StorybookPhp\Runtime\Casting\parameterLabel($param) . ' has no default value; pass it in the story args or bind it in typeMap).');
}

/**
 * Cast a value to match the expected type of a reflection parameter.
 *
 * @param array<string, mixed>|null $typeMap
 * @throws HydrationException when the value cannot satisfy the parameter
 */
function castArg(ReflectionParameter $param, mixed $value, ?string $docType = null, ?array $typeMap = null): mixed
{
    return \StorybookPhp\Runtime\Casting\hydrateParameterValue($param, $value, $docType, null, HydrationContext::fromTypeMap($typeMap));
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return list<mixed>
 * @throws HydrationException when a value cannot satisfy its parameter
 * @throws RuntimeException when a required argument is missing
 */
function matchArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    return \StorybookPhp\Runtime\Casting\resolveArgs($ref, $args, $typeMap, $argDefs)['ordered'];
}

/**
 * Resolve arguments into a named map keyed by parameter name.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return array<string, mixed>
 * @throws HydrationException when a value cannot satisfy its parameter
 * @throws RuntimeException when a required argument is missing
 */
function resolveNamedArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    return \StorybookPhp\Runtime\Casting\resolveArgs($ref, $args, $typeMap, $argDefs)['named'];
}
