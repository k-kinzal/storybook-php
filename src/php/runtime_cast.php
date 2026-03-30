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

    $resolved = resolveClassName($innerType, $param);

    if ($resolved !== null) {
        $resolved = resolveTypeMapBinding($resolved, $typeMap);
    }

    if (function_exists('enum_exists') && $resolved !== null && enum_exists($resolved)) {
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

    if ($resolved !== null && class_exists($resolved)) {
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
 * Score how well a named type matches a given value.
 */
function scoreTypeMatch(ReflectionNamedType $type, mixed $value): int
{
    $name = $type->getName();

    if ($value === null) {
        return $type->allowsNull() ? 2 : 0;
    }

    return match ($name) {
        'int' => is_int($value)
            ? 2
            : (
                (is_float($value) && floor($value) === $value)
                || (is_string($value) && preg_match('/^-?\d+$/', $value) === 1)
                    ? 1
                    : 0
            ),
        'float' => is_float($value) ? 2 : (is_numeric($value) ? 1 : 0),
        'string' => is_string($value) ? 2 : 1,
        'bool' => is_bool($value) ? 2 : 1,
        'array' => is_array($value) ? 2 : 0,
        'mixed' => 1,
        'true' => $value === true ? 2 : (is_bool($value) ? 1 : 0),
        'false' => $value === false ? 2 : (is_bool($value) ? 1 : 0),
        'null' => 0,
        default => 0,
    };
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
        return $value;
    }

    if ($type instanceof ReflectionUnionType) {
        $unionTypes = $type->getTypes();

        $namedTypes = array_filter($unionTypes, fn($t) => $t instanceof ReflectionNamedType);
        $otherTypes = array_filter($unionTypes, fn($t) => !($t instanceof ReflectionNamedType));

        usort($namedTypes, function (ReflectionNamedType $a, ReflectionNamedType $b) use ($value) {
            return scoreTypeMatch($b, $value) <=> scoreTypeMatch($a, $value);
        });

        foreach ([...$namedTypes, ...$otherTypes] as $unionType) {
            try {
                if ($unionType instanceof ReflectionNamedType) {
                    return castWithNamedType($unionType, $value, $param, $docType, $typeMap);
                }
                return $value;
            } catch (\Throwable) {
                // try next
            }
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

    $argOverrides = $typeMap['args'] ?? null;
    if (is_array($argOverrides)) {
        $override = $argOverrides["{$classFqn}::{$methodName}::\${$name}"]
            ?? $argOverrides["{$classFqn}::\${$name}"]
            ?? null;

        if ($override !== null) {
            if (is_string($override)) {
                return $override;
            }

            if (is_array($override)) {
                if (array_key_exists('type', $override) && is_string($override['type'])) {
                    return $override['type'];
                }

                if (array_key_exists('elementType', $override) && $override['elementType'] !== null) {
                    $paramType = $param->getType();
                    $isArrayLike = $paramType instanceof \ReflectionNamedType
                        && in_array($paramType->getName(), ['array', 'iterable'], true);
                    $elementType = $override['elementType'];
                    if ($isArrayLike && is_string($elementType) && $elementType !== '') {
                        return $elementType . '[]';
                    }
                    if (is_string($elementType)) {
                        return $elementType;
                    }
                }
            }
        }
    }

    return $docType;
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

        if ($param->isVariadic()) {
            if (array_key_exists($name, $args)) {
                $docType = resolveParamDocType($param, $docTypes, $classFqn, $methodName, $typeMap);
                $value = $args[$name];
                $values = is_array($value) && isListArray($value) ? $value : [$value];
                foreach ($values as $item) {
                    $ordered[] = castArg($param, $item, $docType, $typeMap);
                }
            }
            continue;
        }

        if (array_key_exists($name, $args)) {
            $docType = resolveParamDocType($param, $docTypes, $classFqn, $methodName, $typeMap);
            $ordered[] = castArg($param, $args[$name], $docType, $typeMap);
        } elseif ($param->isDefaultValueAvailable()) {
            $ordered[] = $param->getDefaultValue();
        } elseif ($param->allowsNull()) {
            $ordered[] = null;
        } else {
            throw new \RuntimeException("Missing required argument: {$name}");
        }
    }

    return $ordered;
}
