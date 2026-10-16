<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Contract\TypeNode;

/**
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseShapeKey
 * @covers \StorybookPhp\Runtime\Contract\parseShapeType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\typeNodeAcceptsNull
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 */
final class TypeAlgebraTest extends TestCase
{
    public function testMapTypeNodeNamesRewritesNamesAndSubstitutesNodes(): void
    {
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression('?array{items: list<T>, wrapper: Wrapper<T>}|Other');
        $mapped = \StorybookPhp\Runtime\Contract\mapTypeNodeNames(
            $node,
            static fn (string $name): TypeNode|string => $name === 'T' ? new TypeNode('named', 'App\Item') : 'App\\' . $name,
        );

        self::assertSame('?array{items: App\list<App\Item>, wrapper: App\Wrapper<App\Item>}|App\Other', \StorybookPhp\Runtime\Contract\describeTypeNode($mapped));
    }

    public function testNullAcceptanceAndStripping(): void
    {
        $nullable = \StorybookPhp\Runtime\Contract\parseTypeExpression('?int');
        $union = \StorybookPhp\Runtime\Contract\parseTypeExpression('int|null|string');
        $plain = \StorybookPhp\Runtime\Contract\parseTypeExpression('int|string');

        self::assertTrue(\StorybookPhp\Runtime\Contract\typeNodeAcceptsNull($nullable));
        self::assertTrue(\StorybookPhp\Runtime\Contract\typeNodeAcceptsNull($union));
        self::assertTrue(\StorybookPhp\Runtime\Contract\typeNodeAcceptsNull(new TypeNode('named', 'mixed')));
        self::assertFalse(\StorybookPhp\Runtime\Contract\typeNodeAcceptsNull($plain));
        self::assertFalse(\StorybookPhp\Runtime\Contract\typeNodeAcceptsNull(new TypeNode('literal', '', [], [], [], true, 1)));
        self::assertSame('int', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Contract\stripNullFromTypeNode($nullable)));
        self::assertSame('int|string', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Contract\stripNullFromTypeNode($union)));
        self::assertSame('int', \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Contract\stripNullFromTypeNode(\StorybookPhp\Runtime\Contract\parseTypeExpression('int|null'))));
        self::assertSame($plain, \StorybookPhp\Runtime\Contract\stripNullFromTypeNode($plain));
    }

    public function testMembersAndUnionBuilding(): void
    {
        $int = new TypeNode('named', 'int');
        $string = new TypeNode('named', 'string');

        self::assertSame([$int], \StorybookPhp\Runtime\Contract\typeNodeMembers($int));
        self::assertSame([$int, $string], \StorybookPhp\Runtime\Contract\typeNodeMembers(\StorybookPhp\Runtime\Contract\unionTypeNode([$int, $string])));
        self::assertSame($int, \StorybookPhp\Runtime\Contract\unionTypeNode([$int]));
    }

    /**
     * @dataProvider providerBuiltinNames
     */
    public function testCanonicalBuiltinTypeNames(string $name, ?string $canonical): void
    {
        self::assertSame($canonical, \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($name));
    }

    /**
     * @return iterable<string, array{string, string|null}>
     */
    public static function providerBuiltinNames(): iterable
    {
        yield 'canonical' => ['Int', 'int'];
        yield 'leading backslash' => ['\string', 'string'];
        yield 'alias' => ['boolean', 'bool'];
        yield 'this' => ['$this', 'static'];
        yield 'closure' => ['Closure', 'callable'];
        yield 'class string' => ['class-string', 'string'];
        yield 'non empty string' => ['non-empty-string', 'string'];
        yield 'positive int' => ['positive-int', 'int'];
        yield 'int mask' => ['int-mask-of', 'int'];
        yield 'array key' => ['array-key', 'mixed'];
        yield 'unknown pseudo type' => ['some-pseudo', 'mixed'];
        yield 'list' => ['list', 'list'];
        yield 'class' => ['App\Item', null];
        yield 'template' => ['T', null];
    }

    public function testArrayLikeNames(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Contract\isArrayLikeTypeName('non-empty-list'));
        self::assertTrue(\StorybookPhp\Runtime\Contract\isArrayLikeTypeName('\Array'));
        self::assertFalse(\StorybookPhp\Runtime\Contract\isArrayLikeTypeName('App\Collection'));
    }
}
