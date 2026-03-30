<?php
namespace App\Components;

class ConstantDefaults {
    public const LEVEL_INFO = 'info';
    public const LEVEL_WARNING = 'warning';
    public const LEVEL_ERROR = 'error';

    public function __construct(
        private string $message,
        private string $level = self::LEVEL_INFO,
        private int $timeout = 5000,
    ) {}

    public function render(): string {
        return "<div class=\"notice-{$this->level}\">{$this->message}</div>";
    }
}
