<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/fixtures/RunnerFixtures.php';

final class RuntimeDocTypesTest extends TestCase
{
    public function testPrefersTheMostSpecificDocumentedParameterType(): void
    {
        $reflection = new ReflectionFunction('StorybookPhp\\TestFixture\\docPriority');

        self::assertSame(['values' => 'list<float>'], parseDocBlockParamTypes($reflection));
    }
}
