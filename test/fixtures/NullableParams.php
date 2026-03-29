<?php
namespace App\Components;

class NullableParams {
    public function __construct(
        private string $message,
        private ?string $title = null,
        private ?string $icon = null,
        private ?int $timeout = null,
        private string|null $footer = null,
    ) {}

    public function render(): string {
        return "<div>{$this->message}</div>";
    }
}
