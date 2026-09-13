<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\ensureExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\reflectPlannerClass
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 */
final class runtime_plannerTest extends TestCase
{
    public function testPlannerRejectsUnknownRenderTypes(): void
    {
        foreach ([[null, 'Unknown type: null'], ['invalid', 'Unknown type: invalid']] as [$type, $message]) {
            try {
                \StorybookPhp\Runtime\Execution\ensureExecutionPlanner(['type' => $type]);
                self::fail('Expected an unknown render type to fail.');
            } catch (RuntimeException $exception) {
                self::assertSame($message, $exception->getMessage());
            }
        }
    }

    public function testClassReflectionRequiresAnExistingClass(): void
    {
        $this->expectException(ReflectionException::class);
        $this->expectExceptionMessage("Class 'MissingPlannerClass' does not exist.");

        \StorybookPhp\Runtime\Execution\reflectPlannerClass('MissingPlannerClass');
    }
}
