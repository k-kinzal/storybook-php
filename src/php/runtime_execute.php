<?php

declare(strict_types=1);

/**
 * @param array{
 *   type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod',
 *   file: string,
 *   sourceFile: string|null,
 *   class: string|null,
 *   callable: string|null,
 *   args: array<string, mixed>,
 *   publicArgDefs: array<string, mixed>|null,
 *   constructorArgDefs: array<string, mixed>|null,
 *   callableArgDefs: array<string, mixed>|null,
 *   bootstrap: string|null,
 *   adapter: string|null,
 *   typeMap: array<string, mixed>|null
 * } $__sb_request
 * @return array{html: string}
 */
function executeRunnerRequest(array $__sb_request): array
{
    $__sb_type = $__sb_request['type'];
    $__sb_file = $__sb_request['file'];
    $__sb_sourceFile = $__sb_request['sourceFile'] ?? $__sb_file;
    $__sb_class = $__sb_request['class'];
    $__sb_callable = $__sb_request['callable'];
    $__sb_storyArgs = $__sb_request['args'];
    $__sb_publicArgDefs = $__sb_request['publicArgDefs'] ?? null;
    $__sb_constructorArgDefs = $__sb_request['constructorArgDefs'] ?? null;
    $__sb_callableArgDefs = $__sb_request['callableArgDefs'] ?? null;
    $__sb_bootstrap = $__sb_request['bootstrap'];
    $__sb_adapterPath = $__sb_request['adapter'];
    $__sb_typeMap = $__sb_request['typeMap'];

    if ($__sb_bootstrap !== null && $__sb_bootstrap !== '') {
        require_once $__sb_bootstrap;
    }

    $__sb_adapter = loadAdapter($__sb_adapterPath);

    $__sb_html = '';
    $__sb_context = [
        'type' => $__sb_type,
        'file' => $__sb_sourceFile,
        'executionFile' => $__sb_file,
        'class' => $__sb_class,
        'callable' => $__sb_callable,
        'storyArgs' => $__sb_storyArgs,
        'publicArgDefs' => $__sb_publicArgDefs,
        'constructorArgDefs' => $__sb_constructorArgDefs,
        'callableArgDefs' => $__sb_callableArgDefs,
    ];

    switch ($__sb_type) {
        case 'classMethod':
            if ($__sb_class === null || $__sb_callable === null) {
                throw new \RuntimeException('classMethod requires class and callable.');
            }
            require_once $__sb_file;
            /** @var class-string $__sb_class */
            $__sb_ref = new ReflectionClass($__sb_class);
            $__sb_constructor = $__sb_ref->getConstructor();
            $__sb_effectiveConstructorArgDefs = buildTargetArgDefs(
                $__sb_constructorArgDefs,
                $__sb_publicArgDefs,
                'constructor'
            );
            $__sb_effectiveCallableArgDefs = buildTargetArgDefs(
                $__sb_callableArgDefs,
                $__sb_publicArgDefs,
                'method'
            );
            $__sb_mappedArgs = mapAdapterArgs($__sb_adapter, $__sb_context);
            $__sb_context['constructorArgs'] = $__sb_mappedArgs['constructor'] ?? [];
            $__sb_context['methodArgs'] = $__sb_mappedArgs['method'] ?? [];
            $__sb_instance = $__sb_constructor !== null
                ? $__sb_ref->newInstanceArgs(matchArgs(
                    $__sb_constructor,
                    $__sb_mappedArgs['constructor'] ?? [],
                    $__sb_typeMap,
                    $__sb_effectiveConstructorArgDefs
                ))
                : $__sb_ref->newInstance();
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_instance, matchArgs(
                $__sb_method,
                $__sb_mappedArgs['method'] ?? [],
                $__sb_typeMap,
                $__sb_effectiveCallableArgDefs
            ));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapterRender($__sb_adapter, $__sb_result, $__sb_buffered, $__sb_instance, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'staticMethod':
            if ($__sb_class === null || $__sb_callable === null) {
                throw new \RuntimeException('staticMethod requires class and callable.');
            }
            require_once $__sb_file;
            /** @var class-string $__sb_class */
            $__sb_ref = new ReflectionClass($__sb_class);
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            $__sb_effectiveCallableArgDefs = buildTargetArgDefs(
                $__sb_callableArgDefs,
                $__sb_publicArgDefs,
                'method'
            );
            $__sb_mappedArgs = mapAdapterArgs($__sb_adapter, $__sb_context);
            $__sb_context['methodArgs'] = $__sb_mappedArgs['method'] ?? [];
            ob_start();
            $__sb_result = $__sb_method->invokeArgs(null, matchArgs(
                $__sb_method,
                $__sb_mappedArgs['method'] ?? [],
                $__sb_typeMap,
                $__sb_effectiveCallableArgDefs
            ));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapterRender($__sb_adapter, $__sb_result, $__sb_buffered, null, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'function':
            if ($__sb_callable === null) {
                throw new \RuntimeException('function render requires callable.');
            }
            require_once $__sb_file;
            $__sb_ref = new ReflectionFunction($__sb_callable);
            $__sb_effectiveCallableArgDefs = buildTargetArgDefs(
                $__sb_callableArgDefs,
                $__sb_publicArgDefs,
                'method'
            );
            $__sb_mappedArgs = mapAdapterArgs($__sb_adapter, $__sb_context);
            $__sb_context['methodArgs'] = $__sb_mappedArgs['method'] ?? [];
            ob_start();
            $__sb_result = $__sb_ref->invokeArgs(matchArgs(
                $__sb_ref,
                $__sb_mappedArgs['method'] ?? [],
                $__sb_typeMap,
                $__sb_effectiveCallableArgDefs
            ));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapterRender($__sb_adapter, $__sb_result, $__sb_buffered, null, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'template':
            $__sb_mappedArgs = mapAdapterArgs($__sb_adapter, $__sb_context);
            $__sb_templateInput = $__sb_mappedArgs['template'] ?? $__sb_storyArgs;
            $__sb_templateArgs = $__sb_publicArgDefs !== null
                ? castTemplateArgs($__sb_templateInput, $__sb_publicArgDefs, $__sb_typeMap)
                : $__sb_templateInput;
            $__sb_context['args'] = $__sb_templateArgs;
            if ($__sb_adapter !== null) {
                $__sb_html = applyAdapterRender($__sb_adapter, null, '', null, $__sb_context);
            } else {
                extract($__sb_templateArgs, EXTR_SKIP);
                ob_start();
                include $__sb_file;
                $__sb_html = getOutputBuffer();
            }
            break;

        case 'enumMethod':
            if ($__sb_class === null || $__sb_callable === null) {
                throw new \RuntimeException('enumMethod requires enum class and callable.');
            }
            // @codeCoverageIgnoreStart
            if (!function_exists('enum_exists')) {
                throw new \RuntimeException("Enum methods require PHP 8.1+. Current PHP: " . PHP_VERSION);
            }
            // @codeCoverageIgnoreEnd
            require_once $__sb_file;
            if (!enum_exists($__sb_class)) {
                throw new \RuntimeException("Enum '{$__sb_class}' is not available.");
            }
            assert(class_exists($__sb_class));
            $__sb_ref = new ReflectionClass($__sb_class);
            $__sb_effectiveCallableArgDefs = buildTargetArgDefs(
                $__sb_callableArgDefs,
                $__sb_publicArgDefs,
                'method'
            );
            $__sb_mappedArgs = mapAdapterArgs($__sb_adapter, $__sb_context);
            $__sb_methodInput = $__sb_mappedArgs['method'] ?? [];
            $__sb_context['methodArgs'] = $__sb_methodInput;
            $__sb_caseValue = $__sb_methodInput['_case'] ?? $__sb_storyArgs['_case'] ?? null;
            $__sb_enumInstance = resolveEnumCase($__sb_class, $__sb_caseValue);
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            $__sb_methodArgs = array_diff_key($__sb_methodInput, ['_case' => true]);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_enumInstance, matchArgs(
                $__sb_method,
                $__sb_methodArgs,
                $__sb_typeMap,
                $__sb_effectiveCallableArgDefs
            ));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapterRender($__sb_adapter, $__sb_result, $__sb_buffered, $__sb_enumInstance, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        default:
            throw new \RuntimeException("Unknown type: {$__sb_type}");
    }

    return ['html' => $__sb_html];
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
        $effectiveArgDefs[$name] = mergeTargetArgDef(
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
function mergeTargetArgDef(array $targetArgDef, ?array $publicArgDef): array
{
    if ($publicArgDef === null) {
        return $targetArgDef;
    }

    return array_merge($targetArgDef, $publicArgDef);
}

function storybookPhpRun(?string $input = null, bool $writeOutput = true): string
{
    try {
        $response = executeRunnerRequest(readRunnerRequest($input ?? readRunnerStdin()));
    } catch (\Throwable $e) {
        $response = buildRunnerErrorResponse($e);
    }

    $encoded = encodeRunnerResponse($response);
    if ($writeOutput) {
        echo $encoded;
    }

    return $encoded;
}
