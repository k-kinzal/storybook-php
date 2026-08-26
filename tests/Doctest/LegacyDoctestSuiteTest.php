<?php

declare(strict_types=1);

namespace Tests\Doctest;

use Override;
use Toolkit\Doctest\Configuration\Configuration;
use Toolkit\Doctest\TestCase\Legacy\LegacyDoctestRunner;

/**
 * Runs the project's documented examples on PHPUnit 9.
 *
 * @medium
 */
final class LegacyDoctestSuiteTest extends LegacyDoctestRunner
{
    /**
     * Selects the non-autoloadable production root whose PHPDoc examples are executable.
     */
    #[Override]
    public static function configure(): Configuration
    {
        return new Configuration(
            directories: [dirname(__DIR__, 2) . '/src/php'],
            bootstrap: dirname(__DIR__) . '/php/bootstrap.php',
        );
    }
}
