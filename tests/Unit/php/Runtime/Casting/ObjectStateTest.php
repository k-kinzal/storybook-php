<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\Hydration\Magic;
use StorybookPhp\TestFixture\Hydration\Pair;
use StorybookPhp\TestFixture\Hydration\PrivateConstructor;
use StorybookPhp\TestFixture\Hydration\Profile;
use StorybookPhp\TestFixture\Hydration\SetterOnly;
use StorybookPhp\TestFixture\Hydration\Tags;
use StorybookPhp\TestFixture\Hydration\Untyped;
use StorybookPhp\TestFixture\Hydration\Variadic;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\NoConstructorItem;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\constructorArgumentValue
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
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
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs
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
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
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
 * @covers \StorybookPhp\Runtime\Casting\invokeMagicSetter
 * @covers \StorybookPhp\Runtime\Casting\classStateArgDefs
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\assignProperty
 * @covers \StorybookPhp\Runtime\Casting\describeStateSlots
 * @covers \StorybookPhp\Runtime\Casting\describeConstructor
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
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
        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['items' => null], HydrationContext::fromTypeMap(null));
    }

    public function testApplyObjectStateAcceptsNullForNullableProperties(): void
    {
        $profile = new Profile('n');
        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['age' => 3], HydrationContext::fromTypeMap(null));
        self::assertSame(3, $profile->age());

        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['age' => null, 'meta' => null], HydrationContext::fromTypeMap(null));
        self::assertNull($profile->age());
        self::assertNull($profile->meta);
    }

    public function testClassEntriesTypeSettersAndProperties(): void
    {
        $context = HydrationContext::fromTypeMap(['classes' => [
            Profile::class => ['args' => ['meta' => Item::class, 'theme' => 'string', 'items' => 'AliasItem[]']],
        ]]);
        $profile = new Profile('n');
        \StorybookPhp\Runtime\Casting\applyObjectState($profile, ['meta' => ['label' => 'typed'], 'theme' => 'dark', 'items' => ['x']], $context);

        self::assertInstanceOf(Item::class, $profile->meta);
        self::assertSame('typed', $profile->meta->label);
        self::assertSame('dark', $profile->theme());
        self::assertSame('x', $profile->items[0]->label);
        self::assertSame(
            ['meta' => ['type' => Item::class], 'theme' => ['type' => 'string'], 'items' => ['type' => 'AliasItem[]']],
            \StorybookPhp\Runtime\Casting\classStateArgDefs(\StorybookPhp\TestFixture\Hydration\classOf(Profile::class), $context),
        );
        self::assertSame([], \StorybookPhp\Runtime\Casting\classStateArgDefs(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class), $context));
    }

    public function testInvokeMagicSetterRequiresTheMagicMethod(): void
    {
        $magic = new Magic();
        \StorybookPhp\Runtime\Casting\invokeMagicSetter($magic, 'anything', 1);
        self::assertSame(['anything' => 1], $magic->dynamic);

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate StorybookPhp\TestFixture\Hydration\Pair::$x: the class has no __set() method to receive dynamic state.');
        \StorybookPhp\Runtime\Casting\invokeMagicSetter(new Pair(1), 'x', 1);
    }

    public function testFindStateSlotPrefersSettersAndFallsBackToProperties(): void
    {
        $reflection = \StorybookPhp\TestFixture\Hydration\classOf(Profile::class);

        self::assertSame('setTheme', \StorybookPhp\Runtime\Casting\findStateSlot($reflection, 'theme')?->getName());
        self::assertSame('items', \StorybookPhp\Runtime\Casting\findStateSlot($reflection, 'ITEMS')?->getName());
        self::assertNull(\StorybookPhp\Runtime\Casting\findStateSlot($reflection, 'missing'));
        self::assertSame('value', \StorybookPhp\Runtime\Casting\findStateSlot(\StorybookPhp\TestFixture\Hydration\classOf(SetterOnly::class), 'value')?->getName());
        self::assertSame('setUserValue', \StorybookPhp\Runtime\Casting\findStateSlot(\StorybookPhp\TestFixture\Hydration\classOf(SetterOnly::class), 'user_value')?->getName());
    }

    public function testDescribeConstructorAndStateSlots(): void
    {
        self::assertSame('__construct(int $x, int $y = 0)', \StorybookPhp\Runtime\Casting\describeConstructor(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class)));
        self::assertSame('__construct(string ...$names)', \StorybookPhp\Runtime\Casting\describeConstructor(\StorybookPhp\TestFixture\Hydration\classOf(Variadic::class)));
        self::assertSame("__construct(\$formatter, \$status = 'draft')", \StorybookPhp\Runtime\Casting\describeConstructor(\StorybookPhp\TestFixture\Hydration\classOf(Untyped::class)));
        self::assertSame('no constructor', \StorybookPhp\Runtime\Casting\describeConstructor(\StorybookPhp\TestFixture\Hydration\classOf(NoConstructorItem::class)));
        self::assertSame(['$x', '$y'], \StorybookPhp\Runtime\Casting\describeStateSlots(\StorybookPhp\TestFixture\Hydration\classOf(Pair::class)));
        self::assertSame(['setUserValue()', '$value'], \StorybookPhp\Runtime\Casting\describeStateSlots(\StorybookPhp\TestFixture\Hydration\classOf(SetterOnly::class)));
    }

    public function testCanHydrateChecksMirrorTheConstructorShape(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, ['x' => 1]));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, ['y' => 1]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, [1]));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Pair::class, [1, 2, 3]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Variadic::class, [1, 2, 3]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(Tags::class, [[1], [2]]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(NoConstructorItem::class, []));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(NoConstructorItem::class, ['label' => 'x']));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(NoConstructorItem::class, ['x']));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromArray(PrivateConstructor::class, []));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar(Item::class));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar(Tags::class));
        self::assertTrue(\StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar(Pair::class));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar(BrokenCollection::class));
        self::assertFalse(\StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar(NoConstructorItem::class));
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
