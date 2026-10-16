<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use RuntimeException;
use StorybookPhp\Runtime\Contract\HydrationException;

/**
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class HydrationExceptionTest extends TestCase
{
    public function testNamesTheSlotPathInTheMessage(): void
    {
        $exception = new HydrationException('App\Card::$title', 'expected string, received array.');

        self::assertSame('Cannot hydrate App\Card::$title: expected string, received array.', $exception->getMessage());
        self::assertSame('App\Card::$title', $exception->path);
        self::assertSame('expected string, received array.', $exception->reason);
    }

    public function testFallsBackToAGenericPrefixWithoutAPath(): void
    {
        $previous = new RuntimeException('inner');
        $exception = new HydrationException('', 'the docblock type expression is empty.', $previous);

        self::assertSame('Cannot hydrate value: the docblock type expression is empty.', $exception->getMessage());
        self::assertSame($previous, $exception->getPrevious());
    }
}
