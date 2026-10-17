<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

/**
 * Normalises the `types` map sent by Storybook into type bindings
 * and slot bindings.
 *
 * Supported keys:
 *
 * | key                          | meaning                                                    |
 * |------------------------------|------------------------------------------------------------|
 * | `App\Renderable`             | build this concrete class wherever the type is expected    |
 * | `App\Card::$body`            | the `body` property of `App\Card` |
 *
 * A binding value is either a type name string or an object with `type`
 * (replace the expected type) and/or `value` (replace the incoming value).
 *
 * @param array<array-key, mixed>|null $types
 * @return array{types: array<string, string>, slots: array<string, array{type: string|null, value: mixed, hasValue: bool}>}
 * @throws HydrationException when a binding key or value has an unsupported shape
 *
 * @example Normalising type and slot bindings
 *     $bindings = \StorybookPhp\Runtime\Contract\normalizeTypeMappings([
 *         'App\Renderable' => 'App\HtmlBlock',
 *         'App\Card::$meta' => ['value' => ['theme' => 'dark']],
 *     ]);
 *     $bindings['types'] // => ['app\renderable' => 'App\HtmlBlock']
 *     $bindings['slots']['app\card::$meta'] // => ['type' => null, 'value' => ['theme' => 'dark'], 'hasValue' => true]
 */
function normalizeTypeMappings(?array $types): array
{
    $normalized = ['types' => [], 'slots' => []];
    if ($types === null) {
        return $normalized;
    }
    foreach ($types as $key => $binding) {
        if (!is_string($key)) {
            throw new HydrationException('', "types key '{$key}' is not supported. Use a fully qualified type name or Class::\$property. Configure component arguments under components.");
        }
        $slot = \StorybookPhp\Runtime\Contract\parseBindingKey($key);
        $value = \StorybookPhp\Runtime\Contract\normalizeBindingValue($key, $binding);
        if ($slot === null) {
            if ($value['type'] === null || $value['hasValue'] || \StorybookPhp\Runtime\Contract\parseBindingKey($value['type']) !== null) {
                throw new HydrationException('', "types binding '{$key}' maps a type, so it needs a concrete class name such as {\"{$key}\": \"App\\\\Concrete\"}.");
            }
            $normalized['types'][strtolower(ltrim($key, '\\'))] = $value['type'];
            continue;
        }
        $normalized['slots'][$slot] = $value;
    }

    return $normalized;
}

/**
 * Converts a slot binding key into its lowercased canonical form, or returns
 * null when the key names a type.
 *
 * @throws HydrationException when the key has an unsupported shape
 *
 * @example Canonical slot keys
 *     \StorybookPhp\Runtime\Contract\parseBindingKey('\App\Card::$body') // => 'app\card::$body'
 *     \StorybookPhp\Runtime\Contract\parseBindingKey('App\Renderable') // => null
 */
function parseBindingKey(string $key): ?string
{
    $trimmed = ltrim(trim($key), '\\');
    if (preg_match('/^(?P<class>[A-Za-z_][A-Za-z0-9_\\\\]*)::\$(?P<name>[A-Za-z_][A-Za-z0-9_]*)$/', $trimmed, $match) === 1) {
        return strtolower($match['class']) . '::$' . $match['name'];
    }
    if (preg_match('/^[A-Za-z_][A-Za-z0-9_\\\\]*$/', $trimmed) === 1) {
        return null;
    }

    throw new HydrationException('', "types key '{$key}' is not supported. Use a fully qualified type name or Class::\$property. Configure component arguments under components.");
}

/**
 * @return array{type: string|null, value: mixed, hasValue: bool}
 * @throws HydrationException when the value is neither a type name nor a type/value object
 */
function normalizeBindingValue(string $key, mixed $binding): array
{
    if (is_string($binding)) {
        if (trim($binding) === '') {
            throw new HydrationException('', "types binding '{$key}' has an empty type name.");
        }

        return ['type' => ltrim(trim($binding), '\\'), 'value' => null, 'hasValue' => false];
    }
    if (!is_array($binding) || (!array_key_exists('type', $binding) && !array_key_exists('value', $binding))) {
        throw new HydrationException('', "types binding '{$key}' must be a type name string or an object with 'type' and/or 'value', received " . get_debug_type($binding) . '.');
    }
    $type = $binding['type'] ?? null;
    if ($type !== null && (!is_string($type) || trim($type) === '')) {
        throw new HydrationException('', "types binding '{$key}' has a 'type' that is not a type name string.");
    }

    return [
        'type' => is_string($type) ? ltrim(trim($type), '\\') : null,
        'value' => $binding['value'] ?? null,
        'hasValue' => array_key_exists('value', $binding),
    ];
}

/**
 * Follows type bindings from an interface or abstract type to the concrete
 * class configured for it. Returns the input when no binding applies.
 *
 * @param array{types: array<string, string>, slots: array<string, array{type: string|null, value: mixed, hasValue: bool}>} $bindings
 * @throws HydrationException when bindings form a cycle
 *
 * @example Chained bindings resolve to the last concrete type
 *     $bindings = \StorybookPhp\Runtime\Contract\normalizeTypeMappings(['App\A' => 'App\B', 'App\B' => 'App\C']);
 *     \StorybookPhp\Runtime\Contract\boundTypeName('App\A', $bindings) // => 'App\C'
 *     \StorybookPhp\Runtime\Contract\boundTypeName('App\Other', $bindings) // => 'App\Other'
 */
function boundTypeName(string $typeName, array $bindings): string
{
    $current = ltrim($typeName, '\\');
    $seen = [];
    while (isset($bindings['types'][strtolower($current)])) {
        if (isset($seen[strtolower($current)])) {
            throw new HydrationException('', "types bindings for '{$typeName}' form a cycle: " . implode(' -> ', array_keys($seen)) . '.');
        }
        $seen[strtolower($current)] = true;
        $current = $bindings['types'][strtolower($current)];
    }

    return $current;
}

/**
 * Finds the first slot binding matching one of the candidate slot keys.
 *
 * @param array{types: array<string, string>, slots: array<string, array{type: string|null, value: mixed, hasValue: bool}>} $bindings
 * @param list<string> $slotKeys canonical keys in priority order, see {@see parseBindingKey()}
 * @return array{type: string|null, value: mixed, hasValue: bool}|null
 *
 * @example Looking up a state slot
 *     $bindings = \StorybookPhp\Runtime\Contract\normalizeTypeMappings(['App\Card::$body' => 'App\HtmlBlock']);
 *     \StorybookPhp\Runtime\Contract\slotBinding(['app\card::$body'], $bindings) // => ['type' => 'App\HtmlBlock', 'value' => null, 'hasValue' => false]
 */
function slotBinding(array $slotKeys, array $bindings): ?array
{
    foreach ($slotKeys as $slotKey) {
        if (isset($bindings['slots'][$slotKey])) {
            return $bindings['slots'][$slotKey];
        }
    }

    return null;
}
