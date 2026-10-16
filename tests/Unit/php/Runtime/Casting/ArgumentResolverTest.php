<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use RuntimeException;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\Hydration\Page;
use StorybookPhp\TestFixture\Hydration\Pair;
use StorybookPhp\TestFixture\Item;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Casting\classStateArgDefs
 * @covers \StorybookPhp\Runtime\Casting\constructorArgumentValue
 * @covers \StorybookPhp\Runtime\Casting\describeConstructor
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Casting\parameterDefaultValue
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\resolveClassName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Casting\resolveArgs
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 * @covers \StorybookPhp\Runtime\Casting\layerClassArgDef
 * @covers \StorybookPhp\Runtime\Casting\isPlainArrayDocType
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Casting\resolveVariadicArgValues
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgValue
 * @covers \StorybookPhp\Runtime\Casting\resolveParamDocType
 * @covers \StorybookPhp\Runtime\Casting\castArg
 * @covers \StorybookPhp\Runtime\Casting\matchArgs
 * @covers \StorybookPhp\Runtime\Casting\resolveNamedArgs
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\buildOverrideDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride
 * @covers \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class ArgumentResolverTest extends TestCase
{
    public function testAnAbsentCallableHasNoResolvedArguments(): void
    {
        self::assertSame(['ordered' => [], 'named' => []], \StorybookPhp\Runtime\Casting\resolveArgs(null, ['ignored' => true]));
        self::assertSame([], \StorybookPhp\Runtime\Casting\matchArgs(null, []));
    }

    public function testResolveArgsLayersStoryArgsDefinitionDefaultsAndPhpDefaults(): void
    {
        $render = \StorybookPhp\TestFixture\Hydration\methodOf(Page::class, 'render');

        self::assertSame(['ordered' => ['t', 1], 'named' => ['title' => 't', 'limit' => 1]], \StorybookPhp\Runtime\Casting\resolveArgs($render, ['title' => 't']));
        self::assertSame(['title' => 'd', 'limit' => 4], \StorybookPhp\Runtime\Casting\resolveNamedArgs($render, [], null, ['title' => ['default' => 'd'], 'limit' => ['type' => 'int', 'default' => '4']]));
        self::assertSame(['title' => 'd', 'limit' => 1], \StorybookPhp\Runtime\Casting\resolveNamedArgs($render, [], null, ['title' => ['default' => 'd'], 'limit' => 'not-a-definition']));
        self::assertSame(['title' => 'a', 'limit' => 9], \StorybookPhp\Runtime\Casting\resolveNamedArgs($render, ['title' => 'a', 'limit' => 2], ['bindings' => [Page::class . '::render($limit)' => ['value' => '9']]]));
    }

    public function testResolveArgsHydratesVariadicsAndNullableParameters(): void
    {
        $formatter = \StorybookPhp\TestFixture\Hydration\functionOf('StorybookPhp\TestFixture\Hydration\acceptsFormatter');
        $typeMap = ['bindings' => [FormatterInterface::class => Formatter::class]];
        $resolved = \StorybookPhp\Runtime\Casting\resolveArgs($formatter, ['formatter' => 'p', 'fallbacks' => [['prefix' => 'a'], 'b']], $typeMap);

        self::assertCount(3, $resolved['ordered']);
        self::assertInstanceOf(Formatter::class, $resolved['ordered'][2]);
        self::assertSame('bB', $resolved['ordered'][2]->format('b'));
        self::assertIsArray($resolved['named']['fallbacks']);
        self::assertCount(2, $resolved['named']['fallbacks']);
        self::assertCount(2, \StorybookPhp\Runtime\Casting\matchArgs($formatter, ['formatter' => [], 'fallbacks' => 'single'], $typeMap));
        self::assertSame([null], \StorybookPhp\Runtime\Casting\matchArgs(\StorybookPhp\TestFixture\Hydration\methodOf(\StorybookPhp\TestFixture\Hydration\SelfLinked::class, '__construct'), []));
        self::assertSame([null], \StorybookPhp\Runtime\Casting\matchArgs(\StorybookPhp\TestFixture\Hydration\methodOf(\StorybookPhp\TestFixture\Hydration\Untyped::class, '__construct'), [], null, ['formatter' => ['nullable' => true]])[0] === null ? [null] : ['set']);
    }

    public function testResolveArgsReportsMissingRequiredArguments(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Missing required argument: x (StorybookPhp\TestFixture\Hydration\Pair::__construct($x) has no default value; pass it in the story args or bind it in typeMap).');

        \StorybookPhp\Runtime\Casting\matchArgs(\StorybookPhp\TestFixture\Hydration\methodOf(Pair::class, '__construct'), ['y' => 1]);
    }

    public function testResolveArgsReportsTheParameterThatRejectedAValue(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate StorybookPhp\\TestFixture\\Hydration\\Pair::__construct(\$y): expected int, received string 'two'.");

        \StorybookPhp\Runtime\Casting\matchArgs(\StorybookPhp\TestFixture\Hydration\methodOf(Pair::class, '__construct'), ['x' => 1, 'y' => 'two']);
    }

    public function testCastArgUsesTheDocumentedTypeForUntypedParameters(): void
    {
        $parameter = \StorybookPhp\TestFixture\Hydration\parameterOf([\StorybookPhp\TestFixture\Hydration\Untyped::class, '__construct'], 'formatter');

        self::assertSame(7, \StorybookPhp\Runtime\Casting\castArg($parameter, '7', 'int'));
        self::assertInstanceOf(Formatter::class, \StorybookPhp\Runtime\Casting\castArg($parameter, [], FormatterInterface::class, ['bindings' => [FormatterInterface::class => Formatter::class]]));
        self::assertSame(['raw'], \StorybookPhp\Runtime\Casting\castArg($parameter, ['raw']));
    }

    public function testIsPlainArrayDocTypeOnlyMatchesUndescribedArrays(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('?list'));
        self::assertTrue(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('null|iterable'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('array<int, Leaf>'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('array|string'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('Leaf'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('list<'));
    }

    public function testResolveConstructorArgDefsLayersClassEntriesUnderExplicitDefinitions(): void
    {
        $typeMap = ['classes' => [Pair::class => ['args' => ['x' => 'int', 'y' => ['type' => 'int', 'default' => '4']]]]];

        self::assertNull(\StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(\StorybookPhp\TestFixture\Hydration\classOf(\StorybookPhp\TestFixture\NoConstructorItem::class), null, $typeMap));
        self::assertSame(['x' => ['type' => 'string']], \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class), ['x' => ['type' => 'string']], null));
        self::assertSame(
            ['x' => ['type' => 'string'], 'y' => ['type' => 'int', 'default' => '4']],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class), ['x' => ['type' => 'string']], $typeMap),
        );
        self::assertSame(
            ['x' => ['type' => 'int', 'nullable' => true], 'y' => ['type' => 'int', 'default' => '4']],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class), ['x' => ['type' => 'array', 'nullable' => true]], $typeMap),
        );
    }

    public function testResolveParamDocTypePrefersOverridesOverDocblocks(): void
    {
        $parameter = \StorybookPhp\TestFixture\Hydration\parameterOf([\StorybookPhp\TestFixture\Hydration\Container::class, '__construct'], 'pairs');

        self::assertSame('Pair[]', \StorybookPhp\Runtime\Casting\resolveParamDocType($parameter, ['pairs' => 'Pair[]']));
        self::assertSame('list<' . Item::class . '>', \StorybookPhp\Runtime\Casting\resolveParamDocType($parameter, ['pairs' => 'Pair[]'], ['type' => 'list<' . Item::class . '>']));
        self::assertSame('Pair[]', \StorybookPhp\Runtime\Casting\resolveParamDocType($parameter, ['pairs' => 'Pair[]'], ['type' => 'array']));
        self::assertNull(\StorybookPhp\Runtime\Casting\resolveParamDocType($parameter, []));
    }
}
