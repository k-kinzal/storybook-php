<?php

declare(strict_types=1);

/** Render types supported by the PHP runner. */
const RENDER_TYPES = ['classMethod', 'staticMethod', 'function', 'template', 'enumMethod'];

function isRenderType(string $type): bool
{
    return in_array($type, RENDER_TYPES, true);
}

function typeExists(string $name): bool
{
    return class_exists($name)
        || interface_exists($name)
        || (function_exists('enum_exists') && enum_exists($name));
}

/**
 * @param array<string, mixed>|null $typeMap
 */
function resolveTypeMapBinding(string $typeName, ?array $typeMap): string
{
    if ($typeMap === null) {
        return $typeName;
    }

    $bindings = $typeMap['bindings'] ?? null;
    if (!is_array($bindings)) {
        return $typeName;
    }

    $binding = $bindings[$typeName] ?? null;
    return is_string($binding) ? $binding : $typeName;
}

/**
 * @param class-string $enumClass
 */
function isBackedEnumClass(string $enumClass): bool
{
    return interface_exists('BackedEnum') && is_subclass_of($enumClass, 'BackedEnum');
}

/**
 * @param class-string $enumClass
 */
function resolveEnumCase(string $enumClass, mixed $value): object
{
    if (!function_exists('enum_exists') || !enum_exists($enumClass)) {
        throw new \RuntimeException("Enum '{$enumClass}' is not available.");
    }

    if ($value instanceof $enumClass) {
        return $value;
    }

    if (isBackedEnumClass($enumClass) && method_exists($enumClass, 'from')) {
        try {
            /** @var callable(mixed): object $from */
            $from = [$enumClass, 'from'];
            return $from($value);
        } catch (\Throwable) {
            // Fall through to name matching.
        }
    }

    /** @var callable(): array<int, object> $cases */
    $cases = [$enumClass, 'cases'];
    foreach ($cases() as $case) {
        if (property_exists($case, 'name') && is_string($case->name) && $case->name === $value) {
            return $case;
        }
    }

    throw new \RuntimeException(
        "Cannot resolve enum case '" . stringifyScalarForError($value) . "' for {$enumClass}",
    );
}

/**
 * Resolve a short class name to a FQN using the declaring namespace.
 */
function resolveClassName(string $className, ReflectionParameter $param): ?string
{
    $candidate = ltrim($className, '\\');

    if (typeExists($candidate)) {
        return $candidate;
    }

    $declaringFunc = $param->getDeclaringFunction();
    $namespace = null;
    if ($declaringFunc instanceof ReflectionMethod) {
        $namespace = $declaringFunc->getDeclaringClass()->getNamespaceName();
    } elseif (method_exists($declaringFunc, 'getNamespaceName')) {
        $namespace = $declaringFunc->getNamespaceName();
    }

    if ($namespace !== null && $namespace !== '') {
        $fqn = $namespace . '\\' . $candidate;
        if (typeExists($fqn)) {
            return $fqn;
        }
    }

    return null;
}
