<?php
namespace App\Components;

/**
 * Demonstrates a static factory pattern (static methods returning HTML strings)
 * with multiple builder methods for different configurations.
 */
class FluentBuilder {
    public function __construct(
        private string $tag = 'div',
        private string $text = '',
        private string $color = '#111827',
        private string $bg = 'transparent',
        private int $padding = 8,
    ) {}

    public static function heading(string $text, int $level = 2, string $color = '#111827'): string {
        $tag = "h{$level}";
        return "<{$tag} style=\"color: {$color}; margin: 0;\">{$text}</{$tag}>";
    }

    public static function badge(string $text, string $bg = '#3b82f6', string $color = 'white'): string {
        return "<span class=\"fb-badge\" style=\"display: inline-block; padding: 2px 10px; border-radius: 12px; background: {$bg}; color: {$color}; font-size: 12px; font-weight: bold;\">{$text}</span>";
    }

    public static function divider(string $style = 'solid', string $color = '#e5e7eb', int $spacing = 16): string {
        return "<hr class=\"fb-divider\" style=\"border: none; border-top: 2px {$style} {$color}; margin: {$spacing}px 0;\">";
    }

    public function render(): string {
        return "<{$this->tag} style=\"color: {$this->color}; background: {$this->bg}; padding: {$this->padding}px;\">{$this->text}</{$this->tag}>";
    }
}
