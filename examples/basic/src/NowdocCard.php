<?php
namespace App\Components;

/**
 * Demonstrates nowdoc syntax (single-quoted heredoc).
 * Unlike heredoc, nowdoc does NOT interpolate variables.
 * Variables are concatenated separately.
 */
class NowdocCard {
    public function __construct(
        private string $title = 'Card',
        private string $body = 'Content goes here.',
        private string $variant = 'default',
    ) {}

    public function render(): string {
        $colors = match ($this->variant) {
            'primary' => ['bg' => '#eff6ff', 'border' => '#3b82f6', 'text' => '#1e40af'],
            'success' => ['bg' => '#f0fdf4', 'border' => '#22c55e', 'text' => '#166534'],
            'warning' => ['bg' => '#fffbeb', 'border' => '#f59e0b', 'text' => '#92400e'],
            default   => ['bg' => '#ffffff', 'border' => '#e5e7eb', 'text' => '#111827'],
        };

        $bg = $colors['bg'];
        $border = $colors['border'];
        $text = $colors['text'];
        $escapedTitle = htmlspecialchars($this->title);
        $escapedBody = htmlspecialchars($this->body);

        // Using nowdoc — no variable interpolation happens inside the string
        $template = <<<'NOWDOC'
<div class="nowdoc-card" style="border: 2px solid %BORDER%; background: %BG%; color: %TEXT%; border-radius: 8px; padding: 16px; font-family: system-ui; max-width: 320px;">
    <h3 style="margin: 0 0 8px 0; font-size: 16px;">%TITLE%</h3>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">%BODY%</p>
</div>
NOWDOC;

        return str_replace(
            ['%BORDER%', '%BG%', '%TEXT%', '%TITLE%', '%BODY%'],
            [$border, $bg, $text, $escapedTitle, $escapedBody],
            $template,
        );
    }
}
