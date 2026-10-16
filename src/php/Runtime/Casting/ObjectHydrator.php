<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionClass;
use ReflectionMethod;
use ReflectionParameter;
use stdClass;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\Runtime\Contract\TypeScope;

/**
 * Builds an object of a class from Storybook input by rewriting its state.
 *
 * - an existing instance is returned unchanged;
 * - an enum receives its case by name or backed value;
 * - an object (associative array) feeds constructor arguments by name, then
 *   applies every remaining key through a `setX()` method or a property;
 * - a list is passed positionally to the constructor, or wrapped into its
 *   single array argument for collection-like classes;
 * - a scalar goes to a constructor with a single required argument.
 *
 * Interfaces and abstract classes resolve through `typeMap.bindings`.
 *
 * @throws HydrationException when the class cannot be built from the value
 *
 * @example Constructor arguments and properties from one object
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
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
    if (is_array($value)) {
        return \StorybookPhp\Runtime\Casting\isListArray($value) && $value !== []
            ? \StorybookPhp\Runtime\Casting\hydrateObjectFromList($class, $value, $context)
            : \StorybookPhp\Runtime\Casting\hydrateObjectFromMap($class, \StorybookPhp\Runtime\Casting\stringKeyedState($value), $context);
    }

    return \StorybookPhp\Runtime\Casting\hydrateObjectFromScalar($class, $value, $context);
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
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(['bindings' => ['Stringable' => \StorybookPhp\Runtime\Contract\HydrationException::class]]);
 *     \StorybookPhp\Runtime\Casting\resolveHydrationClass('Stringable', $ctx) // => 'StorybookPhp\Runtime\Contract\HydrationException'
 *     \StorybookPhp\Runtime\Casting\resolveHydrationClass('Countable', $ctx) // throws \StorybookPhp\Runtime\Contract\HydrationException: Countable is an interface
 */
