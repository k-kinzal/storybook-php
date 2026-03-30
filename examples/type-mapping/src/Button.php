<?php

namespace App\Components;

/**
 * Button with string variant — typeMap.files[*].args provides the valid options.
 */
class Button
{
    public function __construct(
        private string $label,
        private string $variant = 'default',
        private bool $disabled = false,
    ) {}

    public function render(): string
    {
        $styles = [
            'default' => 'background: #e5e7eb; color: #374151; border: 1px solid #d1d5db;',
            'primary' => 'background: #3b82f6; color: white; border: none;',
            'danger'  => 'background: #ef4444; color: white; border: none;',
            'outline' => 'background: transparent; color: #3b82f6; border: 2px solid #3b82f6;',
        ];
        $style = $styles[$this->variant] ?? $styles['default'];
        $dis = $this->disabled ? ' disabled' : '';
        return "<button style=\"{$style} padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;\"{$dis}>{$this->label}</button>";
    }
}
