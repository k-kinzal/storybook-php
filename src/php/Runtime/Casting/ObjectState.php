<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionClass;
use ReflectionException;
use ReflectionMethod;
use ReflectionParameter;
use ReflectionProperty;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeScope;

/**
 * Modifier bit that marks a readonly property, mirroring
 * `ReflectionProperty::IS_READONLY` which only exists from PHP 8.1 on.
 */
const READONLY_PROPERTY_MODIFIER = 128;

/**
 * Applies state keys to an existing object through `setX()` methods,
 * properties (any visibility), `__set()`, or dynamic properties on stdClass.
 *
 * @param object $instance +mut the object whose state is rewritten
 * @param array<string, mixed> $state
 * @throws HydrationException when a key matches no setter or property, or a value cannot be converted
 *
 * @example Rewriting a property after construction
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
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
        if ($slot instanceof ReflectionMethod) {
            $parameter = $slot->getParameters()[0];
            $docType = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($slot)[$parameter->getName()] ?? null;
            $slot->invoke($instance, \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, $value, $docType, null, $context));
        } elseif ($slot instanceof ReflectionProperty) {
            $scopes[$slot->getDeclaringClass()->getName()] ??= \StorybookPhp\Runtime\Contract\typeScopeForProperty($slot);
            \StorybookPhp\Runtime\Casting\assignProperty($instance, $slot, $value, $context, $scopes[$slot->getDeclaringClass()->getName()]);
        } elseif ($reflection->hasMethod('__set')) {
            \StorybookPhp\Runtime\Casting\invokeMagicSetter($instance, $key, $value);
        } else {
            throw new HydrationException(
                $context->at($reflection->getName() . '::$' . $key)->path,
                "{$reflection->getName()} has no constructor argument, setter, or property named '{$key}'. Available state: [" . implode(', ', \StorybookPhp\Runtime\Casting\describeStateSlots($reflection)) . '].',
            );
        }
    }
}

/**
 * Routes a state key through the object's `__set()` magic method.
 *
 * @param object $instance +mut the object receiving the dynamic state
 * @throws HydrationException when the object has no `__set()` method
 */
function invokeMagicSetter(object $instance, string $key, mixed $value): void
{
    try {
        (new ReflectionMethod($instance, '__set'))->invoke($instance, $key, $value);
    } catch (ReflectionException $exception) {
        throw new HydrationException(get_class($instance) . '::$' . $key, 'the class has no __set() method to receive dynamic state.', $exception);
    }
}

/**
 * Finds the public `setX()` method or the property that stores a state key.
 *
 * @param ReflectionClass<object> $reflection
 */
function findStateSlot(ReflectionClass $reflection, string $key): ReflectionMethod|ReflectionProperty|null
{
    $normalized = \StorybookPhp\Runtime\Casting\normalizeStateKey($key);
    foreach ($reflection->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
        $name = $method->getName();
        if (
            !$method->isStatic()
            && $method->getNumberOfParameters() >= 1
            && stripos($name, 'set') === 0
            && \StorybookPhp\Runtime\Casting\normalizeStateKey(substr($name, 3)) === $normalized
        ) {
            return $method;
        }
    }
    foreach ($reflection->getProperties() as $property) {
        if (!$property->isStatic() && ($property->getName() === $key || \StorybookPhp\Runtime\Casting\normalizeStateKey($property->getName()) === $normalized)) {
            return $property;
        }
    }

    return null;
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
        throw new HydrationException($slot->path, 'the property is readonly and was already initialised by the constructor. Pass the value as a constructor argument instead.');
    }
    if ($value === null && !\StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull($property->getType())) {
        throw new HydrationException($slot->path, 'the property is declared as ' . $property->getType() . ' and does not accept null.');
    }
    $hydrated = $value === null ? null : \StorybookPhp\Runtime\Casting\hydrateValue($value, \StorybookPhp\Runtime\Casting\propertyContract($property, $context, $scope), $slot);
    @$property->setAccessible(true);
    $property->setValue($instance, $hydrated);
}

/**
 * Lists constructor arguments, setters, and properties for error messages.
 *
 * @param ReflectionClass<object> $reflection
 * @return list<string>
 */
