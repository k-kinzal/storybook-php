<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_execution_responseTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('resolveTemplateContextArgs');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_execution_response.php'),
            $reflection->getFileName(),
        );
    }
}
