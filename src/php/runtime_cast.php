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
            $case = findEnumCase($resolved, $item);
            $result[$key] = $case ?? $item;
        }
        return $result;
    }

    if (class_exists($resolved)) {
        /** @var class-string $resolved */
        $result = [];
        foreach ($value as $key => $item) {
            if ($item instanceof $resolved) {
                $result[$key] = $item;
                continue;
            }
            $result[$key] = instantiateClassFromValue($resolved, $item, $typeMap);
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
    $resolved = $param instanceof \ReflectionParameter ? resolveClassName($raw, $param) : null;
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

        return findEnumCase($resolved, $value) !== null ? 2 : 0;
    }

    if (interface_exists($resolved)) {
        return $value instanceof $resolved ? 3 : 0;
    }

    if (!class_exists($resolved)) {
        return 0;
    }

    /** @var class-string $resolved */
    if ($value instanceof $resolved) {
        return 3;
    }

    return is_array($value) ? scoreClassInstantiationMatch($resolved, $value) : 0;
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

        if ($info['wrapperClass'] === null) {
            return 4;
        }

        $wrapper = resolveBoundTypeName($info['wrapperClass'], $typeMap, $param);
        return class_exists($wrapper) && canInstantiateCollectionWrapper($wrapper) ? 4 : 0;
    }

    return scoreInlineNamedTypeMatch(resolveBoundTypeName($normalized, $typeMap, $param), $value);
}

/**
 * Instantiate a class from Storybook input using the constructor shape when possible.
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
        if (isListArray($value)) {
            return $ref->newInstanceArgs($value);
        }

        return $ref->newInstanceArgs(matchArgs($constructor, $value, $typeMap));
    }

    $parameters = $constructor->getParameters();
    if (count($parameters) === 1 && !$parameters[0]->isVariadic()) {
        $parameter = $parameters[0];
        $docType = resolveParamDocType($parameter, parseDocBlockParamTypes($constructor));

        return $ref->newInstanceArgs([
            castArg($parameter, $value, $docType, $typeMap),
        ]);
    }

    return $ref->newInstanceArgs(matchArgs($constructor, (array) $value, $typeMap));
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
    if (isListArray($value)) {
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
    return $parameter instanceof ReflectionParameter && reflectionTypeAcceptsArray($parameter->getType());
}

/**
 * Checks whether a reflected parameter type accepts a PHP array directly.
 */
function reflectionTypeAcceptsArray(?ReflectionType $type): bool
{
    if (!$type instanceof \ReflectionType) {
        return true;
    }

    if ($type instanceof ReflectionNamedType) {
        return in_array(strtolower($type->getName()), ['array', 'iterable', 'mixed'], true);
    }

    if ($type instanceof ReflectionUnionType) {
        foreach ($type->getTypes() as $member) {
            if ($member instanceof ReflectionNamedType && reflectionTypeAcceptsArray($member)) {
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
    if (!canInstantiateCollectionWrapper($className)) {
        return $items;
    }

    $reflection = new ReflectionClass($className);
    if (!$reflection->getConstructor() instanceof \ReflectionMethod) {
        return $reflection->newInstance();
    }

    return $reflection->newInstanceArgs([$items]);
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
    return instantiateClassFromValue($resolved, $value, $typeMap);
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
            $scoreComparison = $b['score'] <=> $a['score'];
            if ($scoreComparison !== 0) {
                return $scoreComparison;
            }

            return $a['index'] <=> $b['index'];
        });
        foreach ($rankedUnionTypes as $ranked) {
            return castInlineDocTypeValue($value, $ranked['candidate'], $typeMap);
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
        return instantiateCollectionWrapper($wrapper, $casted);
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
            $scoreComparison = $b['score'] <=> $a['score'];
            if ($scoreComparison !== 0) {
                return $scoreComparison;
            }

            return $a['index'] <=> $b['index'];
        });
        foreach ($rankedUnionTypes as $ranked) {
            return castDocTypeValue($value, $ranked['candidate'], $param, $typeMap);
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
        return instantiateCollectionWrapper($wrapper, $casted);
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
            $scoreComparison = $b['score'] <=> $a['score'];
            if ($scoreComparison !== 0) {
                return $scoreComparison;
            }

            return $a['index'] <=> $b['index'];
        });

        foreach ($rankedNamedTypes as $ranked) {
            if ($ranked['score'] <= 0) {
                continue;
            }

            return castWithNamedType($ranked['type'], $value, $param, $docType, $typeMap);
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
        /** @codeCoverageIgnoreStart */
        case 'never':
            throw new \RuntimeException("Cannot provide a value for 'never' type parameter");
        /** @codeCoverageIgnoreEnd */
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

        return instantiateClassFromValue($typeName, $value, $typeMap);
    }

    /** @codeCoverageIgnoreStart */
    return $value;
    /** @codeCoverageIgnoreEnd */
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
 * Resolve the effective doc type for a parameter using the provided arg definition.
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
        $overrideDocType = buildOverrideDocType($param, $argDef);
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
        if ($elementType === null && isRedundantDocTypeOverride($param, $type)) {
            return null;
        }

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

