<?php

declare(strict_types=1);

require_once __DIR__ . '/runtime_doc_types.php';
require_once __DIR__ . '/runtime_types.php';
require_once __DIR__ . '/runtime_cast.php';
require_once __DIR__ . '/runtime_io.php';
require_once __DIR__ . '/runtime_execute.php';
require_once __DIR__ . '/runtime_boundary.php';

/** @codeCoverageIgnoreStart */
$__sb_scriptFilename = $_SERVER['SCRIPT_FILENAME'] ?? null;
if (PHP_SAPI === 'cli' && is_string($__sb_scriptFilename) && realpath($__sb_scriptFilename) === __FILE__) {
    storybookPhpRun();
}
/** @codeCoverageIgnoreEnd */
