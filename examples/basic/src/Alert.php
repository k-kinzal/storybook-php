<?php
namespace App\Components;

class Alert {
    public static function danger(string $message, bool $dismissible = false): string {
        $dismiss = $dismissible ? '<button class="close">&times;</button>' : '';
        return "<div class=\"alert alert-danger\">{$dismiss}{$message}</div>";
    }

    public static function success(string $message, bool $dismissible = false): string {
        $dismiss = $dismissible ? '<button class="close">&times;</button>' : '';
        return "<div class=\"alert alert-success\">{$dismiss}{$message}</div>";
    }

    public static function info(string $message): string {
        return "<div class=\"alert alert-info\">{$message}</div>";
    }
}
