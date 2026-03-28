<?php
namespace App\Components;

/**
 * Demonstrates constructor with mixed visibility promoted properties.
 * Only public params become story args; private/protected are internal.
 */
class MixedVisibility {
    public function __construct(
        public string $label,
        private string $variant = 'default',
        protected int $maxLength = 50,
        public bool $truncate = false,
    ) {}

    public function render(): string {
        $text = $this->label;
        if ($this->truncate && mb_strlen($text) > $this->maxLength) {
            $text = mb_substr($text, 0, $this->maxLength) . '...';
        }
        return "<div class=\"mixed-vis mixed-vis-{$this->variant}\" style=\"display: inline-block; padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;\">{$text}</div>";
    }
}
