<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Transport;

use Generator;
use JsonException;
use Throwable;

/**
 * Resolves the final HTML output from a method result and output buffer.
 */
function resolveOutput(mixed $result, string $buffered): string
{
    if ($result instanceof Generator) {
        $chunks = [];
        foreach (iterator_to_array($result, false) as $chunk) {
            $chunks[] = \StorybookPhp\Runtime\Transport\stringifyOutputValue($chunk);
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
