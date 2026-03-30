<?php

declare(strict_types=1);

return static function (array $context, callable $next): array {
    $response = $next($context);
    $resultText = 'null';
    $result = $response['result'] ?? null;
    $buffered = is_string($response['buffered'] ?? null) ? $response['buffered'] : '';
    $instance = $response['instance'] ?? null;

    if (is_string($result)) {
        $resultText = $result;
    } elseif (is_array($result) && array_key_exists('html', $result) && is_string($result['html'])) {
        $resultText = $result['html'];
    } elseif (is_object($result)) {
        $resultText = get_class($result);
    }

    return [
        ...$response,
        'html' => implode('|', [
            (string) ($context['type'] ?? ''),
            basename((string) ($context['file'] ?? '')),
            $buffered,
            $instance === null ? 'none' : get_class($instance),
            $resultText,
        ]),
    ];
};
