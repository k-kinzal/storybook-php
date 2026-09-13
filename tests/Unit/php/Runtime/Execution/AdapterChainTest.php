<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\normalizeAdapterResponse
 */
final class AdapterChainTest extends TestCase
{
    public function testNormalizesHtmlStringsToTheAdapterResponseContract(): void
    {
        self::assertSame(['html' => 'rendered'], \StorybookPhp\Runtime\Execution\normalizeAdapterResponse('rendered'));
    }
}
