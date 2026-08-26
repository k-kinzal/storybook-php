<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\executeRunnerRequest
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs
 * @covers \StorybookPhp\Runtime\Execution\baseExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildClassMethodPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildExecutionResponse
 * @covers \StorybookPhp\Runtime\Execution\buildRunnerExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\ensureExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\executeAdapterTerminal
 * @covers \StorybookPhp\Runtime\Execution\executeCoreContext
 * @covers \StorybookPhp\Runtime\Execution\executeTemplateContext
 * @covers \StorybookPhp\Runtime\Execution\executionContextArgs
 * @covers \StorybookPhp\Runtime\Execution\executionPlanner
 * @covers \StorybookPhp\Runtime\Execution\hydrateExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\hydrateTemplateExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\mapPublicArgsToExecutionTargets
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContextMap
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContextString
 * @covers \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap
 * @covers \StorybookPhp\Runtime\Execution\reflectPlannerClass
 * @covers \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\requirePlannerExecutionFile
 * @covers \StorybookPhp\Runtime\Execution\requirePlannerTargetPair
 * @covers \StorybookPhp\Runtime\Execution\resolveTemplateContextArgs
 * @covers \StorybookPhp\Runtime\Transport\createAdapterTerminal
 * @covers \StorybookPhp\Runtime\Transport\getOutputBuffer
 * @covers \StorybookPhp\Runtime\Transport\loadAdapters
 * @covers \StorybookPhp\Runtime\Transport\normalizeAdapterResponse
 * @covers \StorybookPhp\Runtime\Transport\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Transport\requireOutputBuffer
 * @covers \StorybookPhp\Runtime\Transport\runAdapterMiddleware
 */
final class runtime_executeTest extends TestCase
{
    public function testOptionalRequestFieldsHaveRuntimeDefaults(): void
    {
        $response = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
            'type' => 'template',
            'file' => __DIR__ . '/fixtures/Template.php',
            'args' => ['greeting' => 'hello', 'count' => 2],
        ]);

        self::assertSame('hello:2', $response['html']);
    }

    public function testReflectionFailuresUseTheRunnerExceptionContract(): void
    {
        try {
            \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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
