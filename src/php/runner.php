<?php

declare(strict_types=1);

/**
 * PHP execution runner for storybook-php.
 *
 * Reads a JSON request from stdin, executes the described PHP callable,
 * and writes a JSON response to stdout.
 */

// ---------------------------------------------------------------------------
// PHPDoc array type helpers
// ---------------------------------------------------------------------------

/**
 * Parse PHPDoc @param / @phpstan-param / @psalm-param annotations from a
 * function or method docblock.  Returns a map of parameter name → doc type.
 *
 * Priority per param: @phpstan-param > @psalm-param > @param.
 */
function parseDocBlockParamTypes(?ReflectionFunctionAbstract $ref): array
{
    if ($ref === null) {
        return [];
    }

    $doc = $ref->getDocComment();
    if ($doc === false) {
        return [];
    }

    $types = [];

    // Highest priority: @phpstan-param
    if (preg_match_all('/@phpstan-param\s+(.+?)\s+\$(\w+)/m', $doc, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $types[$match[2]] = trim($match[1]);
        }
    }

    // Next priority: @psalm-param (only if not already set by @phpstan-param)
    if (preg_match_all('/@psalm-param\s+(.+?)\s+\$(\w+)/m', $doc, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            if (!isset($types[$match[2]])) {
                $types[$match[2]] = trim($match[1]);
            }
        }
    }

    // Fall back to @param for params not already covered
    if (preg_match_all('/@param\s+(.+?)\s+\$(\w+)/m', $doc, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            if (!isset($types[$match[2]])) {
                $types[$match[2]] = trim($match[1]);
            }
        }
    }

    return $types;
}

/**
 * Split generic type arguments on commas at <> depth 0.
 * e.g. "string, list<Foo>" → ["string", "list<Foo>"]
 */
function splitGenericArgs(string $inner): array
{
    $parts = [];
    $depth = 0;
    $current = '';
    $len = strlen($inner);

    for ($i = 0; $i < $len; $i++) {
        $ch = $inner[$i];
        if ($ch === '<') {
            $depth++;
            $current .= $ch;
        } elseif ($ch === '>') {
            $depth--;
            $current .= $ch;
        } elseif ($ch === ',' && $depth === 0) {
            $parts[] = trim($current);
            $current = '';
        } else {
            $current .= $ch;
        }
    }

    $trimmed = trim($current);
    if ($trimmed !== '') {
        $parts[] = $trimmed;
    }

    return $parts;
}

/** Native array-like type names recognised by PHPStan / Psalm. */
const NATIVE_ARRAY_TYPES = ['list', 'array', 'iterable', 'non-empty-list', 'non-empty-array'];

/**
 * Extract the inner value type from a generic / array doc type.
 *
 * Returns ['valueType' => string, 'wrapperClass' => string|null] or null.
 *   - wrapperClass is null  for native array types (list, array, iterable …)
 *   - wrapperClass is a class name for collection-like types (Collection …)
 */
function extractGenericValueType(string $docType): ?array
{
    // Strip nullable suffix/prefix: list<Foo>|null  →  list<Foo>
    $type = preg_replace('/\|null$/i', '', $docType);
    $type = preg_replace('/^null\|/i', '', $type);
    $type = trim($type);

    // ClassName[][] → ClassName[]  /  ClassName[] → ClassName
    if (str_ends_with($type, '[]')) {
        return ['valueType' => substr($type, 0, -2), 'wrapperClass' => null];
    }

    // Generic syntax: Something<…>
    if (preg_match('/^(.+?)<(.+)>$/', $type, $m)) {
        $outer = trim($m[1]);
        $inner = trim($m[2]);
        $args  = splitGenericArgs($inner);
        // For two-arg generics (array<K,V>, Collection<K,V>), take the last arg as value type
        $valueType = count($args) >= 2 ? trim($args[count($args) - 1]) : $inner;

        $isNative = in_array(strtolower($outer), NATIVE_ARRAY_TYPES, true);
        return [
            'valueType'    => $valueType,
            'wrapperClass' => $isNative ? null : $outer,
        ];
    }

    return null;
}

/**
 * Check whether a PHPDoc type string represents an array-like or generic type.
 */
