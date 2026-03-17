<?php
namespace App\Components;

/**
 * Demonstrates readonly promoted properties with union types.
 * Combines readonly constructor promotion with string|int union type.
 */
class PromotedReadonlyUnion {
    public function __construct(
        public readonly string|int $id,
        public readonly string $label,
        private readonly int|float $amount = 0,
    ) {}

    public function render(): string {
        $formatted = is_float($this->amount) ? number_format($this->amount, 2) : number_format($this->amount);
        return "<div class=\"pru-card\" style=\"display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\">
            <span style=\"background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #6b7280; font-family: monospace;\">{$this->id}</span>
            <strong style=\"color: #111827;\">{$this->label}</strong>
            <span style=\"color: #059669; font-weight: 600;\">{$formatted}</span>
        </div>";
    }
}
