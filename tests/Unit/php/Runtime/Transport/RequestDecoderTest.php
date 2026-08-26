<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Transport;

use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @covers \StorybookPhp\Runtime\Transport\decodeRunnerRequest
 * @covers \StorybookPhp\Runtime\Transport\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Transport\readRunnerStdin
 * @covers \StorybookPhp\Runtime\Transport\requireRunnerInput
 */
final class RequestDecoderTest extends TestCase
{
    public function testDecodesAJsonObjectWithoutAssumingItsFieldContracts(): void
    {
        self::assertSame(['type' => 'template'], \StorybookPhp\Runtime\Transport\decodeRunnerRequest('{"type":"template"}'));
    }

    public function testReadsTheConfiguredInputStream(): void
    {
        self::assertSame('', \StorybookPhp\Runtime\Transport\readRunnerStdin('php://memory'));
    }

    public function testRejectsAnUnreadableInputStreamResult(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Failed to read request from stdin.');

        \StorybookPhp\Runtime\Transport\requireRunnerInput(false);
    }
}
