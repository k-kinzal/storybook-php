<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use ReflectionException;
use ReflectionIntersectionType;
use ReflectionMethod;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionProperty;
use ReflectionType;
use ReflectionUnionType;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\Runtime\Contract\TypeScope;

/**
 * Converts a reflected PHP type into a type node, resolving `self`, `static`,
 * and `parent` through the scope. Returns null for an untyped declaration.
 *
 * @example Reflected nullable class type
 *     $parameter = new \ReflectionParameter([\StorybookPhp\Runtime\Contract\HydrationException::class, '__construct'], 'previous');
 *     $scope = \StorybookPhp\Runtime\Contract\typeScopeForFunction($parameter->getDeclaringFunction());
 *     $node = \StorybookPhp\Runtime\Casting\reflectionTypeNode($parameter->getType(), $scope);
 *     \StorybookPhp\Runtime\Contract\describeTypeNode($node) // => '?Throwable'
 */
function reflectionTypeNode(?ReflectionType $type, TypeScope $scope): ?TypeNode
{
    if ($type instanceof ReflectionNamedType) {
        $name = \StorybookPhp\Runtime\Contract\resolveTypeName($type->getName(), $scope);
        $node = in_array($name, ['true', 'false'], true)
            ? new TypeNode('literal', '', [], [], [], true, $name === 'true')
            : new TypeNode('named', $name);
        if ($type->allowsNull() && !in_array($name, ['null', 'mixed'], true)) {
            return new TypeNode('nullable', '', [$node]);
        }

        return $node;
    }
    if ($type instanceof ReflectionUnionType || $type instanceof ReflectionIntersectionType) {
        $members = [];
        foreach ($type->getTypes() as $member) {
            $node = \StorybookPhp\Runtime\Casting\reflectionTypeNode($member, $scope);
            if ($node instanceof TypeNode) {
                $members[] = $node;
            }
        }

        return new TypeNode($type instanceof ReflectionUnionType ? 'union' : 'intersection', '', $members);
    }

    return null;
}

/**
 * Refines a native reflection type with a documented type.
 *
 * The native type is authoritative: the documented type only narrows it
 * (`array` + `list<Item>` → `list<Item>`, `Foo|array` + `list<Bar>` →
 * `Foo|list<Bar>`). A documented type that contradicts the native one is
 * ignored so that PHP's own declaration always wins.
 *
 * @example Narrowing an array parameter with its docblock
 *     $native = new \StorybookPhp\Runtime\Contract\TypeNode('named', 'array');
 *     $doc = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{foo: App\Foo}');
 *     \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\refineTypeNode($native, $doc)) // => 'array{foo: App\Foo}'
 *     \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\refineTypeNode($native, null)) // => 'array'
 */
function refineTypeNode(?TypeNode $native, ?TypeNode $doc): TypeNode
{
    if (!$native instanceof TypeNode) {
        return $doc ?? new TypeNode('named', 'mixed');
    }
    if (!$doc instanceof TypeNode) {
        return $native;
    }
    if ($native->kind === 'nullable') {
        $inner = \StorybookPhp\Runtime\Casting\refineTypeNode($native->members[0], \StorybookPhp\Runtime\Contract\stripNullFromTypeNode($doc));

        return new TypeNode('nullable', '', [$inner]);
    }
    if ($native->kind === 'union') {
        $members = [];
        foreach ($native->members as $member) {
            $members[] = \StorybookPhp\Runtime\Casting\refineTypeNode($member, $doc);
        }

        return new TypeNode('union', '', $members);
    }
    if ($native->kind !== 'named') {
        return $native;
    }
    if ($native->name === 'mixed') {
        return $doc;
    }
    $compatible = [];
    foreach (\StorybookPhp\Runtime\Contract\typeNodeMembers(\StorybookPhp\Runtime\Contract\stripNullFromTypeNode($doc)) as $member) {
        if (\StorybookPhp\Runtime\Casting\docTypeRefines($member, $native->name)) {
            $compatible[] = $member;
        }
    }

    return $compatible === [] ? $native : \StorybookPhp\Runtime\Contract\unionTypeNode($compatible);
}

/**
 * Reports whether one documented type narrows a native named type.
 */
function docTypeRefines(TypeNode $doc, string $nativeName): bool
{
    if ($doc->kind === 'nullable') {
        return \StorybookPhp\Runtime\Casting\docTypeRefines($doc->members[0], $nativeName);
    }
    if ($doc->kind === 'named' && $doc->name === 'mixed') {
        return false;
    }
    if (in_array($nativeName, ['array', 'iterable'], true)) {
        return \StorybookPhp\Runtime\Casting\docTypeIsArrayLike($doc) || ($nativeName === 'iterable' && \StorybookPhp\Runtime\Casting\docTypeIsClassLike($doc));
    }
    if ($nativeName === 'object') {
        return \StorybookPhp\Runtime\Casting\docTypeIsClassLike($doc) || ($doc->kind === 'shape' && strtolower($doc->name) === 'object');
    }
    if (\StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($nativeName) !== null) {
        return $doc->kind === 'literal'
            ? get_debug_type($doc->literal) === $nativeName || ($nativeName === 'float' && is_int($doc->literal))
            : $doc->kind === 'named' && $doc->name === $nativeName;
    }
    if ($doc->kind === 'intersection') {
        foreach ($doc->members as $member) {
            if (\StorybookPhp\Runtime\Casting\docTypeRefines($member, $nativeName)) {
                return true;
            }
        }

        return false;
    }

    return \StorybookPhp\Runtime\Casting\docTypeIsClassLike($doc)
        && (strcasecmp($doc->name, $nativeName) === 0 || is_a($doc->name, $nativeName, true));
}

