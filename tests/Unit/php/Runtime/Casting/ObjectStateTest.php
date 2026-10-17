<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\Hydration\Pair;
use StorybookPhp\TestFixture\Hydration\PrivateConstructor;
use StorybookPhp\TestFixture\Hydration\Profile;
use StorybookPhp\TestFixture\Hydration\SetterOnly;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\NoConstructorItem;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @uses \StorybookPhp\Runtime\Contract\expectTypeToken
 * @uses \StorybookPhp\Runtime\Contract\leadingTypeExpression
 * @uses \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @uses \StorybookPhp\Runtime\Contract\parseBindingKey
 * @uses \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @uses \StorybookPhp\Runtime\Contract\whitespaceJoinsTypeExpression
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\resolveComponentClassArgDefs
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Casting\parameterDefaultValue
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\propertySlotKeys
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMappings
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockVarType
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForProperty
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\findStateSlot
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\assignProperty
 * @covers \StorybookPhp\Runtime\Casting\describeStateSlots
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\propertyContract
 * @covers \StorybookPhp\Runtime\Casting\propertyLabel
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class ObjectStateTest extends TestCase
{
    public function testApplyObjectStateRejectsNullForNonNullableProperties(): void
    {
        $profile = new Profile('n');

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Profile::$items: the property is declared as array and does not accept null.');
        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['items' => null], HydrationContext::fromTypes(null));
    }

    public function testApplyObjectStateAcceptsNullForNullableProperties(): void
    {
        $profile = new Profile('n');
        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['age' => 3], HydrationContext::fromTypes(null));
        self::assertSame(3, $profile->age());

        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['age' => null, 'meta' => null], HydrationContext::fromTypes(null));
        self::assertNull($profile->age());
        self::assertNull($profile->meta);
    }

    public function testPropertyMappingsRefineContracts(): void
    {
        $context = HydrationContext::fromTypes([Profile::class . '::$meta' => Item::class]);
        $profile = new Profile('n');
        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['meta' => ['label' => 'typed'], 'theme' => 'dark', 'items' => [['label' => 'x']]], $context);
        self::assertInstanceOf(Item::class, $profile->meta);
        self::assertSame('typed', $profile->meta->label);
        self::assertSame('dark', $profile->theme());
        self::assertSame('x', $profile->items[0]->label);
    }



    public function testFindStateSlotPrefersSettersAndFallsBackToProperties(): void
    {
        $reflection = \StorybookPhp\TestFixture\Hydration\classOf(Profile::class);

        self::assertSame('theme', \StorybookPhp\Runtime\Casting\findStateSlot($reflection, 'theme')?->getName());
        self::assertSame('items', \StorybookPhp\Runtime\Casting\findStateSlot($reflection, 'ITEMS')?->getName());
        self::assertNull(\StorybookPhp\Runtime\Casting\findStateSlot($reflection, 'missing'));
        self::assertSame('value', \StorybookPhp\Runtime\Casting\findStateSlot(\StorybookPhp\TestFixture\Hydration\classOf(SetterOnly::class), 'value')?->getName());
        self::assertSame(null, \StorybookPhp\Runtime\Casting\findStateSlot(\StorybookPhp\TestFixture\Hydration\classOf(SetterOnly::class), 'user_value')?->getName());
    }

    public function testDescribeProperties(): void
    {
        self::assertSame(['$x', '$y'], \StorybookPhp\Runtime\Casting\describeStateSlots(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class)));
        self::assertSame(['$value'], \StorybookPhp\Runtime\Casting\describeStateSlots(\StorybookPhp\TestFixture\Hydration\classOf(SetterOnly::class)));
    }

    public function testUnionCandidatesUsePropertyNames(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, ['x' => 1]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, ['y' => 1]));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, [1]));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, ['other' => 1]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(NoConstructorItem::class, []));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(PrivateConstructor::class, []));
    }

    public function testStateKeyHelpers(): void
    {
        self::assertSame('user_name', \StorybookPhp\Runtime\Casting\findStateKey('userName', ['user_name' => 'a']));
        self::assertSame('userName', \StorybookPhp\Runtime\Casting\findStateKey('userName', ['user_name' => 'a', 'userName' => 'b']));
        self::assertNull(\StorybookPhp\Runtime\Casting\findStateKey('userName', ['other' => 'a']));
        self::assertSame('username', \StorybookPhp\Runtime\Casting\normalizeStateKey('User_Name'));
        self::assertSame(['0' => 'a', 'b' => 'c'], \StorybookPhp\Runtime\Casting\stringKeyedState([0 => 'a', 'b' => 'c']));
    }
}
