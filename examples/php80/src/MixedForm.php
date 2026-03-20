<?php
namespace App\Components;

/**
 * Demonstrates mixed promoted and non-promoted constructor properties.
 * Some properties use PHP 8 constructor promotion while others
 * are initialized manually in the constructor body.
 */
class MixedForm {
    private string $id;

    public function __construct(
        public string $label,
        private string $type = 'text',
        ?string $id = null,
        private bool $required = false,
        private ?string $placeholder = null,
    ) {
        $this->id = $id ?? strtolower(str_replace(' ', '-', $label));
    }

    public function render(): string
    {
        $req = $this->required ? ' required' : '';
        $reqStar = $this->required ? '<span style="color: #ef4444;"> *</span>' : '';
        $ph = $this->placeholder !== null ? " placeholder=\"{$this->placeholder}\"" : '';

        return "<div class=\"form-field\" style=\"margin-bottom: 12px;\">
            <label for=\"{$this->id}\" style=\"display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px;\">{$this->label}{$reqStar}</label>
            <input id=\"{$this->id}\" type=\"{$this->type}\" style=\"width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;\"{$ph}{$req}>
        </div>";
    }
}