/**
 * Reports whether a documented type produces a PHP array.
 */
function docTypeIsArrayLike(TypeNode $doc): bool
{
    if ($doc->kind === 'shape') {
        return strtolower($doc->name) !== 'object';
    }

    return in_array($doc->kind, ['named', 'generic'], true) && \StorybookPhp\Runtime\Contract\isArrayLikeTypeName($doc->name);
}

/**
 * Reports whether a documented type names a class, interface, or enum.
 */
function docTypeIsClassLike(TypeNode $doc): bool
{
    return in_array($doc->kind, ['named', 'generic'], true)
        && \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($doc->name) === null;
}

/**
 * Builds the contract of a callable parameter from its native type, its
 * docblock, the generated argument definition, and slot bindings.
 *
 * Priority of the documented layer: slot binding `type` > argument
 * definition `type`/`elementType` > `@param`. The result is always refined
 * against the native declaration.
 *
 * @param array<string, mixed>|null $argDef
 * @param TypeScope|null $scope resolution scope of the declaring callable, built on demand when omitted
 * @throws HydrationException when a documented type cannot be parsed
 *
 * @example Contract of a documented array parameter
 *     $parameter = new \ReflectionParameter([\StorybookPhp\Runtime\Casting\HydrationContext::class, 'withTemplates'], 'templates');
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     $node = \StorybookPhp\Runtime\Casting\parameterContract($parameter, 'array<string, TypeNode>', null, $ctx);
 *     \StorybookPhp\Runtime\Contract\describeTypeNode($node) // => 'array<string, StorybookPhp\Runtime\Contract\TypeNode>'
 */
function parameterContract(ReflectionParameter $param, ?string $docType, ?array $argDef, HydrationContext $context, ?TypeScope $scope = null): TypeNode
{
    $resolvedScope = $scope ?? \StorybookPhp\Runtime\Contract\typeScopeForFunction($param->getDeclaringFunction());
    $binding = \StorybookPhp\Runtime\Contract\slotBinding(\StorybookPhp\Runtime\Casting\parameterSlotKeys($param), $context->bindings);
    $documented = $binding['type'] ?? null;
    if ($documented === null && $argDef !== null) {
        $documented = \StorybookPhp\Runtime\Casting\buildOverrideDocType($param, $argDef);
    }
    $documented ??= $docType;

    return \StorybookPhp\Runtime\Casting\refineTypeNode(
        \StorybookPhp\Runtime\Casting\reflectionTypeNode($param->getType(), $resolvedScope),
        \StorybookPhp\Runtime\Casting\documentedTypeNode($documented, $resolvedScope, $context, \StorybookPhp\Runtime\Casting\parameterLabel($param)),
    );
}

/**
 * Builds the contract of a property from its native type, its `@var`
 * docblock (or the constructor `@param` for a promoted property), and slot
 * bindings.
 *
 * @param TypeScope|null $scope resolution scope of the declaring class, built on demand when omitted
 * @param array<string, mixed>|null $argDef `typeMap.classes` definition that overrides the docblock
 * @throws HydrationException when a documented type cannot be parsed
 *
 * @example Contract of a documented property
 *     $property = new \ReflectionProperty(\StorybookPhp\Runtime\Contract\TypeScope::class, 'imports');
 *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null);
 *     \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\propertyContract($property, $ctx)) // => 'array<string, string>'
 */
function propertyContract(ReflectionProperty $property, HydrationContext $context, ?TypeScope $scope = null, ?array $argDef = null): TypeNode
{
    $resolvedScope = $scope ?? \StorybookPhp\Runtime\Contract\typeScopeForProperty($property);
    $binding = \StorybookPhp\Runtime\Contract\slotBinding(\StorybookPhp\Runtime\Casting\propertySlotKeys($property), $context->bindings);
    $documented = $binding['type'] ?? ($argDef === null ? null : \StorybookPhp\Runtime\Casting\argDefDocType($argDef));
    $documented ??= \StorybookPhp\Runtime\Contract\parseDocBlockVarType($property->getDocComment());
    if ($documented === null && $property->isPromoted()) {
        $constructor = $property->getDeclaringClass()->getConstructor();
        $documented = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($constructor)[$property->getName()] ?? null;
    }

    return \StorybookPhp\Runtime\Casting\refineTypeNode(
        \StorybookPhp\Runtime\Casting\reflectionTypeNode($property->getType(), $resolvedScope),
        \StorybookPhp\Runtime\Casting\documentedTypeNode($documented, $resolvedScope, $context, \StorybookPhp\Runtime\Casting\propertyLabel($property)),
    );
}

