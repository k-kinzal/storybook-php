<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Execution;

use ReflectionException;
use ReflectionFunctionAbstract;

/**
 * Resolves template arguments from a validated execution context.
 *
 * @param array<string, mixed> $context
 * @param array<string, mixed>|null $templateInput
 * @return array<string, mixed>
 * @throws ReflectionException when reflection cannot expose a parameter default
 */
function resolveTemplateContextArgs(array $context, ?array $templateInput = null): array
{
    $templateArgsSource = $templateInput ?? $context['templateArgs'] ?? $context['publicArgs'] ?? [];
    $templateArgs = [];
    if (is_array($templateArgsSource)) {
        foreach ($templateArgsSource as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $templateArgs[$key] = $value;
        }
    }
    $publicArgDefsSource = $context['publicArgDefs'] ?? null;
    if (!is_array($publicArgDefsSource)) {
        $publicArgDefs = null;
    } else {
        $publicArgDefs = [];
        foreach ($publicArgDefsSource as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $publicArgDefs[$key] = $value;
        }
    }
    $typeMapSource = $context['typeMap'] ?? null;
    if (!is_array($typeMapSource)) {
        $typeMap = null;
    } else {
        $typeMap = [];
        foreach ($typeMapSource as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $typeMap[$key] = $value;
        }
    }

    return $publicArgDefs !== null
        ? \StorybookPhp\Runtime\Casting\castTemplateArgs($templateArgs, $publicArgDefs, $typeMap)
        : $templateArgs;
}

/**
 * @param array<string, mixed> $resolvedArgs
 * @return list<mixed>
 */
function orderResolvedArgs(?ReflectionFunctionAbstract $ref, array $resolvedArgs): array
{
    if (!$ref instanceof ReflectionFunctionAbstract) {
        return [];
    }

    $ordered = [];
    foreach ($ref->getParameters() as $param) {
        $name = $param->getName();
        if (!array_key_exists($name, $resolvedArgs)) {
            continue;
        }

        $value = $resolvedArgs[$name];
        if ($param->isVariadic()) {
            $values = is_array($value) && \StorybookPhp\Runtime\Casting\isListArray($value) ? $value : [$value];
            foreach ($values as $item) {
                $ordered[] = $item;
            }
            continue;
        }

        $ordered[] = $value;
    }

    return $ordered;
}

/**
 * @param array<string, mixed> $publicArgs
 * @param array<string, mixed> $templateArgs
 * @param array<string, mixed> $constructorArgs
 * @param array<string, mixed> $methodArgs
 * @return array{
 *   html: string,
 *   result?: mixed,
 *   buffered?: string,
 *   instance?: object|null,
 *   publicArgs?: array<string, mixed>,
 *   templateArgs?: array<string, mixed>,
 *   constructorArgs?: array<string, mixed>,
 *   methodArgs?: array<string, mixed>,
 *   enumCaseValue?: mixed
 * }
 */
function buildExecutionResponse(
    string $html,
    mixed $result,
    string $buffered,
    ?object $instance,
    array $publicArgs,
    array $templateArgs = [],
    array $constructorArgs = [],
    array $methodArgs = [],
    mixed $enumCaseValue = null,
): array {
    $response = [
        'html' => $html,
        'result' => $result,
        'buffered' => $buffered,
        'instance' => $instance,
        'publicArgs' => $publicArgs,
        'templateArgs' => $templateArgs,
        'constructorArgs' => $constructorArgs,
        'methodArgs' => $methodArgs,
    ];

    if ($enumCaseValue !== null) {
        $response['enumCaseValue'] = $enumCaseValue;
    }

    return $response;
}
