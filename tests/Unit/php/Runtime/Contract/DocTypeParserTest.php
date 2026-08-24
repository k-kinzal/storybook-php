<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;

final class DocTypeParserTest extends TestCase
{
    public function testSplitsOnlyTopLevelGenericArguments(): void
    {
        self::assertSame(['string', 'list<Foo>'], \StorybookPhp\Runtime\Contract\splitGenericArgs('string, list<Foo>'));
    }
}
