<?php
namespace App\Components;

class Button {
    public function __construct(
        private string $label,
        private string $variant = 'default',
        private bool $disabled = false,
    ) {}

    public static function primary(string $label, bool $disabled = false): string {
        return (new self($label, 'primary', $disabled))->render();
    }

    public static function secondary(string $label, bool $disabled = false): string {
        return (new self($label, 'secondary', $disabled))->render();
    }

    public function render(): string {
        $disabledAttr = $this->disabled ? ' disabled' : '';
        return "<button class=\"btn btn-{$this->variant}\"{$disabledAttr}>{$this->label}</button>";
    }
}
