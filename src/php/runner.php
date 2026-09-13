<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

/** @codeCoverageIgnoreStart */
$__sb_scriptFilename = $_SERVER['SCRIPT_FILENAME'] ?? null;
if (PHP_SAPI === 'cli' && is_string($__sb_scriptFilename) && realpath($__sb_scriptFilename) === __FILE__) {
    set_exception_handler(static function (Throwable $error): void {
        echo StorybookPhp\Runtime\failure($error);
    });
    StorybookPhp\Runtime\run();
}
/** @codeCoverageIgnoreEnd */
