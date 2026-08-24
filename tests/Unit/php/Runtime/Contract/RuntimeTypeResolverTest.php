<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;

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
}
