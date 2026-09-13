<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContextMap
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContextString
 */
final class runtime_contextTest extends TestCase
{
    public function testExecutionContextRejectsInvalidBoundaryFields(): void
    {
        $cases = [
            [['type' => 'template'], 'Execution context requires an execution file.'],
            [
                ['type' => 'template', 'executionFile' => __FILE__, 'class' => 42],
                "Execution context field 'class' must be a string or null.",
            ],
        ];

        foreach ($cases as [$context, $message]) {
            try {
                \StorybookPhp\Runtime\Execution\normalizeExecutionContext($context);
                self::fail('Expected invalid execution context to fail.');
            } catch (RuntimeException $exception) {
                self::assertSame($message, $exception->getMessage());
            }
        }

        self::assertNull(\StorybookPhp\Runtime\Execution\normalizeExecutionContextMap(null, 'args'));

        $this->expectExceptionMessage("Execution context field 'args' must be an object or null.");
        \StorybookPhp\Runtime\Execution\normalizeExecutionContextMap('invalid', 'args');
    }
}
