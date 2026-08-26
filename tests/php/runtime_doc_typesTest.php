<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/fixtures/RunnerFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 */
final class runtime_doc_typesTest extends TestCase
{
    public function testPrefersTheMostSpecificDocumentedParameterType(): void
    {
        $reflection = new ReflectionFunction('StorybookPhp\\TestFixture\\docPriority');

        self::assertSame(['values' => 'list<float>'], \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($reflection));
    }
}
