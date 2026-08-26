<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

use ReflectionClass;
use ReflectionMethod;
use ReflectionParameter;
use RuntimeException;

/**
 * Render types supported by the PHP runner.
 */
const RENDER_TYPES = ['classMethod', 'staticMethod', 'function', 'template', 'enumMethod'];

/**
 * Narrows an arbitrary request string to a supported render type.
 *
 * @phpstan-assert-if-true 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod' $type
 */
function isRenderType(string $type): bool
{
    return in_array($type, RENDER_TYPES, true);
}

/**
 * Reports whether a class, interface, or enum declaration is available.
 */
function typeExists(string $name): bool
{
    return class_exists($name)
        || interface_exists($name)
        || \StorybookPhp\Runtime\Contract\enumTypeExists($name);
}

/**
 * Tests enum availability without directly calling a PHP 8.1 function on PHP 8.0.
 */
function enumTypeExists(string $name): bool
{
    $enumExists = 'enum_exists';

    return function_exists($enumExists) && $enumExists($name);
}

/**
 * @return class-string
 * @throws RuntimeException when the class is unavailable
 */
function requireExistingClass(string $name): string
{
    if (!class_exists($name)) {
        throw new RuntimeException("Class '{$name}' is not available.");
    }

    return $name;
}

/**
 * @param array<string, mixed>|null $typeMap
 *
 * @example Resolving a configured runtime binding
 *     \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('RendererContract', [
 *         'bindings' => ['RendererContract' => 'BladeRenderer'],
 *     ]) // => 'BladeRenderer'
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
 * @throws RuntimeException when the class is unavailable or no case matches
 */
function resolveEnumCase(string $enumClass, mixed $value): object
{
    if (!\StorybookPhp\Runtime\Contract\enumTypeExists($enumClass)) {
        throw new RuntimeException("Enum '{$enumClass}' is not available.");
    }

    if ($value instanceof $enumClass) {
        return $value;
    }

    $case = \StorybookPhp\Runtime\Contract\findEnumCase($enumClass, $value);
    if ($case !== null) {
        return $case;
    }

    throw new RuntimeException(
        "Cannot resolve enum case '" . \StorybookPhp\Runtime\Transport\stringifyScalarForError($value) . "' for {$enumClass}",
    );
}

/**
 * Finds an enum case without using exceptions for an ordinary failed match.
 *
 * @param class-string $enumClass
 */
function findEnumCase(string $enumClass, mixed $value): ?object
{
    /**
     * @var callable(): array<int, object> $cases
     */
    $cases = [$enumClass, 'cases'];
    foreach ($cases() as $case) {
        if (\StorybookPhp\Runtime\Contract\isBackedEnumClass($enumClass) && property_exists($case, 'value') && $case->value === $value) {
            return $case;
        }

        if (property_exists($case, 'name') && is_string($case->name) && $case->name === $value) {
            return $case;
        }
    }

    return null;
}

/**
 * Resolve a short class name to a FQN using the declaring namespace.
 */
function resolveClassName(string $className, ReflectionParameter $param): ?string
{
    $candidate = ltrim($className, '\\');

    if (\StorybookPhp\Runtime\Contract\typeExists($candidate)) {
        return $candidate;
    }

    $declaringFunc = $param->getDeclaringFunction();
    $namespace = null;
    if ($declaringFunc instanceof ReflectionMethod) {
        $declaringClass = $declaringFunc->getDeclaringClass();
        if ($candidate === 'self' || $candidate === 'static') {
            return $declaringClass->getName();
        }
        if ($candidate === 'parent') {
            $parentClass = $declaringClass->getParentClass();
            return $parentClass instanceof ReflectionClass ? $parentClass->getName() : null;
        }
        $namespace = $declaringClass->getNamespaceName();
    } elseif (method_exists($declaringFunc, 'getNamespaceName')) {
        $namespace = $declaringFunc->getNamespaceName();
    }

    if ($namespace !== null && $namespace !== '') {
        $fqn = $namespace . '\\' . $candidate;
        if (\StorybookPhp\Runtime\Contract\typeExists($fqn)) {
            return $fqn;
        }
    }

    return null;
}
