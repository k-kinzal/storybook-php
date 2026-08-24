<?php

declare(strict_types=1);

/**
 * @param array{
 *   type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod',
 *   file: string,
 *   sourceFile?: string|null,
 *   class?: string|null,
 *   callable?: string|null,
 *   args: array<string, mixed>,
 *   publicArgDefs?: array<string, mixed>|null,
 *   constructorArgDefs?: array<string, mixed>|null,
 *   callableArgDefs?: array<string, mixed>|null,
 *   bootstrap?: string|null,
 *   adapters?: list<string>|null,
 *   typeMap?: array<string, mixed>|null
 * } $__sb_request
 * @return array{html: string}
 * @throws RuntimeException when the request cannot be resolved or executed
 */
function executeRunnerRequest(array $__sb_request): array
{
    $__sb_type = $__sb_request['type'];
    $__sb_file = $__sb_request['file'];
    $__sb_sourceFile = $__sb_request['sourceFile'] ?? $__sb_file;
    $__sb_class = $__sb_request['class'] ?? null;
    $__sb_callable = $__sb_request['callable'] ?? null;
    $__sb_storyArgs = $__sb_request['args'];
    $__sb_publicArgDefs = $__sb_request['publicArgDefs'] ?? null;
    $__sb_constructorArgDefs = $__sb_request['constructorArgDefs'] ?? null;
    $__sb_callableArgDefs = $__sb_request['callableArgDefs'] ?? null;
    $__sb_bootstrap = $__sb_request['bootstrap'] ?? null;
    $__sb_adapterPaths = $__sb_request['adapters'] ?? null;
    $__sb_typeMap = $__sb_request['typeMap'] ?? null;

    if ($__sb_bootstrap !== null && $__sb_bootstrap !== '') {
        require_once $__sb_bootstrap;
    }

    $__sb_adapters = loadAdapters($__sb_adapterPaths);
    $__sb_context = [
        'type' => $__sb_type,
        'file' => $__sb_sourceFile,
        'executionFile' => $__sb_file,
        'class' => $__sb_class,
        'callable' => $__sb_callable,
        'publicArgs' => $__sb_storyArgs,
        'publicArgDefs' => $__sb_publicArgDefs,
        'constructorArgDefs' => $__sb_constructorArgDefs,
        'callableArgDefs' => $__sb_callableArgDefs,
        'deferOutputResolutionToAdapter' => $__sb_adapters !== [],
        'typeMap' => $__sb_typeMap,
    ];

    $__sb_response = runAdapterMiddleware(
        $__sb_adapters,
        $__sb_context,
        /**
         * @param array<string, mixed> $adapterContext
         */
        static function (array $adapterContext): array {
            /** @var array{
             *   type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod',
             *   file: string,
             *   executionFile: string,
             *   class: string|null,
             *   callable: string|null,
             *   publicArgs: array<string, mixed>,
             *   publicArgDefs?: array<string, mixed>|null,
             *   constructorArgDefs?: array<string, mixed>|null,
             *   callableArgDefs?: array<string, mixed>|null,
             *   templateArgs?: array<string, mixed>,
             *   constructorArgs?: array<string, mixed>,
             *   methodArgs?: array<string, mixed>,
             *   enumCaseValue?: mixed,
             *   deferOutputResolutionToAdapter?: bool,
             *   __planner?: array<string, mixed>,
             *   typeMap?: array<string, mixed>|null
             * } $adapterContext
             */
            return executeCoreContext($adapterContext);
        }
    );

    return ['html' => $__sb_response['html']];
}

/**
 * @param array<string, mixed> $__sb_context
 * @return array{
 *   html: string,
 *   result?: mixed,
 *   buffered?: string,
 *   instance?: object|null,
 *   publicArgs?: array<string, mixed>,
 *   templateArgs?: array<string, mixed>,
 *   constructorArgs?: array<string, mixed>,
 *   methodArgs?: array<string, mixed>,
 *   enumCaseValue?: mixed
 * }
 * @throws RuntimeException when the execution context cannot be resolved or invoked
 */
