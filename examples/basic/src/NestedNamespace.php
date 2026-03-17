<?php
namespace App\UI\Components\Form;

/**
 * Demonstrates deeply nested namespace support.
 * Classes in multi-level namespaces like App\UI\Components\Form
 * should be correctly parsed and resolved.
 */
class TextInput {
    public function __construct(
        private string $name,
        private string $label = '',
        private string $type = 'text',
        private string $placeholder = '',
        private bool $required = false,
        private ?string $helpText = null,
    ) {}

    public function render(): string {
        $label = $this->label ?: ucfirst($this->name);
        $req = $this->required ? '<span style="color: #ef4444; margin-left: 2px;">*</span>' : '';
        $reqAttr = $this->required ? ' required' : '';
        $ph = $this->placeholder !== '' ? " placeholder=\"{$this->placeholder}\"" : '';
        $help = $this->helpText !== null
            ? "<p style=\"margin: 4px 0 0; font-size: 12px; color: #9ca3af;\">{$this->helpText}</p>"
            : '';

        return <<<HTML
        <div class="form-field" style="max-width: 320px; font-family: system-ui, sans-serif;">
            <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #374151;">{$label}{$req}</label>
            <input type="{$this->type}" name="{$this->name}"{$ph}{$reqAttr} style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
            {$help}
        </div>
        HTML;
    }
}