function isArrayLikeType(string $type): bool
{
    $t = preg_replace('/\|null$/i', '', $type);
    $t = preg_replace('/^null\|/i', '', $t);
    $t = trim($t);

    return str_ends_with($t, '[]') || (bool) preg_match('/^.+<.+>$/', $t);
}

/**
 * Resolve a short class name to a FQN using the declaring namespace.
 * Falls back to null when the class cannot be found.
 */
function resolveClassName(string $className, ReflectionParameter $param): ?string
{
    // Leading backslash → already absolute
    $candidate = ltrim($className, '\\');

    if (class_exists($candidate) || (function_exists('enum_exists') && enum_exists($candidate))) {
        return $candidate;
    }

    // Try prepending the declaring namespace
    $declaringFunc = $param->getDeclaringFunction();
    $namespace = null;
    if ($declaringFunc instanceof ReflectionMethod) {
        $namespace = $declaringFunc->getDeclaringClass()->getNamespaceName();
    } elseif (method_exists($declaringFunc, 'getNamespaceName')) {
        $namespace = $declaringFunc->getNamespaceName();
    }

    if ($namespace !== null && $namespace !== '') {
        $fqn = $namespace . '\\' . $candidate;
        if (class_exists($fqn) || (function_exists('enum_exists') && enum_exists($fqn))) {
            return $fqn;
        }
    }

    return null;
}

/**
 * Cast each element of an array using PHPDoc generic type information.
 * Handles recursive nesting (e.g. list<list<Foo>>).
 */
function castArrayElements(array $value, string $docType, ReflectionParameter $param): array
{
    $info = extractGenericValueType($docType);
    if ($info === null) {
        return $value;
    }

    $innerType = $info['valueType'];

    // Union inner types (e.g. Foo|Bar) — skip casting
    if (str_contains($innerType, '|')) {
        return $value;
    }

    // Inner type is itself array-like → recurse into each element
    if (isArrayLikeType($innerType)) {
        $result = [];
        foreach ($value as $key => $item) {
            $result[$key] = is_array($item) ? castArrayElements($item, $innerType, $param) : $item;
        }
        return $result;
    }

    // Try to resolve as a class
    $resolved = resolveClassName($innerType, $param);
    if ($resolved !== null && class_exists($resolved)) {
        $ref = new ReflectionClass($resolved);
        $constructor = $ref->getConstructor();
        $result = [];
        foreach ($value as $key => $item) {
            if ($item instanceof $resolved) {
                $result[$key] = $item;
                continue;
            }
            if ($constructor !== null) {
                $result[$key] = $ref->newInstanceArgs(matchArgs($constructor, (array) $item));
            } else {
                $result[$key] = $ref->newInstance();
            }
        }
        return $result;
    }

    // Try to resolve as an enum
    if (function_exists('enum_exists') && $resolved !== null && enum_exists($resolved)) {
        $isBacked = is_subclass_of($resolved, \BackedEnum::class);
        $cases = $resolved::cases();
        $result = [];
        foreach ($value as $key => $item) {
            if ($item instanceof $resolved) {
                $result[$key] = $item;
                continue;
            }
            if ($isBacked) {
                try {
                    $result[$key] = $resolved::from($item);
                    continue;
                } catch (\Throwable) {
                    // fall through to name matching
                }
            }
            foreach ($cases as $case) {
                if ($case->name === $item) {
                    $result[$key] = $case;
                    continue 2;
                }
            }
            $result[$key] = $item;
        }
        return $result;
    }

    return $value;
}

// ---------------------------------------------------------------------------
// Type scoring & casting
// ---------------------------------------------------------------------------

/**
 * Score how well a named type matches a given value.
 * Higher score = better match. Used to pick the best type in a union.
 */
function scoreTypeMatch(ReflectionNamedType $type, mixed $value): int
{
    $name = $type->getName();

    if ($value === null) {
        return $type->allowsNull() ? 2 : 0;
    }

    return match ($name) {
        'int' => is_int($value) ? 2 : (is_numeric($value) && (int) $value == $value ? 1 : 0),
        'float' => is_float($value) ? 2 : (is_numeric($value) ? 1 : 0),
        'string' => is_string($value) ? 2 : 1,
        'bool' => is_bool($value) ? 2 : 1,
        'array' => is_array($value) ? 2 : 0,
        'mixed' => 1,
        'true' => $value === true ? 2 : (is_bool($value) ? 1 : 0),
        'false' => $value === false ? 2 : (is_bool($value) ? 1 : 0),
        'null' => $value === null ? 2 : 0,
        default => 0,
    };
}

