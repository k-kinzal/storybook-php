<?php
namespace App\Components;

/**
 * Demonstrates a simple invocable class with __invoke returning HTML.
 * Uses match expression and default enum parameter.
 */
enum DividerStyle: string {
    case Solid = 'solid';
    case Dashed = 'dashed';
    case Dotted = 'dotted';
    case Double = 'double';

    public function css(): string {
        return $this->value;
    }
}

class Divider {
    public function __construct(
        private DividerStyle $style = DividerStyle::Solid,
        private string $color = '#e5e7eb',
        private int $spacing = 16,
    ) {}

    public function __invoke(?string $label = null): string {
        if ($label !== null) {
            return "<div class=\"divider divider-labeled\" style=\"display: flex; align-items: center; gap: 12px; margin: {$this->spacing}px 0;\"><hr style=\"flex: 1; border: none; border-top: 1px {$this->style->css()} {$this->color};\"><span style=\"color: #6b7280; font-size: 13px;\">{$label}</span><hr style=\"flex: 1; border: none; border-top: 1px {$this->style->css()} {$this->color};\"></div>";
        }
        return "<hr class=\"divider\" style=\"border: none; border-top: 1px {$this->style->css()} {$this->color}; margin: {$this->spacing}px 0;\">";
    }
}
