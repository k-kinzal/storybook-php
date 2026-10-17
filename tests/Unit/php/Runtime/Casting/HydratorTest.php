<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use ArrayIterator;
use PHPUnit\Framework\TestCase;
use stdClass;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\TestFixture\StringableValue;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMappings
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\castToFloat
 * @covers \StorybookPhp\Runtime\Casting\castToBool
 * @covers \StorybookPhp\Runtime\Casting\castToNumeric
 * @covers \StorybookPhp\Runtime\Casting\hydrateLiteralType
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 */
final class HydratorTest extends TestCase
{
    /**
     * @dataProvider providerBuiltinConversions
     */
    public function testCastBuiltinValueAcceptsLosslessConversions(string $builtin, mixed $value, mixed $expected): void
    {
        self::assertSame($expected, \StorybookPhp\Runtime\Casting\castBuiltinValue($builtin, $value, HydrationContext::fromTypes(null)));
    }

    /**
     * @return iterable<string, array{string, mixed, mixed}>
     */
    public static function providerBuiltinConversions(): iterable
    {
        yield 'mixed' => ['mixed', ['x'], ['x']];
        yield 'string' => ['string', 'x', 'x'];
        yield 'string from int' => ['string', 12, '12'];
        yield 'string from bool' => ['string', true, '1'];
        yield 'int' => ['int', 3, 3];
        yield 'int from bool' => ['int', true, 1];
        yield 'int from integral float' => ['int', 4.0, 4];
        yield 'int from numeric string' => ['int', '12', 12];
        yield 'int from float string' => ['int', '2.0', 2];
        yield 'float' => ['float', 1.5, 1.5];
        yield 'float from int' => ['float', 2, 2.0];
        yield 'float from string' => ['float', '2.5', 2.5];
        yield 'bool' => ['bool', false, false];
        yield 'bool from int' => ['bool', 2, true];
        yield 'bool from zero float' => ['bool', 0.0, false];
        yield 'bool from off' => ['bool', 'OFF', false];
        yield 'bool from empty string' => ['bool', '', false];
        yield 'array' => ['array', ['a'], ['a']];
        yield 'list' => ['list', [1], [1]];
        yield 'iterable' => ['iterable', ['a'], ['a']];
        yield 'callable' => ['callable', 'strlen', 'strlen'];
        yield 'scalar' => ['scalar', 1.5, 1.5];
        yield 'numeric int string' => ['numeric', '12', 12];
        yield 'numeric float string' => ['numeric', '1.5', 1.5];
        yield 'numeric exponent string' => ['numeric', '1e3', 1000.0];
        yield 'numeric int' => ['numeric', 7, 7];
    }

    public function testCastBuiltinValueConvertsObjectsAndStringables(): void
    {
        $context = HydrationContext::fromTypes(null);
        $object = new stdClass();
        $iterator = new ArrayIterator([]);
        $resource = fopen('php://memory', 'rb');

        self::assertIsResource($resource);
        self::assertSame($object, \StorybookPhp\Runtime\Casting\castBuiltinValue('object', $object, $context));
        self::assertSame(['a' => 1], (array) \StorybookPhp\Runtime\Casting\castBuiltinValue('object', ['a' => 1], $context));
        self::assertSame($iterator, \StorybookPhp\Runtime\Casting\castBuiltinValue('iterable', $iterator, $context));
        self::assertSame('text', \StorybookPhp\Runtime\Casting\castBuiltinValue('string', new StringableValue('text'), $context));
        self::assertSame($resource, \StorybookPhp\Runtime\Casting\castBuiltinValue('resource', $resource, $context));
        fclose($resource);
    }

    /**
     * @dataProvider providerBuiltinRejections
     */
    public function testCastBuiltinValueRejectsLossyConversions(string $builtin, mixed $value, string $reason): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage('Cannot hydrate App\Card::$slot: ' . $reason);

