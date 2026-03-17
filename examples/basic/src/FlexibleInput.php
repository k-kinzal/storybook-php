<?php
namespace App\Components;

/**
 * Demonstrates explicit union type notation including null.
 * Uses `string|int|null` instead of `?string` to show union type parsing
 * and mixed nullable handling.
 */
class FlexibleInput {
    public function __construct(
        private string $name,
        private string|int|null $value = null,
        private string $type = 'text',
        private int|null $maxLength = null,
        private bool $required = false,
    ) {}

    public function render(): string {
        $escapedName = htmlspecialchars($this->name);
        $escapedValue = htmlspecialchars((string) ($this->value ?? ''));
        $required = $this->required ? ' required' : '';
        $maxAttr = $this->maxLength !== null ? " maxlength=\"{$this->maxLength}\"" : '';

        $label = "<label style=\"display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; font-family: system-ui;\">{$escapedName}" . ($this->required ? '<span style="color: #ef4444;"> *</span>' : '') . "</label>";

        $input = "<input type=\"{$this->type}\" name=\"{$escapedName}\" value=\"{$escapedValue}\"{$required}{$maxAttr} style=\"width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;\">";

        $hint = $this->maxLength !== null
            ? "<span style=\"font-size: 12px; color: #9ca3af;\">Max {$this->maxLength} characters</span>"
            : '';

        return "<div class=\"flexible-input\" style=\"max-width: 320px;\">{$label}{$input}{$hint}</div>";
    }
}
