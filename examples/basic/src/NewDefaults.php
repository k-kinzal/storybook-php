<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.1 `new` in default parameter expressions.
 * The BoxOptions class provides defaults, and StyledBox uses `new BoxOptions()` as a default.
 */
class BoxOptions {
    public function __construct(
        public string $color = '#3b82f6',
        public int $padding = 16,
        public bool $rounded = true,
    ) {}
}

class StyledBox {
    public function __construct(
        private string $title,
        private string $content = '',
        private BoxOptions $options = new BoxOptions(),
    ) {}

    public function render(): string {
        $radius = $this->options->rounded ? 'border-radius: 8px;' : '';
        $bodyHtml = $this->content !== ''
            ? "<p style=\"margin: 6px 0 0; color: #374151;\">{$this->content}</p>"
            : '';
        return <<<HTML
        <div class="styled-box" style="padding: {$this->options->padding}px; border: 2px solid {$this->options->color}; {$radius} font-family: system-ui;">
            <h4 style="margin: 0; color: {$this->options->color};">{$this->title}</h4>
            {$bodyHtml}
        </div>
        HTML;
    }
}
