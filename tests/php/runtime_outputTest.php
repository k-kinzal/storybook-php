<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_outputTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('stringifyOutputValue');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_output.php'),
            $reflection->getFileName(),
        );
    }

    public function testOutputBufferFailureUsesTheRunnerExceptionContract(): void
    {
        self::assertSame('buffered', requireOutputBuffer('buffered'));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Failed to collect output buffer.');
        requireOutputBuffer(false);
    }
}
