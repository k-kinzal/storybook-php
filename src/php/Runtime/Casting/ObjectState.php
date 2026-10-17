<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionClass;
use ReflectionProperty;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeScope;

/**
 * Modifier bit that marks a readonly property, mirroring
 * `ReflectionProperty::IS_READONLY` which only exists from PHP 8.1 on.
 */
const READONLY_PROPERTY_MODIFIER = 128;

/**
 * Applies state keys to reflected properties of any visibility, including parent private properties.
 *
 * @param object $instance +mut the object whose state is rewritten
 * @param array<string, mixed> $state
 * @throws HydrationException when a key matches no property or a value cannot be converted
 *
 * @example Rewriting a property after construction
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypes(null);
 *     $scope = new \StorybookPhp\Runtime\Contract\TypeScope('App');
 *     \StorybookPhp\Runtime\Casting\applyObjectState($scope, ['class_name' => 'App\Card'], $ctx);
 *     $scope->className // => 'App\Card'
 */
function applyObjectState(object $instance, array $state, HydrationContext $context): void
{
    $reflection = new ReflectionClass($instance);
    $scopes = [];
    foreach ($state as $key => $value) {
        $slot = \StorybookPhp\Runtime\Casting\findStateSlot($reflection, $key);
        if ($slot instanceof ReflectionProperty) {
            $scopes[$slot->getDeclaringClass()->getName()] ??= \StorybookPhp\Runtime\Contract\typeScopeForProperty($slot);
            \StorybookPhp\Runtime\Casting\assignProperty($instance, $slot, $value, $context, $scopes[$slot->getDeclaringClass()->getName()]);
        } else {
            throw new HydrationException(
                $context->at($reflection->getName() . '::$' . $key)->path,
                "{$reflection->getName()} has no property named '{$key}'. Available properties: [" . implode(', ', \StorybookPhp\Runtime\Casting\describeStateSlots($reflection)) . '].',
            );
        }
    }
}

/**
 * Finds the property that stores a state key, including inherited private properties.
 *
 * @param ReflectionClass<object> $reflection
 */
function findStateSlot(ReflectionClass $reflection, string $key): ?ReflectionProperty
{
    $normalized = \StorybookPhp\Runtime\Casting\normalizeStateKey($key);
    $fallback = null;
    for ($name = $reflection->getName(); $name !== false; $name = get_parent_class($name)) {
        $current = new ReflectionClass($name);
        foreach ($current->getProperties() as $property) {
            if ($property->isStatic()) {
                continue;
            }
            if ($property->getName() === $key) {
                return $property;
            }
            if (\StorybookPhp\Runtime\Casting\normalizeStateKey($property->getName()) === $normalized) {
                $fallback ??= $property;
            }
        }
    }

    return $fallback;
}

/**
 * Assigns a hydrated value to a property, including private and protected ones.
 *
 * @param object $instance +mut the object whose property is written
 * @param TypeScope|null $scope resolution scope of the declaring class, built on demand when omitted
 * @throws HydrationException when the property is read-only and already initialised, rejects null, or the value cannot be converted
 */
function assignProperty(object $instance, ReflectionProperty $property, mixed $value, HydrationContext $context, ?TypeScope $scope = null): void
{
    $slot = $context->at(\StorybookPhp\Runtime\Casting\propertyLabel($property));
    if (($property->getModifiers() & READONLY_PROPERTY_MODIFIER) !== 0 && $property->isInitialized($instance)) {
        throw new HydrationException($slot->path, 'the property is readonly and has already been initialised. Pass its value when hydrating a new object.');
    }
    if ($value === null && !\StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull($property->getType())) {
        throw new HydrationException($slot->path, 'the property is declared as ' . $property->getType() . ' and does not accept null.');
    }
    $hydrated = $value === null ? null : \StorybookPhp\Runtime\Casting\hydrateValue($value, \StorybookPhp\Runtime\Casting\propertyContract($property, $context, $scope), $slot);
    @$property->setAccessible(true);
    $property->setValue($instance, $hydrated);
}

