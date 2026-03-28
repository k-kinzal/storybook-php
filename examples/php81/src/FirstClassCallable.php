<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.1 first-class callable syntax: strlen(...), strtoupper(...).
 * Shows that the framework handles classes using this syntax correctly.
 */
class FirstClassCallable {
    /** @var \Closure(string): int */
    private \Closure $counter;

    /** @var \Closure(string): string */
    private \Closure $formatter;

    public function __construct(
        private string $text,
    ) {
        $this->counter = strlen(...);
        $this->formatter = strtoupper(...);
    }

    public function render(): string {
        $len = ($this->counter)($this->text);
        $upper = ($this->formatter)($this->text);
        return <<<HTML
        <div class="first-class-callable" style="font-family: system-ui; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="margin-bottom: 4px;">Text: <strong>{$this->text}</strong></div>
            <div style="color: #6b7280;">Length: {$len} | Upper: {$upper}</div>
        </div>
        HTML;
    }
}
