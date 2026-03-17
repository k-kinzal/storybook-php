<?php
namespace App\Components;

/**
 * Demonstrates static factory methods that internally create instances.
 * Multiple static methods serve as named constructors.
 */
class StaticConverter {
    public function __construct(
        private string $label,
        private string $variant = 'default',
        private bool $disabled = false,
    ) {}

    public static function primary(string $label, bool $disabled = false): string {
        return (new self($label, 'primary', $disabled))->render();
    }

    public static function outline(string $label, bool $disabled = false): string {
        return (new self($label, 'outline', $disabled))->render();
    }

    public static function ghost(string $label, bool $disabled = false): string {
        return (new self($label, 'ghost', $disabled))->render();
    }

    public function render(): string {
        $styles = match ($this->variant) {
            'primary' => 'background: #3b82f6; color: white; border: 2px solid #3b82f6;',
            'outline' => 'background: transparent; color: #3b82f6; border: 2px solid #3b82f6;',
            'ghost' => 'background: transparent; color: #3b82f6; border: 2px solid transparent;',
            default => 'background: #e5e7eb; color: #374151; border: 2px solid #e5e7eb;',
        };
        $opacity = $this->disabled ? ' opacity: 0.5; cursor: not-allowed;' : ' cursor: pointer;';
        $disabledAttr = $this->disabled ? ' disabled' : '';

        return "<button class=\"btn btn-{$this->variant}\" style=\"padding: 8px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; {$styles}{$opacity}\"{$disabledAttr}>{$this->label}</button>";
    }
}
