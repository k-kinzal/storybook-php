<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use ArrayIterator;
use ArrayObject;
use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\Hydration\Pair;
use StorybookPhp\TestFixture\Hydration\TypedCollection;
use StorybookPhp\TestFixture\Item;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\scoreBuiltinTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreClassTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreIntTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStringTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStructuralBuiltinMatch
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseShapeKey
 * @covers \StorybookPhp\Runtime\Contract\parseShapeType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\hydrateUnionType
 * @covers \StorybookPhp\Runtime\Casting\hydrateIntersectionType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateShapeType
 * @covers \StorybookPhp\Runtime\Casting\hydrateShapeFields
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\hydrateLiteralType
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\selectUnionMember
 * @covers \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericObject
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsClassLike
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class CollectionHydratorTest extends TestCase
{
    public function testHydrateUnionTypeChoosesTheBestMember(): void
    {
        $context = HydrationContext::fromTypeMap(null);
        $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('int|list<int>|' . Item::class);

        self::assertSame(5, \StorybookPhp\Runtime\Casting\hydrateUnionType('5', $type, $context));
        self::assertSame([5], \StorybookPhp\Runtime\Casting\hydrateUnionType(['5'], $type, $context));
        $item = \StorybookPhp\Runtime\Casting\hydrateUnionType(['label' => 'x'], $type, $context);
        self::assertInstanceOf(Item::class, $item);
        self::assertSame('x', $item->label);
        self::assertSame(['any' => true], \StorybookPhp\Runtime\Casting\hydrateUnionType(['any' => true], \StorybookPhp\Runtime\Contract\parseTypeExpression('int|mixed'), $context));
    }

    public function testHydrateUnionTypeRejectsValuesNoMemberAccepts(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate App\Card::$slot: expected int|string, received empty array. None of the union members accepts this value.');

        \StorybookPhp\Runtime\Casting\hydrateUnionType([], \StorybookPhp\Runtime\Contract\parseTypeExpression('int|string'), HydrationContext::fromTypeMap(null)->at('App\Card::$slot'));
    }

    public function testHydrateIntersectionTypeAcceptsObjectsImplementingEveryMember(): void
    {
        $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('Countable&Traversable');
        $object = new ArrayObject([1]);
        $context = HydrationContext::fromTypeMap(['bindings' => ['Countable' => ArrayObject::class]]);

        self::assertSame($object, \StorybookPhp\Runtime\Casting\hydrateIntersectionType($object, $type, $context));
        self::assertSame([1, 2], (array) \StorybookPhp\Runtime\Casting\hydrateIntersectionType([1, 2], $type, $context));
    }

    public function testHydrateIntersectionTypeRejectsObjectsMissingAMember(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('expected Countable&Traversable&StorybookPhp\TestFixture\FormatterInterface, received ArrayIterator instance. ArrayIterator does not implement StorybookPhp\TestFixture\FormatterInterface.');

        \StorybookPhp\Runtime\Casting\hydrateIntersectionType(
            new ArrayIterator([]),
            \StorybookPhp\Runtime\Contract\parseTypeExpression('Countable&Traversable&StorybookPhp\TestFixture\FormatterInterface'),
            HydrationContext::fromTypeMap(null),
        );
    }

    public function testHydrateIntersectionTypeNeedsAClassMember(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('An intersection must name at least one class or interface.');

        \StorybookPhp\Runtime\Casting\hydrateIntersectionType(1, \StorybookPhp\Runtime\Contract\parseTypeExpression('int&string'), HydrationContext::fromTypeMap(null));
    }

    public function testHydrateGenericTypeConvertsArrayLikesBuiltinsAndWrappers(): void
    {
        $context = HydrationContext::fromTypeMap(null);
        $iterator = new ArrayIterator([]);

        self::assertSame(['a' => 1], \StorybookPhp\Runtime\Casting\hydrateGenericType(['a' => '1'], \StorybookPhp\Runtime\Contract\parseTypeExpression('array<string, int>'), $context));
        self::assertSame([[2]], \StorybookPhp\Runtime\Casting\hydrateGenericType([['2']], \StorybookPhp\Runtime\Contract\parseTypeExpression('int[][]'), $context));
        self::assertSame($iterator, \StorybookPhp\Runtime\Casting\hydrateGenericType($iterator, \StorybookPhp\Runtime\Contract\parseTypeExpression('iterable<int>'), $context));
        self::assertSame('Foo', \StorybookPhp\Runtime\Casting\hydrateGenericType('Foo', \StorybookPhp\Runtime\Contract\parseTypeExpression('class-string<Foo>'), $context));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\hydrateGenericType('3', \StorybookPhp\Runtime\Contract\parseTypeExpression('int<0, max>'), $context));

        $collection = \StorybookPhp\Runtime\Casting\hydrateGenericType([['label' => 'a']], \StorybookPhp\Runtime\Contract\parseTypeExpression(TypedCollection::class . '<' . Item::class . '>'), $context);
        self::assertInstanceOf(TypedCollection::class, $collection);
        self::assertInstanceOf(Item::class, $collection->items[0]);
        self::assertSame('a', $collection->items[0]->label);

        $pairs = \StorybookPhp\Runtime\Casting\hydrateGenericType([[1, 2]], \StorybookPhp\Runtime\Contract\parseTypeExpression(TypedCollection::class . '<' . Pair::class . '>'), $context);
        self::assertInstanceOf(TypedCollection::class, $pairs);
        self::assertInstanceOf(Pair::class, $pairs->items[0]);
        self::assertSame(2, $pairs->items[0]->y);
    }

    public function testHydrateArrayElementsRejectsScalarsAndReportsTheElementPath(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate App\\Card::\$items[1]: expected int, received string 'x'.");

        \StorybookPhp\Runtime\Casting\hydrateGenericType([1, 'x'], \StorybookPhp\Runtime\Contract\parseTypeExpression('list<int>'), HydrationContext::fromTypeMap(null)->at('App\Card::$items'));
    }

    public function testHydrateArrayElementsRejectsNonArrays(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("expected list<int>, received string 'x'.");

        \StorybookPhp\Runtime\Casting\hydrateArrayElements('x', \StorybookPhp\Runtime\Contract\parseTypeExpression('int'), HydrationContext::fromTypeMap(null), 'list<int>');
    }

    public function testHydrateShapeTypeConvertsDeclaredKeysAndKeepsOthers(): void
    {
        $context = HydrationContext::fromTypeMap(null);
        $type = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{id: int, note?: string, ...}');

        self::assertSame(['id' => 7, 'extra' => true], \StorybookPhp\Runtime\Casting\hydrateShapeType(['id' => '7', 'extra' => true], $type, $context));
        self::assertSame(['id' => 7, 'note' => '1'], \StorybookPhp\Runtime\Casting\hydrateShapeType(['id' => 7, 'note' => 1], $type, $context));
        self::assertSame([1, 'b'], \StorybookPhp\Runtime\Casting\hydrateShapeType(['1', 'b'], \StorybookPhp\Runtime\Contract\parseTypeExpression('array{int, string}'), $context));

        $object = \StorybookPhp\Runtime\Casting\hydrateShapeType(['a' => '1'], \StorybookPhp\Runtime\Contract\parseTypeExpression('object{a: int}'), $context);
        self::assertSame(['a' => 1], (array) $object);
        $fromObject = \StorybookPhp\Runtime\Casting\hydrateShapeType((object) ['a' => '2'], \StorybookPhp\Runtime\Contract\parseTypeExpression('object{a: int}'), $context);
        self::assertSame(['a' => 2], (array) $fromObject);
    }

    public function testHydrateShapeTypeRejectsMissingRequiredKeys(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate App\\Card::\$shape: expected array{id: int, note?: string}, received object with keys [note]. The required key 'id' is missing.");

        \StorybookPhp\Runtime\Casting\hydrateShapeType(['note' => 'x'], \StorybookPhp\Runtime\Contract\parseTypeExpression('array{id: int, note?: string}'), HydrationContext::fromTypeMap(null)->at('App\Card::$shape'));
    }

    public function testHydrateShapeTypeRejectsNonArrays(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("expected array{id: int}, received string 'x'.");

        \StorybookPhp\Runtime\Casting\hydrateShapeType('x', \StorybookPhp\Runtime\Contract\parseTypeExpression('array{id: int}'), HydrationContext::fromTypeMap(null));
    }

    public function testObjectShapesRejectScalars(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('expected object{a: int}, received int 1.');

        \StorybookPhp\Runtime\Casting\hydrateShapeType(1, \StorybookPhp\Runtime\Contract\parseTypeExpression('object{a: int}'), HydrationContext::fromTypeMap(null));
    }
}
