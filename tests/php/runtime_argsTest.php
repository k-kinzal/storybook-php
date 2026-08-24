<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_argsTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('resolveArgs');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_args.php'),
            $reflection->getFileName(),
        );
    }
}
