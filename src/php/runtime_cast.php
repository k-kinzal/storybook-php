<?php

declare(strict_types=1);

/**
 * Cast each element of an array using PHPDoc generic type information.
 *
 * @param array<array-key, mixed> $value
 * @param array<string, mixed>|null $typeMap
 * @return array<array-key, mixed>
 */
function castArrayElements(array $value, string $docType, ReflectionParameter $param, ?array $typeMap = null): array
{
    $info = extractGenericValueType($docType);
    if ($info === null) {
        return $value;
    }

    $innerType = $info['valueType'];

    if (str_contains($innerType, '|')) {
        return $value;
    }

    if (isArrayLikeType($innerType)) {
        $result = [];
        foreach ($value as $key => $item) {
            $result[$key] = is_array($item) ? castArrayElements($item, $innerType, $param, $typeMap) : $item;
        }
        return $result;
    }

    $resolved = resolveBoundTypeName($innerType, $typeMap, $param);

    if (function_exists('enum_exists') && enum_exists($resolved)) {
        assert(class_exists($resolved));
        $result = [];
        foreach ($value as $key => $item) {
            try {
                $result[$key] = resolveEnumCase($resolved, $item);
            } catch (\RuntimeException) {
                $result[$key] = $item;
            }
        }
        return $result;
    }

    if (class_exists($resolved)) {
        /** @var class-string $resolved */
        $ref = new ReflectionClass($resolved);
        $constructor = $ref->getConstructor();
        $result = [];
        foreach ($value as $key => $item) {
            if ($item instanceof $resolved) {
                $result[$key] = $item;
                continue;
            }
            if ($constructor !== null) {
                $result[$key] = $ref->newInstanceArgs(matchArgs($constructor, (array) $item, $typeMap));
            } else {
                $result[$key] = $ref->newInstance();
            }
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
    $resolved = $param !== null ? resolveClassName($raw, $param) : null;
    $candidate = $resolved ?? $raw;

    $bound = ltrim(resolveTypeMapBinding($candidate, $typeMap), '\\');
    if ($bound !== $candidate) {
        return $bound;
    }

    $rawBound = ltrim(resolveTypeMapBinding($raw, $typeMap), '\\');
    if ($rawBound !== $raw) {
        return $rawBound;
    }

    return $candidate;
}

/**
 * Score how well an inline/doc type candidate matches the incoming value.
 *
 * Higher scores are preferred when resolving unions.
 *
 * @param array<string, mixed>|null $typeMap
 */
function scoreInlineNamedTypeMatch(string $typeName, mixed $value, ?array $typeMap = null): int
{
    $resolved = ltrim(resolveTypeMapBinding($typeName, $typeMap), '\\');

    switch (strtolower($resolved)) {
        case 'string':
            if (is_string($value)) {
                return 3;
            }
            if (is_object($value) && method_exists($value, '__toString')) {
                return 2;
            }
            return is_int($value) || is_float($value) || is_bool($value) ? 1 : 0;
        case 'int':
        case 'integer':
            if (is_int($value)) {
                return 3;
            }
            if (is_string($value) && preg_match('/^-?\d+$/', $value) === 1) {
                return 2;
            }
            return is_float($value) && floor($value) === $value ? 1 : 0;
        case 'float':
        case 'double':
            if (is_float($value)) {
                return 3;
            }
            if (is_int($value)) {
                return 2;
            }
            return is_string($value) && is_numeric($value) ? 1 : 0;
        case 'bool':
        case 'boolean':
            if (is_bool($value)) {
                return 3;
            }
            if (is_int($value) && in_array($value, [0, 1], true)) {
                return 1;
            }
            if (is_string($value) && in_array(strtolower($value), ['0', '1', 'true', 'false', 'yes', 'no', 'on', 'off'], true)) {
                return 1;
            }
            return 0;
        case 'array':
        case 'iterable':
            if (is_array($value)) {
                return 3;
            }
            return $value instanceof Traversable ? 1 : 0;
        case 'object':
            if (is_object($value)) {
                return 3;
            }
            return is_array($value) ? 1 : 0;
        case 'callable':
            return is_callable($value) ? 3 : 0;
        case 'mixed':
        case 'unknown':
            return 0;
        case 'true':
            return $value === true ? 3 : 0;
        case 'false':
            return $value === false ? 3 : 0;
        case 'null':
            return $value === null ? 3 : 0;
    }

    if (function_exists('enum_exists') && enum_exists($resolved)) {
        assert(class_exists($resolved));
        if ($value instanceof $resolved) {
            return 3;
        }
        try {
            resolveEnumCase($resolved, $value);
            return 2;
        } catch (\Throwable) {
            return 0;
        }
    }

    if (interface_exists($resolved)) {
        return is_object($value) && $value instanceof $resolved ? 3 : 0;
    }

    if (!class_exists($resolved)) {
        return 0;
    }

    /** @var class-string $resolved */
    if ($value instanceof $resolved) {
        return 3;
    }

    return is_array($value) ? 1 : 0;
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
        return scoreDocTypeMatch(substr($normalized, 1), $value, $param, $typeMap);
    }

    $unionTypes = splitUnionTypes($normalized);
    if (count($unionTypes) > 1) {
        $best = 0;
        foreach ($unionTypes as $candidate) {
            if (strtolower($candidate) === 'null') {
                continue;
            }
            $best = max($best, scoreDocTypeMatch($candidate, $value, $param, $typeMap));
        }
        return $best;
    }

    $info = extractGenericValueType($normalized);
    if ($info !== null) {
        if (!is_array($value)) {
            $wrapper = $info['wrapperClass'];
            if ($wrapper !== null) {
                $resolvedWrapper = resolveBoundTypeName($wrapper, $typeMap, $param);
                if (
                    (class_exists($resolvedWrapper) || interface_exists($resolvedWrapper))
                    && is_object($value)
                    && $value instanceof $resolvedWrapper
                ) {
                    return 5;
                }
            }
            return 0;
        }

        return 4;
    }

    return scoreInlineNamedTypeMatch(resolveBoundTypeName($normalized, $typeMap, $param), $value);
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function castInlineNamedType(string $typeName, mixed $value, ?array $typeMap = null): mixed
{
    $resolved = ltrim(resolveTypeMapBinding($typeName, $typeMap), '\\');

    switch (strtolower($resolved)) {
        case 'string':
            return stringifyOutputValue($value);
        case 'int':
        case 'integer':
            if (is_int($value)) {
                return $value;
            }
            return is_numeric($value) ? (int) $value : 0;
        case 'float':
        case 'double':
            if (is_float($value)) {
                return $value;
            }
            return is_numeric($value) ? (float) $value : 0.0;
        case 'bool':
        case 'boolean':
            if (is_bool($value)) {
                return $value;
            }
            return !in_array($value, [null, 0, 0.0, '', '0', []], true);
        case 'array':
        case 'iterable':
            return is_array($value) ? $value : (array) $value;
        case 'object':
            if (is_object($value)) {
                return $value;
            }
            if (is_array($value) || is_scalar($value) || $value === null) {
                return (object) $value;
            }
            return (object) [];
        case 'callable':
        case 'mixed':
        case 'unknown':
            return $value;
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
    }

    if (function_exists('enum_exists') && enum_exists($resolved)) {
        assert(class_exists($resolved));
        return resolveEnumCase($resolved, $value);
    }

    if (!class_exists($resolved)) {
        return $value;
    }

    /** @var class-string $resolved */
    if ($value instanceof $resolved) {
        return $value;
    }

    $ref = new ReflectionClass($resolved);
    $constructor = $ref->getConstructor();
    if ($constructor !== null) {
        return $ref->newInstanceArgs(matchArgs($constructor, is_array($value) ? $value : (array) $value, $typeMap));
    }

    return $ref->newInstance();
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
        $rankedUnionTypes = [];
        foreach ($unionTypes as $index => $candidate) {
            if (strtolower($candidate) === 'null') {
                continue;
            }
            $score = scoreDocTypeMatch($candidate, $value, null, $typeMap);
            if ($score <= 0) {
                continue;
            }
            $rankedUnionTypes[] = ['candidate' => $candidate, 'score' => $score, 'index' => $index];
        }
        usort($rankedUnionTypes, static function (array $a, array $b): int {
            return ($b['score'] <=> $a['score']) ?: ($a['index'] <=> $b['index']);
        });
        foreach ($rankedUnionTypes as $ranked) {
            try {
                return castInlineDocTypeValue($value, $ranked['candidate'], $typeMap);
            } catch (\Throwable) {
                // try next candidate
            }
        }
        return $value;
    }

    $info = extractGenericValueType($normalized);
    if ($info !== null) {
        $arr = is_array($value) ? $value : (array) $value;
        $casted = [];
        foreach ($arr as $key => $item) {
            $casted[$key] = castInlineDocTypeValue($item, $info['valueType'], $typeMap);
        }

        if ($info['wrapperClass'] === null) {
            return $casted;
        }

        $wrapper = ltrim(resolveTypeMapBinding($info['wrapperClass'], $typeMap), '\\');
        if (!class_exists($wrapper)) {
            return $casted;
        }

        /** @var class-string $wrapper */
        $ref = new ReflectionClass($wrapper);
        if (!$ref->isInstantiable()) {
            return $casted;
        }
        $constructor = $ref->getConstructor();
        if ($constructor !== null) {
            return $ref->newInstanceArgs([$casted]);
        }

        return $ref->newInstance();
    }

    return castInlineNamedType($normalized, $value, $typeMap);
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
                /** @var class-string $wrapper */
                $ref = new ReflectionClass($wrapper);
                if (!$ref->isInstantiable()) {
                    return $casted;
                }
                $constructor = $ref->getConstructor();
                if ($constructor !== null) {
                    return $ref->newInstanceArgs([$casted]);
                }
                return $ref->newInstance();
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
        /** @var array<string, mixed> $argDef */

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
            throw new \RuntimeException("Missing required argument: {$name}");
        }
    }

    return $casted;
}

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
        $rankedUnionTypes = [];
        foreach ($unionTypes as $index => $candidate) {
            if (strtolower($candidate) === 'null') {
                continue;
            }
            $score = scoreDocTypeMatch($candidate, $value, $param, $typeMap);
            if ($score <= 0) {
                continue;
            }
            $rankedUnionTypes[] = ['candidate' => $candidate, 'score' => $score, 'index' => $index];
        }
        usort($rankedUnionTypes, static function (array $a, array $b): int {
            return ($b['score'] <=> $a['score']) ?: ($a['index'] <=> $b['index']);
        });
        foreach ($rankedUnionTypes as $ranked) {
            try {
                return castDocTypeValue($value, $ranked['candidate'], $param, $typeMap);
            } catch (\Throwable) {
                // try next candidate
            }
        }
        return $value;
    }

    $info = extractGenericValueType($normalized);
    if ($info !== null) {
        $arr = is_array($value) ? $value : (array) $value;
        $casted = castArrayElements($arr, $normalized, $param, $typeMap);

        if ($info['wrapperClass'] === null) {
            return $casted;
        }

        $wrapper = resolveBoundTypeName($info['wrapperClass'], $typeMap, $param);
        if (!class_exists($wrapper)) {
            return $casted;
        }

        /** @var class-string $wrapper */
        $ref = new ReflectionClass($wrapper);
        if (!$ref->isInstantiable()) {
            return $casted;
        }
        $constructor = $ref->getConstructor();
        if ($constructor !== null) {
            return $ref->newInstanceArgs([$casted]);
        }

        return $ref->newInstance();
    }

    return castInlineNamedType(resolveBoundTypeName($normalized, $typeMap, $param), $value);
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
        $rankedNamedTypes = [];
        $otherTypes = [];

        foreach ($type->getTypes() as $index => $unionType) {
            if ($unionType instanceof ReflectionNamedType) {
                $rankedNamedTypes[] = [
                    'type' => $unionType,
                    'score' => scoreTypeMatch($unionType, $value),
                    'index' => $index,
                ];
                continue;
            }

            $otherTypes[] = $unionType;
        }

        usort($rankedNamedTypes, static function (array $a, array $b): int {
            return ($b['score'] <=> $a['score']) ?: ($a['index'] <=> $b['index']);
        });

        foreach ($rankedNamedTypes as $ranked) {
            if ($ranked['score'] <= 0) {
                continue;
            }
            try {
                return castWithNamedType($ranked['type'], $value, $param, $docType, $typeMap);
            } catch (\Throwable) {
                // try next
            }
        }

        foreach ($otherTypes as $unionType) {
            return $value;
        }

        return $value;
    }

    if ($type instanceof ReflectionNamedType) {
        return castWithNamedType($type, $value, $param, $docType, $typeMap);
    }

    return $value;
}

