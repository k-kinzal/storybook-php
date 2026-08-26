<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Execution\defaultsMatchForRuntime
 */
final class ArgumentDefinitionMapTest extends TestCase
{
    public function testComparesDefaultsByTheirProtocolRepresentation(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Execution\defaultsMatchForRuntime(['value' => 1], ['value' => 1]));
        self::assertFalse(\StorybookPhp\Runtime\Execution\defaultsMatchForRuntime(['value' => 1], ['value' => 2]));
    }
}
