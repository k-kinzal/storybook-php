<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;

final class ArrayCasterTest extends TestCase
{
    public function testKeepsNestedGenericAndIntersectionTypesIntact(): void
    {
        self::assertSame(
            ['Foo<Bar|Baz>', '(A&B)', 'string'],
            \StorybookPhp\Runtime\Casting\splitUnionTypes('Foo<Bar|Baz>|(A&B)|string'),
        );
    }
}
