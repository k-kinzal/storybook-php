<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_cast_inlineTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('castInlineNamedType');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_cast_inline.php'),
            $reflection->getFileName(),
        );
    }
}
