<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/src/php',
        __DIR__ . '/tests/php',
        __DIR__ . '/tools/php',
    ])
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
    );
