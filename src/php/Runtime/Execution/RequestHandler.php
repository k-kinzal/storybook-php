<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Execution;

use RuntimeException;

/**
 * Coordinates a validated runner request with adapters and invocation.
 *
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', file: string, sourceFile?: string|null, class?: string|null, callable?: string|null, args: array<string, mixed>, publicArgDefs?: array<string, mixed>|null, constructorArgDefs?: array<string, mixed>|null, callableArgDefs?: array<string, mixed>|null, bootstrap?: string|null, adapters?: list<string>|null, typeMap?: array<string, mixed>|null} $__sb_request
 * @return array{html: string}
 * @throws RuntimeException when the request cannot be resolved or executed
 */
function executeRunnerRequest(array $__sb_request): array
{
    $__sb_bootstrap = $__sb_request['bootstrap'] ?? null;
    if ($__sb_bootstrap !== null && $__sb_bootstrap !== '') {
        require_once $__sb_bootstrap;
    }

    $__sb_adapters = \StorybookPhp\Runtime\Transport\loadAdapters($__sb_request['adapters'] ?? null);
    $__sb_response = \StorybookPhp\Runtime\Transport\runAdapterMiddleware(
        $__sb_adapters,
        \StorybookPhp\Runtime\Execution\buildRunnerExecutionContext($__sb_request, $__sb_adapters !== []),
        __NAMESPACE__ . '\\executeAdapterTerminal',
    );

    return ['html' => $__sb_response['html']];
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, __planner: array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', effectiveConstructorArgDefs: array<string, mixed>|null, effectiveCallableArgDefs: array<string, mixed>|null, ...}, ...} $context
 * @return array{html: string, ...}
 */
function executeAdapterTerminal(array $context): array
{
    return \StorybookPhp\Runtime\Execution\executeCoreContext($context);
}

/**
 * @param array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', file: string, sourceFile?: string|null, class?: string|null, callable?: string|null, args: array<string, mixed>, publicArgDefs?: array<string, mixed>|null, constructorArgDefs?: array<string, mixed>|null, callableArgDefs?: array<string, mixed>|null, bootstrap?: string|null, adapters?: list<string>|null, typeMap?: array<string, mixed>|null} $request
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', executionFile: string, class: string|null, callable: string|null, publicArgs: array<string, mixed>, ...}
 */
function buildRunnerExecutionContext(array $request, bool $deferOutputResolution): array
{
    return [
        'type' => $request['type'],
        'file' => $request['sourceFile'] ?? $request['file'],
        'executionFile' => $request['file'],
        'class' => $request['class'] ?? null,
        'callable' => $request['callable'] ?? null,
        'publicArgs' => $request['args'],
        'publicArgDefs' => $request['publicArgDefs'] ?? null,
        'constructorArgDefs' => $request['constructorArgDefs'] ?? null,
        'callableArgDefs' => $request['callableArgDefs'] ?? null,
        'deferOutputResolutionToAdapter' => $deferOutputResolution,
        'typeMap' => $request['typeMap'] ?? null,
    ];
}
