<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

// Only bootstrap once per process
if (defined('__STORYBOOK_TWIG_BOOTSTRAPPED__')) {
    return;
}
define('__STORYBOOK_TWIG_BOOTSTRAPPED__', true);

$loader = new FilesystemLoader(__DIR__ . '/src/templates');
$cachePath = sys_get_temp_dir() . '/storybook-php-twig-cache';

if (!is_dir($cachePath)) {
    mkdir($cachePath, 0755, true);
}

$GLOBALS['__storybook_twig'] = new Environment($loader, [
    'cache' => $cachePath,
    'auto_reload' => true,
]);
