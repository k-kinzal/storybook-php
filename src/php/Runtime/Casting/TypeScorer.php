<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use LogicException;
use ReflectionParameter;
use Traversable;

/**
 * Scores how well an inline/doc type candidate matches the incoming value.
 *
 * Higher scores are preferred when resolving unions.
 *
 * @param array<string, mixed>|null $typeMap
 */
function scoreInlineNamedTypeMatch(string $typeName, mixed $value, ?array $typeMap = null): int
{
    $resolved = ltrim(\StorybookPhp\Runtime\Contract\resolveTypeMapBinding($typeName, $typeMap), '\\');
    $nativeScore = \StorybookPhp\Runtime\Casting\scoreNativeTypeMatch(strtolower($resolved), $value);

    if ($nativeScore !== null) {
        return $nativeScore;
    }

    return \StorybookPhp\Runtime\Casting\scoreDeclaredTypeMatch($resolved, $value);
}

/**
 * Scores a builtin type, or returns null when the name is a declared type.
 */
function scoreNativeTypeMatch(string $typeName, mixed $value): ?int
{
    if (in_array($typeName, ['true', 'false', 'null'], true)) {
        return \StorybookPhp\Runtime\Casting\scoreLiteralTypeMatch($typeName, $value);
    }

    return match ($typeName) {
        'string' => \StorybookPhp\Runtime\Casting\scoreStringTypeMatch($value),
        'int', 'integer' => \StorybookPhp\Runtime\Casting\scoreIntTypeMatch($value),
        'float', 'double' => \StorybookPhp\Runtime\Casting\scoreFloatTypeMatch($value),
        'bool', 'boolean' => \StorybookPhp\Runtime\Casting\scoreBoolTypeMatch($value),
        'array', 'iterable' => is_array($value) ? 3 : ($value instanceof Traversable ? 1 : 0),
        'object' => is_object($value) ? 3 : (is_array($value) ? 1 : 0),
        'callable' => is_callable($value) ? 3 : 0,
        'mixed', 'unknown' => 0,
        default => null,
    };
}

/**
 * Scores the true, false, and null literal type contracts.
 *
 * @throws LogicException when called with a non-literal type name
 */
function scoreLiteralTypeMatch(string $typeName, mixed $value): int
{
    return match ($typeName) {
        'true' => $value === true ? 3 : 0,
        'false' => $value === false ? 3 : 0,
        'null' => $value === null ? 3 : 0,
        default => throw new LogicException("Unsupported literal type: {$typeName}"),
    };
}

/**
 * Scores whether a value can be converted to a string without data loss.
 */
function scoreStringTypeMatch(mixed $value): int
{
    if (is_string($value)) {
        return 3;
    }
    if (is_object($value) && method_exists($value, '__toString')) {
        return 2;
    }

    return is_int($value) || is_float($value) || is_bool($value) ? 1 : 0;
}

/**
 * Scores exact integers above numeric strings and integral floats.
 */
function scoreIntTypeMatch(mixed $value): int
{
    if (is_int($value)) {
        return 3;
    }
    if (is_string($value) && preg_match('/^-?\d+$/', $value) === 1) {
        return 2;
    }

    return is_float($value) && floor($value) === $value ? 1 : 0;
}

/**
 * Scores exact floats above integers and numeric strings.
 */
function scoreFloatTypeMatch(mixed $value): int
{
    if (is_float($value)) {
        return 3;
    }
    if (is_int($value)) {
        return 2;
    }

    return is_string($value) && is_numeric($value) ? 1 : 0;
}

/**
 * Scores booleans and the explicit scalar forms the runtime accepts.
 */
function scoreBoolTypeMatch(mixed $value): int
{
    if (is_bool($value)) {
        return 3;
    }
    if (is_int($value) && in_array($value, [0, 1], true)) {
        return 1;
    }

    return is_string($value)
        && in_array(strtolower($value), ['0', '1', 'true', 'false', 'yes', 'no', 'on', 'off'], true)
        ? 1
        : 0;
}

/**
 * Scores a value against an existing class, interface, or enum contract.
 */
