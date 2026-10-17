<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use Closure;
use PHPUnit\Framework\TestCase;
use stdClass;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\ClassTypeMap\Branch;
use StorybookPhp\TestFixture\ClassTypeMap\Tree;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\Hydration\AbstractBlock;
use StorybookPhp\TestFixture\Hydration\ConcreteBlock;
use StorybookPhp\TestFixture\Hydration\Container;
use StorybookPhp\TestFixture\Hydration\Magic;
use StorybookPhp\TestFixture\Hydration\OptionalNote;
use StorybookPhp\TestFixture\Hydration\Page;
use StorybookPhp\TestFixture\Hydration\Pair;
use StorybookPhp\TestFixture\Hydration\PrivateConstructor;
use StorybookPhp\TestFixture\Hydration\Profile;
use StorybookPhp\TestFixture\Hydration\SelfLinked;
use StorybookPhp\TestFixture\Hydration\SetterOnly;
use StorybookPhp\TestFixture\Hydration\Shaped;
use StorybookPhp\TestFixture\Hydration\Untyped;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\NoConstructorItem;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';
require_once dirname(__DIR__, 4) . '/php/fixtures/ClassTypeMapFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\buildOverrideDocType
 * @covers \StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride
 * @covers \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName
 * @covers \StorybookPhp\Runtime\Contract\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Contract\resolveClassName
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Casting\scoreLiteralTypeMatch
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseShapeKey
 * @covers \StorybookPhp\Runtime\Contract\parseShapeType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\whitespaceJoinsTypeExpression
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericObject
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 * @covers \StorybookPhp\Runtime\Casting\layerClassArgDef
 * @covers \StorybookPhp\Runtime\Casting\isPlainArrayDocType
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Contract\resolveComponentClassArgDefs
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\parameterDefaultValue
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\findStateSlot
 * @covers \StorybookPhp\Runtime\Casting\assignProperty
 * @covers \StorybookPhp\Runtime\Casting\describeStateSlots
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Casting\instantiateClassFromValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\hydrateUnionType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateShapeType
 * @covers \StorybookPhp\Runtime\Casting\hydrateShapeFields
 * @covers \StorybookPhp\Runtime\Casting\hydrateLiteralType
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\propertyContract
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsClassLike
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull
 * @covers \StorybookPhp\Runtime\Casting\propertySlotKeys
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\propertyLabel
 * @covers \StorybookPhp\Runtime\Casting\selectUnionMember
 * @covers \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreBuiltinTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreClassTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStringTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForProperty
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockVarType
 * @covers \StorybookPhp\Runtime\Contract\leadingTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMappings
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 */
final class ObjectHydratorTest extends TestCase
{
    public function testHydrateObjectFillsPropertiesOfEveryVisibility(): void
    {
        $profile = \StorybookPhp\Runtime\Casting\hydrateObject(
            Profile::class,
            ['name' => 'Ada', 'theme' => 'dark', 'items' => [['label' => 'one'], ['label' => 'two']], 'age' => '36', 'meta' => ['k' => 'v']],
            HydrationContext::fromTypes(null),
        );

        self::assertInstanceOf(Profile::class, $profile);
        self::assertSame('Ada', $profile->name);
        self::assertSame('dark', $profile->theme());
        self::assertSame('one', $profile->items[0]->label);
        self::assertSame('two', $profile->items[1]->label);
        self::assertSame(36, $profile->age());
        self::assertSame(['k' => 'v'], $profile->meta);
    }

    public function testHydrateObjectReturnsExistingInstancesAndRejectsForeignObjects(): void
    {
        $context = HydrationContext::fromTypes([FormatterInterface::class => Formatter::class]);
        $formatter = new Formatter();
        $item = new Item('x');

        self::assertSame($formatter, \StorybookPhp\Runtime\Casting\hydrateObject(FormatterInterface::class, $formatter, $context));
        self::assertSame($item, \StorybookPhp\Runtime\Casting\hydrateObject(Item::class, $item, $context));

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('expected StorybookPhp\TestFixture\Item, received StorybookPhp\TestFixture\Formatter instance. An existing object of another class cannot be converted.');
        \StorybookPhp\Runtime\Casting\hydrateObject(Item::class, $formatter, $context);
    }

