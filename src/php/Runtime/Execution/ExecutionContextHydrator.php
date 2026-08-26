<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Execution;

use ReflectionException;
use RuntimeException;

/**
 * Hydrates a validated execution context from a deterministic plan.
 *
 * @param array<string, mixed> $context
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}
 * @throws ReflectionException when reflection cannot expose a parameter default
 * @throws RuntimeException when the execution plan or arguments cannot be resolved
 */
function hydrateExecutionContext(array $context): array
{
    $context = \StorybookPhp\Runtime\Execution\normalizeExecutionContext($context);
    $context = \StorybookPhp\Runtime\Execution\ensureExecutionPlanner($context);
    $context = \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext($context);
    $type = $context['type'];
    $mappedArgs = \StorybookPhp\Runtime\Execution\mapPublicArgsToExecutionTargets($context);
    $planner = \StorybookPhp\Runtime\Execution\executionPlanner($context);
    $typeMap = \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap($context['typeMap'] ?? null);

    return match ($type) {
        'template' => \StorybookPhp\Runtime\Execution\hydrateTemplateExecutionContext($context, $mappedArgs),
        'classMethod' => \StorybookPhp\Runtime\Execution\hydrateClassExecutionContext($context, $mappedArgs, $planner, $typeMap),
        'staticMethod', 'function' => \StorybookPhp\Runtime\Execution\hydrateCallableExecutionContext($context, $mappedArgs, $planner, $typeMap),
        'enumMethod' => \StorybookPhp\Runtime\Execution\hydrateEnumExecutionContext($context, $mappedArgs, $planner, $typeMap),
    };
}

/**
 * @param array<string, mixed> $context
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, ...}
 * @throws RuntimeException when a required context field has an invalid shape
 */
function normalizeExecutionContext(array $context): array
{
    $type = $context['type'] ?? null;
    if (!is_string($type)) {
        throw new RuntimeException('Unknown type: ' . get_debug_type($type));
    }
    if (!\StorybookPhp\Runtime\Contract\isRenderType($type)) {
        throw new RuntimeException("Unknown type: {$type}");
    }
    $executionFile = $context['executionFile'] ?? null;
    if (!is_string($executionFile) || $executionFile === '') {
        throw new RuntimeException('Execution context requires an execution file.');
    }
    $class = \StorybookPhp\Runtime\Execution\normalizeExecutionContextString($context, 'class');
    $callable = \StorybookPhp\Runtime\Execution\normalizeExecutionContextString($context, 'callable');
    $publicArgs = \StorybookPhp\Runtime\Execution\normalizeExecutionContextMap($context['publicArgs'] ?? [], 'publicArgs') ?? [];

    return [
        'type' => $type,
        'executionFile' => $executionFile,
        'class' => $class,
        'callable' => $callable,
        'publicArgs' => $publicArgs,
    ] + $context;
}

/**
 * @param array<string, mixed> $context
 * @throws RuntimeException when the selected field is neither a string nor null
 */
function normalizeExecutionContextString(array $context, string $field): ?string
{
    $value = $context[$field] ?? null;
    if ($value !== null && !is_string($value)) {
        throw new RuntimeException("Execution context field '{$field}' must be a string or null.");
    }

    return $value;
}

/**
 * @return array<string, mixed>|null
 * @throws RuntimeException when the selected field is neither an object nor null
 */
function normalizeExecutionContextMap(mixed $value, string $field): ?array
{
    if ($value === null) {
        return null;
    }
    if (!is_array($value)) {
        throw new RuntimeException("Execution context field '{$field}' must be an object or null.");
    }

    return \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($value, $field);
}

/**
 * @param array<string, mixed> $context
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}
 */
function requireHydratedExecutionContext(array $context): array
{
    $normalized = \StorybookPhp\Runtime\Execution\normalizeExecutionContext($context);
    $planner = \StorybookPhp\Runtime\Execution\executionPlanner($context);

    return array_merge($normalized, ['__planner' => $planner]);
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @param array{template?: array<string, mixed>, constructor?: array<string, mixed>, method?: array<string, mixed>} $mappedArgs
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function hydrateTemplateExecutionContext(array $context, array $mappedArgs): array
{
    $publicArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs');
    $computed = \StorybookPhp\Runtime\Execution\resolveTemplateContextArgs($context, $mappedArgs['template'] ?? $publicArgs);
    $context = \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs($context, 'templateArgs', '__computedTemplateArgs', $computed);
    unset($context['constructorArgs'], $context['methodArgs'], $context['enumCaseValue']);

    return \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext($context);
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @param array{template?: array<string, mixed>, constructor?: array<string, mixed>, method?: array<string, mixed>} $mappedArgs
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @param array<string, mixed>|null $typeMap
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function hydrateClassExecutionContext(array $context, array $mappedArgs, array $planner, ?array $typeMap): array
{
    $constructorArgs = \StorybookPhp\Runtime\Execution\resolveNamedArgs(
        \StorybookPhp\Runtime\Execution\plannerConstructorReflection($planner),
        $mappedArgs['constructor'] ?? [],
        $typeMap,
        $planner['effectiveConstructorArgDefs'],
    );
    $methodArgs = \StorybookPhp\Runtime\Execution\resolveNamedArgs(
        \StorybookPhp\Runtime\Execution\plannerCallableReflection($planner),
        $mappedArgs['method'] ?? [],
        $typeMap,
        $planner['effectiveCallableArgDefs'],
    );
    $context = \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs($context, 'constructorArgs', '__computedConstructorArgs', $constructorArgs);
    $context = \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $methodArgs);
    unset($context['templateArgs'], $context['enumCaseValue']);

    return \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext($context);
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @param array{template?: array<string, mixed>, constructor?: array<string, mixed>, method?: array<string, mixed>} $mappedArgs
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @param array<string, mixed>|null $typeMap
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function hydrateCallableExecutionContext(array $context, array $mappedArgs, array $planner, ?array $typeMap): array
{
    $methodArgs = \StorybookPhp\Runtime\Execution\resolveNamedArgs(
        \StorybookPhp\Runtime\Execution\plannerCallableReflection($planner),
        $mappedArgs['method'] ?? [],
        $typeMap,
        $planner['effectiveCallableArgDefs'],
    );
    $context = \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $methodArgs);
    unset($context['templateArgs'], $context['constructorArgs'], $context['enumCaseValue']);

    return \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext($context);
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @param array{template?: array<string, mixed>, constructor?: array<string, mixed>, method?: array<string, mixed>} $mappedArgs
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @param array<string, mixed>|null $typeMap
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...}
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function hydrateEnumExecutionContext(array $context, array $mappedArgs, array $planner, ?array $typeMap): array
{
    $methodInput = $mappedArgs['method'] ?? [];
    $publicArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs');
    $caseValue = $methodInput['_case'] ?? $publicArgs['_case'] ?? null;
    $context = \StorybookPhp\Runtime\Execution\applyResolvedExecutionValue($context, 'enumCaseValue', '__computedEnumCaseValue', $caseValue);
    unset($methodInput['_case']);
    $methodArgs = \StorybookPhp\Runtime\Execution\resolveNamedArgs(
        \StorybookPhp\Runtime\Execution\plannerCallableReflection($planner),
        $methodInput,
        $typeMap,
        $planner['effectiveCallableArgDefs'],
    );
    $context = \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $methodArgs);
    unset($context['templateArgs'], $context['constructorArgs']);

    return \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext($context);
}

/**
 * @param array<string, mixed> $context
 * @param array<string, mixed> $computedArgs
 * @return array<string, mixed>
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
 * @param array<string, mixed> $context
 * @return array<string, mixed>
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
