<?php

declare(strict_types=1);

/**
 * @param StringMap $context
 * @return HydratedExecutionContext
 * @throws RuntimeException when the execution plan or arguments cannot be resolved
 */
function hydrateExecutionContext(array $context): array
{
    $context = normalizeExecutionContext($context);
    $context = ensureExecutionPlanner($context);
    $context = requireHydratedExecutionContext($context);
    $type = $context['type'];
    $mappedArgs = mapPublicArgsToExecutionTargets($context);
    $planner = executionPlanner($context);
    $typeMap = normalizeNamedArgDefMap($context['typeMap'] ?? null);

    return match ($type) {
        'template' => hydrateTemplateExecutionContext($context, $mappedArgs),
        'classMethod' => hydrateClassExecutionContext($context, $mappedArgs, $planner, $typeMap),
        'staticMethod', 'function' => hydrateCallableExecutionContext($context, $mappedArgs, $planner, $typeMap),
        'enumMethod' => hydrateEnumExecutionContext($context, $mappedArgs, $planner, $typeMap),
    };
}

/**
 * @param StringMap $context
 * @return ExecutionContext
 */
function normalizeExecutionContext(array $context): array
{
    $type = $context['type'] ?? null;
    if (!is_string($type)) {
        throw new RuntimeException('Unknown type: ' . get_debug_type($type));
    }
    if (!isRenderType($type)) {
        throw new RuntimeException("Unknown type: {$type}");
    }
    $executionFile = $context['executionFile'] ?? null;
    if (!is_string($executionFile) || $executionFile === '') {
        throw new RuntimeException('Execution context requires an execution file.');
    }
    $class = normalizeExecutionContextString($context, 'class');
    $callable = normalizeExecutionContextString($context, 'callable');
    $publicArgs = normalizeExecutionContextMap($context['publicArgs'] ?? [], 'publicArgs') ?? [];

    return [
        'type' => $type,
        'executionFile' => $executionFile,
        'class' => $class,
        'callable' => $callable,
        'publicArgs' => $publicArgs,
    ] + $context;
}

/** @param StringMap $context */
function normalizeExecutionContextString(array $context, string $field): ?string
{
    $value = $context[$field] ?? null;
    if ($value !== null && !is_string($value)) {
        throw new RuntimeException("Execution context field '{$field}' must be a string or null.");
    }

    return $value;
}

/** @return StringMap|null */
function normalizeExecutionContextMap(mixed $value, string $field): ?array
{
    if ($value === null) {
        return null;
    }
    if (!is_array($value)) {
        throw new RuntimeException("Execution context field '{$field}' must be an object or null.");
    }

    return normalizeStringKeyArray($value, $field);
}

/**
 * @param StringMap $context
 * @return HydratedExecutionContext
 */
function requireHydratedExecutionContext(array $context): array
{
    $normalized = normalizeExecutionContext($context);
    $planner = executionPlanner($context);

    return array_merge($normalized, ['__planner' => $planner]);
}

/**
 * @param HydratedExecutionContext $context
 * @param MappedExecutionArgs $mappedArgs
 * @return HydratedExecutionContext
 */
function hydrateTemplateExecutionContext(array $context, array $mappedArgs): array
{
    $publicArgs = executionContextArgs($context, 'publicArgs');
    $computed = resolveTemplateContextArgs($context, $mappedArgs['template'] ?? $publicArgs);
    $context = applyResolvedExecutionArgs($context, 'templateArgs', '__computedTemplateArgs', $computed);
    unset($context['constructorArgs'], $context['methodArgs'], $context['enumCaseValue']);

    return requireHydratedExecutionContext($context);
}

/**
 * @param HydratedExecutionContext $context
 * @param MappedExecutionArgs $mappedArgs
 * @param ExecutionPlanner $planner
 * @param StringMap|null $typeMap
 * @return HydratedExecutionContext
 */
