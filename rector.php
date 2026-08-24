<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\CodeQuality\Rector\Identical\FlipTypeControlToUseExclusiveTypeRector;
use Rector\DeadCode\Rector\ClassMethod\RemoveReturnTagIncompatibleWithNativeTypeRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/src/php',
        __DIR__ . '/tests/php',
        __DIR__ . '/tools/php',
    ])
    ->withSkip([
        __DIR__ . '/tests/php/fixtures/EnumFixtures.php',
        // This rule cannot resolve the PHPStan global aliases that carry the
        // runtime's array-shape contracts, so applying it erases type safety.
        RemoveReturnTagIncompatibleWithNativeTypeRector::class,
        // The nullable ReflectionMethod contract is clearer as an explicit
        // null branch than as a negated instanceof check.
        FlipTypeControlToUseExclusiveTypeRector::class => [
            __DIR__ . '/src/php/runtime_invocation.php',
        ],
    ])
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
    );