/**
 * Parses and resolves a documented type, attributing parse errors to the slot.
 *
 * @throws HydrationException when the documented type cannot be parsed
 */
function documentedTypeNode(?string $documented, TypeScope $scope, HydrationContext $context, string $label): ?TypeNode
{
    if ($documented === null || trim($documented) === '') {
        return null;
    }
    try {
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression($documented);
    } catch (HydrationException $exception) {
        throw new HydrationException($label, "the documented type '{$documented}' cannot be parsed: {$exception->reason}", $exception);
    }

    return \StorybookPhp\Runtime\Contract\resolveTypeNode($node, $scope, $context->templates);
}

/**
 * Canonical binding keys that may configure a parameter, most specific first.
 *
 * Constructor parameters also answer to the `Class::$name` state key because
 * they initialise the object's state.
 *
 * @return list<string>
 *
 * @example Keys of a constructor parameter
 *     $parameter = new \ReflectionParameter([\StorybookPhp\Runtime\Contract\TypeScope::class, '__construct'], 'imports');
 *     \StorybookPhp\Runtime\Casting\parameterSlotKeys($parameter) // => ['storybookphp\runtime\contract\typescope::__construct($imports)', 'storybookphp\runtime\contract\typescope::$imports']
 */
function parameterSlotKeys(ReflectionParameter $param): array
{
    $function = $param->getDeclaringFunction();
    $name = $param->getName();
    if (!$function instanceof ReflectionMethod) {
        return [strtolower($function->getName()) . '($' . $name . ')'];
    }
    $class = strtolower($function->getDeclaringClass()->getName());
    $keys = [$class . '::' . strtolower($function->getName()) . '($' . $name . ')'];
    if ($function->isConstructor() || str_starts_with(strtolower($function->getName()), 'set')) {
        $keys[] = $class . '::$' . $name;
    }

    return $keys;
}

/**
 * Canonical binding keys that may configure a property.
 *
 * @return list<string>
 *
 * @example Key of a property
 *     $property = new \ReflectionProperty(\StorybookPhp\Runtime\Contract\TypeScope::class, 'imports');
 *     \StorybookPhp\Runtime\Casting\propertySlotKeys($property) // => ['storybookphp\runtime\contract\typescope::$imports']
 */
function propertySlotKeys(ReflectionProperty $property): array
{
    return [strtolower($property->getDeclaringClass()->getName()) . '::$' . $property->getName()];
}

/**
 * Human-readable slot name of a parameter for error messages.
 *
 * @example Labels
 *     \StorybookPhp\Runtime\Casting\parameterLabel(new \ReflectionParameter([\StorybookPhp\Runtime\Contract\TypeScope::class, '__construct'], 'imports')) // => 'StorybookPhp\Runtime\Contract\TypeScope::__construct($imports)'
 *     \StorybookPhp\Runtime\Casting\parameterLabel(new \ReflectionParameter('StorybookPhp\Runtime\Casting\parameterLabel', 'param')) // => 'StorybookPhp\Runtime\Casting\parameterLabel($param)'
 */
function parameterLabel(ReflectionParameter $param): string
{
    $function = $param->getDeclaringFunction();
    $owner = $function instanceof ReflectionMethod
        ? $function->getDeclaringClass()->getName() . '::' . $function->getName()
        : $function->getName();

    return $owner . '($' . $param->getName() . ')';
}

/**
 * Human-readable slot name of a property for error messages.
 *
 * @example Label
 *     \StorybookPhp\Runtime\Casting\propertyLabel(new \ReflectionProperty(\StorybookPhp\Runtime\Contract\TypeScope::class, 'imports')) // => 'StorybookPhp\Runtime\Contract\TypeScope::$imports'
 */
function propertyLabel(ReflectionProperty $property): string
{
    return $property->getDeclaringClass()->getName() . '::$' . $property->getName();
}

/**
 * Reports whether a reflected declaration accepts `null`; untyped
 * declarations accept everything.
 */
function reflectionTypeAllowsNull(?ReflectionType $type): bool
{
    return !$type instanceof ReflectionType || $type->allowsNull();
}

/**
 * Reads a parameter's declared default value, translating the reflection
 * failure for parameters without a default into a hydration error.
 *
 * @throws HydrationException when the parameter has no readable default value
 *
 * @example Declared defaults are returned as PHP values
 *     $parameter = new \ReflectionParameter([\StorybookPhp\Runtime\Contract\TypeScope::class, '__construct'], 'namespace');
 *     \StorybookPhp\Runtime\Casting\parameterDefaultValue($parameter) // => ''
 */
function parameterDefaultValue(ReflectionParameter $param): mixed
{
    try {
        return $param->getDefaultValue();
    } catch (ReflectionException $exception) {
        throw new HydrationException(\StorybookPhp\Runtime\Casting\parameterLabel($param), 'the parameter has no readable default value.', $exception);
    }
}
