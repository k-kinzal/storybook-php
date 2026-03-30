<?php
namespace App\Components;

class Alert {
    public static function danger(string $message, bool $dismissible = false): string {
        return "<div class=\"alert\">{$message}</div>";
    }

    public static function success(string $message): string {
        return "<div class=\"alert-success\">{$message}</div>";
    }

    public function instanceMethod(): string {
        return "instance";
    }
}
