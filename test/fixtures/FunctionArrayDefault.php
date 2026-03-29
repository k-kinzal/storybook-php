<?php
namespace App\Helpers;

function renderNav(array $items = ['Home', 'About', 'Contact'], string $separator = ' | '): string {
    return '<nav>' . implode($separator, $items) . '</nav>';
}

function renderTagList(array $tags = ['php', 'storybook', 'vite'], string $color = '#6366f1'): string {
    $html = '<div class="tags">';
    foreach ($tags as $tag) {
        $html .= "<span style=\"color:{$color};\">{$tag}</span>";
    }
    $html .= '</div>';
    return $html;
}
