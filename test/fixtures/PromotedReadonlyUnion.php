<?php
namespace App\Components;

/**
 * Demonstrates readonly promoted properties with union types.
 * Combines readonly + promoted + union type in a single parameter.
 */
class PromotedReadonlyUnion {
    public function __construct(
        public readonly string|int $id,
        public readonly string $label,
        private readonly int|float $amount = 0,
    ) {}

    public function render(): string {
        $formatted = is_float($this->amount) ? number_format($this->amount, 2) : (string) $this->amount;
        return "<div class=\"pru\"><span>{$this->id}</span> <strong>{$this->label}</strong>: {$formatted}</div>";
    }
}
