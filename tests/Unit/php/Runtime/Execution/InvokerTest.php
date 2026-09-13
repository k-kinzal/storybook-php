<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\executionPlanner
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Execution\baseExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap
 */
final class InvokerTest extends TestCase
{
    public function testReadsAValidatedPlannerFromTheHydratedContext(): void
    {
        self::assertSame('template', \StorybookPhp\Runtime\Execution\executionPlanner(['__planner' => \StorybookPhp\Runtime\Execution\baseExecutionPlanner('template')])['type']);
    }
}
