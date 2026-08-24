<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Execution;

use ReflectionClass;
use ReflectionException;
use ReflectionFunction;
use RuntimeException;

/**
 * Resolves reflection targets before argument conversion or invocation.
 *
 * @param array<string, mixed> $context
 * @return array<string, mixed>
 * @throws RuntimeException when the requested target cannot be reflected
 */
function ensureExecutionPlanner(array $context): array
{
    if (isset($context['__planner'])) {
        return $context;
    }

    $type = $context['type'] ?? null;
    if (!is_string($type)) {
        throw new RuntimeException('Unknown type: ' . get_debug_type($type));
    }
    if (!\StorybookPhp\Runtime\Contract\isRenderType($type)) {
        throw new RuntimeException("Unknown type: {$type}");
    }

    try {
        $planner = \StorybookPhp\Runtime\Execution\buildExecutionPlanner($type, $context);
    } catch (ReflectionException $exception) {
        throw new RuntimeException(
            "Unable to resolve {$type} target from the runner request.",
            0,
            $exception,
        );
    }

    $context['__planner'] = $planner;

    return $context;
}

/**
 * @param 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod' $type
 * @param array<string, mixed> $context
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 * @throws ReflectionException when the target cannot be reflected
 */
function buildExecutionPlanner(string $type, array $context): array
{
    $publicArgDefs = \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap($context['publicArgDefs'] ?? null);
    $callableArgDefs = \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap($context['callableArgDefs'] ?? null);

    return match ($type) {
        'classMethod' => \StorybookPhp\Runtime\Execution\buildClassMethodPlanner(
            $context,
            $publicArgDefs,
            \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap($context['constructorArgDefs'] ?? null),
            $callableArgDefs,
        ),
        'staticMethod' => \StorybookPhp\Runtime\Execution\buildStaticMethodPlanner($context, $publicArgDefs, $callableArgDefs),
        'function' => \StorybookPhp\Runtime\Execution\buildFunctionPlanner($context, $publicArgDefs, $callableArgDefs),
        'template' => \StorybookPhp\Runtime\Execution\baseExecutionPlanner($type),
        'enumMethod' => \StorybookPhp\Runtime\Execution\buildEnumMethodPlanner($context, $publicArgDefs, $callableArgDefs),
    };
}

/**
 * @param 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod' $type
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 */
function baseExecutionPlanner(string $type): array
{
    return [
        'type' => $type,
        'effectiveConstructorArgDefs' => null,
        'effectiveCallableArgDefs' => null,
    ];
}

/**
 * @param array<string, mixed> $context
 * @param array<string, mixed>|null $publicArgDefs
 * @param array<string, mixed>|null $constructorArgDefs
 * @param array<string, mixed>|null $callableArgDefs
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 * @throws ReflectionException when the class or method cannot be reflected
 */
