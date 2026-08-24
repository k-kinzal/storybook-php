<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_executeTest extends TestCase
{
    public function testOptionalRequestFieldsHaveRuntimeDefaults(): void
    {
        $response = executeRunnerRequest([
            'type' => 'template',
            'file' => __DIR__ . '/fixtures/Template.php',
            'args' => ['greeting' => 'hello', 'count' => 2],
        ]);

        self::assertSame('hello:2', $response['html']);
    }

    public function testReflectionFailuresUseTheRunnerExceptionContract(): void
    {
        try {
            executeRunnerRequest([
                'type' => 'classMethod',
                'file' => __DIR__ . '/fixtures/RunnerFixtures.php',
                'class' => 'StorybookPhp\\TestFixture\\Item',
                'callable' => 'missingMethod',
                'args' => [],
            ]);
            self::fail('Expected target reflection to fail.');
        } catch (RuntimeException $exception) {
            self::assertSame(
                'Unable to resolve classMethod target from the runner request.',
                $exception->getMessage(),
            );
            self::assertInstanceOf(ReflectionException::class, $exception->getPrevious());
        }
    }
}
