<?php
namespace App\Components;

/**
 * Demonstrates nested trait chains: TraitC -> TraitB -> TraitA -> Class.
 * The vite plugin recursively resolves methods through the trait chain.
 */
trait HasStyle {
    public function styled(string $text, string $color = '#111827', string $size = '14px'): string {
        return "<span style=\"color: {$color}; font-size: {$size};\">{$text}</span>";
    }
}

trait HasLayout {
    use HasStyle;

    public function row(string $left, string $right = ''): string {
        return "<div style=\"display: flex; justify-content: space-between; align-items: center; padding: 8px 0;\">{$this->styled($left)} {$this->styled($right, '#6b7280')}</div>";
    }
}

trait HasContainer {
    use HasLayout;

    public function container(string $title, string $content): string {
        return "<div style=\"border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-family: system-ui;\"><h3 style=\"margin: 0 0 12px 0;\">{$title}</h3>{$content}</div>";
    }
}

class TraitChain {
    use HasContainer;

    public function __construct(private string $variant = 'default') {}

    public function render(string $title = 'Details', string $key = 'Status', string $value = 'Active'): string {
        $rowHtml = $this->row($key, $value);
        return $this->container($title, $rowHtml);
    }
}
