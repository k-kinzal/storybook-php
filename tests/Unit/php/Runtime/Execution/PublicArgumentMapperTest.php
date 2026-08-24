<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Execution;

use PHPUnit\Framework\TestCase;

final class PublicArgumentMapperTest extends TestCase
{
    public function testProjectsOnlyTheRequestedNamespacedArguments(): void
    {
        self::assertSame(
            ['title' => 'Method', 'shared' => true],
            \StorybookPhp\Runtime\Execution\projectNamespacedPublicArgs([
                'constructor.title' => 'Constructor',
                'method.title' => 'Method',
                'shared' => true,
            ], 'method'),
        );
    }
}
