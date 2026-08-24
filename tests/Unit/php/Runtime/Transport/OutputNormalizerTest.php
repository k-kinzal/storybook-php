<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Transport;

use PHPUnit\Framework\TestCase;

final class OutputNormalizerTest extends TestCase
{
    public function testRejectsImplicitMixedStringCasts(): void
    {
        self::assertSame('42', \StorybookPhp\Runtime\Transport\stringifyOutputValue(42));
        self::assertSame('', \StorybookPhp\Runtime\Transport\stringifyOutputValue(['42']));
    }
}
