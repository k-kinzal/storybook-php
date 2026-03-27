<?php

/**
 * Test adapter that returns context information as HTML.
 * Used to verify the 4th context argument is passed correctly.
 */
return function (mixed $result, string $buffered, ?object $instance, array $context = []): string {
    // For template type: render using context
    if (($context['type'] ?? null) === 'template') {
        $file = $context['file'] ?? '';
        $args = $context['args'] ?? [];
        $argsJson = json_encode($args);
        return "<div data-adapter=\"context\" data-file=\"{$file}\" data-args=\"" . htmlspecialchars($argsJson) . "\">"
            . "Template rendered via adapter"
            . "</div>";
    }

    // For other types: prepend context type to the normal output
    $type = $context['type'] ?? 'unknown';
    $output = resolveOutput($result, $buffered);
    return "<div data-adapter=\"context\" data-type=\"{$type}\">{$output}</div>";
};
