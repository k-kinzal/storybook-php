<?php
namespace App\Components;

/**
 * Demonstrates a class implementing multiple interfaces.
 */
interface Togglable {
    public function toggle(bool $open): string;
}

interface Searchable {
    public function search(string $query): string;
}

class Dropdown implements Togglable, Searchable {
    public function __construct(
        private string $label,
        private array $items = [],
        private ?string $placeholder = null,
    ) {}

    public function toggle(bool $open = false): string
    {
        $state = $open ? 'open' : 'closed';
        $display = $open ? 'block' : 'none';
        $arrow = $open ? '&#9650;' : '&#9660;';
        $ph = $this->placeholder ?? 'Select...';

        $itemsHtml = '';
        foreach ($this->items as $item) {
            $text = is_array($item) ? ($item['label'] ?? '') : (string) $item;
            $itemsHtml .= "<li class=\"dropdown-item\">{$text}</li>";
        }

        return "<div class=\"dropdown dropdown-{$state}\"><button class=\"dropdown-trigger\">{$this->label} {$arrow}</button><div class=\"dropdown-menu\" style=\"display: {$display};\"><div class=\"dropdown-placeholder\">{$ph}</div><ul class=\"dropdown-list\">{$itemsHtml}</ul></div></div>";
    }

    public function search(string $query = ''): string
    {
        $filtered = array_filter($this->items, function ($item) use ($query) {
            $text = is_array($item) ? ($item['label'] ?? '') : (string) $item;
            return $query === '' || stripos($text, $query) !== false;
        });

        if (empty($filtered)) {
            return "<div class=\"dropdown-search dropdown-empty\">No results for \"{$query}\"</div>";
        }

        $html = "<div class=\"dropdown-search\"><input class=\"dropdown-search-input\" value=\"{$query}\" placeholder=\"Search...\"><ul class=\"dropdown-results\">";
        foreach ($filtered as $item) {
            $text = is_array($item) ? ($item['label'] ?? '') : (string) $item;
            $html .= "<li class=\"dropdown-result\">{$text}</li>";
        }
        $html .= '</ul></div>';
        return $html;
    }
}