/**
 * Cast a value to match the expected type of a reflection parameter.
 */
function castArg(ReflectionParameter $param, mixed $value, ?string $docType = null, ?array $typeMap = null): mixed
{
    if ($value === null && $param->getType()?->allowsNull()) {
        return null;
    }

    $type = $param->getType();

    if ($type === null) {
        return $value;
    }

    if ($type instanceof ReflectionUnionType) {
        $unionTypes = $type->getTypes();

        // Filter to only ReflectionNamedType for scoring (skip intersection types in DNF)
        $namedTypes = array_filter($unionTypes, fn($t) => $t instanceof ReflectionNamedType);
        $otherTypes = array_filter($unionTypes, fn($t) => !($t instanceof ReflectionNamedType));

        // Prefer exact-match types to avoid lossy casts (e.g. float → int truncation).
        // Sort so the best-matching type for the value comes first.
        usort($namedTypes, function (ReflectionNamedType $a, ReflectionNamedType $b) use ($value) {
            return scoreTypeMatch($b, $value) <=> scoreTypeMatch($a, $value);
        });

        // Try named types first (sorted by match score), then any remaining types
        foreach ([...$namedTypes, ...$otherTypes] as $unionType) {
            try {
                if ($unionType instanceof ReflectionNamedType) {
                    return castWithNamedType($unionType, $value, $param, $docType, $typeMap);
                }
                // For intersection types in DNF, return value as-is
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

    // ReflectionIntersectionType or unknown — return as-is
    return $value;
}

/**
 * Cast a value using a specific ReflectionNamedType.
 */
function castWithNamedType(ReflectionNamedType $type, mixed $value, ReflectionParameter $param, ?string $docType = null, ?array $typeMap = null): mixed
{
    if ($value === null && $type->allowsNull()) {
        return null;
    }

    $typeName = $type->getName();

    // Apply typeMap.bindings: resolve interface/abstract → concrete class
    if ($typeMap !== null && isset($typeMap['bindings'][$typeName])) {
        $typeName = $typeMap['bindings'][$typeName];
    }

    switch ($typeName) {
        case 'string':
            return (string) $value;
        case 'int':
            return (int) $value;
        case 'float':
            return (float) $value;
        case 'bool':
            return (bool) $value;
        case 'array':
        case 'iterable':
            $arr = is_array($value) ? $value : (array) $value;
            if ($docType !== null) {
                return castArrayElements($arr, $docType, $param);
            }
            return $arr;
        case 'object':
            return is_object($value) ? $value : (object) $value;
        case 'callable':
            return $value;
        case 'mixed':
            return $value;
        // PHP 8.2 standalone types
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
        case 'never':
            throw new \RuntimeException("Cannot provide a value for 'never' type parameter");
    }

    // Check for enum types (enum_exists() requires PHP 8.1+)
    if (function_exists('enum_exists') && enum_exists($typeName)) {
        if ($value instanceof $typeName) {
            return $value;
        }
        // Try backed enum ::from()
        if (is_subclass_of($typeName, \BackedEnum::class)) {
            try {
                return $typeName::from($value);
            } catch (\Throwable) {
                // fallback: try matching by name for unit-like access
            }
        }
        // Try matching by case name (unit enums)
        foreach ($typeName::cases() as $case) {
            if ($case->name === $value) {
                return $case;
            }
        }
        throw new \RuntimeException("Cannot resolve enum case '{$value}' for {$typeName}");
    }

    // Check for class types — recursive instantiation
    if (class_exists($typeName)) {
        if ($value instanceof $typeName) {
            return $value;
        }
        // Generic collection class: cast inner elements, pass array as first constructor arg
        if ($docType !== null && is_array($value)) {
            $info = extractGenericValueType($docType);
            if ($info !== null && $info['wrapperClass'] !== null) {
                $castedItems = castArrayElements($value, $docType, $param);
                $ref = new ReflectionClass($typeName);
                $constructor = $ref->getConstructor();
                if ($constructor !== null) {
                    return $ref->newInstanceArgs([$castedItems]);
                }
            }
        }
        // Original named-arg matching behavior
        $ref = new ReflectionClass($typeName);
        $constructor = $ref->getConstructor();
        if ($constructor !== null) {
            return $ref->newInstanceArgs(matchArgs($constructor, (array) $value, $typeMap));
        }
        return $ref->newInstance();
    }

    return $value;
}

/**
 * Match arguments from an associative array to the parameter order
 * expected by a ReflectionFunctionAbstract (method or function).
 */
function matchArgs(?ReflectionFunctionAbstract $ref, array $args, ?array $typeMap = null): array
{
    if ($ref === null) {
        return [];
    }

    $docTypes = parseDocBlockParamTypes($ref);

    // Resolve class/method FQN for typeMap.args lookup
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
                $val = $args[$name];
                if (is_array($val)) {
                    foreach ($val as $item) {
                        $ordered[] = $item;
                    }
                } else {
                    $ordered[] = $val;
                }
            }
            continue;
        }

        if (array_key_exists($name, $args)) {
            // Resolve typeMap.args override for this parameter
            $docType = $docTypes[$name] ?? null;
            if ($typeMap !== null && isset($typeMap['args'])) {
                // Try "FQCN::method::$name" first, then "FQCN::$name"
                $override = $typeMap['args']["{$classFqn}::{$methodName}::\${$name}"]
                    ?? $typeMap['args']["{$classFqn}::\${$name}"]
                    ?? null;
                if ($override !== null) {
                    if (is_string($override)) {
                        // String shorthand: use as docType directly
                        $docType = $override;
                    } elseif (is_array($override)) {
                        if (array_key_exists('type', $override) && is_string($override['type'])) {
                            // Explicit type override takes precedence
                            $docType = $override['type'];
                        } elseif (array_key_exists('elementType', $override) && $override['elementType'] !== null) {
                            // Convert elementType into array docType (e.g. "string[]")
                            // so that castArrayElements() can apply element-wise casting
                            $paramType = $param->getType();
                            $isArrayLike = $paramType instanceof \ReflectionNamedType
                                && in_array($paramType->getName(), ['array', 'iterable'], true);
                            $elementType = $override['elementType'];
                            if ($isArrayLike && is_string($elementType) && $elementType !== '') {
                                $docType = $elementType . '[]';
                            } elseif (is_string($elementType)) {
                                $docType = $elementType;
                            }
                        }
                    }
                }
            }
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

/**
 * Resolve the final HTML output from a method result and output buffer.
 */
function resolveOutput(mixed $result, string $buffered): string
{
    if ($result instanceof \Generator) {
        $result = implode('', iterator_to_array($result));
    }

    if (is_object($result) && method_exists($result, '__toString')) {
        $result = (string) $result;
    }

    if (is_array($result) && isset($result['html'])) {
        $result = $result['html'];
    }

    if (is_string($result) && $result !== '') {
        return $buffered !== '' ? $result . $buffered : $result;
    }

    if ($buffered !== '') {
        return $buffered;
    }

    if (is_scalar($result) && $result !== null && $result !== '') {
        return (string) $result;
    }

    return '';
}

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------

try {
    $__sb_input = file_get_contents('php://stdin');
    $__sb_data = json_decode($__sb_input, true, 512, JSON_THROW_ON_ERROR);

    $__sb_type        = $__sb_data['type'] ?? null;
    $__sb_file        = $__sb_data['file'] ?? null;
    $__sb_class       = $__sb_data['class'] ?? null;
    $__sb_callable    = $__sb_data['callable'] ?? null;
    $__sb_args        = $__sb_data['args'] ?? [];
    $__sb_bootstrap   = $__sb_data['bootstrap'] ?? null;
    $__sb_adapterPath = $__sb_data['adapter'] ?? null;
    $__sb_typeMap     = $__sb_data['typeMap'] ?? null;

    // Bootstrap file (autoloader, config, etc.)
    if ($__sb_bootstrap !== null && $__sb_bootstrap !== '') {
        require_once $__sb_bootstrap;
    }

    // Load adapter if specified.
    // Adapter file must return a callable: fn(mixed $result, string $buffered, ?object $instance): string
    $__sb_adapter = null;
    if ($__sb_adapterPath !== null && $__sb_adapterPath !== '') {
        $__sb_adapter = require $__sb_adapterPath;
        if (! is_callable($__sb_adapter)) {
            throw new \RuntimeException("Adapter file must return a callable: {$__sb_adapterPath}");
        }
    }

    // Require the target file
    if ($__sb_type !== 'template') {
        require_once $__sb_file;
    }

    $__sb_html = '';

    switch ($__sb_type) {
        case 'classMethod':
            $__sb_ref = new ReflectionClass($__sb_class);
            $__sb_constructor = $__sb_ref->getConstructor();
            $__sb_instance = $__sb_constructor !== null
                ? $__sb_ref->newInstanceArgs(matchArgs($__sb_constructor, $__sb_args, $__sb_typeMap))
                : $__sb_ref->newInstance();
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_instance, matchArgs($__sb_method, $__sb_args, $__sb_typeMap));
            $__sb_buffered = ob_get_clean();
            $__sb_html = $__sb_adapter ? $__sb_adapter($__sb_result, $__sb_buffered, $__sb_instance) : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'staticMethod':
            $__sb_ref = new ReflectionClass($__sb_class);
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs(null, matchArgs($__sb_method, $__sb_args, $__sb_typeMap));
            $__sb_buffered = ob_get_clean();
            $__sb_html = $__sb_adapter ? $__sb_adapter($__sb_result, $__sb_buffered, null) : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'function':
            $__sb_ref = new ReflectionFunction($__sb_callable);
            ob_start();
            $__sb_result = $__sb_ref->invokeArgs(matchArgs($__sb_ref, $__sb_args, $__sb_typeMap));
            $__sb_buffered = ob_get_clean();
            $__sb_html = $__sb_adapter ? $__sb_adapter($__sb_result, $__sb_buffered, null) : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'template':
            // Use prefixed variable for args to avoid collisions with template variables.
            // extract() with EXTR_SKIP won't overwrite runner's prefixed vars since
            // user templates won't use $__sb_ prefixed names.
            extract($__sb_args, EXTR_SKIP);
            ob_start();
            include $__sb_file;
            $__sb_html = ob_get_clean();
            break;

        case 'enumMethod':
            if (!class_exists('ReflectionEnum')) {
                throw new \RuntimeException("Enum methods require PHP 8.1+. Current PHP: " . PHP_VERSION);
            }
            $__sb_ref = new ReflectionEnum($__sb_class);
            $__sb_caseValue = $__sb_args['_case'] ?? null;
            // Try backed enum ::from(), then fall back to name matching
            try {
                $__sb_enumInstance = $__sb_class::from($__sb_caseValue);
            } catch (\Throwable) {
                // Unit enum — match by name
                $__sb_enumInstance = null;
                foreach ($__sb_class::cases() as $__sb_case) {
                    if ($__sb_case->name === $__sb_caseValue) {
                        $__sb_enumInstance = $__sb_case;
                        break;
                    }
                }
                if ($__sb_enumInstance === null) {
                    throw new \RuntimeException("Cannot resolve enum case '{$__sb_caseValue}' for {$__sb_class}");
                }
            }
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            $__sb_methodArgs = array_diff_key($__sb_args, ['_case' => true]);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_enumInstance, matchArgs($__sb_method, $__sb_methodArgs, $__sb_typeMap));
            $__sb_buffered = ob_get_clean();
            $__sb_html = $__sb_adapter ? $__sb_adapter($__sb_result, $__sb_buffered, $__sb_enumInstance) : resolveOutput($__sb_result, $__sb_buffered);
            break;

        default:
            throw new \RuntimeException("Unknown type: {$__sb_type}");
    }

    echo json_encode(['html' => $__sb_html], JSON_THROW_ON_ERROR);

} catch (\Throwable $e) {
    echo json_encode([
        'html'  => '',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ], JSON_THROW_ON_ERROR);
}
