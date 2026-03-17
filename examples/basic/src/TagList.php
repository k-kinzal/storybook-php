<?php
namespace App\Components;

/**
 * Demonstrates variadic constructor parameters.
 * The runner spreads the array into individual arguments.
 */
class TagList {
    /** @var string[] */
    private array $tags;

    public function __construct(
        private string $label = 'Tags',
        private string $color = '#3b82f6',
        string ...$tags,
    ) {
        $this->tags = $tags;
    }

    public function render(): string {
        $items = '';
        foreach ($this->tags as $tag) {
            $items .= "<span style=\"display: inline-block; padding: 2px 10px; margin: 2px; border-radius: 12px; background: {$this->color}; color: white; font-size: 13px;\">{$tag}</span>";
        }
        return "<div style=\"font-family: system-ui;\"><strong style=\"display: block; margin-bottom: 6px;\">{$this->label}</strong><div>{$items}</div></div>";
    }

    public static function inline(string $separator = ', ', string ...$tags): string {
        $escaped = array_map('htmlspecialchars', $tags);
        return "<span style=\"font-family: system-ui; color: #6b7280;\">" . implode($separator, $escaped) . "</span>";
    }
}
