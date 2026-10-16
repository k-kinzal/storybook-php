<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\ListCollection;

require_once __DIR__ . '/fixtures/RunnerFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 */
final class runtime_cast_valuesTest extends TestCase
{
    public function testCollectionWrappersTakeTheWholeListAsOneArrayArgument(): void
    {
        $wrapping = new ReflectionMethod(ListCollection::class, '__construct');
        $positional = new ReflectionMethod(BrokenCollection::class, '__construct');
        $scalar = new ReflectionMethod(Item::class, '__construct');

        self::assertTrue(\StorybookPhp\Runtime\Casting\constructorWrapsList($wrapping));
        self::assertFalse(\StorybookPhp\Runtime\Casting\constructorWrapsList($positional));
        self::assertFalse(\StorybookPhp\Runtime\Casting\constructorWrapsList($scalar));
    }

    public function testArrayAcceptanceCoversUntypedUnionAndNullableParameters(): void
    {
        $untyped = new ReflectionParameter(static function ($value): void {
        }, 0);
        $union = new ReflectionParameter(static function (array|string $value): void {
        }, 0);
        $nullable = new ReflectionParameter(static function (?iterable $value): void {
        }, 0);
        $rejecting = new ReflectionParameter(static function (int|string $value): void {
        }, 0);

        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($untyped));
        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($union));
        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($nullable));
        self::assertFalse(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($rejecting));
    }
}
