<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Transport\encodeRunnerResponse
 * @covers \StorybookPhp\Runtime\Transport\readRunnerRequest
 * @covers \StorybookPhp\Runtime\Transport\decodeRunnerRequest
 * @covers \StorybookPhp\Runtime\Transport\encodeJsonResponse
 */
final class runtime_ioTest extends TestCase
{
    public function testInvalidJsonUsesTheRunnerExceptionContract(): void
    {
        try {
            \StorybookPhp\Runtime\Transport\readRunnerRequest('{');
            self::fail('Expected invalid JSON to fail.');
        } catch (RuntimeException $exception) {
            self::assertSame('Invalid JSON request payload.', $exception->getMessage());
            self::assertInstanceOf(JsonException::class, $exception->getPrevious());
        }
    }

    public function testEncodingSubstitutesInvalidUtf8WithoutBreakingTheProtocol(): void
    {
        self::assertSame(
            '{"html":"\\ufffd1"}',
            \StorybookPhp\Runtime\Transport\encodeRunnerResponse(['html' => "\xB1\x31"]),
        );
    }
}
