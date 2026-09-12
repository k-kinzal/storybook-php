<?php

declare(strict_types=1);

namespace Tests\Property;

use Eris\Generators;
use Eris\TestTrait;
use PHPUnit\Framework\TestCase;

/**
 * @group pbt
 * @medium
 * @covers \StorybookPhp\Runtime\Execution\projectPublicArgsToTarget
 */
final class ArgumentProjectionTest extends TestCase
{
    use TestTrait;

    public function testScopedValuesOverridePublicValuesRegardlessOfInputOrder(): void
    {
        $this->limitTo(500)
            ->forAll(Generators::string(), Generators::int(), Generators::elements('constructor', 'method'))
            ->then(function (string $public, int $scoped, string $scope): void {
                $args = ['title' => $public, $scope . '.title' => $scoped, 'unrelated' => true];
                $defs = ['title' => []];

                self::assertSame(['title' => $scoped], \StorybookPhp\Runtime\Execution\projectPublicArgsToTarget($args, $defs, $scope));
                self::assertSame(['title' => $scoped], \StorybookPhp\Runtime\Execution\projectPublicArgsToTarget(array_reverse($args, true), $defs, $scope));
            });
    }

    public function testExplicitScopedNullDoesNotFallBackToThePublicValue(): void
    {
        $this->limitTo(500)
            ->forAll(Generators::string(), Generators::elements('constructor', 'method'))
            ->then(function (string $public, string $scope): void {
                self::assertSame(
                    ['title' => null],
                    \StorybookPhp\Runtime\Execution\projectPublicArgsToTarget(
                        ['title' => $public, $scope . '.title' => null],
                        ['title' => [], 'absent' => []],
                        $scope,
                    ),
                );
            });
    }
}
