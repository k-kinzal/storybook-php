<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_cast_valuesTest extends TestCase
{
    public function testResponsibilityIsLoadedFromItsSourceUnit(): void
    {
        $reflection = new ReflectionFunction('castDocTypeValue');

        self::assertSame(
            realpath(__DIR__ . '/../../src/php/runtime_cast_values.php'),
            $reflection->getFileName(),
        );
    }

    public function testCollectionWrapperRequiresGenericMetadataAndAConstructor(): void
    {
        $parameter = new ReflectionParameter(
            static function (array $items): void {
            },
            0,
        );

        self::assertNull(castNamedCollectionWrapper(stdClass::class, [], 'array', $parameter, null));
        self::assertNull(castNamedCollectionWrapper(stdClass::class, [], 'stdClass<string>', $parameter, null));
    }
}
