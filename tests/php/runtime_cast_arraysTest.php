<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_cast_arraysTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('castArrayElements');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_cast_arrays.php'),
            $reflection->getFileName(),
        );
    }
}
