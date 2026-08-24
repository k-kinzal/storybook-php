<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime;

use Generator;
use JsonException;
use Throwable;

/**
 * Defers lazy output values when adapter middleware owns their render
 * lifecycle, while preserving already-materialized core output.
 */
function resolveExecutionHtml(mixed $result, string $buffered, bool $deferToAdapter): string
{
    $isLazyOutput = $result instanceof Generator
        || (is_object($result) && method_exists($result, '__toString'));
    if ($deferToAdapter && $isLazyOutput) {
        return $buffered;
    }

    return \StorybookPhp\Runtime\Transport\resolveOutput($result, $buffered);
}

/**
 * Executes one validated stdin payload and returns its encoded response.
 *
 * @throws JsonException when PHP cannot encode the validated protocol shape
 */
function run(?string $input = null, bool $writeOutput = true): string
{
    $response = \StorybookPhp\Runtime\Execution\executeRunnerRequest(
        \StorybookPhp\Runtime\Transport\readRunnerRequest($input ?? \StorybookPhp\Runtime\Transport\readRunnerStdin()),
    );

    $encoded = \StorybookPhp\Runtime\Transport\encodeRunnerResponse($response);
    if ($writeOutput) {
        echo $encoded;
    }

    return $encoded;
}

/**
 * Converts an uncaught process-boundary failure to the JSON protocol.
 *
 * @throws JsonException when PHP cannot encode the validated protocol shape
 */
function failure(Throwable $error): string
{
    return \StorybookPhp\Runtime\Transport\encodeRunnerResponse(
        \StorybookPhp\Runtime\Transport\buildRunnerErrorResponse($error),
    );
}
