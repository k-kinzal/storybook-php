<?php
namespace App\Helpers;

/**
 * Demonstrates standalone functions with array default parameters.
 * Tests that the parser and runner handle complex array defaults correctly.
 */
function renderNav(array $items = ['Home', 'About', 'Contact'], string $separator = ' | ', string $activeClass = 'active'): string {
    $links = [];
    foreach ($items as $i => $item) {
        $cls = $i === 0 ? " class=\"{$activeClass}\"" : '';
        $links[] = "<a href=\"#\"{$cls} style=\"color:#3b82f6;text-decoration:none;font-size:14px;\">{$item}</a>";
    }
    $sep = "<span style=\"color:#d1d5db;margin:0 4px;\">{$separator}</span>";
    return '<nav class="fn-nav" style="font-family:system-ui;padding:8px 0;">' . implode($sep, $links) . '</nav>';
}

function renderTagList(array $tags = ['php', 'storybook', 'vite'], string $color = '#6366f1'): string {
    $html = '<div class="fn-tags" style="display:flex;gap:6px;flex-wrap:wrap;">';
    foreach ($tags as $tag) {
        $html .= "<span style=\"display:inline-block;padding:2px 10px;background:{$color}20;color:{$color};border-radius:12px;font-size:12px;font-family:system-ui;\">{$tag}</span>";
    }
    $html .= '</div>';
    return $html;
}
