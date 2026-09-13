<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Transport;

use Generator;
use JsonException;
use RuntimeException;
use Throwable;

/**
 * Defers lazy output when adapter middleware owns its render lifecycle.
 *
 * @param mixed $result +mut consumes generator results unless adapters own their lifecycle
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
 * Closes the active output buffer and returns its validated contents.
 */
function getOutputBuffer(): string
{
    return \StorybookPhp\Runtime\Transport\requireOutputBuffer(ob_get_clean());
}

/**
 * Converts the engine-level output-buffer failure into the runner contract.
 *
 * @throws RuntimeException when no output buffer is active
 */
function requireOutputBuffer(string|false $buffered): string
{
    if ($buffered === false) {
        throw new RuntimeException('Failed to collect output buffer.');
    }

    return $buffered;
}

/**
 * Resolves the final HTML output from a method result and output buffer.
 *
 * @param mixed $result +mut consumes generator results while resolving output
 */
function resolveOutput(mixed $result, string $buffered): string
{
    if ($result instanceof Generator) {
        $chunks = [];
        foreach (iterator_to_array($result, false) as $chunk) {
            $chunks[] = \StorybookPhp\Runtime\Contract\stringifyOutputValue($chunk);
        }
        $result = implode('', $chunks);
    }

    if (is_object($result) && method_exists($result, '__toString')) {
        $result = (string) $result;
    }

    if (is_array($result) && array_key_exists('html', $result) && is_string($result['html'])) {
        $result = $result['html'];
    }

    if (is_string($result) && $result !== '') {
        return $buffered !== '' ? $result . $buffered : $result;
    }

    if ($buffered !== '') {
        return $buffered;
    }

    if (is_scalar($result) && $result !== '') {
        return (string) $result;
    }

    return '';
}

/**
 * @return array{html: string, error: string, trace: string}
 */
function buildRunnerErrorResponse(Throwable $e): array
{
    return [
        'html' => '',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ];
}

/**
 * @param array{html: string, error?: string, trace?: string} $response
 * @throws JsonException when the validated protocol shape cannot be encoded
 */
function encodeRunnerResponse(array $response): string
{
    return \StorybookPhp\Runtime\Transport\encodeJsonResponse($response);
}

/**
 * @param array{html: string, error?: string, trace?: string} $response
 * @throws JsonException when the validated protocol shape cannot be encoded
 */
function encodeJsonResponse(array $response): string
{
    return json_encode($response, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE);
}
