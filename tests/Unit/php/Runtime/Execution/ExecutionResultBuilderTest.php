<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\buildExecutionResponse
 */
final class ExecutionResultBuilderTest extends TestCase
{
    public function testBuildsTheInternalResultWithValidatedHtml(): void
    {
        $result = \StorybookPhp\Runtime\Execution\buildExecutionResponse('rendered', null, '', null, []);

        self::assertSame('rendered', $result['html']);
        self::assertSame([], $result['publicArgs'] ?? null);
    }
}
