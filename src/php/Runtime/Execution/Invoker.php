<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Execution;

use LogicException;
use ReflectionClass;
use ReflectionFunction;
use ReflectionFunctionAbstract;
use ReflectionMethod;
use RuntimeException;

/**
 * Dispatches a validated plan to its supported render target.
 *
 * @param array<string, mixed> $__sb_context
 * @return array{html: string, ...}
 * @throws RuntimeException when the execution context cannot be resolved or invoked
 */
function executeCoreContext(array $__sb_context): array
{
    $__sb_context = \StorybookPhp\Runtime\Execution\hydrateExecutionContext($__sb_context);
    $type = $__sb_context['type'];

    return match ($type) {
        'classMethod' => \StorybookPhp\Runtime\Execution\executeClassMethodContext($__sb_context),
        'staticMethod' => \StorybookPhp\Runtime\Execution\executeStaticMethodContext($__sb_context),
        'function' => \StorybookPhp\Runtime\Execution\executeFunctionContext($__sb_context),
        'template' => \StorybookPhp\Runtime\Execution\executeTemplateContext($__sb_context),
        'enumMethod' => \StorybookPhp\Runtime\Execution\executeEnumMethodContext($__sb_context),
    };
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array{html: string, ...}
 */
function executeClassMethodContext(array $context): array
{
    $planner = \StorybookPhp\Runtime\Execution\executionPlanner($context);
    $class = \StorybookPhp\Runtime\Execution\plannerClassReflection($planner);
    $method = \StorybookPhp\Runtime\Execution\plannerMethodReflection($planner);
    $constructor = \StorybookPhp\Runtime\Execution\plannerConstructorReflection($planner);
    $constructorArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'constructorArgs');
    $methodArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'methodArgs');
    $instance = $constructor instanceof ReflectionMethod
        ? $class->newInstanceArgs(\StorybookPhp\Runtime\Execution\orderResolvedArgs($constructor, $constructorArgs))
        : $class->newInstance();
    ob_start();
    $result = $method->invokeArgs($instance, \StorybookPhp\Runtime\Execution\orderResolvedArgs($method, $methodArgs));
    $buffered = \StorybookPhp\Runtime\Transport\getOutputBuffer();

    return \StorybookPhp\Runtime\Execution\buildExecutionResponse(
        \StorybookPhp\Runtime\resolveExecutionHtml($result, $buffered, \StorybookPhp\Runtime\Execution\deferExecutionOutput($context)),
        $result,
        $buffered,
        $instance,
        \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs'),
        [],
        $constructorArgs,
        $methodArgs,
    );
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array{html: string, ...}
 */
function executeStaticMethodContext(array $context): array
{
    $method = \StorybookPhp\Runtime\Execution\plannerMethodReflection(\StorybookPhp\Runtime\Execution\executionPlanner($context));
    $methodArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'methodArgs');
    ob_start();
    $result = $method->invokeArgs(null, \StorybookPhp\Runtime\Execution\orderResolvedArgs($method, $methodArgs));
    $buffered = \StorybookPhp\Runtime\Transport\getOutputBuffer();

    return \StorybookPhp\Runtime\Execution\buildExecutionResponse(
        \StorybookPhp\Runtime\resolveExecutionHtml($result, $buffered, \StorybookPhp\Runtime\Execution\deferExecutionOutput($context)),
        $result,
        $buffered,
        null,
        \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs'),
        [],
        [],
        $methodArgs,
    );
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array{html: string, ...}
 */
function executeFunctionContext(array $context): array
{
    $function = \StorybookPhp\Runtime\Execution\plannerFunctionReflection(\StorybookPhp\Runtime\Execution\executionPlanner($context));
    $methodArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'methodArgs');
    ob_start();
    $result = $function->invokeArgs(\StorybookPhp\Runtime\Execution\orderResolvedArgs($function, $methodArgs));
    $buffered = \StorybookPhp\Runtime\Transport\getOutputBuffer();

    return \StorybookPhp\Runtime\Execution\buildExecutionResponse(
        \StorybookPhp\Runtime\resolveExecutionHtml($result, $buffered, \StorybookPhp\Runtime\Execution\deferExecutionOutput($context)),
        $result,
        $buffered,
        null,
        \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs'),
        [],
        [],
        $methodArgs,
    );
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array{html: string, ...}
 */
function executeTemplateContext(array $context): array
{
    $file = $context['executionFile'];
    $templateArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'templateArgs');
    extract($templateArgs, EXTR_SKIP);
    ob_start();
    include $file;

    return \StorybookPhp\Runtime\Execution\buildExecutionResponse(
        \StorybookPhp\Runtime\Transport\getOutputBuffer(),
        null,
        '',
        null,
        \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs'),
        $templateArgs,
    );
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array{html: string, ...}
 * @throws LogicException when the hydrated enum target is unavailable
 */
