<?php
// Bootstrap file for PHP components.
// Add autoloader, framework setup, etc.
// This file is executed before each component render.

$autoload = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoload)) {
    require_once $autoload;
}
