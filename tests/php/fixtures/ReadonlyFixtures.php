<?php

declare(strict_types=1);

namespace StorybookPhp\TestFixture\Hydration;

final class ReadonlyPoint
{
    public function __construct(public readonly int $x)
    {
    }
}
