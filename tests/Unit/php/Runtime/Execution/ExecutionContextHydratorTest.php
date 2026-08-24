<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

final class ExecutionContextHydratorTest extends TestCase
{
    public function testNormalizesTheValidatedExecutionBoundary(): void
    {
        $context = \StorybookPhp\Runtime\Execution\normalizeExecutionContext([
            'type' => 'template',
            'executionFile' => __FILE__,
            'publicArgs' => ['title' => 'Story'],
        ]);

        self::assertSame('template', $context['type']);
        self::assertSame(['title' => 'Story'], $context['publicArgs']);
    }
}
