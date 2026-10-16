<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Contract\HydrationException;

/**
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\unexpectedTypeToken
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseCallableSignature
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseShapeType
 * @covers \StorybookPhp\Runtime\Contract\parseShapeKey
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class TypeExpressionTest extends TestCase
{
    /**
     * @dataProvider providerRoundTrips
     */
    public function testParsesAndDescribesTypeExpressions(string $expression, string $described): void
    {
        self::assertSame($described, \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Contract\parseTypeExpression($expression)));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function providerRoundTrips(): iterable
    {
        yield 'named' => ['string', 'string'];
        yield 'qualified class' => ['\App\Item', '\App\Item'];
        yield 'nullable' => ['?int', '?int'];
        yield 'union with spaces' => ['int | string | null', 'int|string|null'];
        yield 'intersection' => ['Countable&Traversable', 'Countable&Traversable'];
        yield 'dnf' => ['(A&B)|null', 'A&B|null'];
        yield 'generic' => ['array<string, App\Item>', 'array<string, App\Item>'];
        yield 'nested generic' => ['list<list<int>>', 'list<list<int>>'];
        yield 'bracket array' => ['App\Item[][]', 'array<array<App\Item>>'];
        yield 'shape' => ['array{foo: Foo, bar?: int}', 'array{foo: Foo, bar?: int}'];
        yield 'unsealed shape' => ['array{id: int, ...}', 'array{id: int, ...}'];
        yield 'positional shape' => ['list{int, string}', 'list{0: int, 1: string}'];
        yield 'parenthesised positional shape' => ['array{(int|string), ?Foo}', 'array{0: int|string, 1: ?Foo}'];
        yield 'quoted keys' => ["array{'a-b': int, \"c\": string}", 'array{a-b: int, c: string}'];
        yield 'trailing comma' => ['array{id: int,}', 'array{id: int}'];
        yield 'object shape' => ['object{name: string}', 'object{name: string}'];
        yield 'string literals' => ["'draft'|'published'", "'draft'|'published'"];
        yield 'number literals' => ['1|2.5|-3', '1|2.5|-3'];
        yield 'bool literals' => ['true|false', 'true|false'];
        yield 'callable signature' => ['callable(int, string): ?string', 'callable'];
        yield 'closure signature' => ['\Closure(array<int>): void', '\Closure'];
        yield 'callable without signature' => ['callable', 'callable'];
        yield 'constant expression' => ['key-of<self::MAP_*>', 'key-of<self::MAP_*>'];
        yield 'int range' => ['int<0, max>', 'int<0, max>'];
        yield 'this' => ['$this', '$this'];
    }

    public function testShapeFieldsExposeOptionalKeysAndSealing(): void
    {
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{foo: Foo, bar?: int, ...}');

        self::assertSame('shape', $node->kind);
        self::assertSame(['foo', 'bar'], array_keys($node->fields));
        self::assertSame(['bar'], $node->optionalKeys);
        self::assertFalse($node->sealed);
        self::assertSame('Foo', $node->fields['foo']->name);
    }

    public function testLiteralNodesCarryTypedValues(): void
    {
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression("'a\\'b'|7|1.5|true");

        self::assertSame("a'b", $node->members[0]->literal);
        self::assertSame(7, $node->members[1]->literal);
        self::assertSame(1.5, $node->members[2]->literal);
        self::assertTrue($node->members[3]->literal);
    }

    /**
     * @dataProvider providerMalformedExpressions
     */
    public function testRejectsMalformedExpressions(string $expression, string $reason): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage($reason);

        \StorybookPhp\Runtime\Contract\parseTypeExpression($expression);
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function providerMalformedExpressions(): iterable
    {
        yield 'empty' => ['  ', 'the docblock type expression is empty.'];
        yield 'trailing token' => ['int string', "unexpected 'string' at offset 4 in type 'int string'."];
        yield 'unclosed generic' => ['list<int', "expected '>' before the end of type 'list<int'."];
        yield 'wrong closer' => ['list<int}', "expected '>' but found '}' at offset 8 in type 'list<int}'."];
        yield 'dangling union' => ['int|', "unexpected end of type 'int|'."];
        yield 'leading punct' => ['>int', "unexpected '>' at offset 0 in type '>int'."];
        yield 'unclosed callable' => ['callable(int', "unclosed callable signature in type 'callable(int'."];
        yield 'bad character' => ['int%', "unexpected character '%' at offset 3 in type 'int%'."];
        yield 'unclosed shape' => ['array{id: int', "expected '}' before the end of type 'array{id: int'."];
    }

}