function isRedundantDocTypeOverride(ReflectionParameter $param, string $overrideType): bool
{
    $paramType = $param->getType();
    if (!$paramType instanceof ReflectionNamedType) {
        return false;
    }

    $normalizedOverride = normalizeRuntimeTypeName($overrideType, $param);
    $normalizedParamType = normalizeRuntimeTypeName($paramType->getName(), $param);

    return $normalizedOverride !== null
        && $normalizedParamType !== null
        && $normalizedOverride === $normalizedParamType;
}

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
        default => resolveClassName($normalized, $param) ?? $lower,
    };
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return array{ordered: list<mixed>, named: array<string, mixed>}
 */
function resolveArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    if (!$ref instanceof \ReflectionFunctionAbstract) {
        return ['ordered' => [], 'named' => []];
    }

    $docTypes = parseDocBlockParamTypes($ref);

    $ordered = [];
    $named = [];
    foreach ($ref->getParameters() as $param) {
        $name = $param->getName();
        $paramType = $param->getType();
        $argDef = null;
        if ($argDefs !== null && isset($argDefs[$name]) && is_array($argDefs[$name])) {
            /** @var array<string, mixed> $resolvedArgDef */
            $resolvedArgDef = $argDefs[$name];
            $argDef = $resolvedArgDef;
        }
        $docType = resolveParamDocType($param, $docTypes, $argDef);

        if ($param->isVariadic()) {
            if (array_key_exists($name, $args)) {
                $value = $args[$name];
                $values = is_array($value) && isListArray($value) ? $value : [$value];
                $variadicValues = [];
                foreach ($values as $item) {
                    $casted = castArg($param, $item, $docType, $typeMap);
                    $ordered[] = $casted;
                    $variadicValues[] = $casted;
                }
                $named[$name] = $variadicValues;
            }
            continue;
        }

        $resolved = null;
        if (array_key_exists($name, $args)) {
            $resolved = castArg($param, $args[$name], $docType, $typeMap);
        } elseif (is_array($argDef) && array_key_exists('default', $argDef)) {
            $resolved = castArg($param, $argDef['default'], $docType, $typeMap);
        } elseif ($param->isDefaultValueAvailable()) {
            $resolved = reflectionParameterDefaultValue($param);
        } elseif (
            is_array($argDef)
            && (($argDef['nullable'] ?? false) === true)
            && ($paramType === null || $param->allowsNull())
        ) {
            $resolved = null;
        } elseif ($param->allowsNull()) {
            $resolved = null;
        } else {
            throw new \RuntimeException("Missing required argument: {$name}");
        }

        $ordered[] = $resolved;
        $named[$name] = $resolved;
    }

    return ['ordered' => $ordered, 'named' => $named];
}

/**
 * Converts the engine-level reflection failure into the runner's exception
 * contract. Reflection only fails here for internal or extension parameters.
 *
 * @codeCoverageIgnore
 * @throws RuntimeException when the engine cannot expose the default value
 */
function reflectionParameterDefaultValue(ReflectionParameter $parameter): mixed
{
    try {
        return $parameter->getDefaultValue();
    } catch (\ReflectionException $exception) {
        throw new \RuntimeException(
            "Failed to read the default value for parameter '{$parameter->getName()}'.",
            0,
            $exception,
        );
    }
}

/**
 * Match arguments from an associative array to the parameter order expected by reflection.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return list<mixed>
 */
function matchArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    return resolveArgs($ref, $args, $typeMap, $argDefs)['ordered'];
}

/**
 * Resolve arguments into a named map keyed by parameter name.
 *
 * @param array<array-key, mixed> $args
 * @param array<string, mixed>|null $typeMap
 * @param array<string, mixed>|null $argDefs
 * @return array<string, mixed>
 */
function resolveNamedArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null, ?array $argDefs = null): array
{
    return resolveArgs($ref, $args, $typeMap, $argDefs)['named'];
}