function resolveHydrationClass(string $className, HydrationContext $context): string
{
    $bound = \StorybookPhp\Runtime\Contract\boundTypeName($className, $context->bindings);
    $via = strcasecmp($bound, ltrim($className, '\\')) === 0 ? '' : " (bound from {$className} by typeMap)";
    if (\StorybookPhp\Runtime\Contract\enumTypeExists($bound)) {
        return \StorybookPhp\Runtime\Contract\requireExistingClass($bound);
    }
    if (!class_exists($bound) && !interface_exists($bound)) {
        throw new HydrationException($context->path, "the type {$bound}{$via} does not exist. Check the docblock type, make sure the class is autoloadable from the bootstrap file, or add a typeMap binding for it.");
    }
    $reflection = new ReflectionClass($bound);
    if ($reflection->isInterface() || $reflection->isAbstract()) {
        $kind = $reflection->isInterface() ? 'an interface' : 'an abstract class';
        $hint = json_encode([$bound => 'App\\ConcreteClass']);
        throw new HydrationException($context->path, "{$bound}{$via} is {$kind}, so no object can be built from the story value. Add a typeMap binding such as {$hint} to choose the class to instantiate.");
    }
    if (!$reflection->isInstantiable()) {
        throw new HydrationException($context->path, "{$bound}{$via} cannot be instantiated because its constructor is not public. Bind the slot to a value with {\"...\": {\"value\": ...}} or expose a public constructor.");
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
 * Builds an object from an associative array: constructor arguments by name,
 * then setters or properties for the remaining keys.
 *
 * @param class-string $class
 * @param array<string, mixed> $state
 * @throws HydrationException when a required argument is missing or a key cannot be applied
 */
function hydrateObjectFromMap(string $class, array $state, HydrationContext $context): object
{
    $reflection = new ReflectionClass($class);
    $merged = array_merge($state, \StorybookPhp\Runtime\Casting\boundStateValues($reflection, $context));
    [$arguments, $consumed] = \StorybookPhp\Runtime\Casting\constructorArguments($reflection, $merged, $context);
    $instance = $reflection->getConstructor() instanceof ReflectionMethod
        ? $reflection->newInstanceArgs($arguments)
        : $reflection->newInstance();
    \StorybookPhp\Runtime\Casting\applyObjectState($instance, array_diff_key($merged, $consumed), $context);

    return $instance;
}

/**
 * Resolves constructor arguments from an associative array, matching keys to
 * parameter names exactly or through case/underscore-insensitive comparison.
 * `typeMap.classes` entries for the class supply types and defaults for
 * parameters the input does not describe.
 *
 * @param ReflectionClass<object> $reflection
 * @param array<string, mixed> $state
 * @return array{list<mixed>, array<string, true>} ordered arguments and the consumed state keys
 * @throws HydrationException when a required argument is missing or cannot be converted
 */
function constructorArguments(ReflectionClass $reflection, array $state, HydrationContext $context): array
{
    $constructor = $reflection->getConstructor();
    if (!$constructor instanceof ReflectionMethod) {
        return [[], []];
    }
    $docTypes = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($constructor);
    $argDefs = \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs($reflection, null, $context->classTypeMap());
    $scope = \StorybookPhp\Runtime\Contract\typeScopeForFunction($constructor);
    $arguments = [];
    $consumed = [];
    foreach ($constructor->getParameters() as $parameter) {
        $name = $parameter->getName();
        $key = \StorybookPhp\Runtime\Casting\findStateKey($name, $state);
        $argDef = \StorybookPhp\Runtime\Casting\resolveParameterArgDef($name, $argDefs);
        if ($key !== null) {
            $consumed[$key] = true;
        }
        if ($parameter->isVariadic()) {
            $values = $key !== null && is_array($state[$key]) ? $state[$key] : [];
            foreach ($values as $item) {
                $arguments[] = \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, $item, $docTypes[$name] ?? null, $argDef, $context, $scope);
            }
            continue;
        }
        $arguments[] = \StorybookPhp\Runtime\Casting\constructorArgumentValue(
            $parameter,
            $key === null ? [] : ['value' => $state[$key]],
            $argDef,
            $docTypes[$name] ?? null,
            $context,
            $scope,
            'Received keys: [' . implode(', ', array_keys($state)) . '], constructor: ' . \StorybookPhp\Runtime\Casting\describeConstructor($reflection) . '.',
        );
    }

    return [$arguments, $consumed];
}

/**
 * Resolves one constructor argument from, in order: a slot binding value,
 * the supplied input, the `typeMap.classes` default, the PHP default, or
 * null for nullable parameters.
 *
 * @param array{value?: mixed} $input the supplied value, or an empty array when the key was absent
 * @param array<string, mixed>|null $argDef
 * @throws HydrationException when the argument is required but missing, or cannot be converted
 */
function constructorArgumentValue(
    ReflectionParameter $parameter,
    array $input,
    ?array $argDef,
    ?string $docType,
    HydrationContext $context,
    TypeScope $scope,
    string $received,
): mixed {
    $binding = \StorybookPhp\Runtime\Contract\slotBinding(\StorybookPhp\Runtime\Casting\parameterSlotKeys($parameter), $context->bindings);
    if ($binding !== null && $binding['hasValue']) {
        return \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, $binding['value'], $docType, $argDef, $context, $scope);
    }
    if (array_key_exists('value', $input)) {
        return \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, $input['value'], $docType, $argDef, $context, $scope);
    }
    if ($argDef !== null && array_key_exists('default', $argDef)) {
        return \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, $argDef['default'], $docType, $argDef, $context, $scope);
    }
    if ($parameter->isDefaultValueAvailable()) {
        return \StorybookPhp\Runtime\Casting\parameterDefaultValue($parameter);
    }
    if ($parameter->allowsNull()) {
        return null;
    }

    throw new HydrationException(
        $context->at(\StorybookPhp\Runtime\Casting\parameterLabel($parameter))->path,
        "the required constructor argument \${$parameter->getName()} is missing. {$received}",
    );
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
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
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
 * Builds an object from a list: the values are wrapped into a single array
 * argument when the constructor is collection-like, otherwise they are
 * passed positionally.
 *
 * @param class-string $class
 * @param list<mixed> $values
 * @throws HydrationException when the list does not fit the constructor
 */
