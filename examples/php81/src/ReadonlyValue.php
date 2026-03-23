<?php
namespace App\Components;

/**
 * Demonstrates readonly properties without explicit visibility keyword.
 * In PHP 8.1+, `readonly` alone implies promoted (but not public).
 */
class ReadonlyValue {
    public function __construct(
        readonly string $id,
        readonly int $value,
        private readonly string $unit = 'px',
    ) {}

    public function render(): string {
        return "<div class=\"readonly-value\" style=\"display: inline-flex; align-items: baseline; gap: 4px; padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-family: system-ui;\">
            <span style=\"color: #6b7280; font-size: 12px;\">{$this->id}:</span>
            <span style=\"font-size: 20px; font-weight: bold; color: #1e293b;\">{$this->value}</span>
            <span style=\"color: #94a3b8; font-size: 12px;\">{$this->unit}</span>
        </div>";
    }
}
