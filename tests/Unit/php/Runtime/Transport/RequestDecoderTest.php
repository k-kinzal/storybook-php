<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Transport;

use PHPUnit\Framework\TestCase;

final class RequestDecoderTest extends TestCase
{
    public function testDecodesAJsonObjectWithoutAssumingItsFieldContracts(): void
    {
        self::assertSame(['type' => 'template'], \StorybookPhp\Runtime\Transport\decodeRunnerRequest('{"type":"template"}'));
    }
}
