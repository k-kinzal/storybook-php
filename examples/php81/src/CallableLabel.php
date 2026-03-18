<?php
namespace App\Components;

/**
 * Demonstrates callable and Closure type parameters.
 * Since Storybook args are plain JSON, callable params accept null defaults.
 */
class CallableLabel {
    /** @var callable|null */
    private $transformer;

    public function __construct(
        private string $label,
        ?callable $transformer = null,
    ) {
        $this->transformer = $transformer;
    }

    public function render(string $prefix = '', ?string $suffix = null): string {
        $text = $this->transformer !== null ? ($this->transformer)($this->label) : $this->label;
        $full = $prefix !== '' ? "{$prefix}: {$text}" : $text;
        if ($suffix !== null) {
            $full .= " {$suffix}";
        }
        return "<span class=\"callable-label\" style=\"display: inline-block; padding: 6px 14px; background: #f3f4f6; border-radius: 6px; font-family: system-ui;\">{$full}</span>";
    }
}
