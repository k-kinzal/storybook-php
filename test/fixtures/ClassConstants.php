<?php

namespace App\Components;

class Notification {
    public const TYPE_INFO = 'info';
    public const TYPE_WARNING = 'warning';
    public const TYPE_ERROR = 'error';

    public function __construct(
        private string $message,
        private string $type = self::TYPE_INFO,
        private mixed $metadata = null,
        private int $timeout = 5000,
    ) {}

    public function render(): string
    {
        return "<div class=\"notification notification-{$this->type}\">{$this->message}</div>";
    }
}
