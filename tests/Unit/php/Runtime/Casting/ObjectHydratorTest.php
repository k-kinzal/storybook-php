<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

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
use StorybookPhp\TestFixture\Hydration\Tags;
use StorybookPhp\TestFixture\Hydration\Untyped;
use StorybookPhp\TestFixture\Hydration\Variadic;
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
 * @covers \StorybookPhp\Runtime\Casting\invokeMagicSetter
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
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\constructorArgumentValue
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 * @covers \StorybookPhp\Runtime\Casting\layerClassArgDef
 * @covers \StorybookPhp\Runtime\Casting\isPlainArrayDocType
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Casting\classStateArgDefs
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\parameterDefaultValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\findStateSlot
 * @covers \StorybookPhp\Runtime\Casting\assignProperty
 * @covers \StorybookPhp\Runtime\Casting\describeStateSlots
 * @covers \StorybookPhp\Runtime\Casting\describeConstructor
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
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
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
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
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 */
final class ObjectHydratorTest extends TestCase
{
    public function testHydrateObjectFeedsConstructorThenSettersAndProperties(): void
    {
        $profile = \StorybookPhp\Runtime\Casting\hydrateObject(
            Profile::class,
            ['name' => 'Ada', 'theme' => 'dark', 'items' => ['one', ['label' => 'two']], 'age' => '36', 'meta' => ['k' => 'v']],
            HydrationContext::fromTypeMap(null),
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
        $context = HydrationContext::fromTypeMap(['bindings' => [FormatterInterface::class => Formatter::class]]);
        $formatter = new Formatter();
        $item = new Item('x');

        self::assertSame($formatter, \StorybookPhp\Runtime\Casting\hydrateObject(FormatterInterface::class, $formatter, $context));
        self::assertSame($item, \StorybookPhp\Runtime\Casting\hydrateObject(Item::class, $item, $context));

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('expected StorybookPhp\TestFixture\Item, received StorybookPhp\TestFixture\Formatter instance. An existing object of another class cannot be converted.');
        \StorybookPhp\Runtime\Casting\hydrateObject(Item::class, $formatter, $context);
    }

    public function testHydrateObjectMatchesSnakeCaseKeysAndSettersWithoutProperties(): void
    {
        $setterOnly = \StorybookPhp\Runtime\Casting\hydrateObject(SetterOnly::class, ['user_value' => '5'], HydrationContext::fromTypeMap(null));

        self::assertInstanceOf(SetterOnly::class, $setterOnly);
        self::assertSame(5, $setterOnly->value());
        $generated = \StorybookPhp\Runtime\Casting\hydrateObject(NoConstructorItem::class, [], HydrationContext::fromTypeMap(null));
        self::assertInstanceOf(NoConstructorItem::class, $generated);
        self::assertSame('generated', $generated->label);
    }

    public function testHydrateObjectAppliesSlotBindingsWithValues(): void
    {
        $context = HydrationContext::fromTypeMap(['bindings' => [
            Profile::class . '::$meta' => ['value' => ['fixed' => true]],
            Profile::class . '::$theme' => ['value' => 'bound'],
            Profile::class . '::__construct($name)' => ['value' => 'Bound'],
        ]]);
        $profile = \StorybookPhp\Runtime\Casting\hydrateObject(Profile::class, ['name' => 'ignored', 'meta' => 'ignored'], $context);

        self::assertInstanceOf(Profile::class, $profile);
        self::assertSame('Bound', $profile->name);
        self::assertSame(['fixed' => true], $profile->meta);
        self::assertSame('bound', $profile->theme());
        self::assertSame(['meta' => ['fixed' => true], 'theme' => 'bound'], \StorybookPhp\Runtime\Casting\boundStateValues(\StorybookPhp\TestFixture\Hydration\classOf(Profile::class), $context));
        self::assertSame([], \StorybookPhp\Runtime\Casting\boundStateValues(\StorybookPhp\TestFixture\Hydration\classOf(ConcreteBlock::class), $context));
    }

    public function testHydrateObjectBuildsFromListsAndScalars(): void
    {
        $context = HydrationContext::fromTypeMap(null);

        $pair = \StorybookPhp\Runtime\Casting\hydrateObject(Pair::class, ['1', '2'], $context);
        self::assertInstanceOf(Pair::class, $pair);
        self::assertSame([1, 2], [$pair->x, $pair->y]);

        $tags = \StorybookPhp\Runtime\Casting\hydrateObject(Tags::class, ['a', 'b'], $context);
        self::assertInstanceOf(Tags::class, $tags);
        self::assertSame(['a', 'b'], $tags->tags);
        $single = \StorybookPhp\Runtime\Casting\hydrateObject(Tags::class, 'a', $context);
        self::assertInstanceOf(Tags::class, $single);
        self::assertSame(['a'], $single->tags);

        $variadic = \StorybookPhp\Runtime\Casting\hydrateObject(Variadic::class, [1, 'b', 'c'], $context);
        self::assertInstanceOf(Variadic::class, $variadic);
        self::assertSame(['1', 'b', 'c'], $variadic->names);
        $mapped = \StorybookPhp\Runtime\Casting\hydrateObject(Variadic::class, ['names' => ['a']], $context);
        self::assertInstanceOf(Variadic::class, $mapped);
        self::assertSame(['a'], $mapped->names);
        $empty = \StorybookPhp\Runtime\Casting\hydrateObject(Variadic::class, ['names' => 'not-a-list'], $context);
        self::assertInstanceOf(Variadic::class, $empty);
        self::assertSame([], $empty->names);

        $item = \StorybookPhp\Runtime\Casting\hydrateObject(Item::class, 'label', $context);
        self::assertInstanceOf(Item::class, $item);
        self::assertSame('label', $item->label);
        self::assertSame(['a' => 1], (array) \StorybookPhp\Runtime\Casting\hydrateObject(stdClass::class, ['a' => 1], $context));
    }

    public function testHydrateObjectRejectsListsThatDoNotFitTheConstructor(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('expected StorybookPhp\TestFixture\Hydration\Pair, received list of 3 items. 3 positional value(s) do not fit __construct(int $x, int $y = 0). Pass an object whose keys are constructor argument names instead.');

        \StorybookPhp\Runtime\Casting\hydrateObject(Pair::class, [1, 2, 3], HydrationContext::fromTypeMap(null));
    }

    public function testHydrateObjectRejectsListsForClassesWithoutConstructors(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('StorybookPhp\TestFixture\NoConstructorItem has no constructor, so positional values cannot be applied. Pass an object whose keys are property names instead.');

        \StorybookPhp\Runtime\Casting\hydrateObject(NoConstructorItem::class, ['a'], HydrationContext::fromTypeMap(null));
    }

    public function testHydrateObjectRejectsScalarsForMultiArgumentConstructors(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('expected StorybookPhp\TestFixture\BrokenCollection, received string \'x\'. A single value only fits a constructor with one required argument, but this class has __construct(array $items, string $name). Pass an object whose keys are constructor argument names.');

        \StorybookPhp\Runtime\Casting\hydrateObject(BrokenCollection::class, 'x', HydrationContext::fromTypeMap(null));
    }

    public function testHydrateObjectReportsMissingConstructorArguments(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Pair::__construct($x): the required constructor argument $x is missing. Received keys: [y], constructor: __construct(int $x, int $y = 0).');

        \StorybookPhp\Runtime\Casting\hydrateObject(Pair::class, ['y' => 2], HydrationContext::fromTypeMap(null));
    }

    public function testHydrateObjectUsesDefaultsAndNullForOptionalConstructorArguments(): void
    {
        $context = HydrationContext::fromTypeMap(['bindings' => [FormatterInterface::class => Formatter::class]]);
        $page = \StorybookPhp\Runtime\Casting\hydrateObject(Page::class, ['formatter' => ['prefix' => 'p-']], $context);
        $linked = \StorybookPhp\Runtime\Casting\hydrateObject(SelfLinked::class, ['next' => ['next' => []]], $context);

        self::assertInstanceOf(Page::class, $page);
        self::assertSame('p-T:1', $page->render('t'));
        self::assertNull($page->meta);
        self::assertNull($page->block);
        self::assertInstanceOf(SelfLinked::class, $linked);
        self::assertInstanceOf(SelfLinked::class, $linked->next);
        self::assertInstanceOf(SelfLinked::class, $linked->next->next);
        self::assertNull($linked->next->next->next);
        $note = \StorybookPhp\Runtime\Casting\hydrateObject(OptionalNote::class, [], $context);
        self::assertInstanceOf(OptionalNote::class, $note);
        self::assertNull($note->note);
    }

    public function testHydrateObjectRejectsUnknownStateKeys(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate StorybookPhp\\TestFixture\\Hydration\\Profile::\$colour: StorybookPhp\\TestFixture\\Hydration\\Profile has no constructor argument, setter, or property named 'colour'. Available state: [\$name, setTheme(), \$theme, \$meta, \$items, \$age].");

        \StorybookPhp\Runtime\Casting\hydrateObject(Profile::class, ['name' => 'n', 'colour' => 'red'], HydrationContext::fromTypeMap(null));
    }

    public function testParameterDefaultValueReportsParametersWithoutDefaults(): void
    {
        self::assertSame(0, \StorybookPhp\Runtime\Casting\parameterDefaultValue(\StorybookPhp\TestFixture\Hydration\parameterOf([Pair::class, '__construct'], 'y')));

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Pair::__construct($x): the parameter has no readable default value.');
        \StorybookPhp\Runtime\Casting\parameterDefaultValue(\StorybookPhp\TestFixture\Hydration\parameterOf([Pair::class, '__construct'], 'x'));
    }

    public function testHydrateObjectRoutesUnknownKeysThroughMagicSetters(): void
    {
        $magic = \StorybookPhp\Runtime\Casting\hydrateObject(Magic::class, ['anything' => 1], HydrationContext::fromTypeMap(null));

        self::assertInstanceOf(Magic::class, $magic);
        self::assertSame(['anything' => 1], $magic->dynamic);
    }

    public function testHydrateObjectResolvesDocumentedTypesThroughImportsAndTemplates(): void
    {
        $context = HydrationContext::fromTypeMap(null);
        $shaped = \StorybookPhp\Runtime\Casting\hydrateObject(Shaped::class, ['shape' => ['foo' => 'a', 'count' => '1']], $context);
        $container = \StorybookPhp\Runtime\Casting\hydrateObject(Container::class, ['collection' => [['label' => 'c']], 'pairs' => [[1, 2], ['x' => 3]]], $context);

        self::assertInstanceOf(Shaped::class, $shaped);
        $shape = $shaped->shape;
        self::assertSame('a', $shape['foo']->label);
        self::assertSame(1, $shape['count'] ?? null);
        self::assertInstanceOf(Container::class, $container);
        self::assertSame('c', $container->collection->items[0]->label);
        self::assertSame(2, $container->pairs[0]->y);
        self::assertSame(0, $container->pairs[1]->y);
    }

    public function testHydrateObjectAppliesClassEntriesToNestedConstructors(): void
    {
        $context = HydrationContext::fromTypeMap(['classes' => [
            Tree::class => ['args' => ['branches' => 'Branch[]']],
            Branch::class => ['args' => ['leaves' => ['type' => 'array', 'elementType' => 'Leaf', 'default' => [['tags' => ['seed']]]]]],
        ]]);
        $tree = \StorybookPhp\Runtime\Casting\hydrateObject(Tree::class, ['branches' => [['leaves' => [['tags' => ['a', 'b']]]], []]], $context);
        $positional = \StorybookPhp\Runtime\Casting\hydrateObject(Tree::class, [['leaves' => [['tags' => ['p']]]]], $context);

        self::assertInstanceOf(Tree::class, $tree);
        self::assertSame('a/b|seed', $tree->render());
        self::assertInstanceOf(Tree::class, $positional);
        self::assertSame('p', $positional->render());
    }

    public function testHydrateObjectUsesDocblocksForUntypedConstructorArguments(): void
    {
        $context = HydrationContext::fromTypeMap(['bindings' => [FormatterInterface::class => Formatter::class]]);
        $untyped = \StorybookPhp\Runtime\Casting\hydrateObject(Untyped::class, ['formatter' => ['prefix' => 'u-'], 'status' => 'published'], $context);

        self::assertInstanceOf(Untyped::class, $untyped);
        self::assertInstanceOf(Formatter::class, $untyped->formatter);
        self::assertSame('published', $untyped->status);
    }

    public function testHydrateObjectResolvesAbstractTypesThroughBindings(): void
    {
        $block = \StorybookPhp\Runtime\Casting\hydrateObject(AbstractBlock::class, ['content' => 'x'], HydrationContext::fromTypeMap(['bindings' => [AbstractBlock::class => ConcreteBlock::class]]));

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

        \StorybookPhp\Runtime\Casting\resolveHydrationClass($type, HydrationContext::fromTypeMap(['bindings' => ['App\Missing' => 'App\StillMissing']]));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function providerUnbuildableTypes(): iterable
    {
        yield 'missing class' => ['App\Nope', 'the type App\Nope does not exist. Check the docblock type, make sure the class is autoloadable from the bootstrap file, or add a typeMap binding for it.'];
        yield 'missing bound class' => ['App\Missing', 'the type App\StillMissing (bound from App\Missing by typeMap) does not exist.'];
        yield 'interface' => [FormatterInterface::class, 'StorybookPhp\TestFixture\FormatterInterface is an interface, so no object can be built from the story value. Add a typeMap binding such as {"StorybookPhp\\\\TestFixture\\\\FormatterInterface":"App\\\\ConcreteClass"} to choose the class to instantiate.'];
        yield 'abstract class' => [AbstractBlock::class, 'StorybookPhp\TestFixture\Hydration\AbstractBlock is an abstract class, so no object can be built from the story value.'];
        yield 'private constructor' => [PrivateConstructor::class, 'StorybookPhp\TestFixture\Hydration\PrivateConstructor cannot be instantiated because its constructor is not public.'];
    }

    public function testHydrateParameterValueRejectsNullForNonNullableParameters(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Pair::__construct($x): the parameter is declared as int and does not accept null.');

        \StorybookPhp\Runtime\Casting\hydrateParameterValue(\StorybookPhp\TestFixture\Hydration\parameterOf([Pair::class, '__construct'], 'x'), null, null, null, HydrationContext::fromTypeMap(null));
    }

    public function testHydrateParameterValueAcceptsNullForNullableParameters(): void
    {
        self::assertNull(\StorybookPhp\Runtime\Casting\hydrateParameterValue(\StorybookPhp\TestFixture\Hydration\parameterOf([SelfLinked::class, '__construct'], 'next'), null, null, null, HydrationContext::fromTypeMap(null)));
    }

    public function testInstantiateClassFromValueKeepsTheLegacyEntryPoint(): void
    {
        $formatter = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(FormatterInterface::class, ['prefix' => 'x-'], ['bindings' => [FormatterInterface::class => Formatter::class]]);

        self::assertInstanceOf(Formatter::class, $formatter);
        self::assertSame('x-A', $formatter->format('a'));
    }
}
