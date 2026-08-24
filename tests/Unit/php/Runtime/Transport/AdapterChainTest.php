<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Transport;

use PHPUnit\Framework\TestCase;

final class AdapterChainTest extends TestCase
{
    public function testNormalizesHtmlStringsToTheAdapterResponseContract(): void
    {
        self::assertSame(['html' => 'rendered'], \StorybookPhp\Runtime\Transport\normalizeAdapterResponse('rendered'));
    }
}
