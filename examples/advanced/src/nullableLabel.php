<?php
namespace App\Helpers;

/**
 * Demonstrates standalone functions with nullable parameters.
 * Both ?Type and Type|null syntax are supported.
 */
function nullableLabel(
    string $text,
    ?string $icon = null,
    ?string $color = null,
    string|null $subtitle = null,
): string {
    $c = $color ?? '#6b7280';
    $iconHtml = $icon !== null
        ? "<span style=\"margin-right: 6px;\">{$icon}</span>"
        : '';
    $subHtml = $subtitle !== null
        ? "<div style=\"font-size: 12px; color: #9ca3af; margin-top: 2px;\">{$subtitle}</div>"
        : '';

    return <<<HTML
    <div class="nullable-label" style="display: inline-block; padding: 8px 14px; border-left: 3px solid {$c}; background: #f9fafb; border-radius: 0 6px 6px 0; font-family: system-ui;">
        <div style="display: flex; align-items: center; font-size: 14px; color: #374151;">
            {$iconHtml}{$text}
        </div>
        {$subHtml}
    </div>
    HTML;
}
