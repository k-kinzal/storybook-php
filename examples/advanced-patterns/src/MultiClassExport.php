<?php
namespace App\Components;

/**
 * Demonstrates multiple classes in a single file, each exported as a separate
 * story import. The parser detects all classes and the vite plugin generates
 * individual virtual modules per class.
 */
class MultiClassExportA {
    public function __construct(
        private string $label,
    ) {}

    public function render(): string {
        return "<div class=\"multi-a\" style=\"font-family: system-ui; padding: 12px; border: 2px solid #3b82f6; border-radius: 8px;\">"
            . "<strong>A:</strong> {$this->label}</div>";
    }
}

class MultiClassExportB {
    public function __construct(
        private string $label,
    ) {}

    public function render(): string {
        return "<div class=\"multi-b\" style=\"font-family: system-ui; padding: 12px; border: 2px solid #22c55e; border-radius: 8px;\">"
            . "<strong>B:</strong> {$this->label}</div>";
    }
}