    public function testSetterNamesAreNotPropertyKeys(): void
    {
        $generated = \StorybookPhp\Runtime\Casting\hydrateObject(NoConstructorItem::class, [], HydrationContext::fromTypes(null));
        self::assertInstanceOf(NoConstructorItem::class, $generated);
        self::assertSame('generated', $generated->label);
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("has no property named 'user_value'");
        \StorybookPhp\Runtime\Casting\hydrateObject(SetterOnly::class, ['user_value' => '5'], HydrationContext::fromTypes(null));
    }

    public function testHydrateObjectAppliesSlotBindingsWithValues(): void
    {
        $context = HydrationContext::fromTypes([
            Profile::class . '::$meta' => ['value' => ['fixed' => true]],
            Profile::class . '::$theme' => ['value' => 'bound'],
            Profile::class . '::$name' => ['value' => 'Bound'],
        ]);
        $profile = \StorybookPhp\Runtime\Casting\hydrateObject(Profile::class, ['name' => 'ignored', 'meta' => 'ignored'], $context);

        self::assertInstanceOf(Profile::class, $profile);
        self::assertSame('Bound', $profile->name);
        self::assertSame(['fixed' => true], $profile->meta);
        self::assertSame('bound', $profile->theme());
        self::assertSame(['meta' => ['fixed' => true], 'theme' => 'bound', 'name' => 'Bound'], \StorybookPhp\Runtime\Casting\boundStateValues(\StorybookPhp\TestFixture\Hydration\classOf(Profile::class), $context));
        self::assertSame([], \StorybookPhp\Runtime\Casting\boundStateValues(\StorybookPhp\TestFixture\Hydration\classOf(ConcreteBlock::class), $context));
    }

    public function testPropertyMapsAndPrivateConstructors(): void
    {
        $context = HydrationContext::fromTypes(null);
        $pair = \StorybookPhp\Runtime\Casting\hydrateObject(Pair::class, ['x' => '1', 'y' => '2'], $context);
        self::assertInstanceOf(Pair::class, $pair);
        self::assertSame([1, 2], [$pair->x, $pair->y]);
        self::assertSame(['a' => 1], (array) \StorybookPhp\Runtime\Casting\hydrateObject(stdClass::class, ['a' => 1], $context));
        self::assertInstanceOf(PrivateConstructor::class, \StorybookPhp\Runtime\Casting\hydrateObject(PrivateConstructor::class, [], $context));
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Constructors are not used for type mapping.');
        \StorybookPhp\Runtime\Casting\hydrateObject(Item::class, 'label', $context);
    }

    public function testHydrateObjectRejectsListsThatDoNotFitTheConstructor(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Pass an object whose keys are property names.');

        \StorybookPhp\Runtime\Casting\hydrateObject(Pair::class, [1, 2, 3], HydrationContext::fromTypes(null));
    }

    public function testHydrateObjectRejectsListsForClassesWithoutConstructors(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Pass an object whose keys are property names.');

        \StorybookPhp\Runtime\Casting\hydrateObject(NoConstructorItem::class, ['a'], HydrationContext::fromTypes(null));
    }

    public function testHydrateObjectRejectsScalarsForMultiArgumentConstructors(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Pass an object whose keys are property names.');

        \StorybookPhp\Runtime\Casting\hydrateObject(BrokenCollection::class, 'x', HydrationContext::fromTypes(null));
    }

    public function testAbsentTypedPropertiesRemainUninitialized(): void
    {
        $pair = \StorybookPhp\Runtime\Casting\hydrateObject(Pair::class, ['y' => 2], HydrationContext::fromTypes(null));
        self::assertInstanceOf(Pair::class, $pair);
        self::assertFalse(\StorybookPhp\TestFixture\Hydration\propertyOf(Pair::class, 'x')->isInitialized($pair));
        self::assertSame(2, $pair->y);
    }