function hydrateClassExecutionContext(array $context, array $mappedArgs, array $planner, ?array $typeMap): array
{
    $constructorArgs = resolveNamedArgs(
        plannerConstructorReflection($planner),
        $mappedArgs['constructor'] ?? [],
        $typeMap,
        $planner['effectiveConstructorArgDefs'],
    );
    $methodArgs = resolveNamedArgs(
        plannerCallableReflection($planner),
        $mappedArgs['method'] ?? [],
        $typeMap,
        $planner['effectiveCallableArgDefs'],
    );
    $context = applyResolvedExecutionArgs($context, 'constructorArgs', '__computedConstructorArgs', $constructorArgs);
    $context = applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $methodArgs);
    unset($context['templateArgs'], $context['enumCaseValue']);

    return requireHydratedExecutionContext($context);
}

/**
 * @param HydratedExecutionContext $context
 * @param MappedExecutionArgs $mappedArgs
 * @param ExecutionPlanner $planner
 * @param StringMap|null $typeMap
 * @return HydratedExecutionContext
 */
function hydrateCallableExecutionContext(array $context, array $mappedArgs, array $planner, ?array $typeMap): array
{
    $methodArgs = resolveNamedArgs(
        plannerCallableReflection($planner),
        $mappedArgs['method'] ?? [],
        $typeMap,
        $planner['effectiveCallableArgDefs'],
    );
    $context = applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $methodArgs);
    unset($context['templateArgs'], $context['constructorArgs'], $context['enumCaseValue']);

    return requireHydratedExecutionContext($context);
}

/**
 * @param HydratedExecutionContext $context
 * @param MappedExecutionArgs $mappedArgs
 * @param ExecutionPlanner $planner
 * @param StringMap|null $typeMap
 * @return HydratedExecutionContext
 */
function hydrateEnumExecutionContext(array $context, array $mappedArgs, array $planner, ?array $typeMap): array
{
    $methodInput = $mappedArgs['method'] ?? [];
    $publicArgs = executionContextArgs($context, 'publicArgs');
    $caseValue = $methodInput['_case'] ?? $publicArgs['_case'] ?? null;
    $context = applyResolvedExecutionValue($context, 'enumCaseValue', '__computedEnumCaseValue', $caseValue);
    unset($methodInput['_case']);
    $methodArgs = resolveNamedArgs(
        plannerCallableReflection($planner),
        $methodInput,
        $typeMap,
        $planner['effectiveCallableArgDefs'],
    );
    $context = applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $methodArgs);
    unset($context['templateArgs'], $context['constructorArgs']);

    return requireHydratedExecutionContext($context);
}

/**
 * @param StringMap $context
 * @param StringMap $computedArgs
 * @return StringMap
 */
function applyResolvedExecutionArgs(array $context, string $field, string $snapshotField, array $computedArgs): array
{
    $existingArgs = $context[$field] ?? null;
    $previousComputedArgs = $context[$snapshotField] ?? null;

    if (!is_array($existingArgs) || !is_array($previousComputedArgs) || $existingArgs === $previousComputedArgs) {
        $context[$field] = $computedArgs;
        $context[$snapshotField] = $computedArgs;

        return $context;
    }

    $context[$field] = array_merge($computedArgs, $existingArgs);
    $context[$snapshotField] = $computedArgs;

    return $context;
}

/**
 * @param StringMap $context
 * @return StringMap
 */
function applyResolvedExecutionValue(array $context, string $field, string $snapshotField, mixed $computedValue): array
{
    $existingValue = $context[$field] ?? null;
    $previousComputedValue = $context[$snapshotField] ?? null;

    if (!array_key_exists($field, $context) || $existingValue === $previousComputedValue) {
        $context[$field] = $computedValue;
        $context[$snapshotField] = $computedValue;

        return $context;
    }

    $context[$snapshotField] = $computedValue;

    return $context;
}