/**
 * Resolve a typeMap.args override for a specific reflection parameter.
 *
 * @param array<string, mixed>|null $typeMap
 */
function resolveParamArgOverride(
    string $classFqn,
    string $methodName,
    string $name,
    ?array $typeMap = null,
): mixed {
    if ($typeMap === null) {
        return null;
    }

    $argOverrides = $typeMap['args'] ?? null;
    if (!is_array($argOverrides)) {
        return null;
    }

    return $argOverrides["{$classFqn}::{$methodName}::\${$name}"]
        ?? $argOverrides["{$classFqn}::\${$name}"]
        ?? null;
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
    $typeName = resolveTypeMapBinding($typeName, $typeMap);

    switch ($typeName) {
        case 'string':
            return stringifyOutputValue($value);
        case 'int':
            if (is_int($value)) {
                return $value;
            }
            return is_numeric($value) ? (int) $value : 0;
        case 'float':
            if (is_float($value)) {
                return $value;
            }
            return is_numeric($value) ? (float) $value : 0.0;
        case 'bool':
            if (is_bool($value)) {
                return $value;
            }
            return !in_array($value, [null, 0, 0.0, '', '0', []], true);
        case 'array':
        case 'iterable':
            $arr = is_array($value) ? $value : (array) $value;
            if ($docType !== null) {
                return castArrayElements($arr, $docType, $param, $typeMap);
            }
            return $arr;
        case 'object':
            if (is_object($value)) {
                return $value;
            }
            if (is_array($value) || is_scalar($value) || $value === null) {
                return (object) $value;
            }
            return (object) [];
        case 'callable':
        case 'mixed':
            return $value;
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
        // @codeCoverageIgnoreStart
        case 'never':
            throw new \RuntimeException("Cannot provide a value for 'never' type parameter");
        // @codeCoverageIgnoreEnd
    }

    if (function_exists('enum_exists') && enum_exists($typeName)) {
        assert(class_exists($typeName));
        return resolveEnumCase($typeName, $value);
    }

    if (class_exists($typeName)) {
        /** @var class-string $typeName */
        if ($value instanceof $typeName) {
            return $value;
        }

        if ($docType !== null && is_array($value)) {
            $info = extractGenericValueType($docType);
            if ($info !== null && $info['wrapperClass'] !== null) {
                $castedItems = castArrayElements($value, $docType, $param, $typeMap);
                $ref = new ReflectionClass($typeName);
                $constructor = $ref->getConstructor();
                if ($constructor !== null) {
                    return $ref->newInstanceArgs([$castedItems]);
                }
            }
        }

        $ref = new ReflectionClass($typeName);
        $constructor = $ref->getConstructor();
        if ($constructor !== null) {
            return $ref->newInstanceArgs(matchArgs($constructor, (array) $value, $typeMap));
        }
        return $ref->newInstance();
    }

    // @codeCoverageIgnoreStart
    return $value;
    // @codeCoverageIgnoreEnd
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

/**
 * Resolve the effective doc type for a parameter, including typeMap.args overrides.
 *
 * @param array<string, string> $docTypes
 * @param array<string, mixed>|null $typeMap
 */
function resolveParamDocType(
    ReflectionParameter $param,
    array $docTypes,
    string $classFqn,
    string $methodName,
    ?array $typeMap = null,
): ?string {
    $name = $param->getName();
    $docType = $docTypes[$name] ?? null;

    $override = resolveParamArgOverride($classFqn, $methodName, $name, $typeMap);
    if ($override !== null) {
        if (is_string($override)) {
            return $override;
        }

        if (is_array($override)) {
            /** @var array<string, mixed> $override */
            $overrideDocType = buildOverrideDocType($param, $override);
            if ($overrideDocType !== null) {
                return $overrideDocType;
            }
        }
    }

    return $docType;
}

/**
 * Convert a typeMap.args object override into a doc-type string that the
 * runtime caster understands.
 *
 * @param array<string, mixed> $override
 */
function buildOverrideDocType(ReflectionParameter $param, array $override): ?string
{
    $type = isset($override['type']) && is_string($override['type']) && trim($override['type']) !== ''
        ? trim($override['type'])
        : null;
    $elementType = isset($override['elementType']) && is_string($override['elementType']) && trim($override['elementType']) !== ''
        ? trim($override['elementType'])
        : null;

    if ($type !== null) {
        if ($elementType === null) {
            return $type;
        }

        if (in_array(strtolower($type), NATIVE_ARRAY_TYPES, true)) {
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
        if (in_array(strtolower($paramTypeName), NATIVE_ARRAY_TYPES, true)) {
            return $elementType . '[]';
        }
        if (!in_array(strtolower($paramTypeName), ['string', 'int', 'integer', 'float', 'double', 'bool', 'boolean', 'object', 'callable', 'mixed', 'true', 'false', 'null'], true)) {
            return $paramTypeName . '<' . $elementType . '>';
        }
    }

    return $elementType;
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @return list<mixed>
 */
function matchArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null): array
{
    if (!$ref instanceof \ReflectionFunctionAbstract) {
        return [];
    }

    $docTypes = parseDocBlockParamTypes($ref);

    $classFqn = '';
    $methodName = '';
    if ($ref instanceof ReflectionMethod) {
        $classFqn = $ref->getDeclaringClass()->getName();
        $methodName = $ref->getName();
    } elseif ($ref instanceof ReflectionFunction) {
        $methodName = $ref->getName();
    }

    $ordered = [];
    foreach ($ref->getParameters() as $param) {
        $name = $param->getName();
        $override = resolveParamArgOverride($classFqn, $methodName, $name, $typeMap);
        $docType = resolveParamDocType($param, $docTypes, $classFqn, $methodName, $typeMap);

        if ($param->isVariadic()) {
            if (array_key_exists($name, $args)) {
                $value = $args[$name];
                $values = is_array($value) && isListArray($value) ? $value : [$value];
                foreach ($values as $item) {
                    $ordered[] = castArg($param, $item, $docType, $typeMap);
                }
            }
            continue;
        }

        if (array_key_exists($name, $args)) {
            $ordered[] = castArg($param, $args[$name], $docType, $typeMap);
        } elseif (is_array($override) && array_key_exists('default', $override)) {
            $ordered[] = castArg($param, $override['default'], $docType, $typeMap);
        } elseif ($param->isDefaultValueAvailable()) {
            $ordered[] = $param->getDefaultValue();
        } elseif (
            is_array($override)
            && (($override['nullable'] ?? false) === true)
            && (!$param->getType() instanceof \ReflectionType || $param->allowsNull())
        ) {
            $ordered[] = null;
        } elseif ($param->allowsNull()) {
            $ordered[] = null;
        } else {
            throw new \RuntimeException("Missing required argument: {$name}");
        }
    }

    return $ordered;
}
