<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Contract\stringifyOutputValue
 */
final class ValueNormalizerTest extends TestCase
{
    public function testRejectsImplicitMixedStringCasts(): void
    {
        self::assertSame('42', \StorybookPhp\Runtime\Contract\stringifyOutputValue(42));
        self::assertSame('', \StorybookPhp\Runtime\Contract\stringifyOutputValue(['42']));
    }
}
