<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_request_executionTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('executeRunnerRequest');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_request_execution.php'),
            $reflection->getFileName(),
        );
    }
}