function hydrateObjectFromList(string $class, array $values, HydrationContext $context): object
{
    $reflection = new ReflectionClass($class);
    $constructor = $reflection->getConstructor();
    if (!$constructor instanceof ReflectionMethod) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $class, $values, "{$class} has no constructor, so positional values cannot be applied. Pass an object whose keys are property names instead.");
    }
    $parameters = $constructor->getParameters();
    $docTypes = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($constructor);
    $argDefs = \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs($reflection, null, $context->classTypeMap());
    $scope = \StorybookPhp\Runtime\Contract\typeScopeForFunction($constructor);
    $positional = \StorybookPhp\Runtime\Casting\constructorWrapsList($constructor) ? [$values] : $values;
    $count = count($positional);
    $last = $parameters[count($parameters) - 1] ?? null;
    if ($count < $constructor->getNumberOfRequiredParameters() || ($count > count($parameters) && (!$last instanceof ReflectionParameter || !$last->isVariadic()))) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $class, $values, "{$count} positional value(s) do not fit " . \StorybookPhp\Runtime\Casting\describeConstructor($reflection) . '. Pass an object whose keys are constructor argument names instead.');
    }
    $arguments = [];
    foreach ($positional as $index => $value) {
        $parameter = $parameters[min($index, count($parameters) - 1)];
        $arguments[] = \StorybookPhp\Runtime\Casting\hydrateParameterValue($parameter, $value, $docTypes[$parameter->getName()] ?? null, \StorybookPhp\Runtime\Casting\resolveParameterArgDef($parameter->getName(), $argDefs), $context, $scope);
    }

    return $reflection->newInstanceArgs($arguments);
}

/**
 * Reports whether a constructor takes the whole list as its first array
 * argument, which is the shape of collection wrappers.
 */
function constructorWrapsList(ReflectionMethod $constructor): bool
{
    $first = $constructor->getParameters()[0] ?? null;

    return $first instanceof ReflectionParameter
        && !$first->isVariadic()
        && $constructor->getNumberOfRequiredParameters() <= 1
        && \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($first);
}

/**
 * Reports whether a parameter accepts a PHP array natively or through its documented type.
 */
function reflectionTypeAcceptsArray(ReflectionParameter $parameter): bool
{
    $type = $parameter->getType();
    if ($type === null) {
        return true;
    }
    $node = \StorybookPhp\Runtime\Casting\reflectionTypeNode($type, \StorybookPhp\Runtime\Contract\nativeTypeScope($parameter->getDeclaringFunction()));
    foreach (\StorybookPhp\Runtime\Contract\typeNodeMembers(\StorybookPhp\Runtime\Contract\stripNullFromTypeNode($node ?? new TypeNode('named', 'mixed'))) as $member) {
        if ($member->kind === 'named' && in_array($member->name, ['array', 'iterable', 'mixed'], true)) {
            return true;
        }
    }

    return false;
}

/**
 * Builds an object from a scalar through a constructor with one required argument.
 *
 * @param class-string $class
 * @throws HydrationException when the constructor needs more than one value
 */
function hydrateObjectFromScalar(string $class, mixed $value, HydrationContext $context): object
{
    if (!\StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar($class)) {
        throw \StorybookPhp\Runtime\Casting\hydrationFailure($context, $class, $value, 'A single value only fits a constructor with one required argument, but this class has ' . \StorybookPhp\Runtime\Casting\describeConstructor(new ReflectionClass($class)) . '. Pass an object whose keys are constructor argument names.');
    }

    return \StorybookPhp\Runtime\Casting\hydrateObjectFromList($class, [$value], $context);
}

/**
 * Instantiates a class from Storybook input using the constructor shape when possible.
 *
 * Kept as the entry point for adapters and tests; see {@see hydrateObject()}.
 *
 * @param class-string $className
 * @param array<string, mixed>|null $typeMap
 * @throws HydrationException when the class cannot be built from the value
 *
 * @example Building a value object from a scalar
 *     $exception = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(\StorybookPhp\Runtime\Contract\HydrationException::class, ['path' => 'App\Card::$x', 'reason' => 'bad']);
 *     $exception->path // => 'App\Card::$x'
 */
function instantiateClassFromValue(string $className, mixed $value, ?array $typeMap = null): object
{
    return \StorybookPhp\Runtime\Casting\hydrateObject($className, $value, HydrationContext::fromTypeMap($typeMap));
}
