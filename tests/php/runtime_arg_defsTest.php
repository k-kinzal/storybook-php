<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_arg_defsTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('normalizeNamedArgDefMap');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_arg_defs.php'),
            $reflection->getFileName(),
        );
    }
}
