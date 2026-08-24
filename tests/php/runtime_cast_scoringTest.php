<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_cast_scoringTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('scoreInlineNamedTypeMatch');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_cast_scoring.php'),
            $reflection->getFileName(),
        );
    }
}