function executeCoreContext(array $__sb_context): array
{
    $__sb_context = hydrateExecutionContext($__sb_context);
    /** @var array{
     *   type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod',
     *   file?: string,
     *   executionFile: string,
     *   class: string|null,
     *   callable: string|null,
     *   publicArgs: array<string, mixed>,
     *   publicArgDefs?: array<string, mixed>|null,
     *   constructorArgDefs?: array<string, mixed>|null,
     *   callableArgDefs?: array<string, mixed>|null,
     *   templateArgs?: array<string, mixed>,
     *   constructorArgs?: array<string, mixed>,
     *   methodArgs?: array<string, mixed>,
     *   enumCaseValue?: mixed,
     *   deferOutputResolutionToAdapter?: bool,
     *   __planner: array{
     *     classReflection?: ReflectionClass<object>,
     *     constructorReflection?: ReflectionMethod|null,
     *     callableReflection?: ReflectionFunctionAbstract,
     *     effectiveConstructorArgDefs?: array<string, mixed>|null,
     *     effectiveCallableArgDefs?: array<string, mixed>|null
     *   },
     *   typeMap?: array<string, mixed>|null
     * } $__sb_context
     */
    $__sb_type = $__sb_context['type'];
    $__sb_planner = $__sb_context['__planner'];
    $__sb_file = $__sb_context['executionFile'];
    $__sb_class = $__sb_context['class'];
    $__sb_callable = $__sb_context['callable'];
    $__sb_deferOutputResolutionToAdapter = $__sb_context['deferOutputResolutionToAdapter'] ?? false;

    switch ($__sb_type) {
        case 'classMethod':
            assert(isset($__sb_planner['classReflection']));
            assert(isset($__sb_planner['callableReflection']));
            /** @var ReflectionClass<object> $__sb_ref */
            $__sb_ref = $__sb_planner['classReflection'];
            /** @var ReflectionMethod|null $__sb_constructor */
            $__sb_constructor = $__sb_planner['constructorReflection'] ?? null;
            $__sb_constructorArgs = $__sb_context['constructorArgs'] ?? [];
            $__sb_methodArgs = $__sb_context['methodArgs'] ?? [];
            $__sb_instance = $__sb_constructor !== null
                ? $__sb_ref->newInstanceArgs(orderResolvedArgs($__sb_constructor, $__sb_constructorArgs))
                : $__sb_ref->newInstance();
            /** @var ReflectionMethod $__sb_method */
            $__sb_method = $__sb_planner['callableReflection'];
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_instance, orderResolvedArgs($__sb_method, $__sb_methodArgs));
            $__sb_buffered = getOutputBuffer();
            return buildExecutionResponse(
                resolveExecutionHtml($__sb_result, $__sb_buffered, $__sb_deferOutputResolutionToAdapter),
                $__sb_result,
                $__sb_buffered,
                $__sb_instance,
                $__sb_context['publicArgs'],
                [],
                $__sb_constructorArgs,
                $__sb_methodArgs,
            );

        case 'staticMethod':
            $__sb_methodArgs = $__sb_context['methodArgs'] ?? [];
            assert(isset($__sb_planner['callableReflection']));
            /** @var ReflectionMethod $__sb_method */
            $__sb_method = $__sb_planner['callableReflection'];
            ob_start();
            $__sb_result = $__sb_method->invokeArgs(null, orderResolvedArgs($__sb_method, $__sb_methodArgs));
            $__sb_buffered = getOutputBuffer();
            return buildExecutionResponse(
                resolveExecutionHtml($__sb_result, $__sb_buffered, $__sb_deferOutputResolutionToAdapter),
                $__sb_result,
                $__sb_buffered,
                null,
                $__sb_context['publicArgs'],
                [],
                [],
                $__sb_methodArgs,
            );

        case 'function':
            $__sb_methodArgs = $__sb_context['methodArgs'] ?? [];
            assert(isset($__sb_planner['callableReflection']));
            /** @var ReflectionFunction $__sb_ref */
            $__sb_ref = $__sb_planner['callableReflection'];
            ob_start();
            $__sb_result = $__sb_ref->invokeArgs(orderResolvedArgs($__sb_ref, $__sb_methodArgs));
            $__sb_buffered = getOutputBuffer();
            return buildExecutionResponse(
                resolveExecutionHtml($__sb_result, $__sb_buffered, $__sb_deferOutputResolutionToAdapter),
                $__sb_result,
                $__sb_buffered,
                null,
                $__sb_context['publicArgs'],
                [],
                [],
                $__sb_methodArgs,
            );

        case 'template':
            $__sb_templateArgs = $__sb_context['templateArgs'] ?? resolveTemplateContextArgs($__sb_context);
            /** @var array<string, mixed> $__sb_templateArgs */
            extract($__sb_templateArgs, EXTR_SKIP);
            ob_start();
            include $__sb_file;
            return buildExecutionResponse(
                getOutputBuffer(),
                null,
                '',
                null,
                $__sb_context['publicArgs'],
                $__sb_templateArgs,
            );

        case 'enumMethod':
            $__sb_caseValue = $__sb_context['enumCaseValue'] ?? $__sb_context['publicArgs']['_case'] ?? null;
            assert(is_string($__sb_class) && $__sb_class !== '');
            /** @var class-string $__sb_class */
            $__sb_enumInstance = resolveEnumCase($__sb_class, $__sb_caseValue);
            $__sb_methodArgs = $__sb_context['methodArgs'] ?? [];
            assert(isset($__sb_planner['callableReflection']));
            /** @var ReflectionMethod $__sb_method */
            $__sb_method = $__sb_planner['callableReflection'];
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_enumInstance, orderResolvedArgs($__sb_method, $__sb_methodArgs));
            $__sb_buffered = getOutputBuffer();
            return buildExecutionResponse(
                resolveExecutionHtml($__sb_result, $__sb_buffered, $__sb_deferOutputResolutionToAdapter),
                $__sb_result,
                $__sb_buffered,
                $__sb_enumInstance,
                $__sb_context['publicArgs'],
                [],
                [],
                $__sb_methodArgs,
                $__sb_caseValue,
            );

    }
}

