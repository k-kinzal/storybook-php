<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime;

use JsonException;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @covers \StorybookPhp\Runtime\failure
 * @covers \StorybookPhp\Runtime\Transport\buildRunnerErrorResponse
 * @covers \StorybookPhp\Runtime\Transport\encodeJsonResponse
 * @covers \StorybookPhp\Runtime\Transport\encodeRunnerResponse
 */
final class RunnerTest extends TestCase
{
    /**
     * @throws JsonException
     */
    public function testEncodesUncaughtBoundaryFailures(): void
    {
        $response = json_decode(\StorybookPhp\Runtime\failure(new RuntimeException('failed')), true, 512, JSON_THROW_ON_ERROR);

        self::assertIsArray($response);
        self::assertSame('', $response['html']);
        self::assertSame('failed', $response['error']);
    }
}
