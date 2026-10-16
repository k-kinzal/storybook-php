<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use RuntimeException;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\Hydration\TypedCollection;
use StorybookPhp\TestFixture\Item;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Casting\classStateArgDefs
 * @covers \StorybookPhp\Runtime\Casting\constructorArgumentValue
 * @covers \StorybookPhp\Runtime\Casting\describeConstructor
 * @covers \StorybookPhp\Runtime\Casting\parameterDefaultValue
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
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
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\castInlineDocTypeValue
 * @covers \StorybookPhp\Runtime\Casting\castTemplateArgValue
 * @covers \StorybookPhp\Runtime\Casting\castTemplateArgs
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\castToBool
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class InlineCasterTest extends TestCase
{
    public function testCastInlineDocTypeValueHydratesFullyQualifiedDocTypes(): void
    {
        self::assertNull(\StorybookPhp\Runtime\Casting\castInlineDocTypeValue(null, 'string'));
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('5', '?int'));
        self::assertSame(['a' => 1], \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(['a' => '1'], 'array<string, int>'));

        $items = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'a']], 'list<' . Item::class . '>');
        self::assertIsArray($items);
        self::assertInstanceOf(Item::class, $items[0]);
        $collection = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'b']], TypedCollection::class . '<' . Item::class . '>');
        self::assertInstanceOf(TypedCollection::class, $collection);
        self::assertInstanceOf(Item::class, $collection->items[0]);
        self::assertSame('b', $collection->items[0]->label);
        $bound = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(['prefix' => 'p-'], FormatterInterface::class, ['bindings' => [FormatterInterface::class => Formatter::class]]);
        self::assertInstanceOf(Formatter::class, $bound);
    }

    public function testCastInlineDocTypeValueReportsUnparsableTypesAtTheLabel(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate template argument \$x: the type 'array<' cannot be parsed: unexpected end of type 'array<'.");

        \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('x', 'array<', null, 'template argument $x');
    }

    public function testCastTemplateArgValueHonoursTypeAndElementType(): void
    {
        self::assertSame([1, 2], \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'array', 'elementType' => 'int'], ['1', '2']));
        self::assertSame('keep', \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'unknown'], 'keep'));
        self::assertSame('keep', \StorybookPhp\Runtime\Casting\castTemplateArgValue([], 'keep'));
        self::assertNull(\StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'string'], null));
        self::assertTrue(\StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'bool'], 'yes'));

        $wrapped = \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => TypedCollection::class, 'elementType' => Item::class], [['label' => 'c']]);
        self::assertInstanceOf(TypedCollection::class, $wrapped);
        self::assertInstanceOf(Item::class, $wrapped->items[0]);
        self::assertSame('c', $wrapped->items[0]->label);
    }

    public function testCastTemplateArgsAppliesDefaultsNullablesAndSkipsInvalidDefinitions(): void
    {
        $casted = \StorybookPhp\Runtime\Casting\castTemplateArgs(
            ['title' => 'Hello', 'extra' => 'kept'],
            [
                'skip' => 'ignore-me',
                'title' => ['type' => 'string', 'required' => true],
                'count' => ['type' => 'int', 'required' => false, 'default' => '3'],
                'note' => ['type' => 'string', 'required' => false, 'nullable' => true],
                'optional' => ['type' => 'string', 'required' => false],
            ],
        );

        self::assertSame(['title' => 'Hello', 'extra' => 'kept', 'count' => 3, 'note' => null], $casted);
    }

    public function testCastTemplateArgsReportsMissingRequiredArguments(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Missing required argument: title (the template argument has no default; pass it in the story args).');

        \StorybookPhp\Runtime\Casting\castTemplateArgs([], ['title' => ['type' => 'string', 'required' => true]]);
    }

    public function testCastTemplateArgsReportsTheArgumentThatRejectedAValue(): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("Cannot hydrate template argument \$count: expected int, received string 'x'.");

        \StorybookPhp\Runtime\Casting\castTemplateArgs(['count' => 'x'], ['count' => ['type' => 'int']]);
    }
}