        \StorybookPhp\Runtime\Casting\castBuiltinValue($builtin, $value, HydrationContext::fromTypes(null)->at('App\Card::$slot'));
    }

    /**
     * @return iterable<string, array{string, mixed, string}>
     */
    public static function providerBuiltinRejections(): iterable
    {
        yield 'string from array' => ['string', ['x'], 'expected string, received list of 1 item.'];
        yield 'int from text' => ['int', 'abc', "expected int, received string 'abc'."];
        yield 'int from fraction' => ['int', 2.5, 'expected int, received float 2.5.'];
        yield 'int from fraction string' => ['int', '2.5', "expected int, received string '2.5'."];
        yield 'float from text' => ['float', 'x', "expected float, received string 'x'."];
        yield 'bool from text' => ['bool', 'maybe', "expected bool, received string 'maybe'. Use true/false, 1/0, or 'yes'/'no'."];
        yield 'array from string' => ['array', 'x', "expected array, received string 'x'."];
        yield 'iterable from int' => ['iterable', 1, 'expected iterable, received int 1.'];
        yield 'object from int' => ['object', 1, 'expected object, received int 1.'];
        yield 'callable from text' => ['callable', 'no-such-function', "expected callable, received string 'no-such-function'."];
        yield 'scalar from array' => ['scalar', [], 'expected scalar, received empty array.'];
        yield 'numeric from text' => ['numeric', 'x', "expected numeric, received string 'x'."];
        yield 'resource from int' => ['resource', 1, 'expected resource, received int 1.'];
        yield 'null' => ['null', 'x', "expected null, received string 'x'."];
        yield 'void' => ['void', 'x', "expected void, received string 'x'. A void parameter cannot receive a value."];
        yield 'never' => ['never', 'x', "expected never, received string 'x'. A never parameter cannot receive a value."];
        yield 'self' => ['self', 'x', "expected self, received string 'x'. 'self' could not be resolved to a class because the declaration has no owning class."];
        yield 'unsupported' => ['bogus', 'x', "expected bogus, received string 'x'. 'bogus' is not a supported builtin type."];
    }

    public function testHydrateValuePassesNullThroughAndDispatchesByKind(): void
    {
        $context = HydrationContext::fromTypes(null);

        self::assertNull(\StorybookPhp\Runtime\Casting\hydrateValue(null, new TypeNode('named', 'int'), $context));
        self::assertSame(5, \StorybookPhp\Runtime\Casting\hydrateValue('5', \StorybookPhp\Runtime\Contract\parseTypeExpression('?int'), $context));
        self::assertSame('x', \StorybookPhp\Runtime\Casting\hydrateValue('x', \StorybookPhp\Runtime\Contract\parseTypeExpression('unknown'), $context));
    }

    /**
     * @dataProvider providerLiterals
     */
    public function testHydrateLiteralTypeAcceptsEquivalentScalars(string $literal, mixed $value, mixed $expected): void
    {
        self::assertSame($expected, \StorybookPhp\Runtime\Casting\hydrateValue($value, \StorybookPhp\Runtime\Contract\parseTypeExpression($literal), HydrationContext::fromTypes(null)));
    }

    /**
     * @return iterable<string, array{string, mixed, mixed}>
     */
    public static function providerLiterals(): iterable
    {
        yield 'string' => ["'draft'", 'draft', 'draft'];
        yield 'int' => ['2', 2, 2];
        yield 'int from string' => ['2', '2', 2];
        yield 'float from string' => ['2.5', '2.5', 2.5];
        yield 'true from string' => ['true', 'yes', true];
        yield 'false from int' => ['false', 0, false];
    }

    /**
     * @dataProvider providerLiteralRejections
     */
    public function testHydrateLiteralTypeRejectsOtherValues(string $literal, mixed $value, string $reason): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage($reason);

        \StorybookPhp\Runtime\Casting\hydrateValue($value, \StorybookPhp\Runtime\Contract\parseTypeExpression($literal), HydrationContext::fromTypes(null));
    }

    /**
     * @return iterable<string, array{string, mixed, string}>
     */
    public static function providerLiteralRejections(): iterable
    {
        yield 'other string' => ["'draft'", 'published', "expected 'draft', received string 'published'."];
        yield 'other number' => ['2', '3', "expected 2, received string '3'."];
        yield 'true from false flag' => ['true', 'no', "expected true, received string 'no'."];
        yield 'bool from array' => ['false', [], 'expected false, received empty array.'];
    }

    public function testDescribeHydrationValueSummarisesPayloads(): void
    {
        self::assertSame('null', \StorybookPhp\Runtime\Casting\describeHydrationValue(null));
        self::assertSame('bool false', \StorybookPhp\Runtime\Casting\describeHydrationValue(false));
        self::assertSame('int 3', \StorybookPhp\Runtime\Casting\describeHydrationValue(3));
        self::assertSame('float 1.5', \StorybookPhp\Runtime\Casting\describeHydrationValue(1.5));
        self::assertSame("string 'short'", \StorybookPhp\Runtime\Casting\describeHydrationValue('short'));
        self::assertSame("string '" . str_repeat('a', 37) . "...'", \StorybookPhp\Runtime\Casting\describeHydrationValue(str_repeat('a', 41)));
        self::assertSame('empty array', \StorybookPhp\Runtime\Casting\describeHydrationValue([]));
        self::assertSame('list of 1 item', \StorybookPhp\Runtime\Casting\describeHydrationValue([1]));
        self::assertSame('list of 2 items', \StorybookPhp\Runtime\Casting\describeHydrationValue([1, 2]));
        self::assertSame('object with keys [a, 1]', \StorybookPhp\Runtime\Casting\describeHydrationValue(['a' => 1, 1 => 2]));
        self::assertSame('stdClass instance', \StorybookPhp\Runtime\Casting\describeHydrationValue(new stdClass()));
    }

    public function testHydrationFailureAppendsHints(): void
    {
        $context = HydrationContext::fromTypes(null)->at('App\Card::$count');

        self::assertSame("Cannot hydrate App\\Card::\$count: expected int, received string 'x'.", \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'int', 'x')->getMessage());
        self::assertSame("Cannot hydrate App\\Card::\$count: expected int, received string 'x'. Hint.", \StorybookPhp\Runtime\Casting\hydrationFailure($context, 'int', 'x', 'Hint.')->getMessage());
    }

}
