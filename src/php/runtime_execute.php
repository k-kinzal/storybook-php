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
    $__sb_args = $__sb_request['args'];
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
        'args' => $__sb_args,
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
            $__sb_instance = $__sb_constructor !== null
                ? $__sb_ref->newInstanceArgs(matchArgs($__sb_constructor, $__sb_args, $__sb_typeMap))
                : $__sb_ref->newInstance();
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_instance, matchArgs($__sb_method, $__sb_args, $__sb_typeMap));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapter($__sb_adapter, $__sb_result, $__sb_buffered, $__sb_instance, $__sb_context)
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
            ob_start();
            $__sb_result = $__sb_method->invokeArgs(null, matchArgs($__sb_method, $__sb_args, $__sb_typeMap));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapter($__sb_adapter, $__sb_result, $__sb_buffered, null, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'function':
            if ($__sb_callable === null) {
                throw new \RuntimeException('function render requires callable.');
            }
            require_once $__sb_file;
            $__sb_ref = new ReflectionFunction($__sb_callable);
            ob_start();
            $__sb_result = $__sb_ref->invokeArgs(matchArgs($__sb_ref, $__sb_args, $__sb_typeMap));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapter($__sb_adapter, $__sb_result, $__sb_buffered, null, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        case 'template':
            if ($__sb_adapter !== null) {
                $__sb_html = applyAdapter($__sb_adapter, null, '', null, $__sb_context);
            } else {
                extract($__sb_args, EXTR_SKIP);
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
            $__sb_caseValue = $__sb_args['_case'] ?? null;
            $__sb_enumInstance = resolveEnumCase($__sb_class, $__sb_caseValue);
            $__sb_method = $__sb_ref->getMethod($__sb_callable);
            $__sb_methodArgs = array_diff_key($__sb_args, ['_case' => true]);
            ob_start();
            $__sb_result = $__sb_method->invokeArgs($__sb_enumInstance, matchArgs($__sb_method, $__sb_methodArgs, $__sb_typeMap));
            $__sb_buffered = getOutputBuffer();
            $__sb_html = $__sb_adapter !== null
                ? applyAdapter($__sb_adapter, $__sb_result, $__sb_buffered, $__sb_enumInstance, $__sb_context)
                : resolveOutput($__sb_result, $__sb_buffered);
            break;

        default:
            throw new \RuntimeException("Unknown type: {$__sb_type}");
    }

    return ['html' => $__sb_html];
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
