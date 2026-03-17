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
                    return castWithNamedType($unionType, $value, $param);
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
    $__sb_input = file_get_contents('php://stdin');
    $__sb_data = json_decode($__sb_input, true, 512, JSON_THROW_ON_ERROR);

    $__sb_type        = $__sb_data['type'] ?? null;
    $__sb_file        = $__sb_data['file'] ?? null;
    $__sb_class       = $__sb_data['class'] ?? null;
    $__sb_callable    = $__sb_data['callable'] ?? null;
    $__sb_args        = $__sb_data['args'] ?? [];
    $__sb_bootstrap   = $__sb_data['bootstrap'] ?? null;
    $__sb_adapterPath = $__sb_data['adapter'] ?? null;

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
                ? $__sb_ref->newInstanceArgs(matchArgs($__sb_constructor, $__sb_args))
                : $__sb_ref->newInstance();
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_instance, matchArgs($__sb_method, $__sb_args));
            $__sb_buffered = ob_get_clean();
            $__sb_html = $__sb_adapter ? $__sb_adapter($__sb_result, $__sb_buffered, $__sb_instance) : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'staticMethod':
            $__sb_ref = new ReflectionClass($__sb_class);
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs(null, matchArgs($__sb_method, $__sb_args));
            $__sb_buffered = ob_get_clean();
            $__sb_html = $__sb_adapter ? $__sb_adapter($__sb_result, $__sb_buffered, null) : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'function':
            $__sb_ref = new ReflectionFunction($__sb_callable);
            ob_start();
            $__sb_result = $__sb_ref->invokeArgs(matchArgs($__sb_ref, $__sb_args));
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
            $__sb_result = $__sb_method->invokeArgs($__sb_enumInstance, matchArgs($__sb_method, $__sb_methodArgs));
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
