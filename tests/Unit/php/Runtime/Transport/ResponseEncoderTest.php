<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Transport;

use PHPUnit\Framework\TestCase;

final class ResponseEncoderTest extends TestCase
{
    public function testEncodesOnlyTheValidatedProtocolShape(): void
    {
        self::assertSame('{"html":"rendered"}', \StorybookPhp\Runtime\Transport\encodeRunnerResponse(['html' => 'rendered']));
    }
}
