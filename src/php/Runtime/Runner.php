<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime;

use JsonException;
use ReflectionException;
use Throwable;

/**
 * Executes one validated stdin payload and returns its encoded response.
 *
 * @throws JsonException when PHP cannot encode the validated protocol shape
 * @throws ReflectionException when reflection cannot expose a parameter default
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
