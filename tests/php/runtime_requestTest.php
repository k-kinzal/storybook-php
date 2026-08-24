<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_requestTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('readRunnerRequest');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_request.php'),
            $reflection->getFileName(),
        );
    }
}
