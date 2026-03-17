<?php
namespace App\Helpers;

function nullableLabel(
    string $text,
    ?string $icon = null,
    ?string $color = null,
    string|null $subtitle = null,
): string {
    $c = $color ?? '#6b7280';
    $iconHtml = $icon !== null ? "<span>{$icon}</span>" : '';
    $subHtml = $subtitle !== null ? "<div>{$subtitle}</div>" : '';
    return "<div>{$iconHtml}{$text}{$subHtml}</div>";
}