/**
 * Lists instance properties for error messages.
 *
 * @param ReflectionClass<object> $reflection
 * @return list<string>
 */
function describeStateSlots(ReflectionClass $reflection): array
{
    $slots = [];
    for ($name = $reflection->getName(); $name !== false; $name = get_parent_class($name)) {
        $current = new ReflectionClass($name);
        foreach ($current->getProperties() as $property) {
            if (!$property->isStatic()) {
                $slots[] = '$' . $property->getName();
            }
        }
    }

    return array_values(array_unique($slots));
}

/**
 * Reports whether an array is a property map for a concrete class, used to rank union members.
 *
 * @param class-string $class
 * @param array<array-key, mixed> $value
 */
function canHydrateObjectFromArray(string $class, array $value): bool
{
    $reflection = new ReflectionClass($class);

    if ($reflection->isAbstract() || ($value !== [] && \StorybookPhp\Runtime\Casting\isListArray($value))) {
        return false;
    }
    foreach (array_keys($value) as $key) {
        if (!\StorybookPhp\Runtime\Casting\findStateSlot($reflection, (string) $key) instanceof ReflectionProperty) {
            return false;
        }
    }

    return true;
}

/**
 * Finds the state key that stores a parameter or property, preferring an
 * exact match over a case- and underscore-insensitive one.
 *
 * @param array<string, mixed> $state
 *
 * @example Matching snake_case input to camelCase state
 *     \StorybookPhp\Runtime\Casting\findStateKey('userName', ['user_name' => 'a']) // => 'user_name'
 *     \StorybookPhp\Runtime\Casting\findStateKey('userName', ['other' => 'a']) // => null
 */
function findStateKey(string $name, array $state): ?string
{
    if (array_key_exists($name, $state)) {
        return $name;
    }
    $normalized = \StorybookPhp\Runtime\Casting\normalizeStateKey($name);
    foreach (array_keys($state) as $key) {
        if (\StorybookPhp\Runtime\Casting\normalizeStateKey($key) === $normalized) {
            return $key;
        }
    }

    return null;
}

/**
 * Lowercases a key and drops underscores so `user_name` and `userName` compare equal.
 */
function normalizeStateKey(string $key): string
{
    return strtolower(str_replace('_', '', $key));
}

/**
 * Converts array keys to strings so numeric keys of a JSON object become state names.
 *
 * @param array<array-key, mixed> $value
 * @return array<string, mixed>
 */
function stringKeyedState(array $value): array
{
    $state = [];
    foreach ($value as $key => $item) {
        $state[(string) $key] = $item;
    }

    return $state;
}

/**
 * Collects `Class::$name` bindings that carry a fixed `value` for the class
 * or one of its parents, keyed by the state name they override.
 *
 * @param ReflectionClass<object> $reflection
 * @return array<string, mixed>
 *
 * @example A bound value overrides story input for that state
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypes(['StorybookPhp\Runtime\Contract\TypeScope::$namespace' => ['value' => 'App']]);
 *     \StorybookPhp\Runtime\Casting\boundStateValues(new \ReflectionClass(\StorybookPhp\Runtime\Contract\TypeScope::class), $ctx) // => ['namespace' => 'App']
 */
function boundStateValues(ReflectionClass $reflection, HydrationContext $context): array
{
    $values = [];
    $parents = class_parents($reflection->getName());
    foreach (array_merge([$reflection->getName()], $parents === false ? [] : array_values($parents)) as $className) {
        $prefix = strtolower($className) . '::$';
        foreach ($context->bindings['slots'] as $key => $binding) {
            if ($binding['hasValue'] && str_starts_with($key, $prefix) && !array_key_exists(substr($key, strlen($prefix)), $values)) {
                $values[substr($key, strlen($prefix))] = $binding['value'];
            }
        }
    }

    return $values;
}