/**
 * @param array<string, mixed> $context
 * @return array<string, mixed>
 * @throws RuntimeException when the execution plan or arguments cannot be resolved
 */
function hydrateExecutionContext(array $context): array
{
    $context = ensureExecutionPlanner($context);
    $publicArgs = $context['publicArgs'] ?? [];
    $context['publicArgs'] = is_array($publicArgs) ? $publicArgs : [];
    /** @var array{
     *   type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod',
     *   executionFile?: string,
     *   class?: string|null,
     *   callable?: string|null,
     *   publicArgs: array<string, mixed>,
     *   publicArgDefs?: array<string, mixed>|null,
     *   constructorArgDefs?: array<string, mixed>|null,
     *   callableArgDefs?: array<string, mixed>|null,
     *   templateArgs?: array<string, mixed>,
     *   constructorArgs?: array<string, mixed>,
     *   methodArgs?: array<string, mixed>,
     *   enumCaseValue?: mixed,
     *   __planner: array{
     *     classReflection?: ReflectionClass<object>,
     *     constructorReflection?: ReflectionMethod|null,
     *     callableReflection?: ReflectionFunctionAbstract,
     *     effectiveConstructorArgDefs?: array<string, mixed>|null,
     *     effectiveCallableArgDefs?: array<string, mixed>|null
     *   },
     *   typeMap?: array<string, mixed>|null
     * } $context
     */

    $mappedArgs = mapPublicArgsToExecutionTargets($context);
    $planner = $context['__planner'];
    $typeMap = $context['typeMap'] ?? null;

    switch ($context['type']) {
        case 'template':
            $templateInput = $mappedArgs['template'] ?? $context['publicArgs'];
            $computedTemplateArgs = resolveTemplateContextArgs($context, $templateInput);
            $context = applyResolvedExecutionArgs($context, 'templateArgs', '__computedTemplateArgs', $computedTemplateArgs);
            unset($context['constructorArgs'], $context['methodArgs'], $context['enumCaseValue']);
            return $context;

        case 'classMethod':
            $computedConstructorArgs = resolveNamedArgs(
                $planner['constructorReflection'] ?? null,
                $mappedArgs['constructor'] ?? [],
                $typeMap,
                $planner['effectiveConstructorArgDefs'] ?? null,
            );
            $computedMethodArgs = resolveNamedArgs(
                $planner['callableReflection'] ?? null,
                $mappedArgs['method'] ?? [],
                $typeMap,
                $planner['effectiveCallableArgDefs'] ?? null,
            );
            $context = applyResolvedExecutionArgs($context, 'constructorArgs', '__computedConstructorArgs', $computedConstructorArgs);
            $context = applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $computedMethodArgs);
            unset($context['templateArgs'], $context['enumCaseValue']);
            return $context;

        case 'staticMethod':
        case 'function':
            $computedMethodArgs = resolveNamedArgs(
                $planner['callableReflection'] ?? null,
                $mappedArgs['method'] ?? [],
                $typeMap,
                $planner['effectiveCallableArgDefs'] ?? null,
            );
            $context = applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $computedMethodArgs);
            unset($context['templateArgs'], $context['constructorArgs'], $context['enumCaseValue']);
            return $context;

        case 'enumMethod':
            $methodInput = $mappedArgs['method'] ?? [];
            $computedEnumCaseValue = $methodInput['_case'] ?? $context['publicArgs']['_case'] ?? null;
            $context = applyResolvedExecutionValue($context, 'enumCaseValue', '__computedEnumCaseValue', $computedEnumCaseValue);
            unset($methodInput['_case']);
            $computedMethodArgs = resolveNamedArgs(
                $planner['callableReflection'] ?? null,
                $methodInput,
                $typeMap,
                $planner['effectiveCallableArgDefs'] ?? null,
            );
            $context = applyResolvedExecutionArgs($context, 'methodArgs', '__computedMethodArgs', $computedMethodArgs);
            unset($context['templateArgs'], $context['constructorArgs']);
            return $context;
    }

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

