<?php

declare(strict_types=1);

/**
 * Defers lazy output values when adapter middleware owns their render
 * lifecycle, while preserving already-materialized core output.
 */
function resolveExecutionHtml(mixed $result, string $buffered, bool $deferToAdapter): string
{
    $isLazyOutput = $result instanceof \Generator
        || (is_object($result) && method_exists($result, '__toString'));
    if ($deferToAdapter && $isLazyOutput) {
        return $buffered;
    }

    return resolveOutput($result, $buffered);
}

/**
 * Converts every runner failure into the JSON protocol's error response at
 * the process boundary.
 */
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
