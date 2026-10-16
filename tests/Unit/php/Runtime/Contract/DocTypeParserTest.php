<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Contract\splitGenericArgs
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockVarType
 * @covers \StorybookPhp\Runtime\Contract\leadingTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\whitespaceJoinsTypeExpression
 */
final class DocTypeParserTest extends TestCase
{
    public function testSplitsOnlyTopLevelGenericArguments(): void
    {
        self::assertSame(['string', 'list<Foo>'], \StorybookPhp\Runtime\Contract\splitGenericArgs('string, list<Foo>'));
    }

    public function testParseDocBlockVarTypePrefersTheMostSpecificTag(): void
    {
        self::assertNull(\StorybookPhp\Runtime\Contract\parseDocBlockVarType(false));
        self::assertNull(\StorybookPhp\Runtime\Contract\parseDocBlockVarType('/** no type */'));
        self::assertSame('list<int>', \StorybookPhp\Runtime\Contract\parseDocBlockVarType("/**\n * @var array<int> \$items\n * @phpstan-var list<int>\n */"));
        self::assertSame('array{foo: int, bar?: string}', \StorybookPhp\Runtime\Contract\parseDocBlockVarType('/** @var array{foo: int, bar?: string} $value description */'));
        self::assertSame('array<string, int>', \StorybookPhp\Runtime\Contract\parseDocBlockVarType("/** @psalm-var array<string, int>\t\$counts */"));
    }

    public function testLeadingTypeExpressionStopsAtTopLevelWhitespace(): void
    {
        self::assertSame('int', \StorybookPhp\Runtime\Contract\leadingTypeExpression('int $value'));
        self::assertSame('callable(int, string): void', \StorybookPhp\Runtime\Contract\leadingTypeExpression('callable(int, string): void $fn'));
        self::assertSame('list<int>', \StorybookPhp\Runtime\Contract\leadingTypeExpression('list<int>'));
        self::assertSame('int | string', \StorybookPhp\Runtime\Contract\leadingTypeExpression('int | string $value'));
        self::assertSame('A &B', \StorybookPhp\Runtime\Contract\leadingTypeExpression('A &B $value'));
    }
}
