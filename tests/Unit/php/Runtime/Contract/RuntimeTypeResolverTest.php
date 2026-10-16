<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Contract\requireExistingClass
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapBinding
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 */
final class RuntimeTypeResolverTest extends TestCase
{
    public function testNarrowsOnlySupportedRenderTypes(): void
    {
        $supported = file_get_contents('data://text/plain,template');
        $unsupported = file_get_contents('data://text/plain,unknown');

        self::assertIsString($supported);
        self::assertIsString($unsupported);
        self::assertTrue(\StorybookPhp\Runtime\Contract\isRenderType($supported));
        self::assertFalse(\StorybookPhp\Runtime\Contract\isRenderType($unsupported));
    }

    public function testResolveTypeMapBindingFollowsConfiguredTypeBindings(): void
    {
        self::assertSame('Foo', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', null));
        self::assertSame('Foo', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', ['bindings' => 'invalid']));
        self::assertSame('Bar', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', ['bindings' => ['Foo' => 'Bar']]));
    }

    public function testRequireExistingClassRejectsUnknownClasses(): void
    {
        self::assertSame(self::class, \StorybookPhp\Runtime\Contract\requireExistingClass(self::class));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Class 'App\\Missing' is not available.");
        \StorybookPhp\Runtime\Contract\requireExistingClass('App\Missing');
    }
}
