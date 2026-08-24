<?php

declare(strict_types=1);

/**
 * @param HydratedExecutionContext $context
 * @return MappedExecutionArgs
 */
function mapPublicArgsToExecutionTargets(array $context): array
{
    $storyArgs = $context['publicArgs'];

    if ($context['type'] === 'template') {
        $templateArgs = [];
        foreach ($storyArgs as $key => $value) {
            if (str_starts_with($key, 'constructor.') || str_starts_with($key, 'method.')) {
                continue;
            }
            $templateArgs[$key] = $value;
        }

        return ['template' => $templateArgs];
    }

    $mapped = [];
    $constructorArgDefs = normalizeNamedArgDefMap($context['constructorArgDefs'] ?? null);
    if ($constructorArgDefs !== null && $constructorArgDefs !== []) {
        $mapped['constructor'] = projectPublicArgsToTarget($storyArgs, $constructorArgDefs, 'constructor');
    } elseif ($context['type'] === 'classMethod') {
        $mapped['constructor'] = projectNamespacedPublicArgs($storyArgs, 'constructor');
    }

    $callableArgDefs = normalizeNamedArgDefMap($context['callableArgDefs'] ?? null);
    if ($callableArgDefs !== null && $callableArgDefs !== []) {
        $mapped['method'] = projectPublicArgsToTarget($storyArgs, $callableArgDefs, 'method');
    } elseif ($context['type'] !== 'template') {
        $mapped['method'] = projectNamespacedPublicArgs($storyArgs, 'method');
    }

    return $mapped;
}

/**
 * @param array<string, mixed> $storyArgs
 * @param array<string, mixed> $targetArgDefs
 * @return array<string, mixed>
 */
function projectPublicArgsToTarget(array $storyArgs, array $targetArgDefs, string $scope): array
{
    $mapped = [];

    foreach (array_keys($targetArgDefs) as $name) {
        $scopedKey = $scope . '.' . $name;
        if (array_key_exists($scopedKey, $storyArgs)) {
            $mapped[$name] = $storyArgs[$scopedKey];
            continue;
        }

        if (array_key_exists($name, $storyArgs)) {
            $mapped[$name] = $storyArgs[$name];
        }
    }

    return $mapped;
}

/**
 * @param array<string, mixed> $storyArgs
 * @return array<string, mixed>
 */
function projectNamespacedPublicArgs(array $storyArgs, string $scope): array
{
    $mapped = [];

    foreach ($storyArgs as $key => $value) {
        if (str_starts_with($key, 'constructor.')) {
            if ($scope === 'constructor') {
                $mapped[substr($key, strlen('constructor.'))] = $value;
            }
            continue;
        }

        if (str_starts_with($key, 'method.')) {
            if ($scope === 'method') {
                $mapped[substr($key, strlen('method.'))] = $value;
            }
            continue;
        }

        $mapped[$key] = $value;
    }

    return $mapped;
}
