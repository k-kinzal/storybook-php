<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use Latte\Engine;

// Only bootstrap once per process
if (defined('__STORYBOOK_LATTE_BOOTSTRAPPED__')) {
    return;
}
define('__STORYBOOK_LATTE_BOOTSTRAPPED__', true);

$tempDir = sys_get_temp_dir() . '/storybook-php-latte-cache';

if (!is_dir($tempDir)) {
    mkdir($tempDir, 0755, true);
}

$latte = new Engine();
$latte->setTempDirectory($tempDir);
$latte->setAutoRefresh(true);

$GLOBALS['__storybook_latte'] = $latte;
$GLOBALS['__storybook_latte_template_path'] = __DIR__ . '/src/templates/';
