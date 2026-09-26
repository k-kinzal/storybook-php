<?php

return static function (array $context, callable $next): array {
    $response = $next($context);

    return array_merge($response, [
        'html' => \StorybookPhp\Runtime\Transport\resolveOutput($response['result'] ?? null, (string) ($response['buffered'] ?? '')),
    ]);
};
