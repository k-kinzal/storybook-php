<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionClass;
use ReflectionException;
use ReflectionParameter;
use stdClass;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\Runtime\Contract\TypeScope;

/**
 * Hydrates an object through reflected properties without invoking constructors,
 * setters, or factories. Existing instances and enum cases are preserved.
 * Interfaces and abstract classes resolve through `types`.
 *
 * @throws HydrationException when the value is not a property map or cannot satisfy a property contract
 *
 * @example Filling properties without construction
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypes(null);
 *     $scope = \StorybookPhp\Runtime\Casting\hydrateObject(\StorybookPhp\Runtime\Contract\TypeScope::class, ['namespace' => 'App', 'className' => 'App\Card'], $ctx);
 *     $scope->className // => 'App\Card'
 */
function hydrateObject(string $className, mixed $value, HydrationContext $context): object
{
    $class = \StorybookPhp\Runtime\Casting\resolveHydrationClass($className, $context);
    if (is_object($value)) {
        if ($value instanceof $class || (\StorybookPhp\Runtime\Contract\typeExists($className) && $value instanceof $className)) {
            return $value;
        }

        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $className, $value, 'An existing object of another class cannot be converted.');
    }
    if (\StorybookPhp\Runtime\Contract\enumTypeExists($class)) {
        return \StorybookPhp\Runtime\Casting\hydrateEnumCase($class, $value, $context);
    }
    if ($class === stdClass::class && is_array($value)) {
        return (object) $value;
    }
    if (!is_array($value) || ($value !== [] && \StorybookPhp\Runtime\Casting\isListArray($value))) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $class, $value, 'Pass an object whose keys are property names. Constructors are not used for type mapping.');
    }

    return \StorybookPhp\Runtime\Casting\hydrateObjectFromMap($class, \StorybookPhp\Runtime\Casting\stringKeyedState($value), $context);
}

/**
 * Hydrates a generic class such as `Collection<Item>` by binding the class's
 * `@template` names to the documented arguments before building the object.
 *
 * @param list<TypeNode> $arguments
 * @throws HydrationException when the class cannot be built from the value
 */
function hydrateGenericObject(string $className, array $arguments, mixed $value, HydrationContext $context): object
{
    $class = \StorybookPhp\Runtime\Casting\resolveHydrationClass($className, $context);
    $bound = [];
    if (!\StorybookPhp\Runtime\Contract\enumTypeExists($class)) {
        $names = \StorybookPhp\Runtime\Contract\parseDocBlockTemplates((new ReflectionClass($class))->getDocComment());
        foreach ($arguments as $index => $argument) {
            if (isset($names[$index])) {
                $bound[$names[$index]] = $argument;
            }
        }
    }

    return \StorybookPhp\Runtime\Casting\hydrateObject($class, $value, $context->withTemplates(array_merge($context->templates, $bound)));
}

/**
 * Resolves the class that will be instantiated for a type name, following
 * type bindings and rejecting types that cannot be built.
 *
 * @return class-string
 * @throws HydrationException when the type is missing, abstract, an unbound interface, or not instantiable
 *
 * @example Interfaces need a binding
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypes(['Stringable' => \StorybookPhp\Runtime\Contract\HydrationException::class]);
 *     \StorybookPhp\Runtime\Casting\resolveHydrationClass('Stringable', $ctx) // => 'StorybookPhp\Runtime\Contract\HydrationException'
 *     \StorybookPhp\Runtime\Casting\resolveHydrationClass('Countable', $ctx) // throws \StorybookPhp\Runtime\Contract\HydrationException: Countable is an interface
 */
function resolveHydrationClass(string $className, HydrationContext $context): string
{
    $bound = \StorybookPhp\Runtime\Contract\boundTypeName($className, $context->bindings);
    $via = strcasecmp($bound, ltrim($className, '\\')) === 0 ? '' : " (bound from {$className} by types)";
    if (\StorybookPhp\Runtime\Contract\enumTypeExists($bound)) {
        return \StorybookPhp\Runtime\Contract\requireExistingClass($bound);
    }
    if (!class_exists($bound) && !interface_exists($bound)) {
        throw new HydrationException($context->path, "the type {$bound}{$via} does not exist. Check the docblock type, make sure the class is autoloadable from the bootstrap file, or add a types binding for it.");
    }
    $reflection = new ReflectionClass($bound);
    if ($reflection->isInterface() || $reflection->isAbstract()) {
        $kind = $reflection->isInterface() ? 'an interface' : 'an abstract class';
        $hint = json_encode([$bound => 'App\\ConcreteClass']);
        throw new HydrationException($context->path, "{$bound}{$via} is {$kind}, so no object can be built from the story value. Add a types binding such as {$hint} to choose the class to instantiate.");
    }
    return $reflection->getName();
}