/**
 * @param array<string, mixed> $context
 * @return array<string, mixed>
 * @throws RuntimeException when the requested target cannot be reflected
 */
function ensureExecutionPlanner(array $context): array
{
    if (isset($context['__planner'])) {
        return $context;
    }

    $type = $context['type'];
    if (!is_string($type)) {
        throw new \RuntimeException('Unknown type: ' . get_debug_type($type));
    }
    if (!isRenderType($type)) {
        throw new \RuntimeException("Unknown type: {$type}");
    }
    /** @var 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod' $type */
    $executionFile = $context['executionFile'] ?? null;
    $class = $context['class'] ?? null;
    $callable = $context['callable'] ?? null;
    $publicArgDefs = $context['publicArgDefs'] ?? null;
    $publicArgDefs = normalizeNamedArgDefMap($publicArgDefs);
    $constructorArgDefs = $context['constructorArgDefs'] ?? null;
    $constructorArgDefs = normalizeNamedArgDefMap($constructorArgDefs);
    $callableArgDefs = $context['callableArgDefs'] ?? null;
    $callableArgDefs = normalizeNamedArgDefMap($callableArgDefs);

    $planner = [
        'type' => $type,
        'effectiveConstructorArgDefs' => null,
        'effectiveCallableArgDefs' => null,
    ];

    try {
        switch ($type) {
            case 'classMethod':
                if (!is_string($class) || $class === '' || !is_string($callable) || $callable === '') {
                    throw new \RuntimeException('classMethod requires class and callable.');
                }
                if (!is_string($executionFile) || $executionFile === '') {
                    throw new \RuntimeException('classMethod requires an execution file.');
                }
                require_once $executionFile;
                /** @var class-string $class */
                $classReflection = new ReflectionClass($class);
                $planner['classReflection'] = $classReflection;
                $planner['constructorReflection'] = $classReflection->getConstructor();
                $planner['callableReflection'] = $classReflection->getMethod($callable);
                $planner['effectiveConstructorArgDefs'] = buildTargetArgDefs(
                    $constructorArgDefs,
                    $publicArgDefs,
                    'constructor',
                );
                $planner['effectiveCallableArgDefs'] = buildTargetArgDefs(
                    $callableArgDefs,
                    $publicArgDefs,
                    'method',
                );
                break;

            case 'staticMethod':
                if (!is_string($class) || $class === '' || !is_string($callable) || $callable === '') {
                    throw new \RuntimeException('staticMethod requires class and callable.');
                }
                if (!is_string($executionFile) || $executionFile === '') {
                    throw new \RuntimeException('staticMethod requires an execution file.');
                }
                require_once $executionFile;
                /** @var class-string $class */
                $classReflection = new ReflectionClass($class);
                $planner['classReflection'] = $classReflection;
                $planner['callableReflection'] = $classReflection->getMethod($callable);
                $planner['effectiveCallableArgDefs'] = buildTargetArgDefs(
                    $callableArgDefs,
                    $publicArgDefs,
                    'method',
                );
                break;

            case 'function':
                if (!is_string($callable) || $callable === '') {
                    throw new \RuntimeException('function render requires callable.');
                }
                if (!is_string($executionFile) || $executionFile === '') {
                    throw new \RuntimeException('function render requires an execution file.');
                }
                require_once $executionFile;
                $planner['callableReflection'] = new ReflectionFunction($callable);
                $planner['effectiveCallableArgDefs'] = buildTargetArgDefs(
                    $callableArgDefs,
                    $publicArgDefs,
                    'method',
                );
                break;

            case 'template':
                break;

            case 'enumMethod':
                if (!is_string($class) || $class === '' || !is_string($callable) || $callable === '') {
                    throw new \RuntimeException('enumMethod requires enum class and callable.');
                }
                if (!is_string($executionFile) || $executionFile === '') {
                    throw new \RuntimeException('enumMethod requires an execution file.');
                }
                require_once $executionFile;
                if (!runnerEnumExists($class)) {
                    throw new \RuntimeException("Enum '{$class}' is not available.");
                }
                assert(class_exists($class));
                $classReflection = new ReflectionClass($class);
                $planner['classReflection'] = $classReflection;
                $planner['callableReflection'] = $classReflection->getMethod($callable);
                $planner['effectiveCallableArgDefs'] = buildTargetArgDefs(
                    $callableArgDefs,
                    $publicArgDefs,
                    'method',
                );
                break;
        }
    } catch (\ReflectionException $exception) {
        throw new \RuntimeException(
            "Unable to resolve {$type} target from the runner request.",
            0,
            $exception,
        );
    }

    $context['__planner'] = $planner;

    return $context;
}

