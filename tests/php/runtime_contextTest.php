<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_contextTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('hydrateExecutionContext');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_context.php'),
            $reflection->getFileName(),
        );
    }

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
                normalizeExecutionContext($context);
                self::fail('Expected invalid execution context to fail.');
            } catch (RuntimeException $exception) {
                self::assertSame($message, $exception->getMessage());
            }
        }

        self::assertNull(normalizeExecutionContextMap(null, 'args'));

        $this->expectExceptionMessage("Execution context field 'args' must be an object or null.");
        normalizeExecutionContextMap('invalid', 'args');
    }
}
