<?php
namespace App\Fixtures;

class InvocableEcho {
    public function __construct(
        private string $prefix = 'Note',
    ) {}

    public function __invoke(string $message, string $variant = 'info'): void {
        echo "<div class=\"invocable-echo-{$variant}\"><strong>{$this->prefix}:</strong> {$message}</div>";
    }
}
