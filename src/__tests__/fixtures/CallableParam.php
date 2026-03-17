<?php
namespace App\Components;

/**
 * Demonstrates callable and Closure type parameters.
 * Since Storybook args are plain JSON, callable params use default null.
 */
class CallableParam {
    /** @var callable|null */
    private $transformer;

    public function __construct(
        private string $label,
        ?callable $transformer = null,
    ) {
        $this->transformer = $transformer;
    }

    public function render(string $prefix = '', ?Closure $wrapper = null): string {
        $text = $this->transformer ? ($this->transformer)($this->label) : $this->label;
        $full = $prefix !== '' ? "{$prefix}: {$text}" : $text;
        return "<span class=\"callable-param\">{$full}</span>";
    }
}