function buildClassMethodPlanner(
    array $context,
    ?array $publicArgDefs,
    ?array $constructorArgDefs,
    ?array $callableArgDefs,
): array {
    [$class, $callable] = \StorybookPhp\Runtime\Execution\requirePlannerTargetPair($context, 'classMethod requires class and callable.');
    require_once \StorybookPhp\Runtime\Execution\requirePlannerExecutionFile($context, 'classMethod');
    $reflection = \StorybookPhp\Runtime\Execution\reflectPlannerClass($class);
    $planner = \StorybookPhp\Runtime\Execution\baseExecutionPlanner('classMethod');
    $planner['classReflection'] = $reflection;
    $planner['constructorReflection'] = $reflection->getConstructor();
    $planner['callableReflection'] = $reflection->getMethod($callable);
    $planner['effectiveConstructorArgDefs'] = \StorybookPhp\Runtime\Execution\buildTargetArgDefs($constructorArgDefs, $publicArgDefs, 'constructor');
    $planner['effectiveCallableArgDefs'] = \StorybookPhp\Runtime\Execution\buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param array<string, mixed> $context
 * @param array<string, mixed>|null $publicArgDefs
 * @param array<string, mixed>|null $callableArgDefs
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 * @throws ReflectionException when the class or method cannot be reflected
 */
function buildStaticMethodPlanner(array $context, ?array $publicArgDefs, ?array $callableArgDefs): array
{
    [$class, $callable] = \StorybookPhp\Runtime\Execution\requirePlannerTargetPair($context, 'staticMethod requires class and callable.');
    require_once \StorybookPhp\Runtime\Execution\requirePlannerExecutionFile($context, 'staticMethod');
    $reflection = \StorybookPhp\Runtime\Execution\reflectPlannerClass($class);
    $planner = \StorybookPhp\Runtime\Execution\baseExecutionPlanner('staticMethod');
    $planner['classReflection'] = $reflection;
    $planner['callableReflection'] = $reflection->getMethod($callable);
    $planner['effectiveCallableArgDefs'] = \StorybookPhp\Runtime\Execution\buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param array<string, mixed> $context
 * @param array<string, mixed>|null $publicArgDefs
 * @param array<string, mixed>|null $callableArgDefs
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 * @throws ReflectionException when the function cannot be reflected
 * @throws RuntimeException when the function request has no callable or execution file
 */
function buildFunctionPlanner(array $context, ?array $publicArgDefs, ?array $callableArgDefs): array
{
    $callable = $context['callable'] ?? null;
    if (!is_string($callable) || $callable === '') {
        throw new RuntimeException('function render requires callable.');
    }
    require_once \StorybookPhp\Runtime\Execution\requirePlannerExecutionFile($context, 'function render');
    $planner = \StorybookPhp\Runtime\Execution\baseExecutionPlanner('function');
    $planner['callableReflection'] = new ReflectionFunction($callable);
    $planner['effectiveCallableArgDefs'] = \StorybookPhp\Runtime\Execution\buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param array<string, mixed> $context
 * @param array<string, mixed>|null $publicArgDefs
 * @param array<string, mixed>|null $callableArgDefs
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 * @throws ReflectionException when the enum or method cannot be reflected
 * @throws RuntimeException when the enum request has no valid target or execution file
 */
function buildEnumMethodPlanner(array $context, ?array $publicArgDefs, ?array $callableArgDefs): array
{
    [$class, $callable] = \StorybookPhp\Runtime\Execution\requirePlannerTargetPair($context, 'enumMethod requires enum class and callable.');
    require_once \StorybookPhp\Runtime\Execution\requirePlannerExecutionFile($context, 'enumMethod');
    if (!\StorybookPhp\Runtime\Execution\runnerEnumExists($class)) {
        throw new RuntimeException("Enum '{$class}' is not available.");
    }
    $reflection = \StorybookPhp\Runtime\Execution\reflectPlannerClass($class);
    $planner = \StorybookPhp\Runtime\Execution\baseExecutionPlanner('enumMethod');
    $planner['classReflection'] = $reflection;
    $planner['callableReflection'] = $reflection->getMethod($callable);
    $planner['effectiveCallableArgDefs'] = \StorybookPhp\Runtime\Execution\buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param array<string, mixed> $context
 * @return array{string, string}
 * @throws RuntimeException when the request omits either target name
 */
function requirePlannerTargetPair(array $context, string $message): array
{
    $class = $context['class'] ?? null;
    $callable = $context['callable'] ?? null;
    if (!is_string($class) || $class === '' || !is_string($callable) || $callable === '') {
        throw new RuntimeException($message);
    }

    return [$class, $callable];
}

/**
 * @param array<string, mixed> $context
 * @throws RuntimeException when the request omits its execution file
 */
function requirePlannerExecutionFile(array $context, string $renderType): string
{
    $file = $context['executionFile'] ?? null;
    if (!is_string($file) || $file === '') {
        throw new RuntimeException("{$renderType} requires an execution file.");
    }

    return $file;
}

/**
 * @return ReflectionClass<object>
 * @throws ReflectionException when the class does not exist
 */
function reflectPlannerClass(string $class): ReflectionClass
{
    if (!class_exists($class)) {
        throw new ReflectionException("Class '{$class}' does not exist.");
    }

    return new ReflectionClass($class);
}

/**
 * Checks enum availability through a PHP 8.0-compatible boundary.
 */
function runnerEnumExists(string $class): bool
{
    return interface_exists('UnitEnum') && is_subclass_of($class, 'UnitEnum');
}
