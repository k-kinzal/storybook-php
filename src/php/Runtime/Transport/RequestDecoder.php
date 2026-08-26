<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Transport;

use JsonException;
use RuntimeException;

/**
 * Decodes and validates an untrusted runner request.
 *
 * @return array{type: 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod', file: string, sourceFile: string|null, class: string|null, callable: string|null, args: array<string, mixed>, publicArgDefs: array<string, mixed>|null, constructorArgDefs: array<string, mixed>|null, callableArgDefs: array<string, mixed>|null, bootstrap: string|null, adapters: list<string>|null, typeMap: array<string, mixed>|null}
 */
function readRunnerRequest(string $input): array
{
    $decoded = \StorybookPhp\Runtime\Transport\decodeRunnerRequest($input);
    $type = \StorybookPhp\Runtime\Transport\requireRunnerRenderType($decoded);
    $file = \StorybookPhp\Runtime\Transport\requireRunnerStringField($decoded, 'file');
    $args = \StorybookPhp\Runtime\Transport\runnerObjectField($decoded, 'args', false) ?? [];
    $adapters = \StorybookPhp\Runtime\Transport\runnerListField($decoded, 'adapters');

    return [
        'type' => $type,
        'file' => $file,
        'sourceFile' => \StorybookPhp\Runtime\Transport\runnerOptionalStringField($decoded, 'sourceFile'),
        'class' => \StorybookPhp\Runtime\Transport\runnerOptionalStringField($decoded, 'class'),
        'callable' => \StorybookPhp\Runtime\Transport\runnerOptionalStringField($decoded, 'callable'),
        'args' => \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($args, 'args'),
        'publicArgDefs' => \StorybookPhp\Runtime\Transport\runnerObjectField($decoded, 'publicArgDefs'),
        'constructorArgDefs' => \StorybookPhp\Runtime\Transport\runnerObjectField($decoded, 'constructorArgDefs'),
        'callableArgDefs' => \StorybookPhp\Runtime\Transport\runnerObjectField($decoded, 'callableArgDefs'),
        'bootstrap' => \StorybookPhp\Runtime\Transport\runnerOptionalStringField($decoded, 'bootstrap'),
        'adapters' => $adapters === null ? null : \StorybookPhp\Runtime\Transport\normalizeStringList($adapters, 'adapters'),
        'typeMap' => \StorybookPhp\Runtime\Transport\runnerObjectField($decoded, 'typeMap'),
    ];
}

/**
 * @return array<string, mixed>
 * @throws RuntimeException when the payload is not a JSON object
 */
function decodeRunnerRequest(string $input): array
{
    try {
        $decoded = json_decode($input, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new RuntimeException('Invalid JSON request payload.', 0, $exception);
    }
    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid request payload.');
    }

    return \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($decoded, 'request');
}

/**
 * @param array<string, mixed> $decoded
 * @return 'classMethod'|'staticMethod'|'function'|'template'|'enumMethod'
 * @throws RuntimeException when the render type is absent or unsupported
 */
function requireRunnerRenderType(array $decoded): string
{
    $type = $decoded['type'] ?? null;
    if (!is_string($type) || !\StorybookPhp\Runtime\Contract\isRenderType($type)) {
        throw new RuntimeException('Request field "type" is invalid.');
    }

    return $type;
}

/**
 * @param array<string, mixed> $decoded
 * @throws RuntimeException when the required field is empty or not a string
 */
function requireRunnerStringField(array $decoded, string $field): string
{
    $value = $decoded[$field] ?? null;
    if (!is_string($value) || $value === '') {
        throw new RuntimeException("Request field \"{$field}\" is required.");
    }

    return $value;
}

/**
 * @param array<string, mixed> $decoded
 * @throws RuntimeException when the optional field is neither a string nor null
 */
function runnerOptionalStringField(array $decoded, string $field): ?string
{
    $value = $decoded[$field] ?? null;
    if ($value !== null && !is_string($value)) {
        throw new RuntimeException("Request field \"{$field}\" must be a string or null.");
    }

    return $value;
}

/**
 * @param array<string, mixed> $decoded
 * @return array<string, mixed>|null
 * @throws RuntimeException when the field is not a JSON object or null
 */
function runnerObjectField(array $decoded, string $field, bool $nullable = true): ?array
{
    $value = $decoded[$field] ?? ($nullable ? null : []);
    if ($value === null && $nullable) {
        return null;
    }
    if (!is_array($value)) {
        $suffix = $nullable ? ' or null' : '';
        throw new RuntimeException("Request field \"{$field}\" must be an object{$suffix}.");
    }

    return \StorybookPhp\Runtime\Transport\normalizeStringKeyArray($value, $field);
}

/**
 * @param array<string, mixed> $decoded
 * @return array<array-key, mixed>|null
 * @throws RuntimeException when the field is not an array or null
 */
function runnerListField(array $decoded, string $field): ?array
{
    $value = $decoded[$field] ?? null;
    if ($value !== null && !is_array($value)) {
        throw new RuntimeException("Request field \"{$field}\" must be an array or null.");
    }

    return $value;
}

/**
 * @param non-empty-string $streamUri
 * @throws RuntimeException when stdin cannot be read
 */
function readRunnerStdin(string $streamUri = 'php://stdin'): string
{
    return \StorybookPhp\Runtime\Transport\requireRunnerInput(file_get_contents($streamUri));
}

/**
 * Narrows the stream read result to the runner's string input contract.
 *
 * @throws RuntimeException when stdin cannot be read
 */
function requireRunnerInput(string|false $input): string
{
    if ($input === false) {
        throw new RuntimeException('Failed to read request from stdin.');
    }

    return $input;
}
