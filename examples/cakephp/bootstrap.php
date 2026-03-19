<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

// Only bootstrap once per process
if (defined('__STORYBOOK_CAKEPHP_BOOTSTRAPPED__')) {
    return;
}
define('__STORYBOOK_CAKEPHP_BOOTSTRAPPED__', true);

// CakePHP needs some basic configuration
use Cake\Core\Configure;

Configure::write('App.namespace', 'App');
Configure::write('App.paths.templates', [__DIR__ . '/src/templates/']);
Configure::write('App.paths.locales', []);

// Set up the View with template paths
$GLOBALS['__storybook_cake_template_path'] = __DIR__ . '/src/templates/';
