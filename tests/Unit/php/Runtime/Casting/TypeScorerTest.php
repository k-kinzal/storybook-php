<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;

final class TypeScorerTest extends TestCase
{
    public function testPrefersExactIntegersToConvertibleStrings(): void
    {
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreIntTypeMatch(42));
        self::assertSame(2, \StorybookPhp\Runtime\Casting\scoreIntTypeMatch('42'));
    }
}
