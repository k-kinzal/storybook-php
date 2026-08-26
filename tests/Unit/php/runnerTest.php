<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Script;

use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
final class RunnerTest extends TestCase
{
    public function testTheStandaloneEntrypointLoadsWithoutExecutingInProcess(): void
    {
        require_once dirname(__DIR__, 3) . '/src/php/runner.php';

        self::assertTrue(function_exists('StorybookPhp\\Runtime\\run'));
    }
}
