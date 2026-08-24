<?php

declare(strict_types=1);

/**
 * @param RunnerRequestInput $__sb_request
 * @return array{html: string}
 * @throws RuntimeException when the request cannot be resolved or executed
 */
function executeRunnerRequest(array $__sb_request): array
{
    $__sb_bootstrap = $__sb_request['bootstrap'] ?? null;
    if ($__sb_bootstrap !== null && $__sb_bootstrap !== '') {
        require_once $__sb_bootstrap;
    }

    $__sb_adapters = loadAdapters($__sb_request['adapters'] ?? null);
    $__sb_response = runAdapterMiddleware(
        $__sb_adapters,
        buildRunnerExecutionContext($__sb_request, $__sb_adapters !== []),
        'executeAdapterTerminal',
    );

    return ['html' => $__sb_response['html']];
}

/**
 * @param HydratedExecutionContext $context
 * @return ExecutionResponse
 */
function executeAdapterTerminal(array $context): array
{
    return executeCoreContext($context);
}

/**
 * @param RunnerRequestInput $request
 * @return ExecutionContext
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
