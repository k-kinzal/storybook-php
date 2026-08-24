<?php

declare(strict_types=1);

use PhpAiToolkit\Doctest\Configuration\Configuration;
use PhpAiToolkit\Doctest\TestCase\Legacy\LegacyDoctestRunner;

/** Runs examples in the PHP runtime documentation as executable contracts. */
final class DoctestSuiteTest extends LegacyDoctestRunner
{
    public static function configure(): Configuration
    {
        return new Configuration(
            directories: [dirname(__DIR__, 2) . '/src/php'],
            bootstrap: __DIR__ . '/bootstrap.php',
        );
    }
}
