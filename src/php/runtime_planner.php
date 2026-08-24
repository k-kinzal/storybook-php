<?php

declare(strict_types=1);

/**
 * @param StringMap $context
 * @return StringMap
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
    if (!isRenderType($type)) {
        throw new RuntimeException("Unknown type: {$type}");
    }

    try {
        $planner = buildExecutionPlanner($type, $context);
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
 * @param RenderType $type
 * @param StringMap $context
 * @return ExecutionPlanner
 * @throws ReflectionException when the target cannot be reflected
 */
function buildExecutionPlanner(string $type, array $context): array
{
    $publicArgDefs = normalizeNamedArgDefMap($context['publicArgDefs'] ?? null);
    $callableArgDefs = normalizeNamedArgDefMap($context['callableArgDefs'] ?? null);

    return match ($type) {
        'classMethod' => buildClassMethodPlanner(
            $context,
            $publicArgDefs,
            normalizeNamedArgDefMap($context['constructorArgDefs'] ?? null),
            $callableArgDefs,
        ),
        'staticMethod' => buildStaticMethodPlanner($context, $publicArgDefs, $callableArgDefs),
        'function' => buildFunctionPlanner($context, $publicArgDefs, $callableArgDefs),
        'template' => baseExecutionPlanner($type),
        'enumMethod' => buildEnumMethodPlanner($context, $publicArgDefs, $callableArgDefs),
    };
}

/**
 * @param RenderType $type
 * @return ExecutionPlanner
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
 * @param StringMap $context
 * @param StringMap|null $publicArgDefs
 * @param StringMap|null $constructorArgDefs
 * @param StringMap|null $callableArgDefs
 * @return ExecutionPlanner
 * @throws ReflectionException when the class or method cannot be reflected
 */
function buildClassMethodPlanner(
    array $context,
    ?array $publicArgDefs,
    ?array $constructorArgDefs,
    ?array $callableArgDefs,
): array {
    [$class, $callable] = requirePlannerTargetPair($context, 'classMethod requires class and callable.');
    require_once requirePlannerExecutionFile($context, 'classMethod');
    $reflection = reflectPlannerClass($class);
    $planner = baseExecutionPlanner('classMethod');
    $planner['classReflection'] = $reflection;
    $planner['constructorReflection'] = $reflection->getConstructor();
    $planner['callableReflection'] = $reflection->getMethod($callable);
    $planner['effectiveConstructorArgDefs'] = buildTargetArgDefs($constructorArgDefs, $publicArgDefs, 'constructor');
    $planner['effectiveCallableArgDefs'] = buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param StringMap $context
 * @param StringMap|null $publicArgDefs
 * @param StringMap|null $callableArgDefs
 * @return ExecutionPlanner
 * @throws ReflectionException when the class or method cannot be reflected
 */
function buildStaticMethodPlanner(array $context, ?array $publicArgDefs, ?array $callableArgDefs): array
{
    [$class, $callable] = requirePlannerTargetPair($context, 'staticMethod requires class and callable.');
    require_once requirePlannerExecutionFile($context, 'staticMethod');
    $reflection = reflectPlannerClass($class);
    $planner = baseExecutionPlanner('staticMethod');
    $planner['classReflection'] = $reflection;
    $planner['callableReflection'] = $reflection->getMethod($callable);
    $planner['effectiveCallableArgDefs'] = buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param StringMap $context
 * @param StringMap|null $publicArgDefs
 * @param StringMap|null $callableArgDefs
 * @return ExecutionPlanner
 * @throws ReflectionException when the function cannot be reflected
 */
function buildFunctionPlanner(array $context, ?array $publicArgDefs, ?array $callableArgDefs): array
{
    $callable = $context['callable'] ?? null;
    if (!is_string($callable) || $callable === '') {
        throw new RuntimeException('function render requires callable.');
    }
    require_once requirePlannerExecutionFile($context, 'function render');
    $planner = baseExecutionPlanner('function');
    $planner['callableReflection'] = new ReflectionFunction($callable);
    $planner['effectiveCallableArgDefs'] = buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param StringMap $context
 * @param StringMap|null $publicArgDefs
 * @param StringMap|null $callableArgDefs
 * @return ExecutionPlanner
 * @throws ReflectionException when the enum or method cannot be reflected
 */
function buildEnumMethodPlanner(array $context, ?array $publicArgDefs, ?array $callableArgDefs): array
{
    [$class, $callable] = requirePlannerTargetPair($context, 'enumMethod requires enum class and callable.');
    require_once requirePlannerExecutionFile($context, 'enumMethod');
    if (!runnerEnumExists($class)) {
        throw new RuntimeException("Enum '{$class}' is not available.");
    }
    $reflection = reflectPlannerClass($class);
    $planner = baseExecutionPlanner('enumMethod');
    $planner['classReflection'] = $reflection;
    $planner['callableReflection'] = $reflection->getMethod($callable);
    $planner['effectiveCallableArgDefs'] = buildTargetArgDefs($callableArgDefs, $publicArgDefs, 'method');

    return $planner;
}

/**
 * @param StringMap $context
 * @return array{string, string}
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

/** @param StringMap $context */
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

/** Checks enum availability through a PHP 8.0-compatible boundary. */
function runnerEnumExists(string $class): bool
{
    return interface_exists('UnitEnum') && is_subclass_of($class, 'UnitEnum');
}