    public function testHydrationLeavesAbsentPropertiesUninitialized(): void
    {
        $context = HydrationContext::fromTypes([FormatterInterface::class => Formatter::class]);
        $page = \StorybookPhp\Runtime\Casting\hydrateObject(Page::class, ['formatter' => ['prefix' => 'p-']], $context);
        $linked = \StorybookPhp\Runtime\Casting\hydrateObject(SelfLinked::class, ['next' => ['next' => []]], $context);

        self::assertInstanceOf(Page::class, $page);
        self::assertSame('p-T:1', $page->render('t'));
        self::assertFalse(\StorybookPhp\TestFixture\Hydration\propertyOf(Page::class, 'meta')->isInitialized($page));
        self::assertFalse(\StorybookPhp\TestFixture\Hydration\propertyOf(Page::class, 'block')->isInitialized($page));
        self::assertInstanceOf(SelfLinked::class, $linked);
        self::assertInstanceOf(SelfLinked::class, $linked->next);
        self::assertInstanceOf(SelfLinked::class, $linked->next->next);
        self::assertFalse(\StorybookPhp\TestFixture\Hydration\propertyOf(SelfLinked::class, 'next')->isInitialized($linked->next->next));
        $note = \StorybookPhp\Runtime\Casting\hydrateObject(OptionalNote::class, [], $context);
        self::assertInstanceOf(OptionalNote::class, $note);
        self::assertFalse(\StorybookPhp\TestFixture\Hydration\propertyOf(OptionalNote::class, 'note')->isInitialized($note));
    }

    public function testHydrateObjectRejectsUnknownStateKeys(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('has no property named');

        \StorybookPhp\Runtime\Casting\hydrateObject(Profile::class, ['name' => 'n', 'colour' => 'red'], HydrationContext::fromTypes(null));
    }

    public function testParameterDefaultValueReportsParametersWithoutDefaults(): void
    {
        self::assertSame(0, \StorybookPhp\Runtime\Casting\parameterDefaultValue(\StorybookPhp\TestFixture\Hydration\parameterOf([Pair::class, '__construct'], 'y')));

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Pair::__construct($x): the parameter has no readable default value.');
        \StorybookPhp\Runtime\Casting\parameterDefaultValue(\StorybookPhp\TestFixture\Hydration\parameterOf([Pair::class, '__construct'], 'x'));
    }

    public function testMagicSettersCannotReceiveUnknownProperties(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("has no property named 'anything'");
        \StorybookPhp\Runtime\Casting\hydrateObject(Magic::class, ['anything' => 1], HydrationContext::fromTypes(null));
    }

    public function testHydrateObjectResolvesDocumentedTypesThroughImportsAndTemplates(): void
    {
        $context = HydrationContext::fromTypes(null);
        $shaped = \StorybookPhp\Runtime\Casting\hydrateObject(Shaped::class, ['shape' => ['foo' => ['label' => 'a'], 'count' => '1']], $context);
        $container = \StorybookPhp\Runtime\Casting\hydrateObject(Container::class, ['collection' => ['items' => [['label' => 'c']]], 'pairs' => [['x' => 1, 'y' => 2], ['x' => 3]]], $context);

        self::assertInstanceOf(Shaped::class, $shaped);
        $shape = $shaped->shape;
        self::assertSame('a', $shape['foo']->label);
        self::assertSame(1, $shape['count'] ?? null);
        self::assertInstanceOf(Container::class, $container);
        self::assertSame('c', $container->collection->items[0]->label);
        self::assertSame(2, $container->pairs[0]->y);
        self::assertFalse(\StorybookPhp\TestFixture\Hydration\propertyOf(Pair::class, 'y')->isInitialized($container->pairs[1]));
    }

    public function testPropertyMappingsTypeNestedArrays(): void
    {
        $context = HydrationContext::fromTypes([
            Tree::class . '::$branches' => Branch::class . '[]',
            Branch::class . '::$leaves' => ['type' => \StorybookPhp\TestFixture\ClassTypeMap\Leaf::class . '[]'],
        ]);
        $tree = \StorybookPhp\Runtime\Casting\hydrateObject(Tree::class, ['branches' => [['leaves' => [['tags' => ['a', 'b']]]]]], $context);
        self::assertInstanceOf(Tree::class, $tree);
        self::assertSame('a/b', $tree->render());
    }

    public function testPromotedPropertiesUseConstructorDocblocks(): void
    {
        $context = HydrationContext::fromTypes([FormatterInterface::class => Formatter::class]);
        $untyped = \StorybookPhp\Runtime\Casting\hydrateObject(Untyped::class, ['formatter' => ['prefix' => 'u-'], 'status' => 'published'], $context);

        self::assertInstanceOf(Untyped::class, $untyped);
        self::assertInstanceOf(Formatter::class, $untyped->formatter);
        self::assertSame('published', $untyped->status);
    }

    public function testHydrateObjectResolvesAbstractTypesThroughBindings(): void
    {
        $block = \StorybookPhp\Runtime\Casting\hydrateObject(AbstractBlock::class, ['content' => 'x'], HydrationContext::fromTypes([AbstractBlock::class => ConcreteBlock::class]));

        self::assertInstanceOf(ConcreteBlock::class, $block);
        self::assertSame('x', $block->content);
    }

