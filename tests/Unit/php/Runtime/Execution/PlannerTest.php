<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

final class PlannerTest extends TestCase
{
    public function testCreatesAnEmptyPlanForTemplateRendering(): void
    {
        self::assertSame(
            ['type' => 'template', 'effectiveConstructorArgDefs' => null, 'effectiveCallableArgDefs' => null],
            \StorybookPhp\Runtime\Execution\baseExecutionPlanner('template'),
        );
    }
}