function executeEnumMethodContext(array $context): array
{
    $class = $context['class'];
    if ($class === null || $class === '' || !\StorybookPhp\Runtime\Contract\enumTypeExists($class)) {
        throw new LogicException('Enum execution context has no valid enum class.');
    }
    $class = \StorybookPhp\Runtime\Contract\requireExistingClass($class);
    $caseValue = $context['enumCaseValue'] ?? \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs')['_case'] ?? null;
    $instance = \StorybookPhp\Runtime\Contract\resolveEnumCase($class, $caseValue);
    $method = \StorybookPhp\Runtime\Execution\plannerMethodReflection(\StorybookPhp\Runtime\Execution\executionPlanner($context));
    $methodArgs = \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'methodArgs');
    ob_start();
    $result = $method->invokeArgs($instance, \StorybookPhp\Runtime\Execution\orderResolvedArgs($method, $methodArgs));
    $buffered = \StorybookPhp\Runtime\Transport\getOutputBuffer();

    return \StorybookPhp\Runtime\Execution\buildExecutionResponse(
        \StorybookPhp\Runtime\resolveExecutionHtml($result, $buffered, \StorybookPhp\Runtime\Execution\deferExecutionOutput($context)),
        $result,
        $buffered,
        $instance,
        \StorybookPhp\Runtime\Execution\executionContextArgs($context, 'publicArgs'),
        [],
        [],
        $methodArgs,
        $caseValue,
    );
}

/**
 * @param array<string, mixed> $context
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}
 * @throws LogicException when the hydrated context has no valid planner
 */
function executionPlanner(array $context): array
{
    $planner = $context['__planner'] ?? null;
    if (!is_array($planner)) {
        throw new LogicException('Hydrated execution context has no planner.');
    }
    $type = $planner['type'] ?? null;
    if (!is_string($type) || !\StorybookPhp\Runtime\Contract\isRenderType($type)) {
        throw new LogicException('Execution planner has an invalid render type.');
    }
    $constructorArgDefs = \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap($planner['effectiveConstructorArgDefs'] ?? null);
    $callableArgDefs = \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap($planner['effectiveCallableArgDefs'] ?? null);

    return [
        'type' => $type,
        'effectiveConstructorArgDefs' => $constructorArgDefs,
        'effectiveCallableArgDefs' => $callableArgDefs,
    ] + $planner;
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @return ReflectionClass<object>
 * @throws LogicException when the planner has no class reflection
 */
function plannerClassReflection(array $planner): ReflectionClass
{
    $class = $planner['classReflection'] ?? null;
    if (!$class instanceof ReflectionClass) {
        throw new LogicException('Execution planner has no class reflection.');
    }

    return $class;
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @throws LogicException when the planner has no method reflection
 */
function plannerMethodReflection(array $planner): ReflectionMethod
{
    $method = $planner['callableReflection'] ?? null;
    if (!$method instanceof ReflectionMethod) {
        throw new LogicException('Execution planner has no method reflection.');
    }

    return $method;
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @throws LogicException when the planner has no function reflection
 */
function plannerFunctionReflection(array $planner): ReflectionFunction
{
    $function = $planner['callableReflection'] ?? null;
    if (!$function instanceof ReflectionFunction) {
        throw new LogicException('Execution planner has no function reflection.');
    }

    return $function;
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @throws LogicException when the planner has no callable reflection
 */
function plannerCallableReflection(array $planner): ReflectionFunctionAbstract
{
    $callable = $planner['callableReflection'] ?? null;
    if (!$callable instanceof ReflectionFunctionAbstract) {
        throw new LogicException('Execution planner has no callable reflection.');
    }

    return $callable;
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...} $planner
 * @throws LogicException when the planner constructor reflection has an invalid shape
 */
function plannerConstructorReflection(array $planner): ?ReflectionMethod
{
    $constructor = $planner['constructorReflection'] ?? null;
    if ($constructor !== null && !$constructor instanceof ReflectionMethod) {
        throw new LogicException('Execution planner constructor reflection is invalid.');
    }

    return $constructor;
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array<string, mixed>
 */
function executionContextArgs(array $context, string $field): array
{
    $args = $context[$field] ?? [];

    return is_array($args) ? \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($args, $field) : [];
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 */
function deferExecutionOutput(array $context): bool
{
    return ($context['deferOutputResolutionToAdapter'] ?? false) === true;
}
