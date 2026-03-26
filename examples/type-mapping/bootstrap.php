<?php
// Bootstrap: autoload for type-mapping example.
// This example demonstrates typeMap configuration features.

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\Components\\';
    if (str_starts_with($class, $prefix)) {
        $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
        $file = __DIR__ . '/src/' . $relative . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});
