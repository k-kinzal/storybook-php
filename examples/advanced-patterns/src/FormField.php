<?php
namespace App\Components;

/**
 * Demonstrates mixed promoted and non-promoted constructor parameters.
 * The $id param is non-promoted and computed from $label if not provided.
 */
class FormField {
    private string $id;

    public function __construct(
        public readonly string $label,
        private string $type = 'text',
        ?string $id = null,
        private bool $required = false,
        private ?string $placeholder = null,
    ) {
        $this->id = $id ?? strtolower(str_replace(' ', '-', $label));
    }

    public function render(): string
    {
        $req = $this->required ? ' <span style="color: #ef4444;">*</span>' : '';
        $reqAttr = $this->required ? ' required' : '';
        $ph = $this->placeholder !== null ? " placeholder=\"{$this->placeholder}\"" : '';
        return <<<HTML
        <div class="form-field" style="margin-bottom: 12px;">
            <label for="{$this->id}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px;">{$this->label}{$req}</label>
            <input id="{$this->id}" type="{$this->type}"{$ph}{$reqAttr} style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
        </div>
        HTML;
    }
}
