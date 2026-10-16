<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\Runtime\Contract\TypeScope;
use StorybookPhp\TestFixture\Hydration\Container;
use StorybookPhp\TestFixture\Hydration\Page;
use StorybookPhp\TestFixture\Hydration\Profile;
use StorybookPhp\TestFixture\Hydration\SelfLinked;
use StorybookPhp\TestFixture\Hydration\Shaped;
use StorybookPhp\TestFixture\Hydration\TypedCollection;
use StorybookPhp\TestFixture\Hydration\Untyped;
use StorybookPhp\TestFixture\Item;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\leadingTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
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
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\whitespaceJoinsTypeExpression
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsClassLike
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\propertyContract
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
 * @covers \StorybookPhp\Runtime\Casting\propertySlotKeys
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\propertyLabel
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull
 * @covers \StorybookPhp\Runtime\Casting\buildOverrideDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride
 * @covers \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForProperty
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\resolveClassName
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockVarType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 */
final class SlotContractTest extends TestCase
{
    public function testReflectionTypeNodeHandlesNamedNullableUnionAndUntypedDeclarations(): void
    {
        $scope = new TypeScope();
        $self = \StorybookPhp\Runtime\Casting\reflectionTypeNode(
            \StorybookPhp\TestFixture\Hydration\parameterOf([SelfLinked::class, '__construct'], 'next')->getType(),
            new TypeScope('', [], SelfLinked::class),
        );
        $union = \StorybookPhp\Runtime\Casting\reflectionTypeNode(\StorybookPhp\TestFixture\Hydration\parameterOf([Page::class, '__construct'], 'block')->getType(), $scope);
        $mixed = \StorybookPhp\Runtime\Casting\reflectionTypeNode(\StorybookPhp\TestFixture\Hydration\parameterOf([Page::class, '__construct'], 'meta')->getType(), $scope);

        self::assertNull(\StorybookPhp\Runtime\Casting\reflectionTypeNode(null, $scope));
        self::assertNotNull($self);
        self::assertNotNull($union);
        self::assertNotNull($mixed);
        self::assertSame('?' . SelfLinked::class, \StorybookPhp\Runtime\Contract\describeTypeNode($self));
        self::assertSame('StorybookPhp\TestFixture\Hydration\AbstractBlock|string|null', \StorybookPhp\Runtime\Contract\describeTypeNode($union));
        self::assertSame('mixed', \StorybookPhp\Runtime\Contract\describeTypeNode($mixed));
    }

