<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Transport\requireOutputBuffer
 */
final class runtime_outputTest extends TestCase
{
    public function testOutputBufferFailureUsesTheRunnerExceptionContract(): void
    {
        self::assertSame('buffered', \StorybookPhp\Runtime\Transport\requireOutputBuffer('buffered'));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Failed to collect output buffer.');
        \StorybookPhp\Runtime\Transport\requireOutputBuffer(false);
    }
}
