<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\AbstractCollection;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\ListCollection;
use StorybookPhp\TestFixture\ListCollectionContract;
use StorybookPhp\TestFixture\NoConstructorCollection;
use StorybookPhp\TestFixture\NoConstructorItem;

require_once __DIR__ . '/fixtures/RunnerFixtures.php';

final class FailingConstructor
{
    public function __construct(public string $label)
    {
        throw new TypeError('broken constructor');
    }
}

/**
 * @covers \StorybookPhp\Runtime\Casting\classStateArgDefs
 * @covers \StorybookPhp\Runtime\Casting\constructorArgumentValue
 * @covers \StorybookPhp\Runtime\Casting\describeConstructor
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Casting\assignProperty
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\findStateSlot
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
 * @covers \StorybookPhp\Runtime\Casting\propertyContract
 * @covers \StorybookPhp\Runtime\Casting\propertyLabel
 * @covers \StorybookPhp\Runtime\Casting\propertySlotKeys
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\scoreNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockVarType
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForProperty
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\castInlineDocTypeValue
 * @covers \StorybookPhp\Runtime\Casting\instantiateClassFromValue
 * @covers \StorybookPhp\Runtime\Casting\castArg
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\hydrateUnionType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\selectUnionMember
 * @covers \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreClassTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 */
final class runtime_castTest extends TestCase
{
    public function testUnionSelectionUsesTheCompatibleConstructorContract(): void
    {
        $result = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            ['label' => 'item'],
            BrokenCollection::class . '<' . Item::class . '>|' . Item::class,
        );

        self::assertInstanceOf(Item::class, $result);
    }

    public function testUnionConversionDoesNotHideProgrammingErrors(): void
    {
        $this->expectException(TypeError::class);
        \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            ['label' => 'item'],
            FailingConstructor::class . '|' . Item::class,
        );
    }

    public function testScalarInstantiationUsesTheSingleParameterContract(): void
    {
        $item = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(Item::class, 'label');

        self::assertInstanceOf(Item::class, $item);
        self::assertSame('label', $item->label);
    }

    public function testCollectionWrappersReceiveTheirElementsThroughTemplates(): void
    {
        $wrapped = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'wrapped']], ListCollection::class . '<' . Item::class . '>');
        self::assertInstanceOf(ListCollection::class, $wrapped);
        self::assertInstanceOf(Item::class, $wrapped->items[0]);

        $bound = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            [['label' => 'bound']],
            ListCollectionContract::class . '<' . Item::class . '>',
            ['bindings' => [ListCollectionContract::class => ListCollection::class]],
        );
        self::assertInstanceOf(ListCollection::class, $bound);
        self::assertInstanceOf(Item::class, $bound->items[0]);

        $positional = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(BrokenCollection::class, [[new Item('alpha')], 'named']);
        self::assertInstanceOf(BrokenCollection::class, $positional);
        self::assertSame('alpha', $positional->items[0]->label);
        self::assertSame('named', $positional->name);
    }

    public function testClassesWithoutConstructorsOnlyAcceptObjectsNamingProperties(): void
    {
        $items = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'set'], []], 'list<' . NoConstructorItem::class . '>');
        self::assertSame('set', $items[0]->label);
        self::assertSame('generated', $items[1]->label);

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage(NoConstructorCollection::class . ' has no constructor, so positional values cannot be applied.');
        \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'ignored']], NoConstructorCollection::class . '<' . Item::class . '>');
    }

    public function testAbstractWrappersNeedABinding(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage(AbstractCollection::class . ' is an abstract class, so no object can be built from the story value.');
        \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'abstract']], AbstractCollection::class . '<' . Item::class . '>');
    }

    public function testUnknownDeclaredClassIsNamedInTheFailure(): void
    {
        $closure = eval('return static function (\\StorybookPhp\\MissingRuntimeType $value): void {};');
        $parameter = new ReflectionParameter($closure, 0);

        try {
            \StorybookPhp\Runtime\Casting\castArg($parameter, []);
            self::fail('Expected the missing class to be reported.');
        } catch (HydrationException $exception) {
            self::assertStringEndsWith(
                '($value): the type StorybookPhp\MissingRuntimeType does not exist. Check the docblock type, make sure the class is autoloadable from the bootstrap file, or add a typeMap binding for it.',
                $exception->getMessage(),
            );
        }
    }
}
