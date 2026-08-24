<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_invocationTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('executeCoreContext');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_invocation.php'),
            $reflection->getFileName(),
        );
    }

    public function testInvocationRejectsBrokenInternalContracts(): void
    {
        $planner = baseExecutionPlanner('template');
        $cases = [
            [static fn (): array => executeEnumMethodContext(['class' => null]), 'Enum execution context has no valid enum class.'],
            [static fn (): array => executionPlanner([]), 'Hydrated execution context has no planner.'],
            [
                static fn (): array => executionPlanner(['__planner' => ['type' => 'invalid']]),
                'Execution planner has an invalid render type.',
            ],
            [static fn (): ReflectionClass => plannerClassReflection($planner), 'Execution planner has no class reflection.'],
            [static fn (): ReflectionMethod => plannerMethodReflection($planner), 'Execution planner has no method reflection.'],
            [static fn (): ReflectionFunction => plannerFunctionReflection($planner), 'Execution planner has no function reflection.'],
            [
                static fn (): ReflectionFunctionAbstract => plannerCallableReflection($planner),
                'Execution planner has no callable reflection.',
            ],
            [
                static fn (): ?ReflectionMethod => plannerConstructorReflection(['constructorReflection' => 'invalid'] + $planner),
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
