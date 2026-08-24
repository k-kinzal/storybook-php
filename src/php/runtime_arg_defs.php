<?php

declare(strict_types=1);

/**
 * @return StringMap|null
 */
function normalizeNamedArgDefMap(mixed $value): ?array
{
    if (!is_array($value)) {
        return null;
    }

    $normalized = [];
    foreach ($value as $key => $item) {
        if (!is_string($key)) {
            continue;
        }
        $normalized[$key] = $item;
    }

    return $normalized;
}

/**
 * @param array<string, mixed>|null $targetArgDefs
 * @param array<string, mixed>|null $publicArgDefs
 * @return array<string, mixed>|null
 */
function buildTargetArgDefs(?array $targetArgDefs, ?array $publicArgDefs, string $scope): ?array
{
    if ($targetArgDefs === null) {
        return null;
    }

    $effectiveArgDefs = [];

    foreach ($targetArgDefs as $name => $targetArgDef) {
        if (!is_array($targetArgDef)) {
            continue;
        }

        $normalizedTargetArgDef = normalizeStringKeyArray($targetArgDef, "targetArgDefs.{$name}");
        $effectiveArgDefs[$name] = mergeTargetArgDefForRuntime(
            $normalizedTargetArgDef,
            resolvePublicArgDefForTarget($name, $publicArgDefs, $scope)
        );
    }

    return $effectiveArgDefs;
}

/**
 * @param array<string, mixed>|null $publicArgDefs
 * @return array<string, mixed>|null
 */
function resolvePublicArgDefForTarget(string $name, ?array $publicArgDefs, string $scope): ?array
{
    if ($publicArgDefs === null) {
        return null;
    }

    $scopedKey = $scope . '.' . $name;
    if (isset($publicArgDefs[$scopedKey]) && is_array($publicArgDefs[$scopedKey])) {
        return normalizeStringKeyArray($publicArgDefs[$scopedKey], "publicArgDefs.{$scopedKey}");
    }

    if (isset($publicArgDefs[$name]) && is_array($publicArgDefs[$name])) {
        return normalizeStringKeyArray($publicArgDefs[$name], "publicArgDefs.{$name}");
    }

    return null;
}

/**
 * @param array<string, mixed> $targetArgDef
 * @param array<string, mixed>|null $publicArgDef
 * @return array<string, mixed>
 */
function mergeTargetArgDefForRuntime(array $targetArgDef, ?array $publicArgDef): array
{
    $runtimeTargetArgDef = stripInheritedRuntimeDefault($targetArgDef);

    if ($publicArgDef === null) {
        return $runtimeTargetArgDef;
    }

    $runtimePublicArgDef = $publicArgDef;
    if (
        array_key_exists('default', $runtimePublicArgDef)
        && array_key_exists('default', $targetArgDef)
        && defaultsMatchForRuntime(
            $runtimePublicArgDef['default'],
            $targetArgDef['default']
        )
    ) {
        unset($runtimePublicArgDef['default']);
    }

    return array_merge($runtimeTargetArgDef, $runtimePublicArgDef);
}

/**
 * @param array<string, mixed> $argDef
 * @return array<string, mixed>
 */
function stripInheritedRuntimeDefault(array $argDef): array
{
    if (!array_key_exists('default', $argDef)) {
        return $argDef;
    }

    $stripped = $argDef;
    unset($stripped['default']);

    return $stripped;
}

function defaultsMatchForRuntime(mixed $left, mixed $right): bool
{
    return json_encode($left) === json_encode($right);
}
