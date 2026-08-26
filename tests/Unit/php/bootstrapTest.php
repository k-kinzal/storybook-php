<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime;

use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
final class BootstrapTest extends TestCase
{
    public function testTheDistributedBootstrapLoadsEveryRuntimeModule(): void
    {
        require_once dirname(__DIR__, 3) . '/src/php/bootstrap.php';

        self::assertTrue(function_exists('StorybookPhp\\Runtime\\Casting\\castArg'));
        self::assertTrue(function_exists('StorybookPhp\\Runtime\\Execution\\executeCoreContext'));
        self::assertTrue(function_exists('StorybookPhp\\Runtime\\Transport\\readRunnerRequest'));
    }
}
