<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\executeEnumMethodContext
 * @covers \StorybookPhp\Runtime\Execution\executionPlanner
 * @covers \StorybookPhp\Runtime\Execution\plannerCallableReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerClassReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerConstructorReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerFunctionReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerMethodReflection
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Execution\baseExecutionPlanner
 */
final class runtime_invocationTest extends TestCase
{
    public function testInvocationRejectsBrokenInternalContracts(): void
    {
        $planner = \StorybookPhp\Runtime\Execution\baseExecutionPlanner('template');
        $cases = [
            [static fn (): array => \StorybookPhp\Runtime\Execution\executeEnumMethodContext(['class' => null]), 'Enum execution context has no valid enum class.'],
            [static fn (): array => \StorybookPhp\Runtime\Execution\executionPlanner([]), 'Hydrated execution context has no planner.'],
            [
                static fn (): array => \StorybookPhp\Runtime\Execution\executionPlanner(['__planner' => ['type' => 'invalid']]),
                'Execution planner has an invalid render type.',
            ],
            [static fn (): ReflectionClass => \StorybookPhp\Runtime\Execution\plannerClassReflection($planner), 'Execution planner has no class reflection.'],
            [static fn (): ReflectionMethod => \StorybookPhp\Runtime\Execution\plannerMethodReflection($planner), 'Execution planner has no method reflection.'],
            [static fn (): ReflectionFunction => \StorybookPhp\Runtime\Execution\plannerFunctionReflection($planner), 'Execution planner has no function reflection.'],
            [
                static fn (): ReflectionFunctionAbstract => \StorybookPhp\Runtime\Execution\plannerCallableReflection($planner),
                'Execution planner has no callable reflection.',
            ],
            [
                static fn (): ?ReflectionMethod => \StorybookPhp\Runtime\Execution\plannerConstructorReflection(['constructorReflection' => 'invalid'] + $planner),
                'Execution planner constructor reflection is invalid.',
            ],
        ];

        foreach ($cases as [$operation, $message]) {
            try {
                $operation();
                self::fail('Expected an invalid internal contract to fail.');
            } catch (LogicException $exception) {
                self::assertSame($message, $exception->getMessage());
            }
        }
    }
}
