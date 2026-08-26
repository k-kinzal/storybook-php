<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\buildRunnerExecutionContext
 */
final class RequestHandlerTest extends TestCase
{
    public function testBuildsAnExecutionContextWithoutRunningUserCode(): void
    {
        $context = \StorybookPhp\Runtime\Execution\buildRunnerExecutionContext([
            'type' => 'template',
            'file' => __FILE__,
            'args' => ['title' => 'Story'],
        ], false);

        self::assertSame(__FILE__, $context['executionFile']);
        self::assertSame(['title' => 'Story'], $context['publicArgs']);
    }
}
