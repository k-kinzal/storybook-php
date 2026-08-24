<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use stdClass;

final class ObjectInstantiatorTest extends TestCase
{
    public function testInstantiatesAClassWithoutConstructorArguments(): void
    {
        self::assertInstanceOf(stdClass::class, \StorybookPhp\Runtime\Casting\instantiateClassFromValue(stdClass::class, []));
    }
}
