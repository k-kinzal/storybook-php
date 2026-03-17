<?php
namespace App\Components;

/**
 * Demonstrates readonly promoted parameters without explicit visibility.
 * In PHP 8.1+, `readonly` alone promotes the parameter to a property.
 */
class ValueObject {
    public function __construct(
        readonly string $id,
        readonly int $value,
        readonly string $unit = '',
    ) {}

    public function render(): string {
        $unitHtml = $this->unit !== ''
            ? " <span style=\"font-size: 12px; color: #6b7280;\">{$this->unit}</span>"
            : '';
        return <<<HTML
        <div class="value-object" style="display: inline-flex; align-items: baseline; gap: 8px; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; background: #f9fafb;">
            <span style="color: #6b7280; font-size: 12px;">{$this->id}</span>
            <span style="font-size: 20px; font-weight: bold;">{$this->value}{$unitHtml}</span>
        </div>
        HTML;
    }
}