    /**
     * @dataProvider providerRefinements
     */
    public function testRefineTypeNodeNarrowsNativeTypesWithDocumentation(?string $native, ?string $doc, string $expected): void
    {
        $nativeNode = $native === null ? null : \StorybookPhp\Runtime\Contract\parseTypeExpression($native);
        $docNode = $doc === null ? null : \StorybookPhp\Runtime\Contract\parseTypeExpression($doc);

        self::assertSame($expected, \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\refineTypeNode($nativeNode, $docNode)));
    }

    /**
     * @return iterable<string, array{string|null, string|null, string}>
     */
    public static function providerRefinements(): iterable
    {
        yield 'untyped without doc' => [null, null, 'mixed'];
        yield 'untyped with doc' => [null, 'list<App\Item>', 'list<App\Item>'];
        yield 'native without doc' => ['array', null, 'array'];
        yield 'mixed takes doc' => ['mixed', 'App\Item|null', 'App\Item|null'];
        yield 'array takes shape' => ['array', 'array{foo: App\Foo}', 'array{foo: App\Foo}'];
        yield 'array takes generic' => ['array', 'App\Item[]', 'array<App\Item>'];
        yield 'array ignores class doc' => ['array', 'App\Item', 'array'];
        yield 'array ignores object shape' => ['array', 'object{a: int}', 'array'];
        yield 'array ignores mixed doc' => ['array', 'mixed', 'array'];
        yield 'array keeps array-like union members' => ['array', 'list<App\Item>|App\Item|non-empty-array<int>', 'list<App\Item>|non-empty-array<int>'];
        yield 'iterable takes traversable class' => ['iterable', 'App\Collection<App\Item>', 'App\Collection<App\Item>'];
        yield 'nullable array' => ['?array', '?list<int>', '?list<int>'];
        yield 'object takes class' => ['object', 'App\Item', 'App\Item'];
        yield 'object takes object shape' => ['object', 'object{a: int}', 'object{a: int}'];
        yield 'object ignores array doc' => ['object', 'list<int>', 'object'];
        yield 'scalar keeps native' => ['string', 'non-empty-string', 'string'];
        yield 'scalar takes same name' => ['int', 'int', 'int'];
        yield 'scalar takes literal' => ['string', "'a'|'b'|1", "'a'|'b'"];
        yield 'float takes int literal' => ['float', '1|2', '1|2'];
        yield 'class takes generic of itself' => [Item::class, Item::class . '<int>', Item::class . '<int>'];
        yield 'class takes subclass' => ['StorybookPhp\TestFixture\Hydration\AbstractBlock', 'StorybookPhp\TestFixture\Hydration\ConcreteBlock', 'StorybookPhp\TestFixture\Hydration\ConcreteBlock'];
        yield 'class ignores unrelated class' => [Item::class, 'App\Other', Item::class];
        yield 'class takes intersection' => ['Countable', 'Countable&Traversable', 'Countable&Traversable'];
        yield 'class ignores unrelated intersection' => ['Countable', 'Stringable&Traversable', 'Countable'];
        yield 'native union refines per member' => ['array|' . Item::class, 'list<' . Item::class . '>|' . Item::class, 'list<' . Item::class . '>|' . Item::class];
        yield 'native intersection stays' => ['Countable&Traversable', 'ArrayObject', 'Countable&Traversable'];
        yield 'nullable doc on class' => [Item::class, '?' . Item::class, Item::class];
        yield 'nullable member inside a doc union' => ['int', '?int|string', '?int'];
    }

    public function testParameterContractLayersBindingArgDefAndDocblock(): void
    {
        $parameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Shaped::class, '__construct'], 'shape');
        $none = HydrationContext::fromTypeMap(null);
        $bound = HydrationContext::fromTypeMap(['bindings' => [Shaped::class . '::$shape' => 'list<int>']]);

        self::assertSame('array{foo: ' . Item::class . ', count?: int}', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, 'array{foo: AliasItem, count?: int}', null, $none)));
        self::assertSame('array<string>', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, 'array{foo: AliasItem}', ['type' => 'array', 'elementType' => 'string'], $none)));
        self::assertSame('list<int>', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, 'array{foo: AliasItem}', ['elementType' => 'string'], $bound)));
        self::assertSame('array', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, null, ['type' => 'array'], $none)));
        self::assertSame('array', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, '  ', null, $none)));
    }

    public function testParameterContractBindsTemplatesFromTheContext(): void
    {
        $parameter = \StorybookPhp\TestFixture\Hydration\parameterOf([TypedCollection::class, '__construct'], 'items');
        $context = HydrationContext::fromTypeMap(null)->withTemplates(['T' => new TypeNode('named', Item::class)]);

        self::assertSame('list<' . Item::class . '>', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, 'list<T>', null, $context)));
        self::assertSame('list<mixed>', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\parameterContract($parameter, 'list<T>', null, HydrationContext::fromTypeMap(null))));
    }

    public function testParameterContractReportsUnparsableDocumentation(): void
    {
        $parameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Shaped::class, '__construct'], 'shape');

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate StorybookPhp\\TestFixture\\Hydration\\Shaped::__construct(\$shape): the documented type 'list<int' cannot be parsed: expected '>' before the end of type 'list<int'.");
        \StorybookPhp\Runtime\Casting\parameterContract($parameter, 'list<int', null, HydrationContext::fromTypeMap(null));
    }

    public function testPropertyContractReadsVarPromotedParamAndBindings(): void
    {
        $none = HydrationContext::fromTypeMap(null);

        self::assertSame('list<' . Item::class . '>', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\propertyContract(\StorybookPhp\TestFixture\Hydration\propertyOf(Profile::class, 'items'), $none)));
        self::assertSame('array{foo: ' . Item::class . ', count?: int}', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\propertyContract(\StorybookPhp\TestFixture\Hydration\propertyOf(Shaped::class, 'shape'), $none)));
        self::assertSame('mixed', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\propertyContract(\StorybookPhp\TestFixture\Hydration\propertyOf(Profile::class, 'meta'), $none)));
        self::assertSame('string', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\propertyContract(\StorybookPhp\TestFixture\Hydration\propertyOf(Profile::class, 'name'), $none)));
        self::assertSame(
            Item::class,
            \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Casting\propertyContract(
                \StorybookPhp\TestFixture\Hydration\propertyOf(Profile::class, 'meta'),
                HydrationContext::fromTypeMap(['bindings' => [Profile::class . '::$meta' => Item::class]]),
            )),
        );
    }

    public function testSlotKeysAndLabels(): void
    {
        $constructorParameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Profile::class, '__construct'], 'name');
        $setterParameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Profile::class, 'setTheme'], 'theme');
        $functionParameter = \StorybookPhp\TestFixture\Hydration\parameterOf('StorybookPhp\TestFixture\Hydration\acceptsShape', 'shape');
        $property = \StorybookPhp\TestFixture\Hydration\propertyOf(Profile::class, 'items');

        self::assertSame(
            ['storybookphp\testfixture\hydration\profile::__construct($name)', 'storybookphp\testfixture\hydration\profile::$name'],
            \StorybookPhp\Runtime\Casting\parameterSlotKeys($constructorParameter),
        );
        self::assertSame(
            ['storybookphp\testfixture\hydration\profile::settheme($theme)', 'storybookphp\testfixture\hydration\profile::$theme'],
            \StorybookPhp\Runtime\Casting\parameterSlotKeys($setterParameter),
        );
        self::assertSame(['storybookphp\testfixture\hydration\acceptsshape($shape)'], \StorybookPhp\Runtime\Casting\parameterSlotKeys($functionParameter));
        self::assertSame(['storybookphp\testfixture\hydration\profile::$items'], \StorybookPhp\Runtime\Casting\propertySlotKeys($property));
        self::assertSame(Profile::class . '::__construct($name)', \StorybookPhp\Runtime\Casting\parameterLabel($constructorParameter));
        self::assertSame('StorybookPhp\TestFixture\Hydration\acceptsShape($shape)', \StorybookPhp\Runtime\Casting\parameterLabel($functionParameter));
        self::assertSame(Profile::class . '::$items', \StorybookPhp\Runtime\Casting\propertyLabel($property));
        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull(null));
        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull(\StorybookPhp\TestFixture\Hydration\parameterOf([SelfLinked::class, '__construct'], 'next')->getType()));
        self::assertFalse(\StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull($property->getType()));
    }

    public function testOverrideDocTypesFromArgumentDefinitions(): void
    {
        $arrayParameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Container::class, '__construct'], 'pairs');
        $classParameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Container::class, '__construct'], 'collection');
        $untypedParameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Untyped::class, '__construct'], 'status');
        $stringParameter = \StorybookPhp\TestFixture\Hydration\parameterOf([Profile::class, '__construct'], 'name');

        self::assertNull(\StorybookPhp\Runtime\Casting\buildOverrideDocType($arrayParameter, []));
        self::assertNull(\StorybookPhp\Runtime\Casting\buildOverrideDocType($arrayParameter, ['type' => 'array']));
        self::assertNull(\StorybookPhp\Runtime\Casting\buildOverrideDocType($arrayParameter, ['type' => 'unknown']));
        self::assertSame('int', \StorybookPhp\Runtime\Casting\buildOverrideDocType($arrayParameter, ['type' => 'int']));
        self::assertSame('Pair[]', \StorybookPhp\Runtime\Casting\buildOverrideDocType($arrayParameter, ['type' => 'array', 'elementType' => 'Pair']));
        self::assertSame('Pair[]', \StorybookPhp\Runtime\Casting\buildOverrideDocType($arrayParameter, ['elementType' => 'Pair']));
        self::assertSame(TypedCollection::class . '<Pair>', \StorybookPhp\Runtime\Casting\buildOverrideDocType($classParameter, ['elementType' => 'Pair']));
        self::assertSame(TypedCollection::class . '<Pair>', \StorybookPhp\Runtime\Casting\buildOverrideDocType($classParameter, ['type' => TypedCollection::class, 'elementType' => 'Pair']));
        self::assertSame('Pair[]', \StorybookPhp\Runtime\Casting\buildOverrideDocType($untypedParameter, ['elementType' => 'Pair']));
        self::assertSame('Pair', \StorybookPhp\Runtime\Casting\buildOverrideDocType($stringParameter, ['elementType' => 'Pair']));
        self::assertNull(\StorybookPhp\Runtime\Casting\buildOverrideDocType($stringParameter, ['type' => ' String ']));
        self::assertNull(\StorybookPhp\Runtime\Casting\argDefDocType(['type' => 'mixed']));
        self::assertSame('Pair[]', \StorybookPhp\Runtime\Casting\argDefDocType(['elementType' => 'Pair']));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride(\StorybookPhp\TestFixture\Hydration\parameterOf([Page::class, '__construct'], 'block'), 'string'));
        self::assertTrue(\StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride($classParameter, 'TypedCollection'));
        self::assertNull(\StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName(' ', $stringParameter));
        self::assertSame('missing', \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName('Missing', $stringParameter));
    }
}
