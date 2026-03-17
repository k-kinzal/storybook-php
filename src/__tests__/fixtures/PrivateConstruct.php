<?php
namespace App\Components;

class PrivateConstruct {
    private function __construct(
        private string $type,
        private string $message,
        private string $icon,
    ) {}

    public static function success(string $message = 'OK'): string {
        return "<div class=\"notice-success\">{$message}</div>";
    }

    public static function error(string $message = 'Error'): string {
        return "<div class=\"notice-error\">{$message}</div>";
    }

    public static function info(string $message = 'Info'): string {
        return "<div class=\"notice-info\">{$message}</div>";
    }

    private function html(): string {
        return "<div>{$this->icon} {$this->message}</div>";
    }
}
