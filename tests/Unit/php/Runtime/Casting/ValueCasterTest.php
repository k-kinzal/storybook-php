<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 */
final class ValueCasterTest extends TestCase
{
    public function testDistinguishesListsFromProtocolObjects(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Casting\isListArray(['first', 'second']));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isListArray(['name' => 'first']));
    }
}