/**
 * Checks enum availability through a PHP 8.0-compatible boundary.
 *
 * @codeCoverageIgnore
 * @throws RuntimeException when enums are unavailable
 */
function runnerEnumExists(string $class): bool
{
    if (!function_exists('enum_exists')) {
        throw new \RuntimeException("Enum methods require PHP 8.1+. Current PHP: " . PHP_VERSION);
    }

    $exists = enum_exists($class);
    if (!is_bool($exists)) {
        throw new \RuntimeException('enum_exists() returned an invalid result.');
    }

    return $exists;
}

/**
 * @return array<string, mixed>|null
 */
function normalizeNamedArgDefMap(mixed $value): ?array
{
    if (!is_array($value)) {
        return null;
    }

    $normalized = [];
    foreach ($value as $key => $item) {
        if (!is_string($key)) {
            continue;
        }
        $normalized[$key] = $item;
    }

    return $normalized;
}

/**
 * @param array<string, mixed>|null $targetArgDefs
 * @param array<string, mixed>|null $publicArgDefs
 * @return array<string, mixed>|null
 */
function buildTargetArgDefs(?array $targetArgDefs, ?array $publicArgDefs, string $scope): ?array
{
    if ($targetArgDefs === null) {
        return null;
    }

    $effectiveArgDefs = [];

    foreach ($targetArgDefs as $name => $targetArgDef) {
        if (!is_array($targetArgDef)) {
            continue;
        }

        /** @var array<string, mixed> $normalizedTargetArgDef */
        $normalizedTargetArgDef = $targetArgDef;
        $effectiveArgDefs[$name] = mergeTargetArgDefForRuntime(
            $normalizedTargetArgDef,
            resolvePublicArgDefForTarget($name, $publicArgDefs, $scope)
        );
    }

    return $effectiveArgDefs;
}

/**
 * @param array<string, mixed>|null $publicArgDefs
 * @return array<string, mixed>|null
 */
function resolvePublicArgDefForTarget(string $name, ?array $publicArgDefs, string $scope): ?array
{
    if ($publicArgDefs === null) {
        return null;
    }

    $scopedKey = $scope . '.' . $name;
    if (isset($publicArgDefs[$scopedKey]) && is_array($publicArgDefs[$scopedKey])) {
        /** @var array<string, mixed> $resolved */
        $resolved = $publicArgDefs[$scopedKey];
        return $resolved;
    }

    if (isset($publicArgDefs[$name]) && is_array($publicArgDefs[$name])) {
        /** @var array<string, mixed> $resolved */
        $resolved = $publicArgDefs[$name];
        return $resolved;
    }

    return null;
}

/**
 * @param array<string, mixed> $targetArgDef
 * @param array<string, mixed>|null $publicArgDef
 * @return array<string, mixed>
 */
