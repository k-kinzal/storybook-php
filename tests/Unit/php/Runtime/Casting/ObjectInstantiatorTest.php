<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use ReflectionException;
use stdClass;

/**
 * @covers \StorybookPhp\Runtime\Casting\instantiateClassFromValue
 */
final class ObjectInstantiatorTest extends TestCase
{
    /**
     * @throws ReflectionException
     */
    public function testInstantiatesAClassWithoutConstructorArguments(): void
    {
        self::assertInstanceOf(stdClass::class, \StorybookPhp\Runtime\Casting\instantiateClassFromValue(stdClass::class, []));
    }
}
