<?php

declare(strict_types=1);

/**
 * @return RunnerRequest
 */
function readRunnerRequest(string $input): array
{
    $decoded = decodeRunnerRequest($input);
    $type = requireRunnerRenderType($decoded);
    $file = requireRunnerStringField($decoded, 'file');
    $args = runnerObjectField($decoded, 'args', false) ?? [];
    $adapters = runnerListField($decoded, 'adapters');

    return [
        'type' => $type,
        'file' => $file,
        'sourceFile' => runnerOptionalStringField($decoded, 'sourceFile'),
        'class' => runnerOptionalStringField($decoded, 'class'),
        'callable' => runnerOptionalStringField($decoded, 'callable'),
        'args' => normalizeStringKeyArray($args, 'args'),
        'publicArgDefs' => runnerObjectField($decoded, 'publicArgDefs'),
        'constructorArgDefs' => runnerObjectField($decoded, 'constructorArgDefs'),
        'callableArgDefs' => runnerObjectField($decoded, 'callableArgDefs'),
        'bootstrap' => runnerOptionalStringField($decoded, 'bootstrap'),
        'adapters' => $adapters === null ? null : normalizeStringList($adapters, 'adapters'),
        'typeMap' => runnerObjectField($decoded, 'typeMap'),
    ];
}

/** @return StringMap */
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

    return normalizeStringKeyArray($decoded, 'request');
}

/**
 * @param array<string, mixed> $decoded
 * @return RenderType
 */
function requireRunnerRenderType(array $decoded): string
{
    $type = $decoded['type'] ?? null;
    if (!is_string($type) || !isRenderType($type)) {
        throw new RuntimeException('Request field "type" is invalid.');
    }

    return $type;
}

/** @param array<string, mixed> $decoded */
function requireRunnerStringField(array $decoded, string $field): string
{
    $value = $decoded[$field] ?? null;
    if (!is_string($value) || $value === '') {
        throw new RuntimeException("Request field \"{$field}\" is required.");
    }

    return $value;
}

/** @param array<string, mixed> $decoded */
function runnerOptionalStringField(array $decoded, string $field): ?string
{
    $value = $decoded[$field] ?? null;
    if ($value !== null && !is_string($value)) {
        throw new RuntimeException("Request field \"{$field}\" must be a string or null.");
    }

    return $value;
}

/**
 * @param StringMap $decoded
 * @return StringMap|null
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

    return normalizeStringKeyArray($value, $field);
}

/**
 * @param StringMap $decoded
 * @return array<array-key, mixed>|null
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
 * @codeCoverageIgnore
 * @throws RuntimeException when stdin cannot be read
 */
function readRunnerStdin(): string
{
    $input = file_get_contents('php://stdin');
    if ($input === false) {
        throw new RuntimeException('Failed to read request from stdin.');
    }

    return $input;
}
