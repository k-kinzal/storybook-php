<?php

declare(strict_types=1);

/**
 * @param StringMap $__sb_context
 * @return ExecutionResponse
 * @throws RuntimeException when the execution context cannot be resolved or invoked
 */
function executeCoreContext(array $__sb_context): array
{
    $__sb_context = hydrateExecutionContext($__sb_context);
    $type = $__sb_context['type'];

    return match ($type) {
        'classMethod' => executeClassMethodContext($__sb_context),
        'staticMethod' => executeStaticMethodContext($__sb_context),
        'function' => executeFunctionContext($__sb_context),
        'template' => executeTemplateContext($__sb_context),
        'enumMethod' => executeEnumMethodContext($__sb_context),
    };
}

/**
 * @param HydratedExecutionContext $context
 * @return ExecutionResponse
 */
function executeClassMethodContext(array $context): array
{
    $planner = executionPlanner($context);
    $class = plannerClassReflection($planner);
    $method = plannerMethodReflection($planner);
    $constructor = plannerConstructorReflection($planner);
    $constructorArgs = executionContextArgs($context, 'constructorArgs');
    $methodArgs = executionContextArgs($context, 'methodArgs');
    $instance = $constructor === null
        ? $class->newInstance()
        : $class->newInstanceArgs(orderResolvedArgs($constructor, $constructorArgs));
    ob_start();
    $result = $method->invokeArgs($instance, orderResolvedArgs($method, $methodArgs));
    $buffered = getOutputBuffer();

    return buildExecutionResponse(
        resolveExecutionHtml($result, $buffered, deferExecutionOutput($context)),
        $result,
        $buffered,
        $instance,
        executionContextArgs($context, 'publicArgs'),
        [],
        $constructorArgs,
        $methodArgs,
    );
}

/**
 * @param HydratedExecutionContext $context
 * @return ExecutionResponse
 */
function executeStaticMethodContext(array $context): array
{
    $method = plannerMethodReflection(executionPlanner($context));
    $methodArgs = executionContextArgs($context, 'methodArgs');
    ob_start();
    $result = $method->invokeArgs(null, orderResolvedArgs($method, $methodArgs));
    $buffered = getOutputBuffer();

    return buildExecutionResponse(
        resolveExecutionHtml($result, $buffered, deferExecutionOutput($context)),
        $result,
        $buffered,
        null,
        executionContextArgs($context, 'publicArgs'),
        [],
        [],
        $methodArgs,
    );
}

/**
 * @param HydratedExecutionContext $context
 * @return ExecutionResponse
 */
function executeFunctionContext(array $context): array
{
    $function = plannerFunctionReflection(executionPlanner($context));
    $methodArgs = executionContextArgs($context, 'methodArgs');
    ob_start();
    $result = $function->invokeArgs(orderResolvedArgs($function, $methodArgs));
    $buffered = getOutputBuffer();

    return buildExecutionResponse(
        resolveExecutionHtml($result, $buffered, deferExecutionOutput($context)),
        $result,
        $buffered,
        null,
        executionContextArgs($context, 'publicArgs'),
        [],
        [],
        $methodArgs,
    );
}

/**
 * @param HydratedExecutionContext $context
 * @return ExecutionResponse
 */
function executeTemplateContext(array $context): array
{
    $file = $context['executionFile'];
    $templateArgs = executionContextArgs($context, 'templateArgs');
    extract($templateArgs, EXTR_SKIP);
    ob_start();
    include $file;

    return buildExecutionResponse(
        getOutputBuffer(),
        null,
        '',
        null,
        executionContextArgs($context, 'publicArgs'),
        $templateArgs,
    );
}

/**
 * @param HydratedExecutionContext $context
 * @return ExecutionResponse
 */
function executeEnumMethodContext(array $context): array
{
    $class = $context['class'];
    if ($class === null || $class === '' || !enumTypeExists($class)) {
        throw new LogicException('Enum execution context has no valid enum class.');
    }
    $class = requireExistingClass($class);
    $caseValue = $context['enumCaseValue'] ?? executionContextArgs($context, 'publicArgs')['_case'] ?? null;
    $instance = resolveEnumCase($class, $caseValue);
    $method = plannerMethodReflection(executionPlanner($context));
    $methodArgs = executionContextArgs($context, 'methodArgs');
    ob_start();
    $result = $method->invokeArgs($instance, orderResolvedArgs($method, $methodArgs));
    $buffered = getOutputBuffer();

    return buildExecutionResponse(
        resolveExecutionHtml($result, $buffered, deferExecutionOutput($context)),
        $result,
        $buffered,
        $instance,
        executionContextArgs($context, 'publicArgs'),
        [],
        [],
        $methodArgs,
        $caseValue,
    );
}

/**
 * @param StringMap $context
 * @return ExecutionPlanner
 */
function executionPlanner(array $context): array
{
    $planner = $context['__planner'] ?? null;
    if (!is_array($planner)) {
        throw new LogicException('Hydrated execution context has no planner.');
    }
    $type = $planner['type'] ?? null;
    if (!is_string($type) || !isRenderType($type)) {
        throw new LogicException('Execution planner has an invalid render type.');
    }
    $constructorArgDefs = normalizeNamedArgDefMap($planner['effectiveConstructorArgDefs'] ?? null);
    $callableArgDefs = normalizeNamedArgDefMap($planner['effectiveCallableArgDefs'] ?? null);

    return [
        'type' => $type,
        'effectiveConstructorArgDefs' => $constructorArgDefs,
        'effectiveCallableArgDefs' => $callableArgDefs,
    ] + $planner;
}

/**
 * @param ExecutionPlanner $planner
 * @return ReflectionClass<object>
 */
function plannerClassReflection(array $planner): ReflectionClass
{
    $class = $planner['classReflection'] ?? null;
    if (!$class instanceof ReflectionClass) {
        throw new LogicException('Execution planner has no class reflection.');
    }

    return $class;
}

/** @param ExecutionPlanner $planner */
function plannerMethodReflection(array $planner): ReflectionMethod
{
    $method = $planner['callableReflection'] ?? null;
    if (!$method instanceof ReflectionMethod) {
        throw new LogicException('Execution planner has no method reflection.');
    }

    return $method;
}

/** @param ExecutionPlanner $planner */
function plannerFunctionReflection(array $planner): ReflectionFunction
{
    $function = $planner['callableReflection'] ?? null;
    if (!$function instanceof ReflectionFunction) {
        throw new LogicException('Execution planner has no function reflection.');
    }

    return $function;
}

/** @param ExecutionPlanner $planner */
function plannerCallableReflection(array $planner): ReflectionFunctionAbstract
{
    $callable = $planner['callableReflection'] ?? null;
    if (!$callable instanceof ReflectionFunctionAbstract) {
        throw new LogicException('Execution planner has no callable reflection.');
    }

    return $callable;
}

/** @param ExecutionPlanner $planner */
function plannerConstructorReflection(array $planner): ?ReflectionMethod
{
    $constructor = $planner['constructorReflection'] ?? null;
    if ($constructor !== null && !$constructor instanceof ReflectionMethod) {
        throw new LogicException('Execution planner constructor reflection is invalid.');
    }

    return $constructor;
}

/**
 * @param HydratedExecutionContext $context
 * @return StringMap
 */
function executionContextArgs(array $context, string $field): array
{
    $args = $context[$field] ?? [];

    return is_array($args) ? normalizeStringKeyArray($args, $field) : [];
}

/** @param HydratedExecutionContext $context */
function deferExecutionOutput(array $context): bool
{
    return ($context['deferOutputResolutionToAdapter'] ?? false) === true;
}
