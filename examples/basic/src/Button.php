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

    public static function outline(string $label, bool $disabled = false): string {
        return (new self($label, 'outline', $disabled))->render();
    }

    public function render(): string {
        $disabledAttr = $this->disabled ? ' disabled' : '';
        $styles = [
            'primary' => 'background-color: #3b82f6; color: white; border: none;',
            'secondary' => 'background-color: #6b7280; color: white; border: none;',
            'outline' => 'background-color: transparent; color: #3b82f6; border: 2px solid #3b82f6;',
            'default' => 'background-color: #e5e7eb; color: #374151; border: 1px solid #d1d5db;',
        ];
        $style = $styles[$this->variant] ?? $styles['default'];
        return "<button class=\"btn btn-{$this->variant}\" style=\"{$style} padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;\"{$disabledAttr}>{$this->label}</button>";
    }
}
