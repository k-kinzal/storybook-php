<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use ArrayIterator;
use PHPUnit\Framework\TestCase;
use stdClass;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\Hydration\Pair;
use StorybookPhp\TestFixture\Hydration\TypedCollection;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\StringableValue;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
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
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch
 * @covers \StorybookPhp\Runtime\Casting\selectUnionMember
 * @covers \StorybookPhp\Runtime\Casting\scoreUnionTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreIntersectionTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreBuiltinTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStructuralBuiltinMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreLiteralTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStringTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreIntTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreFloatTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreBoolTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreClassTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreShapeTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsClassLike
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 */
final class TypeScorerTest extends TestCase
{
    /**
     * @dataProvider providerScores
     */
    public function testScoreTypeNodeMatchRanksValuesByExactness(string $type, mixed $value, int $score): void
    {
        $context = HydrationContext::fromTypeMap(['bindings' => [FormatterInterface::class => Formatter::class]]);

        self::assertSame($score, \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch(\StorybookPhp\Runtime\Contract\parseTypeExpression($type), $value, $context));
    }

    /**
     * @return iterable<string, array{string, mixed, int}>
     */
    public static function providerScores(): iterable
    {
        yield 'string exact' => ['string', 'x', 3];
        yield 'string from stringable' => ['string', new StringableValue('x'), 2];
        yield 'string from int' => ['string', 1, 1];
        yield 'string from array' => ['string', [], 0];
        yield 'int exact' => ['int', 1, 3];
        yield 'int from digits' => ['int', '-4', 2];
        yield 'int from integral float' => ['int', 2.0, 1];
        yield 'int from text' => ['int', 'x', 0];
        yield 'float exact' => ['float', 1.5, 3];
        yield 'float from int' => ['float', 1, 2];
        yield 'float from numeric string' => ['float', '1.5', 1];
        yield 'float from text' => ['float', 'x', 0];
        yield 'bool exact' => ['bool', true, 3];
        yield 'bool from bit' => ['bool', 1, 1];
        yield 'bool from flag word' => ['bool', 'off', 1];
        yield 'bool from other int' => ['bool', 2, 0];
        yield 'array' => ['array', [1], 3];
        yield 'array from scalar' => ['array', 1, 0];
        yield 'list from list' => ['list', [1], 3];
        yield 'list from map' => ['list', ['a' => 1], 1];
        yield 'iterable from traversable' => ['iterable', new ArrayIterator([]), 3];
        yield 'object exact' => ['object', new stdClass(), 3];
        yield 'object from array' => ['object', [], 1];
        yield 'callable' => ['callable', 'strlen', 3];
        yield 'null' => ['null', null, 3];
        yield 'scalar' => ['scalar', 1, 3];
        yield 'numeric from string' => ['numeric', '1.5', 2];
        yield 'numeric from text' => ['numeric', 'x', 0];
        yield 'resource from int' => ['resource', 1, 0];
        yield 'mixed' => ['mixed', 1, 0];
        yield 'void' => ['void', 1, 0];
        yield 'nullable with null' => ['?int', null, 3];
        yield 'nullable with value' => ['?int', '1', 2];
        yield 'union max' => ['int|string', '1', 3];
        yield 'literal exact' => ["'a'", 'a', 3];
        yield 'literal numeric string' => ['2', '2', 2];
        yield 'literal numeric mismatch' => ['2', '3', 0];
        yield 'literal other' => ["'a'", 'b', 0];
        yield 'class instance' => [Item::class, new Item('x'), 3];
        yield 'class foreign instance' => [Item::class, new stdClass(), 0];
        yield 'class from map' => [Item::class, ['label' => 'x'], 2];
        yield 'class from list' => [Item::class, ['x'], 1];
        yield 'class from scalar' => [Item::class, 'x', 1];
        yield 'class from bad map' => [Pair::class, ['y' => 1], 0];
        yield 'class from bad scalar' => [BrokenCollection::class, 'x', 0];
        yield 'bound interface' => [FormatterInterface::class, ['prefix' => 'a'], 2];
        yield 'missing class' => ['App\Missing', [], 0];
        yield 'generic list' => ['list<int>', [1], 4];
        yield 'generic list from map' => ['list<int>', ['a' => 1], 1];
        yield 'generic array from traversable' => ['array<int>', new ArrayIterator([]), 2];
        yield 'generic array from scalar' => ['array<int>', 1, 0];
        yield 'generic builtin' => ['class-string<Foo>', 'Foo', 3];
        yield 'generic wrapper instance' => [TypedCollection::class . '<int>', new TypedCollection([]), 5];
        yield 'generic wrapper foreign instance' => [TypedCollection::class . '<int>', new stdClass(), 0];
        yield 'generic wrapper from list' => [TypedCollection::class . '<int>', [1], 4];
        yield 'generic wrapper missing' => ['App\Missing<int>', [1], 0];
        yield 'shape complete' => ['array{id: int, note?: string}', ['id' => 1], 4];
        yield 'shape missing key' => ['array{id: int}', [], 0];
        yield 'shape from scalar' => ['array{id: int}', 1, 0];
        yield 'object shape from object' => ['object{id: int}', new stdClass(), 4];
        yield 'object shape from array' => ['object{id: int}', [], 3];
        yield 'object shape from scalar' => ['object{id: int}', 1, 0];
        yield 'intersection instance' => ['Countable&Traversable', new ArrayIterator([]), 3];
        yield 'intersection foreign instance' => ['Countable&Traversable', new stdClass(), 0];
        yield 'intersection builtin member' => ['int&Traversable', new ArrayIterator([]), 0];
        yield 'intersection from array' => ['StorybookPhp\TestFixture\Item&Countable', ['label' => 'x'], 1];
        yield 'intersection from scalar' => ['Countable&Traversable', 1, 0];
    }

    public function testSelectUnionMemberPrefersEarlierMembersOnTiesAndMixed(): void
    {
        $context = HydrationContext::fromTypeMap(null);
        $tied = \StorybookPhp\Runtime\Contract\parseTypeExpression('scalar|string|int');
        $mixed = \StorybookPhp\Runtime\Contract\parseTypeExpression('int|mixed|string');

        self::assertSame('scalar', \StorybookPhp\Runtime\Casting\selectUnionMember($tied->members, 'x', $context)?->name);
        self::assertSame('int', \StorybookPhp\Runtime\Casting\selectUnionMember(\StorybookPhp\Runtime\Contract\parseTypeExpression('float|int')->members, '5', $context)?->name);
        self::assertSame('float', \StorybookPhp\Runtime\Casting\selectUnionMember(\StorybookPhp\Runtime\Contract\parseTypeExpression('float|int')->members, 5.5, $context)?->name);
        self::assertSame('mixed', \StorybookPhp\Runtime\Casting\selectUnionMember($mixed->members, [], $context)?->name);
        self::assertNull(\StorybookPhp\Runtime\Casting\selectUnionMember($tied->members, [], $context));
        self::assertNull(\StorybookPhp\Runtime\Casting\selectUnionMember([], 1, $context));
        self::assertNull(\StorybookPhp\Runtime\Casting\selectUnionMember([new TypeNode('intersection', '', [])], [], $context));
    }
}
