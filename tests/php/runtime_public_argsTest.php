<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_public_argsTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('mapPublicArgsToExecutionTargets');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_public_args.php'),
            $reflection->getFileName(),
        );
    }
}
