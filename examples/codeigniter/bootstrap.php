<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

// Only bootstrap once per process
if (defined('__STORYBOOK_CI4_BOOTSTRAPPED__')) {
    return;
}
define('__STORYBOOK_CI4_BOOTSTRAPPED__', true);

// Store template path for components to use
$GLOBALS['__storybook_ci4_template_path'] = __DIR__ . '/src/templates/';
