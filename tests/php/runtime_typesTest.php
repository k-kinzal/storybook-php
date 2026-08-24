<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_typesTest extends TestCase
{
    public function testEnumLookupReturnsNullForAnOrdinaryMismatch(): void
    {
        if (PHP_VERSION_ID < 80100) {
            self::markTestSkipped('Enums require PHP 8.1+.');
        }

        require_once __DIR__ . '/fixtures/EnumFixtures.php';
        $enumClass = 'StorybookPhp\\EnumFixture\\Status';

        self::assertSame('Draft', \StorybookPhp\Runtime\Contract\findEnumCase($enumClass, 'draft')->name);
        self::assertNull(\StorybookPhp\Runtime\Contract\findEnumCase($enumClass, 'missing'));
    }
}
