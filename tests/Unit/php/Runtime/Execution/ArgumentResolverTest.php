<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;
use ReflectionException;

/**
 * @covers \StorybookPhp\Runtime\Execution\resolveArgs
 */
final class ArgumentResolverTest extends TestCase
{
    /**
     * @throws ReflectionException
     */
    public function testAnAbsentCallableHasNoResolvedArguments(): void
    {
        self::assertSame(['ordered' => [], 'named' => []], \StorybookPhp\Runtime\Execution\resolveArgs(null, ['ignored' => true]));
    }
}
