<?php
namespace App\Components;

/**
 * Demonstrates multiple traits in one class, each providing
 * a distinct render method usable as a story callable.
 */
trait HasIcon {
    public function icon(string $name, int $size = 24): string {
        return "<span class=\"icon icon-{$name}\" style=\"display: inline-flex; align-items: center; justify-content: center; width: {$size}px; height: {$size}px; border-radius: 50%; background: #e5e7eb; font-size: " . intval($size * 0.5) . "px;\">&#9679;</span>";
    }
}

trait HasBadge {
    public function badge(string $text, string $color = '#3b82f6'): string {
        return "<span class=\"widget-badge\" style=\"display: inline-block; padding: 2px 8px; border-radius: 12px; background-color: {$color}; color: white; font-size: 11px; font-weight: bold;\">{$text}</span>";
    }
}

trait HasActions {
    public function actionBar(string $primaryLabel, ?string $secondaryLabel = null): string {
        $secondary = $secondaryLabel !== null
            ? "<button class=\"btn btn-secondary\" style=\"padding: 6px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;\">{$secondaryLabel}</button>"
            : '';
        return "<div class=\"action-bar\" style=\"display: flex; gap: 8px; padding: 8px 0;\">{$secondary}<button class=\"btn btn-primary\" style=\"padding: 6px 16px; border: none; border-radius: 6px; background: #3b82f6; color: white; cursor: pointer;\">{$primaryLabel}</button></div>";
    }
}

class Widget {
    use HasIcon, HasBadge, HasActions;

    public function __construct(
        private string $title,
        private string $description = '',
    ) {}

    public function render(): string {
        $desc = $this->description !== ''
            ? "<p style=\"margin: 4px 0 0; color: #6b7280;\">{$this->description}</p>"
            : '';
        return "<div class=\"widget\" style=\"padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;\"><h3 style=\"margin: 0;\">{$this->title}</h3>{$desc}</div>";
    }
}
