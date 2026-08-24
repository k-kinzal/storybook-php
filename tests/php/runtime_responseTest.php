<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_responseTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('resolveOutput');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_response.php'),
            $reflection->getFileName(),
        );
    }
}
