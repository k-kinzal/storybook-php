<?php

declare(strict_types=1);

return [
    'mapArgs' => static function (array $storyArgs): array {
        return [
            'constructor' => ['id' => $storyArgs['constructor.id'] ?? $storyArgs['id'] ?? 1],
            'method' => ['title' => $storyArgs['method.title'] ?? $storyArgs['title'] ?? 'mapped'],
            'template' => ['greeting' => $storyArgs['greeting'] ?? 'hello'],
        ];
    },
    'render' => static function (mixed $result, string $buffered, ?object $instance, array $context): string {
        return implode('|', [
            'array',
            (string) ($context['type'] ?? ''),
            $buffered,
            $instance === null ? 'none' : get_class($instance),
            is_string($result) ? $result : 'null',
        ]);
    },
];
