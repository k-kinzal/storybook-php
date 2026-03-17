<?php
function badge(string $label, string $color = 'gray'): string {
    return "<span class=\"badge\" style=\"background-color: {$color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;\">{$label}</span>";
}
