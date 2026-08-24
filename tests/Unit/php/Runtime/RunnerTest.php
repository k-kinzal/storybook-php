<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime;

use PHPUnit\Framework\TestCase;
use RuntimeException;

final class RunnerTest extends TestCase
{
    public function testEncodesUncaughtBoundaryFailures(): void
    {
        $response = json_decode(\StorybookPhp\Runtime\failure(new RuntimeException('failed')), true, 512, JSON_THROW_ON_ERROR);

        self::assertIsArray($response);
        self::assertSame('', $response['html']);
        self::assertSame('failed', $response['error']);
    }
}
