<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;

final class InlineCasterTest extends TestCase
{
    public function testCastsOnlyTheSupportedInlineBuiltinContract(): void
    {
        self::assertSame(42, \StorybookPhp\Runtime\Casting\castInlineBuiltinType('int', '42'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isInlineBuiltinType('DateTimeImmutable'));
    }
}
