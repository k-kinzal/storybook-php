<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use ReflectionException;

/**
 * @covers \StorybookPhp\Runtime\Casting\resolveArgs
 */
final class ArgumentResolverTest extends TestCase
{
    /**
     * @throws ReflectionException
     */
    public function testAnAbsentCallableHasNoResolvedArguments(): void
    {
        self::assertSame(['ordered' => [], 'named' => []], \StorybookPhp\Runtime\Casting\resolveArgs(null, ['ignored' => true]));
    }
}
