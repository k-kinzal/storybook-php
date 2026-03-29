<?php
namespace App\Fixtures;

class VoidNeverReturn {
    public function __construct(
        private string $message = 'Hello',
        private string $style = 'info',
    ) {}

    public function renderEcho(): void {
        echo "<div class=\"vn-{$this->style}\">{$this->message}</div>";
    }

    public function render(): string {
        return "<div class=\"vn-{$this->style}\">{$this->message}</div>";
    }

    public function fail(): never {
        throw new \RuntimeException('Intentional failure');
    }
}