function describeStateSlots(ReflectionClass $reflection): array
{
    $slots = [];
    $constructor = $reflection->getConstructor();
    if ($constructor instanceof ReflectionMethod) {
        foreach ($constructor->getParameters() as $parameter) {
            $slots[] = '$' . $parameter->getName();
        }
    }
    foreach ($reflection->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
        if (!$method->isStatic() && stripos($method->getName(), 'set') === 0 && $method->getNumberOfParameters() >= 1) {
            $slots[] = $method->getName() . '()';
        }
    }
    foreach ($reflection->getProperties() as $property) {
        if (!$property->isStatic() && !$property->isPromoted()) {
            $slots[] = '$' . $property->getName();
        }
    }

    return array_values(array_unique($slots));
}

/**
 * Renders a constructor signature such as `__construct(string $label, int $count = 0)`.
 *
 * @param ReflectionClass<object> $reflection
 *
 * @example Signature rendering
 *     \StorybookPhp\Runtime\Casting\describeConstructor(new \ReflectionClass(\StorybookPhp\Runtime\Contract\HydrationException::class)) // => '__construct(string $path, string $reason, ?Throwable $previous = null)'
 *     \StorybookPhp\Runtime\Casting\describeConstructor(new \ReflectionClass(\stdClass::class)) // => 'no constructor'
 */
function describeConstructor(ReflectionClass $reflection): string
{
    $constructor = $reflection->getConstructor();
    if (!$constructor instanceof ReflectionMethod) {
        return 'no constructor';
    }
    $parameters = [];
    foreach ($constructor->getParameters() as $parameter) {
        $type = $parameter->getType();
        $rendered = ($type === null ? '' : $type . ' ') . ($parameter->isVariadic() ? '...' : '') . '$' . $parameter->getName();
        if ($parameter->isDefaultValueAvailable()) {
            $default = \StorybookPhp\Runtime\Casting\parameterDefaultValue($parameter);
            $rendered .= ' = ' . ($default === null ? 'null' : str_replace("\n", '', var_export($default, true)));
        }
        $parameters[] = $rendered;
    }

    return '__construct(' . implode(', ', $parameters) . ')';
}

/**
 * Reports whether an array can feed the class constructor, used to rank union members.
 *
 * @param class-string $class
 * @param array<array-key, mixed> $value
 */
function canHydrateObjectFromArray(string $class, array $value): bool
{
    $reflection = new ReflectionClass($class);
    if (!$reflection->isInstantiable()) {
        return false;
    }
    $constructor = $reflection->getConstructor();
    if (\StorybookPhp\Runtime\Casting\isListArray($value) && $value !== []) {
        if (!$constructor instanceof ReflectionMethod) {
            return false;
        }
        $count = \StorybookPhp\Runtime\Casting\constructorWrapsList($constructor) ? 1 : count($value);
        $parameters = $constructor->getParameters();
        $last = $parameters[count($parameters) - 1] ?? null;

        return $count >= $constructor->getNumberOfRequiredParameters()
            && ($count <= count($parameters) || ($last instanceof ReflectionParameter && $last->isVariadic()));
    }
    if (!$constructor instanceof ReflectionMethod) {
        return true;
    }
    $state = \StorybookPhp\Runtime\Casting\stringKeyedState($value);
    foreach ($constructor->getParameters() as $parameter) {
        if (!$parameter->isOptional() && !$parameter->allowsNull() && \StorybookPhp\Runtime\Casting\findStateKey($parameter->getName(), $state) === null) {
            return false;
        }
    }

    return true;
}

/**
 * Reports whether a scalar can feed the class constructor.
 *
 * @param class-string $class
 */
function canHydrateObjectFromScalar(string $class): bool
{
    $constructor = (new ReflectionClass($class))->getConstructor();

    return $constructor instanceof ReflectionMethod
        && $constructor->getNumberOfParameters() >= 1
        && $constructor->getNumberOfRequiredParameters() <= 1;
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
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(['bindings' => ['StorybookPhp\Runtime\Contract\TypeScope::$namespace' => ['value' => 'App']]]);
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
