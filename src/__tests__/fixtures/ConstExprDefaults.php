<?php
namespace App\Components;

class ConstExprDefaults {
    public function __construct(
        private string $title,
        private string $separator = PHP_EOL,
        private int $maxSize = PHP_INT_SIZE,
        private string $version = PHP_VERSION,
        private bool $debug = false,
    ) {}

    public function render(): string {
        return "<div>{$this->title}</div>";
    }
}