    /**
     * @dataProvider providerUnbuildableTypes
     */
    public function testResolveHydrationClassRejectsTypesThatCannotBeBuilt(string $type, string $reason): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage($reason);

        \StorybookPhp\Runtime\Casting\resolveHydrationClass($type, HydrationContext::fromTypes(['App\Missing' => 'App\StillMissing']));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function providerUnbuildableTypes(): iterable
    {
        yield 'missing class' => ['App\Nope', 'the type App\Nope does not exist. Check the docblock type, make sure the class is autoloadable from the bootstrap file, or add a types binding for it.'];
        yield 'missing bound class' => ['App\Missing', 'the type App\StillMissing (bound from App\Missing by types) does not exist.'];
        yield 'interface' => [FormatterInterface::class, 'StorybookPhp\TestFixture\FormatterInterface is an interface, so no object can be built from the story value. Add a types binding such as {"StorybookPhp\\\\TestFixture\\\\FormatterInterface":"App\\\\ConcreteClass"} to choose the class to instantiate.'];
        yield 'abstract class' => [AbstractBlock::class, 'StorybookPhp\TestFixture\Hydration\AbstractBlock is an abstract class, so no object can be built from the story value.'];
    }

    public function testHydrateParameterValueRejectsNullForNonNullableParameters(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Pair::__construct($x): the parameter is declared as int and does not accept null.');

        \StorybookPhp\Runtime\Casting\hydrateParameterValue(\StorybookPhp\TestFixture\Hydration\parameterOf([Pair::class, '__construct'], 'x'), null, null, null, HydrationContext::fromTypes(null));
    }

    public function testHydrateParameterValueAcceptsNullForNullableParameters(): void
    {
        self::assertNull(\StorybookPhp\Runtime\Casting\hydrateParameterValue(\StorybookPhp\TestFixture\Hydration\parameterOf([SelfLinked::class, '__construct'], 'next'), null, null, null, HydrationContext::fromTypes(null)));
    }

    public function testInstantiateClassFromValueKeepsTheLegacyEntryPoint(): void
    {
        $formatter = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(FormatterInterface::class, ['prefix' => 'x-'], [FormatterInterface::class => Formatter::class]);

        self::assertInstanceOf(Formatter::class, $formatter);
        self::assertSame('x-A', $formatter->format('a'));
    }

    public function testHydrateObjectBypassesMethodsAndIncludesParentPrivateProperties(): void
    {
        $class = \StorybookPhp\TestFixture\Hydration\PropertyOnly::class;
        $parent = \StorybookPhp\TestFixture\Hydration\PropertyParent::class;
        $context = HydrationContext::fromTypes([
            $parent . '::$inherited' => ['value' => '42'],
            $class . '::$item' => ['type' => Item::class, 'value' => ['label' => 'mapped']],
        ]);
        $value = \StorybookPhp\Runtime\Casting\hydrateObject($class, ['user_name' => 'Ada'], $context);
        self::assertInstanceOf(\StorybookPhp\TestFixture\Hydration\PropertyOnly::class, $value);
        self::assertSame(42, $value->inherited());
        self::assertSame('Ada', $value->userName);
        self::assertSame('mapped', $value->item->label);
        self::assertContains('$inherited', \StorybookPhp\Runtime\Casting\describeStateSlots(\StorybookPhp\TestFixture\Hydration\classOf($class)));
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("has no property named 'staticValue'");
        \StorybookPhp\Runtime\Casting\hydrateObject($class, ['staticValue' => 'changed'], $context);
    }

    public function testHydrateObjectReportsInternalAllocationFailures(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Closure cannot be allocated without its constructor. Use a component adapter');
        \StorybookPhp\Runtime\Casting\hydrateObject(Closure::class, [], HydrationContext::fromTypes(null)->at('App\Card::$callback'));
    }

    public function testPropertyMappingNamesAreNotResolvedThroughFileImports(): void
    {
        $class = \StorybookPhp\TestFixture\Hydration\PropertyOnly::class;
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('the type AliasItem does not exist');
        \StorybookPhp\Runtime\Casting\hydrateObject($class, ['item' => ['label' => 'x']], HydrationContext::fromTypes([$class . '::$item' => 'AliasItem']));
    }

}
