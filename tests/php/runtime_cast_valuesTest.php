<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_cast_valuesTest extends TestCase
{
    public function testCollectionWrapperRequiresGenericMetadataAndAConstructor(): void
    {
        $parameter = new ReflectionParameter(
            static function (array $items): void {
            },
            0,
        );

        self::assertNull(\StorybookPhp\Runtime\Casting\castNamedCollectionWrapper(stdClass::class, [], 'array', $parameter, null));
        self::assertNull(\StorybookPhp\Runtime\Casting\castNamedCollectionWrapper(stdClass::class, [], 'stdClass<string>', $parameter, null));
    }
}
