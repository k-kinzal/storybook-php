<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\findEnumCase
 * @covers \StorybookPhp\Runtime\Contract\isBackedEnumClass
 */
final class runtime_typesTest extends TestCase
{
    public function testEnumLookupReturnsNullForAnOrdinaryMismatch(): void
    {
        if (PHP_VERSION_ID < 80100) {
            self::assertFalse(\StorybookPhp\Runtime\Contract\enumTypeExists('StorybookPhp\\EnumFixture\\Status'));

            return;
        }

        require_once __DIR__ . '/fixtures/EnumFixtures.php';
        $enumClass = 'StorybookPhp\\EnumFixture\\Status';

        self::assertSame('Draft', \StorybookPhp\Runtime\Contract\findEnumCase($enumClass, 'draft')->name);
        self::assertNull(\StorybookPhp\Runtime\Contract\findEnumCase($enumClass, 'missing'));
    }
}
