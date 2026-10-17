<?php

declare(strict_types=1);

use StorybookPhp\Tools\PhpStan\ReflectionAllocationThrowTypeExtension;

require_once __DIR__ . '/ReflectionAllocationThrowTypeExtension.php';

return [
    'services' => [
        [
            'class' => ReflectionAllocationThrowTypeExtension::class,
            'tags' => ['phpstan.dynamicMethodThrowTypeExtension'],
        ],
    ],
];
