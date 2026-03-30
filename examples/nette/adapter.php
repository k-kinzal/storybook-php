<?php

return static function (array $context, callable $next): array {
    $response = $next($context);

    return [
        ...$response,
        'html' => resolveOutput($response['result'] ?? null, (string) ($response['buffered'] ?? '')),
    ];
};