/**
 * Resolves an enum case from its name or backed value.
 *
 * @param class-string $enumClass
 * @throws HydrationException when no case matches
 */
function hydrateEnumCase(string $enumClass, mixed $value, HydrationContext $context): object
{
    $case = \StorybookPhp\Runtime\Contract\findEnumCase($enumClass, $value);
    if ($case !== null) {
        return $case;
    }
    $cases = [];
    foreach ((new ReflectionClass($enumClass))->getConstants() as $name => $constant) {
        $backed = is_object($constant) && property_exists($constant, 'value') ? $constant->value : null;
        $cases[] = is_scalar($backed) ? "{$name} (" . var_export($backed, true) . ')' : $name;
    }

    throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $enumClass, $value, 'Valid cases: ' . implode(', ', $cases) . '.');
}

/**
 * Allocates an object without construction and hydrates its properties.
 *
 * @param class-string $class
 * @param array<string, mixed> $state
 * @throws HydrationException when allocation fails or a property cannot be assigned
 */
function hydrateObjectFromMap(string $class, array $state, HydrationContext $context): object
{
    $reflection = new ReflectionClass($class);
    $merged = array_merge($state, \StorybookPhp\Runtime\Casting\boundStateValues($reflection, $context));
    try {
        $instance = $reflection->newInstanceWithoutConstructor();
    } catch (ReflectionException $exception) {
        throw new HydrationException($context->path, "{$class} cannot be allocated without its constructor. Use a component adapter for this value.", $exception);
    }
    \StorybookPhp\Runtime\Casting\applyObjectState($instance, $merged, $context);

    return $instance;
}

/**
 * Converts one value for a parameter: checks `null` against the native
 * declaration, builds the parameter contract, and hydrates the value.
 *
 * @param array<string, mixed>|null $argDef generated argument definition with type overrides
 * @param TypeScope|null $scope resolution scope of the declaring callable, built on demand when omitted
 * @throws HydrationException when the value cannot satisfy the parameter
 *
 * @example Converting a documented array parameter
 *     $parameter = new \ReflectionParameter([\StorybookPhp\Runtime\Casting\HydrationContext::class, 'withTemplates'], 'templates');
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypes(null);
 *     $templates = \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, ['T' => ['kind' => 'named', 'name' => 'int']], 'array<string, TypeNode>', null, $ctx);
 *     $templates['T']->name // => 'int'
 */
function hydrateParameterValue(ReflectionParameter $parameter, mixed $value, ?string $docType, ?array $argDef, HydrationContext $context, ?TypeScope $scope = null): mixed
{
    $slot = $context->at(\StorybookPhp\Runtime\Casting\parameterLabel($parameter));
    if ($value === null) {
        if (!\StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull($parameter->getType())) {
            throw new HydrationException($slot->path, 'the parameter is declared as ' . $parameter->getType() . ' and does not accept null.');
        }

        return null;
    }

    return \StorybookPhp\Runtime\Casting\hydrateValue(
        $value,
        \StorybookPhp\Runtime\Casting\parameterContract($parameter, $docType, $argDef, $context, $scope),
        $slot,
    );
}

/**
 * Allocates a class from a property map without calling its constructor.
 *
 * Kept as the entry point for adapters and tests; see {@see hydrateObject()}.
 *
 * @param class-string $className
 * @param array<string, mixed>|null $types
 * @throws HydrationException when the class cannot be built from the value
 *
 * @example Building a value object from properties
 *     $exception = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(\StorybookPhp\Runtime\Contract\HydrationException::class, ['path' => 'App\Card::$x', 'reason' => 'bad']);
 *     $exception->path // => 'App\Card::$x'
 */
function instantiateClassFromValue(string $className, mixed $value, ?array $types = null): object
{
    return \StorybookPhp\Runtime\Casting\hydrateObject($className, $value, HydrationContext::fromTypes($types));
}
