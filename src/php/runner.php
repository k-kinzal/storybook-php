<?php

declare(strict_types=1);

/**
 * PHP execution runner for storybook-php.
 *
 * Reads a JSON request from stdin, executes the described PHP callable,
 * and writes a JSON response to stdout.
 */

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
        default => 0,
    };
}

/**
 * Cast a value to match the expected type of a reflection parameter.
 */
function castArg(ReflectionParameter $param, mixed $value): mixed
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

        // Prefer exact-match types to avoid lossy casts (e.g. float → int truncation).
        // Sort so the best-matching type for the value comes first.
        usort($unionTypes, function (ReflectionNamedType $a, ReflectionNamedType $b) use ($value) {
            return scoreTypeMatch($b, $value) <=> scoreTypeMatch($a, $value);
        });

        foreach ($unionTypes as $unionType) {
            try {
                return castWithNamedType($unionType, $value, $param);
            } catch (\Throwable) {
                // try next
            }
        }
        return $value;
    }

    if ($type instanceof ReflectionNamedType) {
        return castWithNamedType($type, $value, $param);
    }

    // ReflectionIntersectionType or unknown — return as-is
    return $value;
}

/**
 * Cast a value using a specific ReflectionNamedType.
 */
function castWithNamedType(ReflectionNamedType $type, mixed $value, ReflectionParameter $param): mixed
{
    if ($value === null && $type->allowsNull()) {
        return null;
    }

    $typeName = $type->getName();

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
            return is_array($value) ? $value : (array) $value;
        case 'mixed':
            return $value;
    }

    // Check for enum types
    if (enum_exists($typeName)) {
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
        $ref = new ReflectionClass($typeName);
        $constructor = $ref->getConstructor();
        if ($constructor !== null) {
            return $ref->newInstanceArgs(matchArgs($constructor, (array) $value));
        }
        return $ref->newInstance();
    }

    return $value;
}

/**
 * Match arguments from an associative array to the parameter order
 * expected by a ReflectionFunctionAbstract (method or function).
 */
function matchArgs(?ReflectionFunctionAbstract $ref, array $args): array
{
    if ($ref === null) {
        return [];
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
            $ordered[] = castArg($param, $args[$name]);
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
    $input = file_get_contents('php://stdin');
    $data = json_decode($input, true, 512, JSON_THROW_ON_ERROR);

    $type        = $data['type'] ?? null;
    $file        = $data['file'] ?? null;
    $class       = $data['class'] ?? null;
    $callable    = $data['callable'] ?? null;
    $args        = $data['args'] ?? [];
    $bootstrap   = $data['bootstrap'] ?? null;
    $adapterPath = $data['adapter'] ?? null;

    // Bootstrap file (autoloader, config, etc.)
    if ($bootstrap !== null && $bootstrap !== '') {
        require_once $bootstrap;
    }

    // Load adapter if specified.
    // Adapter file must return a callable: fn(mixed $result, string $buffered, ?object $instance): string
    $adapter = null;
    if ($adapterPath !== null && $adapterPath !== '') {
        $adapter = require $adapterPath;
        if (! is_callable($adapter)) {
            throw new \RuntimeException("Adapter file must return a callable: {$adapterPath}");
        }
    }

    // Require the target file
    if ($type !== 'template') {
        require_once $file;
    }

    $html = '';

    switch ($type) {
        case 'classMethod':
            $ref = new ReflectionClass($class);
            $constructor = $ref->getConstructor();
            $instance = $constructor !== null
                ? $ref->newInstanceArgs(matchArgs($constructor, $args))
                : $ref->newInstance();
            $method = $ref->getMethod($callable);
            ob_start();
            $result = $method->invokeArgs($instance, matchArgs($method, $args));
            $buffered = ob_get_clean();
            $html = $adapter ? $adapter($result, $buffered, $instance) : resolveOutput($result, $buffered);
            break;

        case 'staticMethod':
            $ref = new ReflectionClass($class);
            $method = $ref->getMethod($callable);
            ob_start();
            $result = $method->invokeArgs(null, matchArgs($method, $args));
            $buffered = ob_get_clean();
            $html = $adapter ? $adapter($result, $buffered, null) : resolveOutput($result, $buffered);
            break;

        case 'function':
            $ref = new ReflectionFunction($callable);
            ob_start();
            $result = $ref->invokeArgs(matchArgs($ref, $args));
            $buffered = ob_get_clean();
            $html = $adapter ? $adapter($result, $buffered, null) : resolveOutput($result, $buffered);
            break;

        case 'template':
            extract($args, EXTR_SKIP);
            ob_start();
            include $file;
            $html = ob_get_clean();
            break;

        case 'enumMethod':
            $ref = new ReflectionEnum($class);
            $caseValue = $args['_case'] ?? null;
            // Try backed enum ::from(), then fall back to name matching
            try {
                $enumInstance = $class::from($caseValue);
            } catch (\Throwable) {
                // Unit enum — match by name
                $enumInstance = null;
                foreach ($class::cases() as $case) {
                    if ($case->name === $caseValue) {
                        $enumInstance = $case;
                        break;
                    }
                }
                if ($enumInstance === null) {
                    throw new \RuntimeException("Cannot resolve enum case '{$caseValue}' for {$class}");
                }
            }
            $method = $ref->getMethod($callable);
            $methodArgs = array_diff_key($args, ['_case' => true]);
            ob_start();
            $result = $method->invokeArgs($enumInstance, matchArgs($method, $methodArgs));
            $buffered = ob_get_clean();
            $html = $adapter ? $adapter($result, $buffered, $enumInstance) : resolveOutput($result, $buffered);
            break;

        default:
            throw new \RuntimeException("Unknown type: {$type}");
    }

    echo json_encode(['html' => $html], JSON_THROW_ON_ERROR);

} catch (\Throwable $e) {
    echo json_encode([
        'html'  => '',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ], JSON_THROW_ON_ERROR);
}
