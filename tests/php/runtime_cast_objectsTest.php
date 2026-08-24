<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_cast_objectsTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('instantiateClassFromValue');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_cast_objects.php'),
            $reflection->getFileName(),
        );
    }
}
