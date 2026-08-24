<?php

declare(strict_types=1);

$finder = (new PhpCsFixer\Finder())
    ->in([
        __DIR__ . '/src/php',
        __DIR__ . '/tests/php',
        __DIR__ . '/tests/Unit',
        __DIR__ . '/tools/php',
    ]);

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        'declare_strict_types' => true,
        'strict_param' => true,
        'strict_comparison' => true,
        'array_syntax' => ['syntax' => 'short'],
        'no_unused_imports' => true,
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'single_quote' => true,
        'trailing_comma_in_multiline' => true,
        'no_empty_statement' => true,
        'no_superfluous_elseif' => true,
        'no_useless_else' => true,
        'void_return' => true,
        'no_alias_functions' => true,
        'no_mixed_echo_print' => ['use' => 'echo'],
        'global_namespace_import' => [
            'import_classes' => true,
            'import_constants' => true,
            'import_functions' => true,
        ],
        'fully_qualified_strict_types' => true,
    ])
    ->setFinder($finder);