function mergeTargetArgDefForRuntime(array $targetArgDef, ?array $publicArgDef): array
{
    $runtimeTargetArgDef = stripInheritedRuntimeDefault($targetArgDef);

    if ($publicArgDef === null) {
        return $runtimeTargetArgDef;
    }

    $runtimePublicArgDef = $publicArgDef;
    if (
        array_key_exists('default', $runtimePublicArgDef)
        && array_key_exists('default', $targetArgDef)
        && defaultsMatchForRuntime(
            $runtimePublicArgDef['default'],
            $targetArgDef['default']
        )
    ) {
        unset($runtimePublicArgDef['default']);
    }

    return array_merge($runtimeTargetArgDef, $runtimePublicArgDef);
}

/**
 * @param array<string, mixed> $argDef
 * @return array<string, mixed>
 */
function stripInheritedRuntimeDefault(array $argDef): array
{
    if (!array_key_exists('default', $argDef)) {
        return $argDef;
    }

    $stripped = $argDef;
    unset($stripped['default']);

    return $stripped;
}

function defaultsMatchForRuntime(mixed $left, mixed $right): bool
{
    return json_encode($left) === json_encode($right);
}

/**
 * @param array<string, mixed> $context
 * @param array<string, mixed>|null $templateInput
 * @return array<string, mixed>
 */
function resolveTemplateContextArgs(array $context, ?array $templateInput = null): array
{
    $templateArgsSource = $templateInput ?? $context['templateArgs'] ?? $context['publicArgs'] ?? [];
    $templateArgs = [];
    if (is_array($templateArgsSource)) {
        foreach ($templateArgsSource as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $templateArgs[$key] = $value;
        }
    }
    $publicArgDefsSource = $context['publicArgDefs'] ?? null;
    if (!is_array($publicArgDefsSource)) {
        $publicArgDefs = null;
    } else {
        $publicArgDefs = [];
        foreach ($publicArgDefsSource as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $publicArgDefs[$key] = $value;
        }
    }
    $typeMapSource = $context['typeMap'] ?? null;
    if (!is_array($typeMapSource)) {
        $typeMap = null;
    } else {
        $typeMap = [];
        foreach ($typeMapSource as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $typeMap[$key] = $value;
        }
    }

    return $publicArgDefs !== null
        ? castTemplateArgs($templateArgs, $publicArgDefs, $typeMap)
        : $templateArgs;
}

/**
 * @param array<string, mixed> $resolvedArgs
 * @return list<mixed>
 */
function orderResolvedArgs(?ReflectionFunctionAbstract $ref, array $resolvedArgs): array
{
    if (!$ref instanceof ReflectionFunctionAbstract) {
        return [];
    }

    $ordered = [];
    foreach ($ref->getParameters() as $param) {
        $name = $param->getName();
        if (!array_key_exists($name, $resolvedArgs)) {
            continue;
        }

        $value = $resolvedArgs[$name];
        if ($param->isVariadic()) {
            $values = is_array($value) && isListArray($value) ? $value : [$value];
            foreach ($values as $item) {
                $ordered[] = $item;
            }
            continue;
        }

        $ordered[] = $value;
    }

    return $ordered;
}

/**
 * @param array<string, mixed> $publicArgs
 * @param array<string, mixed> $templateArgs
 * @param array<string, mixed> $constructorArgs
 * @param array<string, mixed> $methodArgs
 * @return array{
 *   html: string,
 *   result?: mixed,
 *   buffered?: string,
 *   instance?: object|null,
 *   publicArgs?: array<string, mixed>,
 *   templateArgs?: array<string, mixed>,
 *   constructorArgs?: array<string, mixed>,
 *   methodArgs?: array<string, mixed>,
 *   enumCaseValue?: mixed
 * }
 */
function buildExecutionResponse(
    string $html,
    mixed $result,
    string $buffered,
    ?object $instance,
    array $publicArgs,
    array $templateArgs = [],
    array $constructorArgs = [],
    array $methodArgs = [],
    mixed $enumCaseValue = null,
): array {
    $response = [
        'html' => $html,
        'result' => $result,
        'buffered' => $buffered,
        'instance' => $instance,
        'publicArgs' => $publicArgs,
        'templateArgs' => $templateArgs,
        'constructorArgs' => $constructorArgs,
        'methodArgs' => $methodArgs,
    ];

    if ($enumCaseValue !== null) {
        $response['enumCaseValue'] = $enumCaseValue;
    }

    return $response;
}
