<?php
namespace App\Components;

/**
 * Demonstrates a class that uses a trait but overrides one of its methods.
 * The class's own render() takes precedence over the trait's render(),
 * while the trait's badge() method is still accessible.
 */
trait HasDefaultRender {
    public function render(): string {
        return "<div class=\"default-render\" style=\"padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-family: system-ui;\">Default render from trait</div>";
    }

    public function badge(): string {
        return "<span class=\"default-badge\" style=\"display: inline-block; padding: 2px 8px; border-radius: 12px; background: #6b7280; color: white; font-size: 12px;\">default</span>";
    }
}

class OverrideTrait {
    use HasDefaultRender;

    public function __construct(
        private string $title,
        private string $variant = 'primary',
    ) {}

    /**
     * Overrides the trait's render() method.
     */
    public function render(): string {
        $colors = [
            'primary'   => ['#3b82f6', '#eff6ff'],
            'secondary' => ['#6b7280', '#f9fafb'],
            'success'   => ['#22c55e', '#f0fdf4'],
        ];
        [$accent, $bg] = $colors[$this->variant] ?? $colors['primary'];

        return "<div class=\"override-card\" style=\"padding: 14px 18px; background: {$bg}; border-left: 4px solid {$accent}; border-radius: 0 8px 8px 0; font-family: system-ui;\">
            <h3 style=\"margin: 0 0 4px; color: {$accent}; font-size: 15px;\">{$this->title}</h3>
            {$this->badge()}
        </div>";
    }
}
