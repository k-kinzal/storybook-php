<?php

/**
 * Test middleware adapter that can either terminate template execution or wrap
 * the core executor response for callable-backed stories.
 */
return function (array $context, callable $next): array {
    if (($context['type'] ?? null) === 'template') {
        $file = $context['file'] ?? '';
        $args = isset($context['templateArgs']) && is_array($context['templateArgs'])
            ? $context['templateArgs']
            : resolveTemplateContextArgs($context);
        $argsJson = json_encode($args);
        return [
            'html' => "<div data-adapter=\"context\" data-file=\"{$file}\" data-args=\"" . htmlspecialchars($argsJson) . "\">"
                . "Template rendered via adapter"
                . "</div>",
            'args' => $args,
        ];
    }

    $response = $next($context);
    $type = $context['type'] ?? 'unknown';
    return array_merge($response, [
        'html' => "<div data-adapter=\"context\" data-type=\"{$type}\">{$response['html']}</div>",
    ]);
};
