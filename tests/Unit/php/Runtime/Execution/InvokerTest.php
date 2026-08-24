<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

final class InvokerTest extends TestCase
{
    public function testReadsAValidatedPlannerFromTheHydratedContext(): void
    {
        self::assertSame('template', \StorybookPhp\Runtime\Execution\executionPlanner(['__planner' => \StorybookPhp\Runtime\Execution\baseExecutionPlanner('template')])['type']);
    }
}
