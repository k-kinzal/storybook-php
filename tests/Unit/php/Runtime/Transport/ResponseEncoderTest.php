<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Transport;

use JsonException;
use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Transport\encodeRunnerResponse
 * @covers \StorybookPhp\Runtime\Transport\encodeJsonResponse
 */
final class ResponseEncoderTest extends TestCase
{
    /**
     * @throws JsonException
     */
    public function testEncodesOnlyTheValidatedProtocolShape(): void
    {
        self::assertSame('{"html":"rendered"}', \StorybookPhp\Runtime\Transport\encodeRunnerResponse(['html' => 'rendered']));
    }
}