function scoreDeclaredTypeMatch(string $resolved, mixed $value): int
{
    if (\StorybookPhp\Runtime\Contract\enumTypeExists($resolved)) {
        $enumClass = \StorybookPhp\Runtime\Contract\requireExistingClass($resolved);
        return $value instanceof $enumClass ? 3 : (\StorybookPhp\Runtime\Contract\findEnumCase($enumClass, $value) !== null ? 2 : 0);
    }

    if (interface_exists($resolved)) {
        return $value instanceof $resolved ? 3 : 0;
    }

    if (!class_exists($resolved)) {
        return 0;
    }

    if ($value instanceof $resolved) {
        return 3;
    }

    return is_array($value) ? \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch($resolved, $value) : 0;
}

/**
 * Score how well a PHPDoc type string matches the incoming value.
 *
 * @param array<string, mixed>|null $typeMap
 */
function scoreDocTypeMatch(string $docType, mixed $value, ?ReflectionParameter $param = null, ?array $typeMap = null): int
{
    $normalized = trim($docType);
    if ($normalized === '' || strtolower($normalized) === 'mixed' || strtolower($normalized) === 'unknown') {
        return 0;
    }

    if ($value === null) {
        return strtolower($normalized) === 'null' || str_starts_with($normalized, '?') ? 3 : 0;
    }

    if (str_starts_with($normalized, '?')) {
        return \StorybookPhp\Runtime\Casting\scoreDocTypeMatch(substr($normalized, 1), $value, $param, $typeMap);
    }

    $unionTypes = \StorybookPhp\Runtime\Casting\splitUnionTypes($normalized);
    if (count($unionTypes) > 1) {
        return \StorybookPhp\Runtime\Casting\scoreDocUnionTypeMatch($unionTypes, $value, $param, $typeMap);
    }

    $info = \StorybookPhp\Runtime\Contract\extractGenericValueType($normalized);
    if ($info !== null) {
        return \StorybookPhp\Runtime\Casting\scoreGenericDocTypeMatch($info['wrapperClass'], $value, $param, $typeMap);
    }

    return \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch(\StorybookPhp\Runtime\Casting\resolveBoundTypeName($normalized, $typeMap, $param), $value);
}

/**
 * @param list<string> $unionTypes
 * @param array<string, mixed>|null $typeMap
 */
function scoreDocUnionTypeMatch(array $unionTypes, mixed $value, ?ReflectionParameter $param, ?array $typeMap): int
{
    $best = 0;
    foreach ($unionTypes as $candidate) {
        if (strtolower($candidate) !== 'null') {
            $best = max($best, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch($candidate, $value, $param, $typeMap));
        }
    }

    return $best;
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function scoreGenericDocTypeMatch(?string $wrapperClass, mixed $value, ?ReflectionParameter $param, ?array $typeMap): int
{
    if (is_array($value)) {
        if ($wrapperClass === null) {
            return 4;
        }
        $wrapper = \StorybookPhp\Runtime\Casting\resolveBoundTypeName($wrapperClass, $typeMap, $param);

        return class_exists($wrapper) && \StorybookPhp\Runtime\Casting\canInstantiateCollectionWrapper($wrapper) ? 4 : 0;
    }

    if ($wrapperClass === null || !is_object($value)) {
        return 0;
    }
    $wrapper = \StorybookPhp\Runtime\Casting\resolveBoundTypeName($wrapperClass, $typeMap, $param);

    return (class_exists($wrapper) || interface_exists($wrapper)) && $value instanceof $wrapper ? 5 : 0;
}

/**
 * Ranks compatible union members by conversion confidence and declaration order.
 *
 * @param list<string> $unionTypes
 * @param array<string, mixed>|null $typeMap
 * @return list<string>
 */
function rankDocTypeCandidates(array $unionTypes, mixed $value, ?ReflectionParameter $param, ?array $typeMap): array
{
    $ranked = [];
    foreach ($unionTypes as $index => $candidate) {
        if (strtolower($candidate) === 'null') {
            continue;
        }
        $score = \StorybookPhp\Runtime\Casting\scoreDocTypeMatch($candidate, $value, $param, $typeMap);
        if ($score > 0) {
            $ranked[] = ['candidate' => $candidate, 'score' => $score, 'index' => $index];
        }
    }
    usort($ranked, static function (array $left, array $right): int {
        $scoreComparison = $right['score'] <=> $left['score'];

        return $scoreComparison !== 0 ? $scoreComparison : ($left['index'] <=> $right['index']);
    });

    return array_map(
        static fn (array $candidate): string => $candidate['candidate'],
        $ranked,
    );
}
