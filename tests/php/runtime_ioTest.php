<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

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
